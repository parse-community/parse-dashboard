var babel = require('babel-core');
var extractClassnames = require('./extractClassnames');
var path = require('path');

var rootDir = path.join(process.cwd(), '..', '..', 'app', 'webpack');

module.exports = {
  process: function (src, filename) {
    if (filename.endsWith('.scss') || filename.endsWith('.css')) {
      var matches = extractClassnames(src);
      return 'module.exports = ' + JSON.stringify(matches);
    }

    // Let Jest handle our custom module resolution
    src = src.replace(/from \'stylesheets/g, "from '" + path.join(rootDir, 'stylesheets'));
    src = src.replace(/from \'lib/g, "from '" + path.join(rootDir, 'lib'));
    src = src.replace(/from \'components/g, "from '" + path.join(rootDir, 'components'));

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
