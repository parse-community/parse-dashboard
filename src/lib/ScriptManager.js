/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ServerConfigStorage from './ServerConfigStorage';
import { prefersServerStorage, setStoragePreference } from './StoragePreferences';

const VERSION = 1;

/**
 * Script Manager for handling playground script storage with server-side storage support
 */
export default class ScriptManager {
  constructor(app) {
    this.app = app;
    this.serverStorage = new ServerConfigStorage(app);
  }

  /**
   * Gets scripts from either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @returns {Promise<Array>} Array of scripts
   */
  async getScripts(appId) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        const serverScripts = await this._getScriptsFromServer(appId);
        // Always return server scripts (even if empty) when server storage is preferred
        return serverScripts || [];
      } catch (error) {
        console.error('Failed to get scripts from server:', error);
        // When server storage is preferred, return empty array instead of falling back to local
        return [];
      }
    }

    // Use local storage when server storage is not preferred
    let localScripts = this._getScriptsFromLocal(appId);
    
    // If no scripts found in new format, try the legacy Playground format
    if (!localScripts || localScripts.length === 0) {
      localScripts = this._getScriptsFromPlaygroundFormat();
    }
    
    return localScripts;
  }

  /**
   * Saves scripts to either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {Array} scripts - Array of scripts to save
   * @returns {Promise}
   */
  async saveScripts(appId, scripts) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      // Use server storage - no fallback to local
      return await this._saveScriptsToServer(appId, scripts);
    }

    // Use local storage when server storage is not preferred
    return this._saveScriptsToLocal(appId, scripts);
  }

  /**
   * Migrates scripts from local storage to server storage
   * @param {string} appId - The application ID
   * @returns {Promise<{success: boolean, scriptCount: number}>}
   */
  async migrateToServer(appId) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      throw new Error('Server configuration is not enabled for this app');
    }

    // Try to get scripts from both the new format and the legacy Playground format
    let localScripts = this._getScriptsFromLocal(appId);
    
    // If no scripts found in new format, try the legacy Playground format
    if (!localScripts || localScripts.length === 0) {
      localScripts = this._getScriptsFromPlaygroundFormat();
    }
    
    if (!localScripts || localScripts.length === 0) {
      return { success: true, scriptCount: 0 };
    }

    try {
      await this._saveScriptsToServer(appId, localScripts);
      return { success: true, scriptCount: localScripts.length };
    } catch (error) {
      console.error('Failed to migrate scripts to server:', error);
      throw error;
    }
  }

  /**
   * Deletes scripts from local storage
   * @param {string} appId - The application ID
   * @returns {boolean} True if deletion was successful
   */
  deleteFromBrowser(appId) {
    try {
      // Remove from new format
      localStorage.removeItem(this._getLocalPath(appId));
      // Remove from legacy Playground format
      localStorage.removeItem('parse-dashboard-playground-saved-tabs');
      return true;
    } catch (error) {
      console.error('Failed to delete scripts from browser:', error);
      return false;
    }
  }

  /**
   * Sets the storage preference for the app
   * @param {string} appId - The application ID
   * @param {string} preference - The storage preference ('local' or 'server')
   */
  setStoragePreference(appId, preference) {
    setStoragePreference(appId, preference);
  }

  /**
   * Gets the current storage preference for the app
   * @param {string} appId - The application ID
   * @returns {string} The storage preference ('local' or 'server')
   */
  getStoragePreference(appId) {
    return prefersServerStorage(appId) ? 'server' : 'local';
  }

  /**
   * Checks if server configuration is enabled for this app
   * @returns {boolean} True if server config is enabled
   */
  isServerConfigEnabled() {
    return this.serverStorage.isServerConfigEnabled();
  }

  /**
   * Gets scripts from server storage
   * @private
   */
  async _getScriptsFromServer(appId) {
    try {
      const scriptConfigs = await this.serverStorage.getConfigsByPrefix('console.js.script.', appId);
      const scripts = [];

      Object.entries(scriptConfigs).forEach(([key, config]) => {
        if (config && typeof config === 'object') {
          // Extract script ID from key (console.js.script.{SCRIPT_ID})
          const scriptId = key.replace('console.js.script.', '');

          scripts.push({
            id: parseInt(scriptId, 10),
            ...config
          });
        }
      });

      return scripts;
    } catch (error) {
      console.error('Failed to get scripts from server:', error);
      return [];
    }
  }

  /**
   * Saves scripts to server storage
   * @private
   */
  async _saveScriptsToServer(appId, scripts) {
    try {
      // First, get existing scripts from server to know which ones to delete
      const existingScriptConfigs = await this.serverStorage.getConfigsByPrefix('console.js.script.', appId);
      const existingScriptIds = Object.keys(existingScriptConfigs).map(key =>
        key.replace('console.js.script.', '')
      );

      // Delete scripts that are no longer in the new scripts array
      const newScriptIds = scripts.map(script => script.id.toString());
      const scriptsToDelete = existingScriptIds.filter(id => !newScriptIds.includes(id));

      await Promise.all(
        scriptsToDelete.map(id =>
          this.serverStorage.deleteConfig(`console.js.script.${id}`, appId)
        )
      );

      // Save or update current scripts
      await Promise.all(
        scripts.map(script => {
          const scriptConfig = { ...script };
          delete scriptConfig.id; // Don't store ID in the config itself

          // Remove null and undefined values to keep the storage clean
          Object.keys(scriptConfig).forEach(key => {
            if (scriptConfig[key] === null || scriptConfig[key] === undefined) {
              delete scriptConfig[key];
            }
          });

          return this.serverStorage.setConfig(
            `console.js.script.${script.id}`,
            scriptConfig,
            appId
          );
        })
      );
    } catch (error) {
      console.error('Failed to save scripts to server:', error);
      throw error;
    }
  }

  /**
   * Gets scripts from local storage (original implementation)
   * @private
   */
  _getScriptsFromLocal(appId) {
    let entry;
    try {
      entry = localStorage.getItem(this._getLocalPath(appId)) || '[]';
    } catch {
      entry = '[]';
    }
    try {
      return JSON.parse(entry);
    } catch {
      return [];
    }
  }

  /**
   * Gets scripts from the legacy Playground storage format
   * @private
   */
  _getScriptsFromPlaygroundFormat() {
    let entry;
    try {
      entry = localStorage.getItem('parse-dashboard-playground-saved-tabs') || '[]';
    } catch {
      entry = '[]';
    }
    try {
      return JSON.parse(entry);
    } catch {
      return [];
    }
  }

  /**
   * Saves scripts to local storage (original implementation)
   * @private
   */
  _saveScriptsToLocal(appId, scripts) {
    try {
      localStorage.setItem(this._getLocalPath(appId), JSON.stringify(scripts));
    } catch {
      // ignore write errors
    }
  }

  /**
   * Gets the local storage path for scripts
   * @private
   */
  _getLocalPath(appId) {
    return `ParseDashboard:${VERSION}:${appId}:Scripts`;
  }

  /**
   * Generates a unique ID for a script
   * @private
   */
  _generateScriptId(script) {
    // Use a hash of the script name and code as a fallback ID
    const str = `${script.name || 'script'}-${script.code || ''}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

// Legacy API compatibility - these functions will work with local storage only
// for backward compatibility
export function getScripts(appId) {
  let entry;
  try {
    entry = localStorage.getItem(path(appId)) || '[]';
  } catch {
    entry = '[]';
  }
  try {
    return JSON.parse(entry);
  } catch {
    return [];
  }
}

export function saveScripts(appId, scripts) {
  try {
    localStorage.setItem(path(appId), JSON.stringify(scripts));
  } catch {
    // ignore write errors
  }
}

function path(appId) {
  return `ParseDashboard:${VERSION}:${appId}:Scripts`;
}
