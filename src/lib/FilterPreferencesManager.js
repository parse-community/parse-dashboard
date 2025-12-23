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
    console.log('[FilterPreferencesManager] getFilters called:', { appId, className });

    const serverConfigEnabled = this.serverStorage.isServerConfigEnabled();
    const prefersServer = prefersServerStorage(appId);

    console.log('[FilterPreferencesManager] Storage configuration:', {
      serverConfigEnabled,
      prefersServer,
      willUseServer: serverConfigEnabled && prefersServer
    });

    // Check if server storage is enabled and user prefers it
    if (serverConfigEnabled && prefersServer) {
      try {
        console.log('[FilterPreferencesManager] Fetching filters from server...');
        const serverFilters = await this._getFiltersFromServer(appId, className);
        console.log('[FilterPreferencesManager] Server filters retrieved:', serverFilters);
        // Always return server filters (even if empty) when server storage is preferred
        return serverFilters || [];
      } catch (error) {
        console.error('[FilterPreferencesManager] Failed to get filters from server:', error);
        // When server storage is preferred, return empty array instead of falling back to local
        return [];
      }
    }

    // Use local storage when server storage is not preferred
    console.log('[FilterPreferencesManager] Fetching filters from local storage...');
    const localFilters = this._getFiltersFromLocal(appId, className);
    console.log('[FilterPreferencesManager] Local filters retrieved:', localFilters);
    return localFilters;
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
    // Ensure filter has a UUID
    if (!filter.id) {
      filter.id = this._generateFilterId();
    }

    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        return await this._saveFilterToServer(appId, className, filter);
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
        return await this._deleteFilterFromServer(appId, className, filterId);
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
   * @returns {Promise<{success: boolean, filterCount: number}>}
   */
  async migrateToServer(appId) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      throw new Error('Server configuration is not enabled for this app');
    }

    const allPreferences = getAllPreferences(appId);
    let totalFilterCount = 0;

    try {
      for (const [className, preferences] of Object.entries(allPreferences)) {
        if (preferences.filters && preferences.filters.length > 0) {
          // Ensure all filters have UUIDs before migrating
          const filtersWithIds = preferences.filters.map(filter => {
            if (!filter.id) {
              return { ...filter, id: this._generateFilterId() };
            }
            return filter;
          });

          await this._saveFiltersToServer(appId, className, filtersWithIds);
          totalFilterCount += filtersWithIds.length;
        }
      }

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
   * Gets filters for a specific class from server storage
   * @private
   */
  async _getFiltersFromServer(appId, className) {
    try {
      console.log('[FilterPreferencesManager] _getFiltersFromServer - Fetching configs with prefix "dataBrowser.filter."');
      const filterConfigs = await this.serverStorage.getConfigsByPrefix(
        'dataBrowser.filter.',
        appId
      );
      console.log('[FilterPreferencesManager] _getFiltersFromServer - Raw configs from server:', filterConfigs);

      const filters = [];

      Object.entries(filterConfigs).forEach(([key, config]) => {
        console.log('[FilterPreferencesManager] _getFiltersFromServer - Processing config:', { key, config });

        if (config && typeof config === 'object') {
          // Only include filters for this class
          if (config.className !== className) {
            console.log('[FilterPreferencesManager] _getFiltersFromServer - Skipping filter (wrong class):', {
              key,
              configClassName: config.className,
              targetClassName: className
            });
            return;
          }

          // Extract filter ID from key (dataBrowser.filter.{FILTER_ID})
          const filterId = key.replace('dataBrowser.filter.', '');

          const filterConfig = { ...config };

          // Remove className from the filter object (it's only used for server-side filtering)
          delete filterConfig.className;

          // Note: We keep the filter property as a string (not parsed) to match the format
          // returned by _getFiltersFromLocal, which uses getPreferences that stores filters as strings

          const filter = {
            id: filterId,
            ...filterConfig
          };

          console.log('[FilterPreferencesManager] _getFiltersFromServer - Adding filter:', filter);
          filters.push(filter);
        }
      });

      console.log('[FilterPreferencesManager] _getFiltersFromServer - Final filters array:', filters);
      return filters;
    } catch (error) {
      console.error('[FilterPreferencesManager] _getFiltersFromServer - Error:', error);
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
      const existingFilterConfigs = await this.serverStorage.getConfigsByPrefix(
        'dataBrowser.filter.',
        appId
      );

      // Filter to only this class's filters
      const existingFilterIds = Object.entries(existingFilterConfigs)
        .filter(([key, config]) => config.className === className)
        .map(([key]) => key.replace('dataBrowser.filter.', ''));

      // Delete filters that are no longer in the new filters array
      const newFilterIds = filters.map(filter => filter.id || this._generateFilterId());
      const filtersToDelete = existingFilterIds.filter(id => !newFilterIds.includes(id));

      await Promise.all(
        filtersToDelete.map(id =>
          this.serverStorage.deleteConfig(`dataBrowser.filter.${id}`, appId)
        )
      );

      // Save or update current filters
      await Promise.all(
        filters.map(filter => {
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

          return this.serverStorage.setConfig(
            `dataBrowser.filter.${filterId}`,
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
        `dataBrowser.filter.${filterId}`,
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
  async _deleteFilterFromServer(appId, className, filterId) {
    try {
      await this.serverStorage.deleteConfig(`dataBrowser.filter.${filterId}`, appId);
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
    if (!preferences || !preferences.filters) {
      return [];
    }

    // Ensure all filters have UUIDs
    return preferences.filters.map(filter => {
      if (!filter.id) {
        return { ...filter, id: this._generateFilterId() };
      }
      return filter;
    });
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
