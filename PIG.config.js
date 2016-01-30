var configuration = require('./webpack.config.js');

configuration.entry = './dashboard/index.js';
configuration.output.path = './PIG/bundles';

module.exports = configuration;
