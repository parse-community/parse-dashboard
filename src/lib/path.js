export const mountPath = window.PARSE_DASHBOARD_PATH;

export function applyMountPath(path) {
  return `${mountPath}${path}`
}