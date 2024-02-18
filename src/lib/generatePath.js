const MOUNT_PATH = window.PARSE_DASHBOARD_PATH;

export default function generatePath(currentApp, path, prependMountPath = false) {
  if (prependMountPath && MOUNT_PATH) {
    return `${MOUNT_PATH}apps/${currentApp.slug}/${path}`;
  }
  return `/apps/${currentApp.slug}/${path}`;
}
