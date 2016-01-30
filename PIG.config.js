var configuration = require('./base.config.js');

configuration.entry = {PIG: './parse-interface-guide/index.js'};
configuration.output.path = './PIG/bundles';

module.exports = configuration;
