// Production build configuration for the PIG

var webpack = require('webpack');

// Import the main configuration file
var configuration = require('./webpack.config.js');

// Remove the dashboard configuration, we're only building the PIG
delete configuration.entry.dashboard;

// Remove SVG plugin
configuration.plugins = [];

module.exports = configuration;
