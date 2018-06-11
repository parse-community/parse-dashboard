/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var configuration = require('./base.config.js');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

configuration.entry = {
  dashboard: './dashboard/index.js',
  login: './login/index.js'
};
configuration.output.path = require('path').resolve('./Parse-Dashboard/public/bundles');
configuration.output.filename = "[name].[chunkhash].js";

configuration.plugins.push(
  new HtmlWebpackPlugin({
    template: '../Parse-Dashboard/index.template.html',
    filename: path.resolve('./Parse-Dashboard/public/index.html')
  })
);

module.exports = configuration;
