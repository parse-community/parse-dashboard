const VERSION = 1; // In case we ever need to invalidate these
import Parse from 'parse';

export const load = async (preferencesClassName) => {
  const preferences = await new Parse.Query(preferencesClassName)
    .equalTo('user', Parse.User.current())
    .equalTo('key', 'classPreferences')
    .first({ useMasterKey: true });

  if (preferences) {
    const prefs = preferences.get('value');
    setClassPreferences(JSON.parse(prefs), Parse.applicationId);
  }

}

export function setClassPreferences(classPreference, appId) {
  if (!classPreference) {
    return;
  }

  for (const className in classPreference) {
    const preferences = getPreferences(appId, className) || { filters: [] };
    const { filters } = classPreference[className];
    for (const filter of filters) {
      if (Array.isArray(filter.filter)) {
        filter.filter = JSON.stringify(filter.filter);
      }
      if (preferences.filters.some(row => JSON.stringify(row) === JSON.stringify(filter))) {
        continue;
      }
      preferences.filters.push(filter);
    }
    updatePreferences(preferences, appId, className);
  }
}
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
