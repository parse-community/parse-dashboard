var configuration = require('./publish.config.js');
var webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

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

configuration.optimization = {
  splitChunks: {
    cacheGroups: {
      commons: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      }
    }
  },
  minimizer: [
    new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: true // Must be set to true if using source-maps in production
    })
  ]
}

module.exports = configuration;
