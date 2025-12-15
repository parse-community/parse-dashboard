/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Utility for managing keyboard shortcuts preferences
 */

const KEYBOARD_SHORTCUTS_KEY = 'ParseDashboard:KeyboardShortcuts';

/**
 * Default keyboard shortcuts
 */
export const DEFAULT_SHORTCUTS = {
  reloadData: 'r',
  togglePanels: 'p',
};

/**
 * Gets the keyboard shortcuts for a specific app
 * @param {string} appId - The application ID
 * @returns {object} The keyboard shortcuts configuration
 */
export function getKeyboardShortcuts(appId) {
  try {
    const shortcuts = localStorage.getItem(KEYBOARD_SHORTCUTS_KEY);
    if (shortcuts) {
      const parsed = JSON.parse(shortcuts);
      return parsed[appId] || DEFAULT_SHORTCUTS;
    }
  } catch (error) {
    console.warn('Failed to get keyboard shortcuts:', error);
  }
  return DEFAULT_SHORTCUTS;
}

/**
 * Sets the keyboard shortcuts for a specific app
 * @param {string} appId - The application ID
 * @param {object} shortcuts - The keyboard shortcuts configuration
 */
export function setKeyboardShortcuts(appId, shortcuts) {
  try {
    let allShortcuts = {};
    const existing = localStorage.getItem(KEYBOARD_SHORTCUTS_KEY);
    if (existing) {
      allShortcuts = JSON.parse(existing);
    }

    allShortcuts[appId] = shortcuts;
    localStorage.setItem(KEYBOARD_SHORTCUTS_KEY, JSON.stringify(allShortcuts));
  } catch (error) {
    console.warn('Failed to set keyboard shortcuts:', error);
  }
}

/**
 * Resets keyboard shortcuts to defaults for a specific app
 * @param {string} appId - The application ID
 */
export function resetKeyboardShortcuts(appId) {
  setKeyboardShortcuts(appId, DEFAULT_SHORTCUTS);
}

/**
 * Validates that a key is a single character
 * @param {string} key - The key to validate
 * @returns {boolean} True if valid
 */
export function isValidKey(key) {
  return typeof key === 'string' && key.length === 1;
}
