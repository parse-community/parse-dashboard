/*
 * Theme management utility
 * Handles theme persistence (localStorage) and application (data-theme attribute)
 */

const STORAGE_KEY = 'parse-dashboard-theme';
const VALID_THEMES = ['light', 'dark', 'classic', 'auto'];

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * Resolve the effective theme (handles 'auto' → system preference)
 */
function resolveTheme(theme) {
  if (theme === 'auto') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply theme to the document
 */
function applyTheme(theme) {
  const resolved = resolveTheme(theme);
  if (resolved === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', resolved);
  }
}

/**
 * Get the saved theme preference from localStorage
 */
export function getSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_THEMES.includes(saved)) {
      return saved;
    }
  } catch (e) {
    // localStorage may be unavailable
  }
  return 'light';
}

/**
 * Set and apply a theme
 */
export function setTheme(theme) {
  if (!VALID_THEMES.includes(theme)) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    // localStorage may be unavailable
  }
  applyTheme(theme);
}

/**
 * Initialize theme on page load. Call as early as possible.
 */
export function initTheme() {
  const theme = getSavedTheme();
  applyTheme(theme);

  // If auto, listen for system preference changes
  if (theme === 'auto' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const current = getSavedTheme();
      if (current === 'auto') {
        applyTheme('auto');
      }
    });
  }
}
