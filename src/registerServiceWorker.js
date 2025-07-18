export default function registerServiceWorker() {
  if (!window.PARSE_DASHBOARD_ENABLE_SERVICE_WORKER) {
    return;
  }
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const mountPath = window.PARSE_DASHBOARD_PATH || '/';
  const swPath = `${mountPath}sw.js`;
  const countKey = `pd-sw-tabs:${mountPath}`;

  const increment = () => {
    let current = parseInt(localStorage.getItem(countKey) || '0', 10);
    if (!navigator.serviceWorker.controller && current > 0) {
      current = 0;
    }
    localStorage.setItem(countKey, String(current + 1));
  };

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
  window.addEventListener('beforeunload', decrement);
  window.addEventListener('pagehide', decrement);

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swPath).catch(() => {});
  });
}
