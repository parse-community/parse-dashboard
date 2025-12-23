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
 * Enhanced ViewPreferences with server-side storage support
 */
export default class ViewPreferencesManager {
  constructor(app) {
    this.app = app;
    this.serverStorage = new ServerConfigStorage(app);
  }

  /**
   * Gets views from either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @returns {Promise<Array>} Array of views
   */
  async getViews(appId) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        const serverViews = await this._getViewsFromServer(appId);
        // Always return server views (even if empty) when server storage is preferred
        return serverViews || [];
      } catch (error) {
        console.error('Failed to get views from server:', error);
        // When server storage is preferred, return empty array instead of falling back to local
        return [];
      }
    }

    // Use local storage when server storage is not preferred
    return this._getViewsFromLocal(appId);
  }

  /**
   * Saves a single view to either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {Object} view - The view to save
   * @param {Array} allViews - All views (required for local storage fallback)
   * @returns {Promise}
   */
  async saveView(appId, view, allViews) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        return await this._saveViewToServer(appId, view);
      } catch (error) {
        console.error('Failed to save view to server:', error);
        // On error, fallback to local storage
      }
    }

    // Use local storage (either by preference or as fallback)
    return this._saveViewsToLocal(appId, allViews);
  }

  /**
   * Deletes a single view from either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {string} viewId - The ID of the view to delete
   * @param {Array} allViews - All views (required for local storage fallback)
   * @returns {Promise}
   */
  async deleteView(appId, viewId, allViews) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        return await this._deleteViewFromServer(appId, viewId);
      } catch (error) {
        console.error('Failed to delete view from server:', error);
        // On error, fallback to local storage
      }
    }

    // Use local storage (either by preference or as fallback)
    return this._saveViewsToLocal(appId, allViews);
  }

  /**
   * Migrates views from local storage to server storage
   * @param {string} appId - The application ID
   * @param {boolean} overwriteConflicts - If true, overwrite server views with same ID
   * @returns {Promise<{success: boolean, viewCount: number, conflicts?: Array}>}
   */
  async migrateToServer(appId, overwriteConflicts = false) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      throw new Error('Server configuration is not enabled for this app');
    }

    const localViews = this._getViewsFromLocal(appId);
    if (!localViews || localViews.length === 0) {
      return { success: true, viewCount: 0 };
    }

    try {
      // Get existing views from server to detect conflicts
      const existingViewConfigs = await this.serverStorage.getConfigsByPrefix('views.view.', appId);
      const existingViewIds = Object.keys(existingViewConfigs).map(key =>
        key.replace('views.view.', '')
      );

      // Check for conflicts
      const localViewIds = localViews.map(view => view.id).filter(Boolean);
      const conflictingIds = localViewIds.filter(id => existingViewIds.includes(id));

      if (conflictingIds.length > 0 && !overwriteConflicts) {
        // Return conflicts for user decision
        const conflicts = conflictingIds.map(id => {
          const localView = localViews.find(v => v.id === id);
          const serverViewKey = `views.view.${id}`;
          const serverView = existingViewConfigs[serverViewKey];
          return {
            id,
            type: 'view',
            local: localView,
            server: serverView
          };
        });

        return {
          success: false,
          viewCount: 0,
          conflicts
        };
      }

      // Proceed with migration (merge mode)
      await this._migrateViewsToServer(appId, localViews, overwriteConflicts);
      return { success: true, viewCount: localViews.length };
    } catch (error) {
      console.error('Failed to migrate views to server:', error);
      throw error;
    }
  }

  /**
   * Deletes views from local storage
   * @param {string} appId - The application ID
   * @returns {boolean} True if deletion was successful
   */
  deleteFromBrowser(appId) {
    try {
      localStorage.removeItem(this._getLocalPath(appId));
      return true;
    } catch (error) {
      console.error('Failed to delete views from browser:', error);
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
   * Migrates views to server storage with merge/overwrite logic
   * @private
   */
  async _migrateViewsToServer(appId, localViews, overwriteConflicts) {
    try {
      // Get existing views from server
      const existingViewConfigs = await this.serverStorage.getConfigsByPrefix('views.view.', appId);
      const existingViewIds = Object.keys(existingViewConfigs).map(key =>
        key.replace('views.view.', '')
      );

      // Save local views to server
      await Promise.all(
        localViews.map(view => {
          const viewId = view.id || this._generateViewId();
          const viewConfig = { ...view };
          delete viewConfig.id; // Don't store ID in the config itself

          // Remove null and undefined values to keep the storage clean
          Object.keys(viewConfig).forEach(key => {
            if (viewConfig[key] === null || viewConfig[key] === undefined) {
              delete viewConfig[key];
            }
          });

          // Stringify the query if it exists and is an array/object
          if (viewConfig.query && (Array.isArray(viewConfig.query) || typeof viewConfig.query === 'object')) {
            viewConfig.query = JSON.stringify(viewConfig.query);
          }

          // Only save if we're overwriting conflicts or if this view doesn't exist on server
          if (overwriteConflicts || !existingViewIds.includes(viewId)) {
            return this.serverStorage.setConfig(
              `views.view.${viewId}`,
              viewConfig,
              appId
            );
          }
          return Promise.resolve(); // Skip conflicting views when not overwriting
        })
      );

      // Note: We don't delete server views that aren't in local storage
      // This preserves server-side settings that don't conflict with local ones
    } catch (error) {
      console.error('Failed to migrate views to server:', error);
      throw error;
    }
  }

  /**
   * Gets views from server storage
   * @private
   */
  async _getViewsFromServer(appId) {
    try {
      const viewConfigs = await this.serverStorage.getConfigsByPrefix('views.view.', appId);
      const views = [];

      Object.entries(viewConfigs).forEach(([key, config]) => {
        if (config && typeof config === 'object') {
          // Extract view ID from key (views.view.{VIEW_ID})
          const viewId = key.replace('views.view.', '');

          // Parse the query if it's a string (it was stringified for storage)
          const viewConfig = { ...config };
          if (viewConfig.query && typeof viewConfig.query === 'string') {
            try {
              viewConfig.query = JSON.parse(viewConfig.query);
            } catch (e) {
              console.warn('Failed to parse view query from server storage:', e);
              console.error(`Skipping view ${viewId} due to corrupted query`);
              // Skip views with corrupted queries instead of keeping them as strings
              return;
            }
          }

          views.push({
            id: viewId,
            ...viewConfig
          });
        }
      });

      return views;
    } catch (error) {
      console.error('Failed to get views from server:', error);
      return [];
    }
  }

  /**
   * Saves views to server storage
   * @private
   */
  async _saveViewsToServer(appId, views) {
    try {
      // First, get existing views from server to know which ones to delete
      const existingViewConfigs = await this.serverStorage.getConfigsByPrefix('views.view.', appId);
      const existingViewIds = Object.keys(existingViewConfigs).map(key =>
        key.replace('views.view.', '')
      );

      // Delete views that are no longer in the new views array
      const newViewIds = views.map(view => view.id || this._generateViewId());
      const viewsToDelete = existingViewIds.filter(id => !newViewIds.includes(id));

      await Promise.all(
        viewsToDelete.map(id =>
          this.serverStorage.deleteConfig(`views.view.${id}`, appId)
        )
      );

      // Save or update current views
      await Promise.all(
        views.map(view => {
          const viewId = view.id || this._generateViewId();
          const viewConfig = { ...view };
          delete viewConfig.id; // Don't store ID in the config itself

          // Remove null and undefined values to keep the storage clean
          Object.keys(viewConfig).forEach(key => {
            if (viewConfig[key] === null || viewConfig[key] === undefined) {
              delete viewConfig[key];
            }
          });

          // Stringify the query if it exists and is an array/object
          if (viewConfig.query && (Array.isArray(viewConfig.query) || typeof viewConfig.query === 'object')) {
            viewConfig.query = JSON.stringify(viewConfig.query);
          }

          return this.serverStorage.setConfig(
            `views.view.${viewId}`,
            viewConfig,
            appId
          );
        })
      );
    } catch (error) {
      console.error('Failed to save views to server:', error);
      throw error;
    }
  }

  /**
   * Saves a single view to server storage
   * @private
   */
  async _saveViewToServer(appId, view) {
    try {
      const viewId = view.id || this._generateViewId();
      const viewConfig = { ...view };
      delete viewConfig.id; // Don't store ID in the config itself

      // Remove null and undefined values to keep the storage clean
      Object.keys(viewConfig).forEach(key => {
        if (viewConfig[key] === null || viewConfig[key] === undefined) {
          delete viewConfig[key];
        }
      });

      // Stringify the query if it exists and is an array/object
      if (viewConfig.query && (Array.isArray(viewConfig.query) || typeof viewConfig.query === 'object')) {
        viewConfig.query = JSON.stringify(viewConfig.query);
      }

      await this.serverStorage.setConfig(
        `views.view.${viewId}`,
        viewConfig,
        appId
      );
    } catch (error) {
      console.error('Failed to save view to server:', error);
      throw error;
    }
  }

  /**
   * Deletes a single view from server storage
   * @private
   */
  async _deleteViewFromServer(appId, viewId) {
    try {
      await this.serverStorage.deleteConfig(`views.view.${viewId}`, appId);
    } catch (error) {
      console.error('Failed to delete view from server:', error);
      throw error;
    }
  }

  /**
   * Gets views from local storage (original implementation)
   * @private
   */
  _getViewsFromLocal(appId) {
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
   * Saves views to local storage (original implementation)
   * @private
   */
  _saveViewsToLocal(appId, views) {
    try {
      localStorage.setItem(this._getLocalPath(appId), JSON.stringify(views));
    } catch {
      // ignore write errors
    }
  }

  /**
   * Gets the local storage path for views
   * @private
   */
  _getLocalPath(appId) {
    return `ParseDashboard:${VERSION}:${appId}:Views`;
  }

  /**
   * Generates a unique ID for a new view
   * @returns {string} A UUID string
   */
  generateViewId() {
    return this._generateViewId();
  }

  /**
   * Generates a unique ID for a view using UUID
   * @private
   */
  _generateViewId() {
    return crypto.randomUUID();
  }
}

// Legacy API compatibility - these functions will work with local storage only
// for backward compatibility
export function getViews(appId) {
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

export function saveViews(appId, views) {
  try {
    localStorage.setItem(path(appId), JSON.stringify(views));
  } catch {
    // ignore write errors
  }
}

function path(appId) {
  return `ParseDashboard:${VERSION}:${appId}:Views`;
}
