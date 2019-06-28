var configuration = require('./publish.config.js');
var webpack = require('webpack');

configuration.plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': '"homolog"'
    }
  })
);
configuration.devtool = 'source-map'

module.exports = configuration;
