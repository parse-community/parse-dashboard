/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const babel = require('@babel/core');
const path = require('path');
const extractClassnames = require('./extractClassnames');

const srcDir = path.resolve(__dirname, '..', 'src');

module.exports = {
  process: function (src, filename) {
    if (filename.endsWith('.scss') || filename.endsWith('.css')) {
      const matches = extractClassnames(src);
      return {
        code: 'module.exports = ' + JSON.stringify(matches),
      };
    }

    // Let Jest handle our custom module resolution
    // Compute relative prefix from file's directory to src/ so that
    // bare imports like 'components/...' resolve correctly regardless
    // of the file's depth within the src tree.
    let relPrefix = '../../';
    if (filename.startsWith(srcDir + path.sep)) {
      const rel = path.relative(path.dirname(filename), srcDir);
      relPrefix = rel ? rel.replace(/\\/g, '/') + '/' : './';
    }
    src = src.replace(/from 'stylesheets/g, 'from \'' + relPrefix + 'stylesheets');
    src = src.replace(/from 'lib/g, 'from \'' + relPrefix + 'lib');
    src = src.replace(/from 'components/g, 'from \'' + relPrefix + 'components');

    // Ignore all files within node_modules
    // babel files can be .js, .es, .jsx or .es6
    if (filename.indexOf('node_modules') < 0 && !filename.endsWith('package.json')) {
      return babel.transform(src, {
        filename: filename,
        retainLines: true,
        // Remove propTypes for tests so we don't have to keep unmocking lib/PropTypes
        // Also it's more representative of the production environment
        //plugins: [ 'babel-plugin-remove-proptypes' ]
      });
    }

    return {
      code: src,
    };
  }
};
