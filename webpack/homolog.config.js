var configuration = require('./publish.config.js');
var webpack = require('webpack');

configuration.plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': '"homolog"'
    }
  }),
  new webpack.SourceMapDevToolPlugin({
    filename: '[file].map',
    include: /dashboard.*.*/
  })
);

module.exports = configuration;
