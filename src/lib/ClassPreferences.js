const VERSION = 'v1'; // In case we ever need to invalidate these
let cache = {};
export function updatePreferences(prefs, appId, className) {
  try {
    localStorage.setItem(path(appId, className), JSON.stringify(prefs));
  } catch (e) {
    // Fails in Safari private browsing
  }
  cache[appId] = cache[appId] || {};
  cache[appId][className] = prefs;
}

export function getPreferences(appId, className) {
  if (cache[appId] && cache[appId][className]) {
    return cache[appId][className];
  }
  let entry;
  try {
    entry = localStorage.getItem(path(appId, className)) || JSON.stringify({
      filters: [],
    });
  } catch (e) {
    // Fails in Safari private browsing
    entry = null;
  }
  if (!entry) {
    return null;
  }
  try {
    let prefs = JSON.parse(entry);
    cache[appId] = cache[appId] || {};
    cache[appId][className] = prefs;
    return prefs;
  } catch (e) {
    return null;
  }
}
function path(appId, className) {
  return `ParseDashboard:${VERSION}:${appId}:ClassPreference:${className}`;
}
