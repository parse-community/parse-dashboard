export default function registerServiceWorker() {
  if (!window.PARSE_DASHBOARD_ENABLE_SERVICE_WORKER) {
    return;
  }
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swPath = `${window.PARSE_DASHBOARD_PATH || '/'}sw.js`;
      navigator.serviceWorker.register(swPath).catch(() => {});
    });
  }
}
