/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import FilterPreferencesManager from './FilterPreferencesManager';

const VERSION = 1; // In case we ever need to invalidate these

// Global filter preferences manager instance
let filterPreferencesManager = null;

/**
 * Enhanced ClassPreferences with server-side storage support
 */
export class ClassPreferencesManager {
  constructor(app) {
    this.app = app;
    this.filterManager = new FilterPreferencesManager(app);
  }

  /**
   * Gets class preferences from either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {string} className - The class name
   * @returns {Promise<Object>} Class preferences object
   */
  async getPreferences(appId, className) {
    return await this.filterManager.getClassPreferences(appId, className);
  }

  /**
   * Updates class preferences to either server or local storage based on configuration and user preference
   * @param {Object} prefs - The preferences object
   * @param {string} appId - The application ID
   * @param {string} className - The class name
   * @returns {Promise}
   */
  async updatePreferences(prefs, appId, className) {
    return await this.filterManager.saveClassPreferences(appId, className, prefs);
  }

  /**
   * Gets filters for a specific class from either server or local storage based on configuration and user preference
   * @param {string} className - The class name
   * @returns {Promise<Array>} Array of filters
   */
  async getFilters(className) {
    try {
      const preferences = await this.getPreferences(this.app.applicationId, className);
      const filters = preferences.filters || [];
      return filters;
    } catch (error) {
      console.warn(`Failed to get filters for class ${className}:`, error);
      return [];
    }
  }

  /**
   * Sets filters for a specific class to either server or local storage based on configuration and user preference
   * @param {string} className - The class name
   * @param {Array} filters - Array of filters
   * @returns {Promise}
   */
  async setFilters(className, filters) {
    const preferences = await this.getPreferences(this.app.applicationId, className);
    preferences.filters = filters;
    return await this.updatePreferences(preferences, this.app.applicationId, className);
  }

  /**
   * Gets all class preferences for an app
   * @param {string} appId - The application ID
   * @returns {Promise<Object>} Object with className keys and preferences values
   */
  async getAllPreferences(appId) {
    // For server storage, we'll need to get all classes first
    // For now, we'll maintain compatibility with the local storage approach
    // but enhance it to work with both storage types
    if (this.filterManager.serverStorage.isServerConfigEnabled() &&
        this.filterManager.getStoragePreference(appId) === 'server') {
      // For server storage, we would need to query all filter configurations
      // This is more complex and might require a different approach
      // For now, we'll use the local storage method as fallback
      return this._getAllPreferencesFromLocal(appId);
    } else {
      return this._getAllPreferencesFromLocal(appId);
    }
  }

  /**
   * Migrates class preferences from local to server storage
   * @param {string} appId - The application ID
   * @returns {Promise<{success: boolean, classCount: number, filterCount: number}>}
   */
  async migrateToServer(appId) {
    return await this.filterManager.migrateToServer(appId);
  }

  /**
   * Deletes class preferences from browser storage
   * @param {string} appId - The application ID
   * @param {string} className - The class name (optional)
   * @returns {boolean} True if deletion was successful
   */
  deleteFromBrowser(appId, className) {
    return this.filterManager.deleteFromBrowser(appId, className);
  }

  /**
   * Sets the storage preference for the app
   * @param {string} appId - The application ID
   * @param {string} preference - The storage preference ('local' or 'server')
   */
  setStoragePreference(appId, preference) {
    this.filterManager.setStoragePreference(appId, preference);
  }

  /**
   * Gets the current storage preference for the app
   * @param {string} appId - The application ID
   * @returns {string} The storage preference ('local' or 'server')
   */
  getStoragePreference(appId) {
    return this.filterManager.getStoragePreference(appId);
  }

  /**
   * Private method for getting all preferences from local storage
   * @private
   */
  _getAllPreferencesFromLocal(appId) {
    const storageKeys = Object.keys(localStorage);
    const result = {};
    for (const key of storageKeys) {
      const split = key.split(':');
      if (split.length <= 1 || split[2] !== appId) {
        continue;
      }
      const className = split.at(-1);
      const preferences = getPreferences(appId, className);
      if (preferences) {
        preferences.filters = preferences.filters.map(filter => {
          if (typeof filter.filter === 'string') {
            filter.filter = JSON.parse(filter.filter);
          }
          return filter;
        });
        result[className] = preferences;
      }
    }
    return result;
  }
}

/**
 * Initializes or gets the global filter preferences manager
 * @param {Object} app - The app object
 * @returns {ClassPreferencesManager}
 */
export function getClassPreferencesManager(app) {
  if (!filterPreferencesManager || filterPreferencesManager.app !== app) {
    filterPreferencesManager = new ClassPreferencesManager(app);
  }
  return filterPreferencesManager;
}

// Legacy API - these functions maintain backward compatibility
export function updatePreferences(prefs, appId, className) {
  try {
    localStorage.setItem(path(appId, className), JSON.stringify(prefs));
  } catch {
    // Fails in Safari private browsing
  }
}

export function getPreferences(appId, className) {
  let entry;
  try {
    entry =
      localStorage.getItem(path(appId, className)) ||
      JSON.stringify({
        filters: [],
      });
  } catch {
    // Fails in Safari private browsing
    entry = null;
  }
  if (!entry) {
    return null;
  }
  try {
    return JSON.parse(entry);
  } catch {
    return null;
  }
}
function path(appId, className) {
  return `ParseDashboard:${VERSION}:${appId}:ClassPreference:${className}`;
}

export function getAllPreferences(appId) {
  const storageKeys = Object.keys(localStorage);
  const result = {};
  for (const key of storageKeys) {
    const split = key.split(':');
    if (split.length <= 1 || split[2] !== appId) {
      continue;
    }
    const className = split.at(-1);
    const preferences = getPreferences(appId, className);
    if (preferences) {
      preferences.filters = preferences.filters.map(filter => {
        if (typeof filter.filter === 'string') {
          filter.filter = JSON.parse(filter.filter);
        }
        return filter;
      });
      result[className] = preferences;
    }
  }
  return result;
}
