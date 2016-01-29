// Production build configuration for dashboard.parse.com

var webpack = require('webpack');

// Import the main configuration file
var configuration = require('./webpack.config.js');

// Remove the PIG configuration, we're only building the dashboard
delete configuration.entry.PIG;

// Add propType removal to Babel
var loaders = configuration.module.loaders;
for (var i = 0; i < loaders.length; i++) {
  if (loaders[i].loader === 'babel-loader') {
    if (!loaders[i].query.plugins) {
      loaders[i].query.plugins = [];
    }
    loaders[i].query.plugins.push('babel-plugin-remove-proptypes');
    break;
  }
}

// Enable minification
configuration.plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': '"production"'
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  new webpack.optimize.OccurenceOrderPlugin(),
  function() {
    this.plugin('done', function(stats) {
      if (stats.compilation.errors && stats.compilation.errors.length) {
        console.log(stats.compilation.errors);
        process.exit(1);
      }
    });
  }
);

module.exports = configuration;
