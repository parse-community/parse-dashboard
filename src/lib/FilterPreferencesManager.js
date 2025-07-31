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
 * Enhanced FilterPreferences with server-side storage support
 */
export default class FilterPreferencesManager {
  constructor(app) {
    this.app = app;
    this.serverStorage = new ServerConfigStorage(app);
  }

  /**
   * Gets class filters from either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {string} className - The class name
   * @returns {Promise<Object>} Class preferences object with filters
   */
  async getClassPreferences(applicationId, className) {
    // Check if server storage is enabled and user prefers server storage
    const isServerStorageEnabled = this.serverConfigStorage.isServerStorageEnabled();
    const prefersServerStorage = this.storagePreferences.prefersServerStorage('filters');
    
    if (isServerStorageEnabled && prefersServerStorage) {
      return await this.getServerClassPreferences(applicationId, className);
    } else {
      return this.getLocalClassPreferences(applicationId, className);
    }
  }

  /**
   * Saves class filters to either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {string} className - The class name
   * @param {Object} preferences - Class preferences object with filters
   * @returns {Promise}
   */
  async saveClassPreferences(appId, className, preferences) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        return await this._saveClassPreferencesToServer(appId, className, preferences);
      } catch (error) {
        console.error('Failed to save class preferences to server:', error);
        // On error, fallback to local storage
      }
    }
    
    // Use local storage (either by preference or as fallback)
    return this._saveClassPreferencesToLocal(appId, className, preferences);
  }

  /**
   * Migrates class filters from local storage to server storage
   * @param {string} appId - The application ID
   * @returns {Promise<{success: boolean, classCount: number, filterCount: number}>}
   */
  async migrateToServer(appId) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      throw new Error('Server configuration is not enabled for this app');
    }

    const allPreferences = this._getAllPreferencesFromLocal(appId);
    if (!allPreferences || Object.keys(allPreferences).length === 0) {
      return { success: true, classCount: 0, filterCount: 0 };
    }

    let totalFilterCount = 0;
    try {
      await Promise.all(
        Object.entries(allPreferences).map(async ([className, preferences]) => {
          await this._saveClassPreferencesToServer(appId, className, preferences);
          totalFilterCount += preferences.filters ? preferences.filters.length : 0;
        })
      );
      return {
        success: true,
        classCount: Object.keys(allPreferences).length,
        filterCount: totalFilterCount
      };
    } catch (error) {
      console.error('Failed to migrate class preferences to server:', error);
      throw error;
    }
  }

  /**
   * Deletes class filters from local storage
   * @param {string} appId - The application ID
   * @param {string} className - The class name (optional, if not provided deletes all classes)
   * @returns {boolean} True if deletion was successful
   */
  deleteFromBrowser(appId, className) {
    try {
      if (className) {
        localStorage.removeItem(this._getLocalPath(appId, className));
      } else {
        // Delete all class preferences for this app
        const storageKeys = Object.keys(localStorage);
        const keysToDelete = storageKeys.filter(key => {
          const split = key.split(':');
          return split.length > 3 &&
                 split[0] === 'ParseDashboard' &&
                 split[1] === VERSION.toString() &&
                 split[2] === appId &&
                 split[3] === 'ClassPreference';
        });
        keysToDelete.forEach(key => localStorage.removeItem(key));
      }
      return true;
    } catch (error) {
      console.error('Failed to delete class preferences from browser:', error);
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
   * Gets class preferences from server storage
   * @private
   */
  async _getClassPreferencesFromServer(appId, className) {
    try {
      const filterConfigs = await this.serverStorage.getConfigsByPrefix(
        `filters.class.${className}.filter.id.`,
        appId
      );
      
      const filters = [];
      Object.entries(filterConfigs).forEach(([key, config]) => {
        if (config && typeof config === 'object') {
          // Extract filter ID from key (filters.class.{CLASS_NAME}.filter.id.{FILTER_ID})
          const filterId = key.replace(`filters.class.${className}.filter.id.`, '');
          
          // Parse the filter data if it's a string (it was stringified for storage)
          const filterConfig = { ...config };
          if (filterConfig.filter && typeof filterConfig.filter === 'string') {
            try {
              filterConfig.filter = JSON.parse(filterConfig.filter);
            } catch (e) {
              console.warn('Failed to parse filter data from server storage:', e);
              // Keep as string if parsing fails
            }
          }
          
          filters.push({
            id: filterId,
            ...filterConfig
          });
        }
      });
      
      return { filters };
    } catch (error) {
      console.error('Failed to get class preferences from server:', error);
      return { filters: [] };
    }
  }

  /**
   * Saves class preferences to server storage
   * @private
   */
  async _saveClassPreferencesToServer(appId, className, preferences) {
    try {
      const filters = preferences.filters || [];
      
      // First, get existing filters from server to know which ones to delete
      const existingFilterConfigs = await this.serverStorage.getConfigsByPrefix(
        `filters.class.${className}.filter.id.`,
        appId
      );
      const existingFilterIds = Object.keys(existingFilterConfigs).map(key =>
        key.replace(`filters.class.${className}.filter.id.`, '')
      );

      // Delete filters that are no longer in the new filters array
      const newFilterIds = filters.map(filter => filter.id).filter(Boolean);
      const filtersToDelete = existingFilterIds.filter(id => !newFilterIds.includes(id));
      
      await Promise.all(
        filtersToDelete.map(id =>
          this.serverStorage.deleteConfig(`filters.class.${className}.filter.id.${id}`, appId)
        )
      );

      // Save or update current filters
      await Promise.all(
        filters.map(filter => {
          if (!filter.id) {
            // Skip filters without IDs (shouldn't happen with modern filters)
            console.warn('Skipping filter without ID during server save:', filter);
            return Promise.resolve();
          }
          
          const filterConfig = { ...filter };
          delete filterConfig.id; // Don't store ID in the config itself
          
          // Remove null and undefined values to keep the storage clean
          Object.keys(filterConfig).forEach(key => {
            if (filterConfig[key] === null || filterConfig[key] === undefined) {
              delete filterConfig[key];
            }
          });
          
          // Stringify the filter data if it exists and is an array/object
          if (filterConfig.filter && (Array.isArray(filterConfig.filter) || typeof filterConfig.filter === 'object')) {
            filterConfig.filter = JSON.stringify(filterConfig.filter);
          }
          
          return this.serverStorage.setConfig(
            `filters.class.${className}.filter.id.${filter.id}`,
            filterConfig,
            appId
          );
        })
      );
    } catch (error) {
      console.error('Failed to save class preferences to server:', error);
      throw error;
    }
  }

  /**
   * Gets class preferences from local storage (original implementation)
   * @private
   */
  _getClassPreferencesFromLocal(appId, className) {
    let entry;
    try {
      entry = localStorage.getItem(this._getLocalPath(appId, className)) ||
              JSON.stringify({ filters: [] });
    } catch {
      entry = JSON.stringify({ filters: [] });
    }
    try {
      return JSON.parse(entry);
    } catch {
      return { filters: [] };
    }
  }

  /**
   * Saves class preferences to local storage (original implementation)
   * @private
   */
  _saveClassPreferencesToLocal(appId, className, preferences) {
    try {
      localStorage.setItem(this._getLocalPath(appId, className), JSON.stringify(preferences));
    } catch {
      // ignore write errors
    }
  }

  /**
   * Gets all class preferences from local storage
   * @private
   */
  _getAllPreferencesFromLocal(appId) {
    const storageKeys = Object.keys(localStorage);
    const result = {};
    for (const key of storageKeys) {
      const split = key.split(':');
      if (split.length <= 3 || split[2] !== appId || split[3] !== 'ClassPreference') {
        continue;
      }
      const className = split.at(-1);
      const preferences = this._getClassPreferencesFromLocal(appId, className);
      if (preferences && preferences.filters && preferences.filters.length > 0) {
        result[className] = preferences;
      }
    }
    return result;
  }

  /**
   * Gets the local storage path for class preferences
   * @private
   */
  _getLocalPath(appId, className) {
    return `ParseDashboard:${VERSION}:${appId}:ClassPreference:${className}`;
  }
}
