var path = require('path');

// Import the main configuration file
var configuration = require('./webpack.config.js');

// Remove the dashboard configuration, we're only building the PIG
delete configuration.entry.PIG;

configuration.output.path = path.join(__dirname, 'Parse-Dashboard', 'bundles');

// Remove SVG plugin
configuration.plugins = [];

module.exports = configuration;
