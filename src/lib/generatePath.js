export default function generatePath(currentApp, path) {
  return `/apps/${currentApp.slug}/${path}`;
}
