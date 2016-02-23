/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var babel = require('babel-core');
var extractClassnames = require('./extractClassnames');

module.exports = {
  process: function (src, filename) {
    if (filename.endsWith('.scss') || filename.endsWith('.css')) {
      var matches = extractClassnames(src);
      return 'module.exports = ' + JSON.stringify(matches);
    }

    // Let Jest handle our custom module resolution
    src = src.replace(/from \'stylesheets/g, "from '../../stylesheets");
    src = src.replace(/from \'lib/g, "from '../../lib");
    src = src.replace(/from \'components/g, "from '../../components");

    // Ignore all files within node_modules
    // babel files can be .js, .es, .jsx or .es6
    if (filename.indexOf('node_modules') < 0 && babel.canCompile(filename)) {
      return babel.transform(src, {
        filename: filename,
        stage: 0,
        retainLines: true,
        // Remove propTypes for tests so we don't have to keep unmocking lib/PropTypes
        // Also it's more representative of the production environment
        plugins: [ 'babel-plugin-remove-proptypes' ]
      }).code;
    }

    return src;
  }
};
