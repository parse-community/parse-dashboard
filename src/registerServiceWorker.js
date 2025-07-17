export default function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swPath = `${window.PARSE_DASHBOARD_PATH || '/'}sw.js`;
      navigator.serviceWorker.register(swPath).catch(() => {});
    });
  }
}
