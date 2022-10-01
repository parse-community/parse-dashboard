const core = require('@actions/core');
const semver = require('semver');
const fs = require('fs').promises;
const path = require('path');

/**
 * This checks whether any package dependency requires a minimum node engine
 * version higher than the host package.
 */
class NodeEngineCheck {

  /**
   * The constructor.
   * @param {Object} config The config.
   * @param {String} config.nodeModulesPath The path to the node_modules directory.
   * @param {String} config.packageJsonPath The path to the parent package.json file.
   */
  constructor(config) {
    const {
      nodeModulesPath,
      packageJsonPath,
    } = config;

    // Ensure required params are set
    if ([
      nodeModulesPath,
      packageJsonPath,
    ].includes(undefined)) {
      throw 'invalid configuration';
    }

    this.nodeModulesPath = nodeModulesPath;
    this.packageJsonPath = packageJsonPath;
  }

  /**
   * Returns an array of `package.json` files under the given path and subdirectories.
   * @param {String} basePath The base path for recursive directory search.
   */
  async getPackageFiles(basePath = this.nodeModulesPath) {
    try {
      // Declare file list
      const files = []

      // Get files
      const dirents = await fs.readdir(basePath, { withFileTypes: true });
      const validFiles = dirents.filter(d => d.name.toLowerCase() == 'package.json').map(d => path.join(basePath, d.name));
      files.push(...validFiles);
      
      // For each directory entry
      for (const dirent of dirents) {
        if (dirent.isDirectory()) {
          const subFiles = await this.getPackageFiles(path.join(basePath, dirent.name));
          files.push(...subFiles);
        }
      }
      return files;
    } catch (e) {
      throw `Failed to get package.json files in ${this.nodeModulesPath} with error: ${e}`;
    }
  }

  /**
   * Extracts and returns the node engine versions of the given package.json
   * files.
   * @param {Object} config
   * @param {String[]} config.files The package.json files.
   * @param {Boolean} config.clean Is true if packages with undefined node versions
   * should be removed from the results.
   * @param {RegExp[]} config.ignoredFilePaths A RegExp list of ignored file paths.
   * @returns {Object[]} A list of results.
   */
  async getNodeVersion({ files, ignoredFilePaths = [], clean = false }) {

    // Declare response
    let response = [];

    // For each file
    for (const file of files) {
      const shouldFileBeIgnored = ignoredFilePaths.find((path) => path.test(file)) !== undefined;

      if (shouldFileBeIgnored) {
        continue;
      }

      try {
        // Get node version
        const contentString = await fs.readFile(file, 'utf-8');
        const contentJson = JSON.parse(contentString);
        const version = ((contentJson || {}).engines || {}).node;

        // Add response
        response.push({
          file: file,
          nodeVersion: version
        });
      } catch (err) {
        throw `Failed to parse package at ${file} with error ${err}`;
      }
    }

    // If results should be cleaned by removing undefined node versions
    if (clean) {
      response = response.filter(r => r.nodeVersion !== undefined);
    }
    return response;
  }

  /**
   * Returns the highest semver definition that satisfies all versions
   * in the given list.
   * @param {Object} config
   * @param {Object[]} config.versions The list of semver version ranges.
   * @param {String} config.baseVersion The base version of which higher versions should be
   * determined; as a version (1.2.3), not a range (>=1.2.3).
   * @returns {String} The highest semver version.
   */
  getHigherVersions({ versions, baseVersion }) {
    // Add min satisfying node versions
    const minVersions = versions.map(v => {
      v.nodeMinVersion = semver.minVersion(v.nodeVersion)
      return v;
    });

    // Sort by min version
    const sortedMinVersions = minVersions.sort((v1, v2) => semver.compare(v1.nodeMinVersion, v2.nodeMinVersion));

    // Filter by higher versions
    const higherVersions = sortedMinVersions.filter(v => semver.gt(v.nodeMinVersion, baseVersion));

    return higherVersions;
  }

  /**
   * Returns the node version of the parent package.
   * @return {Object} The parent package info.
   */
  async getParentVersion() {
    // Get parent package.json version
    const [version] = await this.getNodeVersion({ files: [ this.packageJsonPath ], clean: true });

    // If parent node version could not be determined
    if (!version) {
      throw `Failed to determine node engine version of parent package at ${this.packageJsonPath}`;
    }

    return version;
  }
}

async function check() {
  try {
    // Define paths
    const nodeModulesPath = path.join(__dirname, '../node_modules');
    const packageJsonPath = path.join(__dirname, '../package.json');

    // Create check
    const check = new NodeEngineCheck({
      nodeModulesPath,
      packageJsonPath,
    });

    // Get package node version of parent package
    const parentVersion = await check.getParentVersion();

    // Determine parent min version
    const parentMinVersion = semver.minVersion(parentVersion.nodeVersion);

    // Get package.json files
    const files = await check.getPackageFiles();
    core.info(`Checking the minimum node version requirement of ${files.length} dependencies`);

    // List of package.json paths that should be skipped
    const ignoredFilePaths = [
      // Malformed package.json for testing purpose in eslint-plugin-react
      /eslint-plugin-react\/.*malformed.*/,
    ];

    // Get node versions
    const versions = await check.getNodeVersion({ files, ignoredFilePaths, clean: true });

    // Get are dependencies that require a higher node version than the parent package
    const higherVersions = check.getHigherVersions({ versions, baseVersion: parentMinVersion });

    // Get highest version
    const highestVersion = higherVersions.map(v => v.nodeMinVersion).pop();

    // If there are higher versions
    if (higherVersions.length > 0) {
      console.log(`\nThere are ${higherVersions.length} dependencies that require a higher node engine version than the parent package (${parentVersion.nodeVersion}):`);

      // For each dependency
      for (const higherVersion of higherVersions) {

        // Get package name
        const _package = higherVersion.file.split('node_modules/').pop().replace('/package.json', '');
        console.log(`- ${_package} requires at least node ${higherVersion.nodeMinVersion} (${higherVersion.nodeVersion})`);
      }
      throw `\n❌ Upgrade the node engine version in package.json to at least '${highestVersion}' to satisfy the dependencies.\n`;
    }

    console.log(`\n✅ All dependencies satisfy the node version requirement of the parent package (${parentVersion.nodeVersion}).\n`);
  } catch (err) {
    core.setFailed(err);
  }
}

check();
