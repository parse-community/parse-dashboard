var configuration = require('./base.config.js');

configuration.entry = './dashboard/index.js';
configuration.output.path = './PIG/bundles';

module.exports = configuration;
