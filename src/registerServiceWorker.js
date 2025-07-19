function registerServiceWorker() {

  if (!window.PARSE_DASHBOARD_ENABLE_RESOURCE_CACHE) {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    return;
  }

  const mountPath = (window.PARSE_DASHBOARD_PATH || '/').replace(/\/?$/, '/');
  const swPath = `${mountPath}sw.js`;
  const countKey = `pd-sw-tabs:${mountPath}`;

  /**
   * Registers the service worker at the specified path.
   */
  const register = () => {
    navigator.serviceWorker.register(swPath).catch(() => {});
  };

  /**
   * Increments the count of open dashboard tabs in localStorage.
   */
  const increment = () => {
    let current = parseInt(localStorage.getItem(countKey) || '0', 10);
    if (!navigator.serviceWorker.controller && current > 0) {
      current = 0;
    }
    localStorage.setItem(countKey, String(current + 1));
  };

  /**
   * Decrements the count of open dashboard tabs in localStorage.
   */
  const decrement = () => {
    const current = parseInt(localStorage.getItem(countKey) || '0', 10);
    const next = Math.max(0, current - 1);
    localStorage.setItem(countKey, String(next));
    if (next === 0) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('unregister');
      }
      navigator.serviceWorker.getRegistration(swPath).then(reg => {
        if (reg) {
          reg.unregister();
        }
      });
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
    }
  };

  increment();

  window.addEventListener('load', () => {
    register();
  });
  window.addEventListener('beforeunload', () => {
    decrement();
  });
  window.addEventListener('pagehide', () => {
    decrement();
  });
}

export default registerServiceWorker;
