/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
//This file should be imported by another config file, like build.config.js

const path = require('path');
const SvgPrepPlugin = require('./plugins/svg-prep');

// pulls in package.json and gets version
const webpack = require('webpack');
const fs = require('fs');
const json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = json.version;

module.exports = {
  context: path.join(__dirname, '../src'),
  output: {
    filename: '[name].bundle.js',
    publicPath: 'bundles/',
    assetModuleFilename: 'img/[hash][ext]',
  },
  resolve: {
    modules: [__dirname, path.join(__dirname, '../src'), path.join(__dirname, '../node_modules')],
    fullySpecified: false,
    alias: {
      'react/jsx-runtime': require.resolve('react/jsx-runtime.js'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime.js'),
    },
  },
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!react-chartjs-2)/,
        use: ['babel-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 2,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.resolve(__dirname, '../src')],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.png$/,
        type: 'asset/resource',
      },
      {
        test: /\.jpg$/,
        type: 'asset/resource',
      },
      {
        test: /\.flow$/,
        use: 'null-loader',
      },
    ],
  },
  plugins: [
    new SvgPrepPlugin({
      source: path.join(__dirname, '../src', 'icons'),
    }),
    new webpack.DefinePlugin({
      'process.env': {
        version: JSON.stringify(version),
      },
    }),
  ],
};
