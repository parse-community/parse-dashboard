var configuration = require('./base.config.js');

configuration.entry = {
  dashboard: './dashboard/index.js'),
  login: './login/index.js'
  signup: './signup/index.js'
  PIG: './parse-interface-guide/index.js'
  quickstart: './quickstart/index.js
};
configuration.output.path = './bundles';

module.exports = configuration;
