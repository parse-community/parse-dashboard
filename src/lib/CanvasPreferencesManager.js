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
 * In-memory cache for canvases fetched from server storage
 * Cache persists for the lifetime of the page (until browser reload)
 * Structure: { appId: canvases[] }
 */
const serverCanvasesCache = {};

/**
 * Canvas storage manager with server-side and local storage support
 * Following the same pattern as ViewPreferencesManager
 */
export default class CanvasPreferencesManager {
  constructor(app) {
    this.app = app;
    this.serverStorage = new ServerConfigStorage(app);
  }

  /**
   * Gets canvases from either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @returns {Promise<Array>} Array of canvases
   */
  async getCanvases(appId) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        // Check cache first
        if (serverCanvasesCache[appId]) {
          return serverCanvasesCache[appId];
        }

        // Fetch from server and cache the result
        const serverCanvases = await this._getCanvasesFromServer(appId);
        // Always return server canvases (even if empty) when server storage is preferred
        const canvases = serverCanvases || [];

        // Cache the fetched canvases
        serverCanvasesCache[appId] = canvases;

        return canvases;
      } catch (error) {
        console.error('Failed to get canvases from server:', error);
        // When server storage is preferred, return empty array instead of falling back to local
        return [];
      }
    }

    // Use local storage when server storage is not preferred
    return this._getCanvasesFromLocal(appId);
  }

  /**
   * Saves a single canvas to either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {Object} canvas - The canvas to save
   * @param {Array} allCanvases - All canvases (required for local storage fallback)
   * @returns {Promise}
   */
  async saveCanvas(appId, canvas, allCanvases) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      await this._saveCanvasToServer(appId, canvas);

      // Invalidate cache - will be reloaded on next getCanvases call
      delete serverCanvasesCache[appId];

      return;
    }

    // Use local storage when server storage is not preferred
    return this._saveCanvasesToLocal(appId, allCanvases);
  }

  /**
   * Deletes a single canvas from either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {string} canvasId - The ID of the canvas to delete
   * @param {Array} allCanvases - All canvases (required for local storage fallback)
   * @returns {Promise}
   */
  async deleteCanvas(appId, canvasId, allCanvases) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      await this._deleteCanvasFromServer(appId, canvasId);

      // Invalidate cache - will be reloaded on next getCanvases call
      delete serverCanvasesCache[appId];

      return;
    }

    // Use local storage when server storage is not preferred
    return this._saveCanvasesToLocal(appId, allCanvases);
  }

  /**
   * Migrates canvases from local storage to server storage
   * @param {string} appId - The application ID
   * @param {boolean} overwriteConflicts - If true, overwrite server canvases with same ID
   * @returns {Promise<{success: boolean, canvasCount: number, conflicts?: Array}>}
   */
  async migrateToServer(appId, overwriteConflicts = false) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      throw new Error('Server configuration is not enabled for this app');
    }

    const localCanvases = this._getCanvasesFromLocal(appId);
    if (!localCanvases || localCanvases.length === 0) {
      return { success: true, canvasCount: 0 };
    }

    try {
      // Get existing canvases from server to detect conflicts
      const existingCanvasConfigs = await this.serverStorage.getConfigsByPrefix('canvases.canvas.', appId);
      const existingCanvasIds = Object.keys(existingCanvasConfigs).map(key =>
        key.replace('canvases.canvas.', '')
      );

      // Check for conflicts
      const localCanvasIds = localCanvases.map(canvas => canvas.id).filter(Boolean);
      const conflictingIds = localCanvasIds.filter(id => existingCanvasIds.includes(id));

      if (conflictingIds.length > 0 && !overwriteConflicts) {
        // Return conflicts for user decision
        const conflicts = conflictingIds.map(id => {
          const localCanvas = localCanvases.find(c => c.id === id);
          const serverCanvasKey = `canvases.canvas.${id}`;
          const serverCanvas = existingCanvasConfigs[serverCanvasKey];
          return {
            id,
            type: 'canvas',
            local: localCanvas,
            server: serverCanvas
          };
        });

        return {
          success: false,
          canvasCount: 0,
          conflicts
        };
      }

      // Proceed with migration (merge mode)
      await this._migrateCanvasesToServer(appId, localCanvases, overwriteConflicts);

      // Invalidate cache after migration
      delete serverCanvasesCache[appId];

      return { success: true, canvasCount: localCanvases.length };
    } catch (error) {
      console.error('Failed to migrate canvases to server:', error);
      throw error;
    }
  }

  /**
   * Deletes canvases from local storage
   * @param {string} appId - The application ID
   * @returns {boolean} True if deletion was successful
   */
  deleteFromBrowser(appId) {
    try {
      localStorage.removeItem(this._getLocalPath(appId));
      return true;
    } catch (error) {
      console.error('Failed to delete canvases from browser:', error);
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
   * Migrates canvases to server storage with merge/overwrite logic
   * @private
   */
  async _migrateCanvasesToServer(appId, localCanvases, overwriteConflicts) {
    try {
      // Get existing canvases from server
      const existingCanvasConfigs = await this.serverStorage.getConfigsByPrefix('canvases.canvas.', appId);
      const existingCanvasIds = Object.keys(existingCanvasConfigs).map(key =>
        key.replace('canvases.canvas.', '')
      );

      // Save local canvases to server
      await Promise.all(
        localCanvases.map(canvas => {
          const canvasId = canvas.id || this._generateCanvasId();
          const canvasConfig = { ...canvas };
          delete canvasConfig.id; // Don't store ID in the config itself

          // Remove null and undefined values to keep the storage clean
          Object.keys(canvasConfig).forEach(key => {
            if (canvasConfig[key] === null || canvasConfig[key] === undefined) {
              delete canvasConfig[key];
            }
          });

          // Stringify the elements array for storage
          if (canvasConfig.elements && Array.isArray(canvasConfig.elements)) {
            canvasConfig.elements = JSON.stringify(canvasConfig.elements);
          }

          // Only save if we're overwriting conflicts or if this canvas doesn't exist on server
          if (overwriteConflicts || !existingCanvasIds.includes(canvasId)) {
            return this.serverStorage.setConfig(
              `canvases.canvas.${canvasId}`,
              canvasConfig,
              appId
            );
          }
          return Promise.resolve(); // Skip conflicting canvases when not overwriting
        })
      );
    } catch (error) {
      console.error('Failed to migrate canvases to server:', error);
      throw error;
    }
  }

  /**
   * Gets canvases from server storage
   * @private
   */
  async _getCanvasesFromServer(appId) {
    try {
      const canvasConfigs = await this.serverStorage.getConfigsByPrefix('canvases.canvas.', appId);
      const canvases = [];

      Object.entries(canvasConfigs).forEach(([key, config]) => {
        if (config && typeof config === 'object') {
          // Extract canvas ID from key (canvases.canvas.{CANVAS_ID})
          const canvasId = key.replace('canvases.canvas.', '');

          // Parse the elements if it's a string (it was stringified for storage)
          const canvasConfig = { ...config };
          if (canvasConfig.elements && typeof canvasConfig.elements === 'string') {
            try {
              canvasConfig.elements = JSON.parse(canvasConfig.elements);
            } catch (e) {
              console.warn('Failed to parse canvas elements from server storage:', e);
              console.error(`Skipping canvas ${canvasId} due to corrupted elements`);
              // Skip canvases with corrupted elements
              return;
            }
          }

          canvases.push({
            id: canvasId,
            ...canvasConfig
          });
        }
      });

      return canvases;
    } catch (error) {
      console.error('Failed to get canvases from server:', error);
      return [];
    }
  }

  /**
   * Saves a single canvas to server storage
   * @private
   */
  async _saveCanvasToServer(appId, canvas) {
    try {
      const canvasId = canvas.id || this._generateCanvasId();
      const canvasConfig = { ...canvas };
      delete canvasConfig.id; // Don't store ID in the config itself

      // Remove null and undefined values to keep the storage clean
      Object.keys(canvasConfig).forEach(key => {
        if (canvasConfig[key] === null || canvasConfig[key] === undefined) {
          delete canvasConfig[key];
        }
      });

      // Stringify the elements array for storage
      if (canvasConfig.elements && Array.isArray(canvasConfig.elements)) {
        canvasConfig.elements = JSON.stringify(canvasConfig.elements);
      }

      await this.serverStorage.setConfig(
        `canvases.canvas.${canvasId}`,
        canvasConfig,
        appId
      );
    } catch (error) {
      console.error('Failed to save canvas to server:', error);
      throw error;
    }
  }

  /**
   * Deletes a single canvas from server storage
   * @private
   */
  async _deleteCanvasFromServer(appId, canvasId) {
    try {
      await this.serverStorage.deleteConfig(`canvases.canvas.${canvasId}`, appId);
    } catch (error) {
      console.error('Failed to delete canvas from server:', error);
      throw error;
    }
  }

  /**
   * Gets canvases from local storage
   * @private
   */
  _getCanvasesFromLocal(appId) {
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
   * Saves canvases to local storage
   * @private
   */
  _saveCanvasesToLocal(appId, canvases) {
    try {
      localStorage.setItem(this._getLocalPath(appId), JSON.stringify(canvases));
    } catch {
      // ignore write errors
    }
  }

  /**
   * Gets the local storage path for canvases
   * @private
   */
  _getLocalPath(appId) {
    return `ParseDashboard:${VERSION}:${appId}:Canvases`;
  }

  /**
   * Generates a unique ID for a new canvas
   * @returns {string} A UUID string
   */
  generateCanvasId() {
    return this._generateCanvasId();
  }

  /**
   * Generates a unique ID for a canvas using UUID
   * @private
   */
  _generateCanvasId() {
    return crypto.randomUUID();
  }
}
