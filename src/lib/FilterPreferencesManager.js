/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ServerConfigStorage from './ServerConfigStorage';
import { prefersServerStorage, setStoragePreference } from './StoragePreferences';
import { getPreferences, updatePreferences, getAllPreferences } from './ClassPreferences';

const VERSION = 1;

/**
 * In-memory cache for filters fetched from server storage
 * Cache persists for the lifetime of the page (until browser reload)
 * Structure: { appId: { className: filters[] } }
 */
const serverFiltersCache = {};

/**
 * FilterPreferencesManager with server-side storage support
 * Manages DataBrowser filters for specific classes
 */
export default class FilterPreferencesManager {
  constructor(app) {
    this.app = app;
    this.serverStorage = new ServerConfigStorage(app);
  }

  /**
   * Gets filters for a specific class from either server or local storage
   * @param {string} appId - The application ID
   * @param {string} className - The class name
   * @returns {Promise<Array>} Array of filters
   */
  async getFilters(appId, className) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        // Check cache first
        if (serverFiltersCache[appId] && serverFiltersCache[appId][className]) {
          return serverFiltersCache[appId][className];
        }

        // Fetch from server and cache the result
        const serverFilters = await this._getFiltersFromServer(appId, className);
        // Always return server filters (even if empty) when server storage is preferred
        const filters = serverFilters || [];

        // Cache the fetched filters
        if (!serverFiltersCache[appId]) {
          serverFiltersCache[appId] = {};
        }
        serverFiltersCache[appId][className] = filters;

