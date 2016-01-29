import howLongAgo from 'lib/howLongAgo';

let ReleaseInfo = ({ release }) => {
  if (!release) {
    return '';
  }

  return [
    'Latest deploy: ',
    release.version,
    ' \u2022 ',
    howLongAgo(release.deployedAt),
    ' \u2022 SDK Version: ',
    release.parseVersion
  ].join('');
};

export default ReleaseInfo;
