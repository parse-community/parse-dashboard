'use strict'

const CiVersionCheck = require('./CiVersionCheck');
const allNodeVersions = require('all-node-versions');

async function check() {
  // Run checks
  await checkNodeVersions();
}

/**
 * Check the Nodejs versions used in test environments.
 */
async function checkNodeVersions() {

  const allVersions = await allNodeVersions();
  const releasedVersions = allVersions.versions;

  await new CiVersionCheck({
    packageName: 'Node.js',
    packageSupportUrl: 'https://github.com/nodejs/node/blob/master/CHANGELOG.md',
    yamlFilePath: './.github/workflows/ci.yml',
    ciEnvironmentsKeyPath: 'jobs.check-build.strategy.matrix.include',
    ciVersionKey: 'NODE_VERSION',
    releasedVersions,
    latestComponent: CiVersionCheck.versionComponents.minor,
    ignoreReleasedVersions: [
      '<14.0.0', // These versions have reached their end-of-life support date
      '>=15.0.0 <16.0.0', // These versions have reached their end-of-life support date
      '>=17.0.0 <18.0.0', // These versions have reached their end-of-life support date
    ],
  }).check();
}

check();
