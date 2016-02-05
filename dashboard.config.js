var configuration = require('./base.config.js');

configuration.entry = {dashboard: './dashboard/index.js'};
configuration.output.path = './Parse-Dashboard/public/bundles';

module.exports = configuration;
