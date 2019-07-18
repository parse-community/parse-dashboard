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
    publicPath: 'bundles/'
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
        use: {
          loader: 'babel-loader',
          query: {
            plugins: [["@babel/plugin-proposal-decorators", { "legacy": true }], '@babel/transform-regenerator', '@babel/transform-runtime'],
            presets: ['@babel/preset-react', '@babel/preset-env']
          },
        },
      }, {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]__[hash:base64:5]'
              },
              importLoaders: 2
            },
          },
          "sass-loader?includePaths[]=" + encodeURIComponent(path.resolve(__dirname, '../src'))
        ]
      }, {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }, {
        test: /\.png$/,
        use: { loader: 'file-loader?name=img/[hash].[ext]' }
      }, {
        test: /\.jpg$/,
        use: { loader: 'file-loader?name=img/[hash].[ext]' }
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
