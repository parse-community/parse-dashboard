/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var configuration = require('./base.config.js');
var HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
var settings = require('@back4app/back4app-settings');

configuration.entry = {
  dashboard: './dashboard/index.js',
  login: './login/index.js',
  PIG: './parse-interface-guide/index.js',
  quickstart: './quickstart/index.js',
};
configuration.output.path = require('path').resolve('./production/bundles');

var webpack = require('webpack');

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
  new webpack.optimize.OccurrenceOrderPlugin(),
  function() {
    this.plugin('done', function(stats) {
      if (stats.compilation.errors && stats.compilation.errors.length) {
        console.log(stats.compilation.errors);
        process.exit(1);
      }
    });
  },
  new HtmlWebpackExternalsPlugin({
    externals: [{
      module: '@back4app/back4app-navigation',
      entry: settings.BACK4APP_NAVIGATION_PATH + '/back4app-navigation.bundle.js'
    }]
  })
);

module.exports = configuration;