        return filters;
      } catch (error) {
        console.error('Failed to get filters from server:', error);
        // When server storage is preferred, return empty array instead of falling back to local
        return [];
      }
    }

    // Use local storage when server storage is not preferred
    return this._getFiltersFromLocal(appId, className);
  }

  /**
   * Saves a filter to either server or local storage
   * @param {string} appId - The application ID
   * @param {string} className - The class name
   * @param {Object} filter - The filter to save
   * @param {Array} allFilters - All filters (required for local storage fallback)
   * @returns {Promise}
   */
  async saveFilter(appId, className, filter, allFilters) {
    // Ensure filter has a UUID (create new object to avoid mutating input)
    const filterWithId = filter.id ? filter : { ...filter, id: this._generateFilterId() };

    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        await this._saveFilterToServer(appId, className, filterWithId);

        // Invalidate cache for this class - will be reloaded on next getFilters call
        if (serverFiltersCache[appId]) {
          delete serverFiltersCache[appId][className];
        }

        return;
      } catch (error) {
        console.error('Failed to save filter to server:', error);
        // On error, fallback to local storage
      }
    }

    // Use local storage (either by preference or as fallback)
    return this._saveFiltersToLocal(appId, className, allFilters);
  }

  /**
   * Deletes a filter from either server or local storage
   * @param {string} appId - The application ID
   * @param {string} className - The class name
   * @param {string} filterId - The ID of the filter to delete
   * @param {Array} allFilters - All filters (required for local storage fallback)
   * @returns {Promise}
   */
  async deleteFilter(appId, className, filterId, allFilters) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        await this._deleteFilterFromServer(appId, filterId);

        // Invalidate cache for this class - will be reloaded on next getFilters call
        if (serverFiltersCache[appId]) {
          delete serverFiltersCache[appId][className];
        }

        return;
      } catch (error) {
        console.error('Failed to delete filter from server:', error);
        // On error, fallback to local storage
      }
    }

    // Use local storage (either by preference or as fallback)
    return this._saveFiltersToLocal(appId, className, allFilters);
  }

  /**
   * Migrates filters from local storage to server storage for all classes
   * @param {string} appId - The application ID
   * @param {boolean} overwriteConflicts - If true, overwrite server filters with same ID
   * @returns {Promise<{success: boolean, filterCount: number, conflicts?: Array}>}
   */
  async migrateToServer(appId, overwriteConflicts = false) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      throw new Error('Server configuration is not enabled for this app');
    }

    const allPreferences = getAllPreferences(appId);
    let totalFilterCount = 0;
    const allConflicts = [];

    try {
      // Get all existing filters from server
      const existingFilterConfigs = await this.serverStorage.getConfigsByPrefix(
        'browser.filters.filter.',
        appId
      );
      const existingFilterIds = Object.keys(existingFilterConfigs).map(key =>
        key.replace('browser.filters.filter.', '')
      );

      for (const [className, preferences] of Object.entries(allPreferences)) {
        if (preferences.filters && preferences.filters.length > 0) {
          // Ensure all filters have UUIDs before migrating
          const filtersWithIds = preferences.filters.map(filter => {
            if (!filter.id) {
              return { ...filter, id: this._generateFilterId() };
            }
            return filter;
          });

          // Check for conflicts in this class
          const localFilterIds = filtersWithIds.map(f => f.id);
          const conflictingIds = localFilterIds.filter(id => existingFilterIds.includes(id));

          if (conflictingIds.length > 0 && !overwriteConflicts) {
            // Collect conflicts
            conflictingIds.forEach(id => {
              const localFilter = filtersWithIds.find(f => f.id === id);
              const serverFilterKey = `browser.filters.filter.${id}`;
              const serverFilter = existingFilterConfigs[serverFilterKey];
              allConflicts.push({
                id,
                type: 'filter',
                className,
                local: localFilter,
                server: serverFilter
              });
            });
          }

          if (overwriteConflicts || conflictingIds.length === 0) {
            // Only migrate if no conflicts or overwriting
            await this._migrateFiltersToServer(appId, className, filtersWithIds, existingFilterIds, overwriteConflicts);
            totalFilterCount += filtersWithIds.length;
          }
        }
      }

      if (allConflicts.length > 0 && !overwriteConflicts) {
        return {
          success: false,
          filterCount: 0,
          conflicts: allConflicts
        };
      }

      // Invalidate cache after migration
      delete serverFiltersCache[appId];

      return { success: true, filterCount: totalFilterCount };
    } catch (error) {
      console.error('Failed to migrate filters to server:', error);
      throw error;
    }
  }

  /**
   * Deletes filters from local storage for all classes
   * @param {string} appId - The application ID
   * @returns {boolean} True if deletion was successful
   */
  deleteFromBrowser(appId) {
    try {
      const allPreferences = getAllPreferences(appId);
      for (const className of Object.keys(allPreferences)) {
        const path = this._getLocalPath(appId, className);
        localStorage.removeItem(path);
      }
      return true;
    } catch (error) {
      console.error('Failed to delete filters from browser:', error);
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
   * Migrates filters to server storage with merge/overwrite logic
   * @private
   */
  async _migrateFiltersToServer(appId, className, filters, existingFilterIds, overwriteConflicts) {
    try {
      // Save local filters to server
      await Promise.all(
        filters.map(filter => {
          const filterId = filter.id;
          const filterConfig = { ...filter };
          delete filterConfig.id; // Don't store ID in the config itself

          // Add className to the object
          filterConfig.className = className;

          // Remove null and undefined values to keep the storage clean
          Object.keys(filterConfig).forEach(key => {
            if (filterConfig[key] === null || filterConfig[key] === undefined) {
              delete filterConfig[key];
            }
          });

          // Stringify the filter if it exists and is an array/object
          if (filterConfig.filter && (Array.isArray(filterConfig.filter) || typeof filterConfig.filter === 'object')) {
            filterConfig.filter = JSON.stringify(filterConfig.filter);
          }

          // Only save if we're overwriting conflicts or if this filter doesn't exist on server
          if (overwriteConflicts || !existingFilterIds.includes(filterId)) {
            return this.serverStorage.setConfig(
              `browser.filters.filter.${filterId}`,
              filterConfig,
              appId
            );
          }
          return Promise.resolve(); // Skip conflicting filters when not overwriting
        })
      );

      // Note: We don't delete server filters that aren't in local storage
      // This preserves server-side settings that don't conflict with local ones
    } catch (error) {
      console.error('Failed to migrate filters to server:', error);
      throw error;
    }
  }

  /**
   * Gets filters for a specific class from server storage
   * @private
   */
  async _getFiltersFromServer(appId, className) {
    try {
      // Query server with className filter to only fetch filters for this class
      const filterConfigs = await this.serverStorage.getConfigsByPrefix(
        'browser.filters.filter.',
        appId,
        null,
        { className } // Filter by className in the object field
      );
      const filters = [];

      Object.entries(filterConfigs).forEach(([key, config]) => {
        if (config && typeof config === 'object') {
          // Extract filter ID from key (browser.filters.filter.{FILTER_ID})
          const filterId = key.replace('browser.filters.filter.', '');

          const filterConfig = { ...config };

          // Remove className from the filter object (it's only used for server-side filtering)
          delete filterConfig.className;

          // Note: We keep the filter property as a string (not parsed) to match the format
          // returned by _getFiltersFromLocal, which uses getPreferences that stores filters as strings

          filters.push({
            id: filterId,
            ...filterConfig
          });
        }
      });

      return filters;
    } catch (error) {
      console.error('Failed to get filters from server:', error);
      return [];
    }
  }

  /**
   * Saves filters for a specific class to server storage
   * @private
   */
  async _saveFiltersToServer(appId, className, filters) {
    try {
      // First, get existing filters from server to know which ones to delete
      // Only fetch filters for this specific class
      const existingFilterConfigs = await this.serverStorage.getConfigsByPrefix(
        'browser.filters.filter.',
        appId,
        null,
        { className } // Filter by className in the object field
      );

      // Extract filter IDs
      const existingFilterIds = Object.keys(existingFilterConfigs)
        .map(key => key.replace('browser.filters.filter.', ''));

      // Validate all filters have IDs before proceeding
      filters.forEach((filter, index) => {
        if (!filter.id) {
          throw new Error(`Filter at index ${index} is missing an ID. All filters must have IDs before saving to server.`);
        }
      });

      // Delete filters that are no longer in the new filters array
      const newFilterIds = filters.map(filter => filter.id);
      const filtersToDelete = existingFilterIds.filter(id => !newFilterIds.includes(id));

      await Promise.all(
        filtersToDelete.map(id =>
          this.serverStorage.deleteConfig(`browser.filters.filter.${id}`, appId)
        )
      );

      // Save or update current filters
      await Promise.all(
        filters.map(filter => {
          const filterId = filter.id;
          const filterConfig = { ...filter };
          delete filterConfig.id; // Don't store ID in the config itself

          // Add className to the object
          filterConfig.className = className;

          // Remove null and undefined values to keep the storage clean
          Object.keys(filterConfig).forEach(key => {
            if (filterConfig[key] === null || filterConfig[key] === undefined) {
              delete filterConfig[key];
            }
          });

          // Stringify the filter if it exists and is an array/object
          if (filterConfig.filter && (Array.isArray(filterConfig.filter) || typeof filterConfig.filter === 'object')) {
            filterConfig.filter = JSON.stringify(filterConfig.filter);
          }

          return this.serverStorage.setConfig(
            `browser.filters.filter.${filterId}`,
            filterConfig,
            appId
          );
        })
      );
    } catch (error) {
      console.error('Failed to save filters to server:', error);
      throw error;
    }
  }

  /**
   * Saves a single filter to server storage
   * @private
   */
  async _saveFilterToServer(appId, className, filter) {
    try {
      const filterId = filter.id || this._generateFilterId();
      const filterConfig = { ...filter };
      delete filterConfig.id; // Don't store ID in the config itself

      // Add className to the object
      filterConfig.className = className;

      // Remove null and undefined values to keep the storage clean
      Object.keys(filterConfig).forEach(key => {
        if (filterConfig[key] === null || filterConfig[key] === undefined) {
          delete filterConfig[key];
        }
      });

      // Stringify the filter if it exists and is an array/object
      if (filterConfig.filter && (Array.isArray(filterConfig.filter) || typeof filterConfig.filter === 'object')) {
        filterConfig.filter = JSON.stringify(filterConfig.filter);
      }

      await this.serverStorage.setConfig(
        `browser.filters.filter.${filterId}`,
        filterConfig,
        appId
      );
    } catch (error) {
      console.error('Failed to save filter to server:', error);
      throw error;
    }
  }

  /**
   * Deletes a single filter from server storage
   * @private
   */
  async _deleteFilterFromServer(appId, filterId) {
    try {
      await this.serverStorage.deleteConfig(`browser.filters.filter.${filterId}`, appId);
    } catch (error) {
      console.error('Failed to delete filter from server:', error);
      throw error;
    }
  }

  /**
   * Gets filters from local storage (original implementation)
   * @private
   */
  _getFiltersFromLocal(appId, className) {
    const preferences = getPreferences(appId, className);
    // getPreferences() already ensures all filters have UUIDs
    return preferences?.filters || [];
  }

  /**
   * Saves filters to local storage (original implementation)
   * @private
   */
  _saveFiltersToLocal(appId, className, filters) {
    const preferences = getPreferences(appId, className) || { filters: [] };

    // Ensure all filters have UUIDs before saving
    const filtersWithIds = filters.map(filter => {
      if (!filter.id) {
        return { ...filter, id: this._generateFilterId() };
      }
      return filter;
    });

    preferences.filters = filtersWithIds;
    updatePreferences(preferences, appId, className);
  }

  /**
   * Gets the local storage path for class preferences
   * @private
   */
  _getLocalPath(appId, className) {
    return `ParseDashboard:${VERSION}:${appId}:ClassPreference:${className}`;
  }

  /**
   * Generates a unique ID for a new filter
   * @returns {string} A UUID string
   */
  generateFilterId() {
    return this._generateFilterId();
  }

  /**
   * Generates a unique ID for a filter using UUID
   * @private
   */
  _generateFilterId() {
    return crypto.randomUUID();
  }
}
