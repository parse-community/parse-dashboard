//This file should be imported by another config file, like dashboard.config.js

var path = require('path');
var SvgPrepPlugin = require('./plugins/svg-prep');

module.exports = {
  output: {
    filename: '[name].bundle.js'
  },
  resolve: {
    root: [__dirname, path.join(__dirname, 'node_modules')]
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
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
          encodeURIComponent(path.resolve(__dirname, "../../app/webpack"))
      }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  },
  plugins: [
    new SvgPrepPlugin({
      source: path.join(__dirname, 'icons')
    })
  ]
};
