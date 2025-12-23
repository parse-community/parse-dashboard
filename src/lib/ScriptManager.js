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

    // Always check for legacy single-script format and add it as a new unsaved tab
    const legacyScript = this._getScriptFromLegacySingleFormat();
    if (legacyScript && legacyScript.length > 0) {
      // Check if a script with the same code already exists to prevent duplicates
      const legacyScriptData = legacyScript[0];
      const existingScript = (localScripts || []).find(script =>
        script.code === legacyScriptData.code && script.name === 'Legacy Script'
      );

      if (!existingScript) {
        // Assign order property to automatically open the legacy script as a tab
        // Use order 0 to make it the first tab
        legacyScriptData.order = 0;

        // Mark as saved to prevent unnecessary unsaved change warnings
        legacyScriptData.saved = true;

        // If we have existing scripts, add the legacy script to them
        if (localScripts && localScripts.length > 0) {
          // Increment order of existing scripts to make room for legacy script at position 0
          localScripts.forEach(script => {
            if (script.order !== undefined && script.order !== null) {
              script.order += 1;
            }
          });
          localScripts = [...localScripts, ...legacyScript];
        } else {
          // If no existing scripts, use the legacy script
          localScripts = legacyScript;
        }

        // Auto-save the legacy script to storage
        this._saveScriptsToLocal(appId, localScripts);
      }
    }

    return localScripts || [];
  }

  /**
   * Gets only the scripts that should be open (have an order property)
   * @param {string} appId - The application ID
   * @returns {Promise<Array>} Array of scripts that should be open, sorted by order
   */
  async getOpenScripts(appId) {
    const allScripts = await this.getScripts(appId);
    return allScripts
      .filter(script => script.order !== undefined && script.order !== null)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Gets all saved scripts (including closed ones)
   * @param {string} appId - The application ID
   * @returns {Promise<Array>} Array of all saved scripts
   */
  async getAllSavedScripts(appId) {
    const allScripts = await this.getScripts(appId);
    return allScripts.filter(script => script.saved !== false);
  }

  /**
   * Opens a script by setting its order property
   * @param {string} appId - The application ID
   * @param {number} scriptId - The script ID to open
   * @param {number} order - The order position for the tab
   * @returns {Promise}
   */
  async openScript(appId, scriptId, order) {
    const allScripts = await this.getScripts(appId);
    const updatedScripts = allScripts.map(script =>
      script.id === scriptId
        ? { ...script, order }
        : script
    );
    await this.saveScripts(appId, updatedScripts);
  }

  /**
   * Closes a script by removing its order property
   * @param {string} appId - The application ID
   * @param {number} scriptId - The script ID to close
   * @returns {Promise}
   */
  async closeScript(appId, scriptId) {
    const allScripts = await this.getScripts(appId);
    const updatedScripts = allScripts.map(script =>
      script.id === scriptId
        ? { ...script, order: undefined }
        : script
    );
    await this.saveScripts(appId, updatedScripts);
  }

  /**
   * Updates the order of open scripts
   * @param {string} appId - The application ID
   * @param {Array} openScripts - Array of scripts with their new order
   * @returns {Promise}
   */
  async updateScriptOrder(appId, openScripts) {
    const allScripts = await this.getScripts(appId);
    const openScriptIds = openScripts.map(script => script.id);

    const updatedScripts = allScripts.map(script => {
      const openScript = openScripts.find(os => os.id === script.id);
      if (openScript) {
        return { ...script, ...openScript };
      } else if (openScriptIds.includes(script.id)) {
        // Script was previously open but not in the new list, close it
        return { ...script, order: undefined };
      }
      return script;
    });

    await this.saveScripts(appId, updatedScripts);
  }

  /**
   * Completely deletes a script from storage
   * @param {string} appId - The application ID
   * @param {number} scriptId - The script ID to delete
   * @returns {Promise}
   */
  async deleteScript(appId, scriptId) {
    const allScripts = await this.getScripts(appId);
    const updatedScripts = allScripts.filter(script => script.id !== scriptId);
    await this.saveScripts(appId, updatedScripts);
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
   * @param {boolean} overwriteConflicts - If true, overwrite server scripts with same ID
   * @returns {Promise<{success: boolean, scriptCount: number, conflicts?: Array}>}
   */
  async migrateToServer(appId, overwriteConflicts = false) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      throw new Error('Server configuration is not enabled for this app');
    }

    // Get scripts from local storage only (legacy scripts are handled by getScripts as unsaved tabs)
    const localScripts = this._getScriptsFromLocal(appId);

    if (!localScripts || localScripts.length === 0) {
      return { success: true, scriptCount: 0 };
    }

    try {
      // Get existing scripts from server to detect conflicts
      const existingScriptConfigs = await this.serverStorage.getConfigsByPrefix('console.js.script.', appId);
      const existingScriptIds = Object.keys(existingScriptConfigs).map(key =>
        key.replace('console.js.script.', '')
      );

      // Check for conflicts
      const localScriptIds = localScripts.map(script => script.id).filter(Boolean);
      const conflictingIds = localScriptIds.filter(id => existingScriptIds.includes(id));

      if (conflictingIds.length > 0 && !overwriteConflicts) {
        // Return conflicts for user decision
        const conflicts = conflictingIds.map(id => {
          const localScript = localScripts.find(s => s.id === id);
          const serverScriptKey = `console.js.script.${id}`;
          const serverScript = existingScriptConfigs[serverScriptKey];
          return {
            id,
            type: 'script',
            local: localScript,
            server: serverScript
          };
        });

        return {
          success: false,
          scriptCount: 0,
          conflicts
        };
      }

      // Proceed with migration (merge mode)
      await this._migrateScriptsToServer(appId, localScripts, overwriteConflicts);
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
   * Generates a unique ID for a new script/tab
   * @returns {string} A UUID string
   */
  generateScriptId() {
    return this._generateScriptId();
  }

  /**
   * Migrates scripts to server storage with merge/overwrite logic
   * @private
   */
  async _migrateScriptsToServer(appId, localScripts, overwriteConflicts) {
    try {
      // Get existing scripts from server
      const existingScriptConfigs = await this.serverStorage.getConfigsByPrefix('console.js.script.', appId);
      const existingScriptIds = Object.keys(existingScriptConfigs).map(key =>
        key.replace('console.js.script.', '')
      );

      // Save local scripts to server
      await Promise.all(
        localScripts.map(script => {
          const scriptId = script.id || this._generateScriptId();
          const scriptConfig = { ...script };
          delete scriptConfig.id; // Don't store ID in the config itself

          // Remove null and undefined values to keep the storage clean
          Object.keys(scriptConfig).forEach(key => {
            if (scriptConfig[key] === null || scriptConfig[key] === undefined) {
              delete scriptConfig[key];
            }
          });

          // Only save if we're overwriting conflicts or if this script doesn't exist on server
          if (overwriteConflicts || !existingScriptIds.includes(scriptId)) {
            return this.serverStorage.setConfig(
              `console.js.script.${scriptId}`,
              scriptConfig,
              appId
            );
          }
          return Promise.resolve(); // Skip conflicting scripts when not overwriting
        })
      );

      // Note: We don't delete server scripts that aren't in local storage
      // This preserves server-side settings that don't conflict with local ones
    } catch (error) {
      console.error('Failed to migrate scripts to server:', error);
      throw error;
    }
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
            id: scriptId, // Keep as string (UUID) instead of parsing as integer
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
   * Gets script from the legacy single-script format
   * @private
   */
  _getScriptFromLegacySingleFormat() {
    try {
      const legacyCode = localStorage.getItem('parse-dashboard-playground-code');

      if (legacyCode && legacyCode.trim()) {
        // Create a script with the legacy code, marked as saved since we're auto-importing it
        const script = {
          id: this._generateScriptId(),
          name: 'Legacy Script',
          code: legacyCode,
          saved: true, // Mark as saved since this is a one-time migration
          lastModified: Date.now()
        };

        // Clean up the old storage key immediately after reading
        localStorage.removeItem('parse-dashboard-playground-code');

        return [script];
      }
    } catch {
      // Ignore errors
    }
    return [];
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
   * Generates a unique ID for a script using UUID
   * @private
   */
  _generateScriptId() {
    return crypto.randomUUID();
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
