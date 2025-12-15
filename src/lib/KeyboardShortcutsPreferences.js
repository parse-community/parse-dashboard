/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ServerConfigStorage from './ServerConfigStorage';

/**
 * Default keyboard shortcuts
 */
export const DEFAULT_SHORTCUTS = {
  dataBrowserReloadData: { key: 'r', ctrl: false, shift: false, alt: false },
  dataBrowserToggleInfoPanels: { key: 'p', ctrl: false, shift: false, alt: false },
};

/**
 * Keyboard shortcuts manager with server-side storage support
 */
export default class KeyboardShortcutsManager {
  constructor(app) {
    this.app = app;
    this.serverStorage = new ServerConfigStorage(app);
  }

  /**
   * Gets keyboard shortcuts from server storage
   * @param {string} appId - The application ID
   * @returns {Promise<Object>} The keyboard shortcuts configuration
   */
  async getKeyboardShortcuts(appId) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      return DEFAULT_SHORTCUTS;
    }

    try {
      const configs = await this.serverStorage.getConfigsByPrefix('settings.keyboard.binding', appId);

      if (!configs || Object.keys(configs).length === 0) {
        return DEFAULT_SHORTCUTS;
      }

      // Extract shortcuts from the config keys
      const shortcuts = {};
      for (const [key, value] of Object.entries(configs)) {
        // Extract the shortcut name from keys like "settings.keyboard.binding.dataBrowserReloadData"
        const shortcutName = key.replace('settings.keyboard.binding.', '');
        // Validate the shortcut structure before storing
        if (isValidShortcut(value)) {
          shortcuts[shortcutName] = value;
        } else {
          console.warn(`Invalid shortcut for ${shortcutName}, using default`);
        }
      }

      // Merge with defaults, but preserve null values (which mean disabled)
      const result = {};
      for (const shortcutName of Object.keys(DEFAULT_SHORTCUTS)) {
        result[shortcutName] = shortcuts.hasOwnProperty(shortcutName)
          ? shortcuts[shortcutName]
          : DEFAULT_SHORTCUTS[shortcutName];
      }
      return result;
    } catch (error) {
      console.warn('Failed to get keyboard shortcuts from server:', error);
      return DEFAULT_SHORTCUTS;
    }
  }

  /**
   * Saves keyboard shortcuts to server storage
   * @param {string} appId - The application ID
   * @param {Object} shortcuts - The keyboard shortcuts configuration
   * @returns {Promise}
   */
  async saveKeyboardShortcuts(appId, shortcuts) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      throw new Error('Server configuration is not enabled for this app');
    }

    // Validate all shortcuts before saving
    for (const [shortcutName, value] of Object.entries(shortcuts)) {
      if (!isValidShortcut(value)) {
        throw new Error(`Invalid shortcut for ${shortcutName}`);
      }
    }

    try {
      // Save each shortcut as a separate config entry
      const promises = [];
      for (const [shortcutName, value] of Object.entries(shortcuts)) {
        const key = `settings.keyboard.binding.${shortcutName}`;
        promises.push(this.serverStorage.setConfig(key, value, appId));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to save keyboard shortcuts to server:', error);
      throw error;
    }
  }

  /**
   * Resets keyboard shortcuts to defaults
   * @param {string} appId - The application ID
   * @returns {Promise}
   */
  async resetKeyboardShortcuts(appId) {
    return this.saveKeyboardShortcuts(appId, DEFAULT_SHORTCUTS);
  }

  /**
   * Checks if server configuration is enabled
   * @returns {boolean}
   */
  isServerConfigEnabled() {
    return this.serverStorage.isServerConfigEnabled();
  }
}

/**
 * Validates that a shortcut object has the correct structure
 * Note: Currently only single-character keys are supported (a-z, 0-9).
 * Special keys like "Enter", "Escape", "Tab" are not supported.
 * @param {Object} shortcut - The shortcut object to validate
 * @returns {boolean} True if valid
 */
export function isValidShortcut(shortcut) {
  if (shortcut === null) {
    return true;
  }

  if (typeof shortcut !== 'object') {
    return false;
  }

  // Must have a key property that is a single character
  if (!shortcut.key || typeof shortcut.key !== 'string' || shortcut.key.length !== 1) {
    return false;
  }

  // Modifier keys are optional booleans
  // Note: Meta/Cmd key support could be added in the future
  if (shortcut.ctrl !== undefined && typeof shortcut.ctrl !== 'boolean') {
    return false;
  }
  if (shortcut.shift !== undefined && typeof shortcut.shift !== 'boolean') {
    return false;
  }
  if (shortcut.alt !== undefined && typeof shortcut.alt !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Creates a shortcut object from a key string
 * @param {string} key - The key character
 * @returns {Object} Shortcut object
 */
export function createShortcut(key) {
  if (!key || key.length !== 1) {
    return null;
  }
  return { key, ctrl: false, shift: false, alt: false };
}

/**
 * Checks if a keyboard event matches a shortcut
 * Note: Consumers should check event.target to prevent triggering
 * shortcuts when typing in input fields (INPUT, TEXTAREA, contentEditable).
 * @param {KeyboardEvent} event - The keyboard event
 * @param {Object} shortcut - The shortcut object
 * @returns {boolean} True if matches
 */
export function matchesShortcut(event, shortcut) {
  if (!shortcut || !shortcut.key) {
    return false;
  }

  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatches = !!event.ctrlKey === !!shortcut.ctrl;
  const shiftMatches = !!event.shiftKey === !!shortcut.shift;
  const altMatches = !!event.altKey === !!shortcut.alt;

  return keyMatches && ctrlMatches && shiftMatches && altMatches;
}
