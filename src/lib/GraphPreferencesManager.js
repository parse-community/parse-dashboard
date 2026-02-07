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
 * In-memory cache for graphs fetched from server storage
 * Cache persists for the lifetime of the page (until browser reload)
 * Structure: { appId: { className: graphs[] } }
 */
const serverGraphsCache = {};

/**
 * GraphPreferences with server-side storage support
 */
export default class GraphPreferencesManager {
  constructor(app) {
    this.app = app;
    this.serverStorage = new ServerConfigStorage(app);
  }

  /**
   * Gets graphs from either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {string} className - The Parse class name
   * @returns {Promise<Array>} Array of graphs
   */
  async getGraphs(appId, className) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      try {
        // Check cache first
        if (serverGraphsCache[appId]?.[className]) {
          return serverGraphsCache[appId][className];
        }

        // Fetch from server and cache the result
        const serverGraphs = await this._getGraphsFromServer(appId, className);
        // Always return server graphs (even if empty) when server storage is preferred
        const graphs = serverGraphs || [];

        // Cache the fetched graphs
        if (!serverGraphsCache[appId]) {
          serverGraphsCache[appId] = {};
        }
        serverGraphsCache[appId][className] = graphs;

        return graphs;
      } catch (error) {
        console.error('Failed to get graphs from server:', error);
        // When server storage is preferred, return empty array instead of falling back to local
        return [];
      }
    }

    // Use local storage when server storage is not preferred
    return this._getGraphsFromLocal(appId, className);
  }

  /**
   * Saves a single graph to either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {string} className - The Parse class name
   * @param {Object} graph - The graph to save
   * @param {Array} allGraphs - All graphs (required for local storage fallback)
   * @returns {Promise}
   */
  async saveGraph(appId, className, graph, allGraphs) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      await this._saveGraphToServer(appId, className, graph);

      // Invalidate cache - will be reloaded on next getGraphs call
      if (serverGraphsCache[appId]) {
        delete serverGraphsCache[appId][className];
      }

      return;
    }

    // Use local storage when server storage is not preferred
    return this._saveGraphsToLocal(appId, className, allGraphs);
  }

  /**
   * Deletes a single graph from either server or local storage based on configuration and user preference
   * @param {string} appId - The application ID
   * @param {string} className - The Parse class name
   * @param {string} graphId - The ID of the graph to delete
   * @param {Array} allGraphs - All graphs (required for local storage fallback)
   * @returns {Promise}
   */
  async deleteGraph(appId, className, graphId, allGraphs) {
    // Check if server storage is enabled and user prefers it
    if (this.serverStorage.isServerConfigEnabled() && prefersServerStorage(appId)) {
      await this._deleteGraphFromServer(appId, graphId);

      // Invalidate cache - will be reloaded on next getGraphs call
      if (serverGraphsCache[appId]) {
        delete serverGraphsCache[appId][className];
      }

      return;
    }

    // Use local storage when server storage is not preferred
    return this._saveGraphsToLocal(appId, className, allGraphs);
  }

  /**
   * Migrates graphs from local storage to server storage
   * @param {string} appId - The application ID
   * @param {string} className - The Parse class name
   * @param {boolean} overwriteConflicts - If true, overwrite server graphs with same ID
   * @returns {Promise<{success: boolean, graphCount: number, conflicts?: Array}>}
   */
  async migrateToServer(appId, className, overwriteConflicts = false) {
    if (!this.serverStorage.isServerConfigEnabled()) {
      throw new Error('Server configuration is not enabled for this app');
    }

    const localGraphs = this._getGraphsFromLocal(appId, className);
    if (!localGraphs || localGraphs.length === 0) {
      return { success: true, graphCount: 0 };
    }

    try {
      // Get existing graphs from server to detect conflicts
      const existingGraphConfigs = await this.serverStorage.getConfigsByPrefix(
        'browser.graphs.graph.',
        appId,
        null,
        { className }
      );
      const existingGraphIds = Object.keys(existingGraphConfigs).map(key =>
        key.replace('browser.graphs.graph.', '')
      );

      // Check for conflicts
      const localGraphIds = localGraphs.map(graph => graph.id).filter(Boolean);
      const conflictingIds = localGraphIds.filter(id => existingGraphIds.includes(id));

      if (conflictingIds.length > 0 && !overwriteConflicts) {
        // Return conflicts for user decision
        const conflicts = conflictingIds.map(id => {
          const localGraph = localGraphs.find(g => g.id === id);
          const serverGraphKey = `browser.graphs.graph.${id}`;
          const serverGraph = existingGraphConfigs[serverGraphKey];
          return {
            id,
            type: 'graph',
            local: localGraph,
            server: serverGraph
          };
        });

        return {
          success: false,
          graphCount: 0,
          conflicts
        };
      }

      // Proceed with migration (merge mode)
      await this._migrateGraphsToServer(appId, className, localGraphs, overwriteConflicts);

      // Invalidate cache after migration
      if (serverGraphsCache[appId]) {
        delete serverGraphsCache[appId][className];
      }

      return { success: true, graphCount: localGraphs.length };
    } catch (error) {
      console.error('Failed to migrate graphs to server:', error);
      throw error;
    }
  }

  /**
   * Deletes graphs from local storage
   * @param {string} appId - The application ID
   * @param {string} className - The Parse class name
   * @returns {boolean} True if deletion was successful
   */
  deleteFromBrowser(appId, className) {
    try {
      localStorage.removeItem(this._getLocalPath(appId, className));
      return true;
    } catch (error) {
      console.error('Failed to delete graphs from browser:', error);
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
   * Migrates graphs to server storage with merge/overwrite logic
   * @private
   */
  async _migrateGraphsToServer(appId, className, localGraphs, overwriteConflicts) {
    try {
      // Get existing graphs from server
      const existingGraphConfigs = await this.serverStorage.getConfigsByPrefix(
        'browser.graphs.graph.',
        appId,
        null,
        { className }
      );
      const existingGraphIds = Object.keys(existingGraphConfigs).map(key =>
        key.replace('browser.graphs.graph.', '')
      );

      // Save local graphs to server
      await Promise.all(
        localGraphs.map(graph => {
          const graphId = graph.id || this._generateGraphId();
          const graphConfig = { ...graph };
          delete graphConfig.id; // Don't store ID in the config itself

          // Ensure className is included
          if (!graphConfig.className) {
            graphConfig.className = className;
          }

          // Remove null and undefined values to keep the storage clean
          Object.keys(graphConfig).forEach(key => {
            if (graphConfig[key] === null || graphConfig[key] === undefined) {
              delete graphConfig[key];
            }
          });

          // Only save if we're overwriting conflicts or if this graph doesn't exist on server
          if (overwriteConflicts || !existingGraphIds.includes(graphId)) {
            return this.serverStorage.setConfig(
              `browser.graphs.graph.${graphId}`,
              graphConfig,
              appId
            );
          }
          return Promise.resolve(); // Skip conflicting graphs when not overwriting
        })
      );

      // Note: We don't delete server graphs that aren't in local storage
      // This preserves server-side settings that don't conflict with local ones
    } catch (error) {
      console.error('Failed to migrate graphs to server:', error);
      throw error;
    }
  }

  /**
   * Gets graphs from server storage
   * @private
   */
  async _getGraphsFromServer(appId, className) {
    try {
      const graphConfigs = await this.serverStorage.getConfigsByPrefix(
        'browser.graphs.graph.',
        appId,
        null,
        { className }
      );
      const graphs = [];

      Object.entries(graphConfigs).forEach(([key, config]) => {
        if (config && typeof config === 'object') {
          // Extract graph ID from key (browser.graphs.graph.{GRAPH_ID})
          const graphId = key.replace('browser.graphs.graph.', '');

          graphs.push({
            id: graphId,
            ...config
          });
        }
      });

      return graphs;
    } catch (error) {
      console.error('Failed to get graphs from server:', error);
      return [];
    }
  }

  /**
   * Saves a single graph to server storage
   * @private
   */
  async _saveGraphToServer(appId, className, graph) {
    try {
      const graphId = graph.id || this._generateGraphId();
      const graphConfig = { ...graph };
      delete graphConfig.id; // Don't store ID in the config itself

      // Ensure className is included
      if (!graphConfig.className) {
        graphConfig.className = className;
      }

      // Remove null and undefined values to keep the storage clean
      Object.keys(graphConfig).forEach(key => {
        if (graphConfig[key] === null || graphConfig[key] === undefined) {
          delete graphConfig[key];
        }
      });

      await this.serverStorage.setConfig(
        `browser.graphs.graph.${graphId}`,
        graphConfig,
        appId
      );
    } catch (error) {
      console.error('Failed to save graph to server:', error);
      throw error;
    }
  }

  /**
   * Deletes a single graph from server storage
   * @private
   */
  async _deleteGraphFromServer(appId, graphId) {
    try {
      await this.serverStorage.deleteConfig(`browser.graphs.graph.${graphId}`, appId);
    } catch (error) {
      console.error('Failed to delete graph from server:', error);
      throw error;
    }
  }

  /**
   * Gets graphs from local storage (original implementation)
   * @private
   */
  _getGraphsFromLocal(appId, className) {
    let entry;
    try {
      entry = localStorage.getItem(this._getLocalPath(appId, className)) || '[]';
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
   * Saves graphs to local storage (original implementation)
   * @private
   */
  _saveGraphsToLocal(appId, className, graphs) {
    try {
      localStorage.setItem(this._getLocalPath(appId, className), JSON.stringify(graphs));
    } catch {
      // ignore write errors
    }
  }

  /**
   * Gets the local storage path for graphs
   * @private
   */
  _getLocalPath(appId, className) {
    return `ParseDashboard:${VERSION}:${appId}:Graphs:${className}`;
  }

  /**
   * Generates a unique ID for a new graph
   * @returns {string} A UUID string
   */
  generateGraphId() {
    return this._generateGraphId();
  }

  /**
   * Generates a unique ID for a graph using UUID
   * @private
   */
  _generateGraphId() {
    return crypto.randomUUID();
  }
}
