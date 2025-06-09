const MOUNT_PATH = window.PARSE_DASHBOARD_PATH;

export default function generatePath(currentApp, path, prependMountPath = false) {

  const urlObj = new URL(path, window.location.origin);
  const params = new URLSearchParams(urlObj.search);

  const filters = JSON.parse(params.get('filters'))

  if (filters) {
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      if (filter.compareTo?.__type === 'RelativeDate') {
        const date = new Date();
        date.setTime(date.getTime() + filter.compareTo.value * 1000);
        filter.compareTo = {
          __type: 'Date',
          iso: date.toISOString(),
        }
        filters[i] = filter;
      }
    }

    params.set('filters', JSON.stringify(filters));
    urlObj.search = params.toString();

    path = urlObj.toString().split(window.location.origin)[1].substring(1);
  }

  if (prependMountPath && MOUNT_PATH) {
    return `${MOUNT_PATH}apps/${currentApp.slug}/${path}`;
  }
  return `/apps/${currentApp.slug}/${path}`;
}
