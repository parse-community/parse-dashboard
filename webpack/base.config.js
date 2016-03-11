/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
//This file should be imported by another config file, like build.config.js

var path = require('path');
var SvgPrepPlugin = require('./plugins/svg-prep');

module.exports = {
  context: path.join(__dirname, '../src'),
  output: {
    filename: '[name].bundle.js',
    publicPath: '/bundles/'
  },
  resolve: {
    root: [__dirname,path.join(__dirname, '../src'), path.join(__dirname, 'node_modules')]
  },
  resolveLoader: {
    root: path.join(__dirname, '../node_modules')
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          optional: ['runtime', 'es7.decorators']
        }
      }, {
        test: /\.scss$/,
        loader: "style-loader!css-loader?modules&localIdentName=[local]__[hash:base64:5]!sass-loader?includePaths[]=" +
          encodeURIComponent(path.resolve(__dirname, '../src'))
      }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }, {
        test: /\.png$/,
        loader: 'file-loader?name=img/[hash].[ext]',
      }
    ]
  },
  plugins: [
    new SvgPrepPlugin({
      source: path.join(__dirname,'../src', 'icons')
    })
  ]
};
