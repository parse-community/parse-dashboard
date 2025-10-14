/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Parse from 'parse';

/**
 * Utility class for storing dashboard configuration on Parse Server
 */
export default class ServerConfigStorage {
  constructor(app) {
    this.app = app;
    this.className = app.config?.className || 'DashboardConfig';

    // Validate className is a non-empty string
    if (typeof this.className !== 'string' || !this.className.trim()) {
      throw new Error('Invalid className for ServerConfigStorage');
    }
  }

  /**
   * Stores a configuration value on the server
   * @param {string} key - The configuration key
   * @param {*} value - The configuration value
   * @param {string} appId - The app ID
   * @param {string | null} userId - The user ID (optional)
   * @returns {Promise}
   */
  async setConfig(key, value, appId, userId = null) {
    // First, try to find existing config object to update instead of creating duplicates
    const query = new Parse.Query(this.className);
    query.equalTo('appId', appId);
    query.equalTo('key', key);

    if (userId) {
      query.equalTo('user', new Parse.User({ objectId: userId }));
    } else {
      query.doesNotExist('user');
    }

    let configObject = await query.first({ useMasterKey: true });

    // If no existing object found, create a new one
    if (!configObject) {
      configObject = new Parse.Object(this.className);
      configObject.set('appId', appId);
      configObject.set('key', key);
      if (userId) {
        configObject.set('user', new Parse.User({ objectId: userId }));
      }
    }

    // Set the value in the appropriate typed field based on value type
    const valueType = this._getValueType(value);
    this._clearAllValueFields(configObject);
    configObject.set(valueType, value);

    // Set empty ACL so object is only accessible with master key
    configObject.setACL(new Parse.ACL());

    // Use master key for operations
    return configObject.save(null, { useMasterKey: true });
  }

  /**
   * Gets a configuration value from the server
   * @param {string} key - The configuration key
   * @param {string} appId - The app ID
   * @param {string | null} userId - The user ID (optional)
   * @returns {Promise<*>} The configuration value
   */
  async getConfig(key, appId, userId = null) {
    const query = new Parse.Query(this.className);
    query.equalTo('appId', appId);
    query.equalTo('key', key);

    if (userId) {
      query.equalTo('user', new Parse.User({ objectId: userId }));
    } else {
      query.doesNotExist('user');
    }

    const result = await query.first({ useMasterKey: true });
    if (!result) {
      return null;
    }

    return this._extractValue(result);
  }

  /**
   * Gets all configuration values for an app with a key prefix
   * @param {string} keyPrefix - The key prefix to filter by
   * @param {string} appId - The app ID
   * @param {string | null} userId - The user ID (optional)
   * @returns {Promise<Object>} Object with keys and values
   */
  async getConfigsByPrefix(keyPrefix, appId, userId = null) {
    const query = new Parse.Query(this.className);
    query.equalTo('appId', appId);
    query.startsWith('key', keyPrefix);

    if (userId) {
      query.equalTo('user', new Parse.User({ objectId: userId }));
    } else {
      query.doesNotExist('user');
    }

    const results = await query.find({ useMasterKey: true });
    const configs = {};

    results.forEach(result => {
      const key = result.get('key');
      const value = this._extractValue(result);
      configs[key] = value;
    });

    return configs;
  }

  /**
   * Deletes a configuration value from the server
   * @param {string} key - The configuration key
   * @param {string} appId - The app ID
   * @param {string | null} userId - The user ID (optional)
   * @returns {Promise}
   */
  async deleteConfig(key, appId, userId = null) {
    const query = new Parse.Query(this.className);
    query.equalTo('appId', appId);
    query.equalTo('key', key);

    if (userId) {
      query.equalTo('user', new Parse.User({ objectId: userId }));
    } else {
      query.doesNotExist('user');
    }

    const result = await query.first({ useMasterKey: true });
    if (result) {
      return result.destroy({ useMasterKey: true });
    }
  }

  /**
   * Checks if server configuration is available for this app
   * @returns {boolean}
   */
  isServerConfigEnabled() {
    return !!(this.app && this.app.config && this.app.config.className);
  }

  /**
   * Gets the value type for a given value
   * @private
   */
  _getValueType(value) {
    if (typeof value === 'boolean') {
      return 'bool';
    } else if (typeof value === 'string') {
      return 'string';
    } else if (typeof value === 'number') {
      return 'number';
    } else if (Array.isArray(value)) {
      return 'array';
    } else if (typeof value === 'object' && value !== null) {
      return 'object';
    }
    return 'string'; // fallback
  }

  /**
   * Clears all value fields on a config object
   * @private
   */
  _clearAllValueFields(configObject) {
    configObject.unset('bool');
    configObject.unset('string');
    configObject.unset('number');
    configObject.unset('array');
    configObject.unset('object');
  }

  /**
   * Extracts the value from a config object based on its type
   * @private
   */
  _extractValue(configObject) {
    const fields = ['bool', 'string', 'number', 'array', 'object'];
    for (const field of fields) {
      const value = configObject.get(field);
      if (value !== undefined && value !== null) {
        return value;
      }
    }
    return null;
  }
}
