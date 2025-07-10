const VERSION = 1;

export function getViews(appId) {
  let entry;
  try {
    entry = localStorage.getItem(path(appId)) || '[]';
  } catch {
    entry = '[]';
  }
  try {
    return JSON.parse(entry);
  } catch {
    return [];
  }
}

export function saveViews(appId, views) {
  try {
    localStorage.setItem(path(appId), JSON.stringify(views));
  } catch {
    // ignore write errors
  }
}

function path(appId) {
  return `ParseDashboard:${VERSION}:${appId}:Views`;
}
