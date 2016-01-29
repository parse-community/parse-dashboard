var path = require('path');
var SvgPrepPlugin = require('./plugins/svg-prep');

var entries = {
  dashboard: path.join(__dirname, 'dashboard', 'index.js'),
  login: path.join(__dirname, 'login', 'index.js'),
  signup: path.join(__dirname, 'signup', 'index.js'),
  PIG: path.join(__dirname, 'parse-interface-guide', 'index.js'),
  quickstart: path.join(__dirname, 'quickstart', 'index.js')
};

module.exports = {
  entry: entries,
  output: {
    path: path.join(__dirname, 'PIG', 'bundles'),
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
