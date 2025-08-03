const VERSION = 1; // In case we ever need to invalidate these
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
