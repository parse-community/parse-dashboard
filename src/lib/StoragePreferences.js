/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Utility for managing user's storage preferences (server vs local storage)
 */

const STORAGE_PREFERENCE_KEY = 'ParseDashboard:StoragePreferences';

/**
 * Storage preference options
 */
export const STORAGE_TYPES = {
  LOCAL: 'local',
  SERVER: 'server'
};

/**
 * Gets the storage preference for a specific app
 * @param {string} appId - The application ID
 * @returns {string} The storage preference ('local' or 'server')
 */
export function getStoragePreference(appId) {
  try {
    const preferences = localStorage.getItem(STORAGE_PREFERENCE_KEY);
    if (preferences) {
      const parsed = JSON.parse(preferences);
      return parsed[appId] || STORAGE_TYPES.LOCAL; // Default to local storage
    }
  } catch (error) {
    console.warn('Failed to get storage preference:', error);
  }
  return STORAGE_TYPES.LOCAL; // Default fallback
}

/**
 * Sets the storage preference for a specific app
 * @param {string} appId - The application ID
 * @param {string} preference - The storage preference ('local' or 'server')
 */
export function setStoragePreference(appId, preference) {
  // Validate preference value
  if (!Object.values(STORAGE_TYPES).includes(preference)) {
    console.warn('Invalid storage preference:', preference);
    return;
  }

  try {
    let preferences = {};
    const existing = localStorage.getItem(STORAGE_PREFERENCE_KEY);
    if (existing) {
      preferences = JSON.parse(existing);
    }

    preferences[appId] = preference;
    localStorage.setItem(STORAGE_PREFERENCE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to set storage preference:', error);
  }
}

/**
 * Checks if the user prefers server storage for the given app
 * @param {string} appId - The application ID
 * @returns {boolean} True if user prefers server storage
 */
export function prefersServerStorage(appId) {
  return getStoragePreference(appId) === STORAGE_TYPES.SERVER;
}

/**
 * Checks if the user prefers local storage for the given app
 * @param {string} appId - The application ID
 * @returns {boolean} True if user prefers local storage
 */
export function prefersLocalStorage(appId) {
  return getStoragePreference(appId) === STORAGE_TYPES.LOCAL;
}
