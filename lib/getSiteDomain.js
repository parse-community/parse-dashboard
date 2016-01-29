export default function getSiteDomain() {
  let host = location.host.split('.');
  return location.protocol + '//' + host.slice(host.length - 2).join('.');
}
