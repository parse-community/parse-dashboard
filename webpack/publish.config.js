/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var configuration = require('./base.config.js');

configuration.mode = 'production';
configuration.entry = {
  dashboard: './dashboard/index.js',
  login: './login/index.js'
};
configuration.output.path = require('path').resolve('./Parse-Dashboard/public/bundles');

var webpack = require('webpack');

// Enable minification
configuration.plugins.push(
  new webpack.optimize.OccurrenceOrderPlugin(),
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
