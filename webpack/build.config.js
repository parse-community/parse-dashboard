/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var configuration = require('./base.config.js');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var path = require('path');
var HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
var settings = require('@back4app/back4app-settings');

configuration.mode = 'development';
configuration.entry = {
  dashboard: './dashboard/index.js',
  login: './login/index.js'
};
configuration.output.path = path.resolve('./Parse-Dashboard/public/bundles');
configuration.output.filename = "[name].[chunkhash].js";

configuration.plugins.push(
  new CleanWebpackPlugin(['bundles/dashboard*.js'], {
    root: path.resolve('./Parse-Dashboard/public'),
    watch: true
  }),
  new HtmlWebpackPlugin({
    template: '../Parse-Dashboard/index.ejs',
    filename: path.resolve('./Parse-Dashboard/public/index.html')
  }),
  new HtmlWebpackExternalsPlugin({
    externals: [{
      module: '@back4app/back4app-navigation',
      entry: settings.BACK4APP_NAVIGATION_PATH + '/back4app-navigation.bundle.js'
    }]
  })
);

module.exports = configuration;
