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

// pulls in package.json and gets version
var webpack = require('webpack');
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var version = json.version;

module.exports = {
  context: path.join(__dirname, '../src'),
  output: {
    filename: '[name].bundle.js',
    publicPath: 'bundles/',
    assetModuleFilename: 'img/[hash][ext]'
  },
  resolve: {
    modules: [__dirname,path.join(__dirname, '../src'), path.join(__dirname, '../node_modules')]
  },
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules')]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }, {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 2
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.resolve(__dirname, '../src')]
              }
            }
          }
        ]
      }, {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }, {
        test: /\.png$/,
        type: 'asset/resource'
      }, {
        test: /\.jpg$/,
        type: 'asset/resource'
      }, {
        test: /\.flow$/,
        use: 'null-loader'
      }
    ]
  },
  plugins: [
    new SvgPrepPlugin({
      source: path.join(__dirname,'../src', 'icons')
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'version' : JSON.stringify(version)
      }
    })
  ]
};
