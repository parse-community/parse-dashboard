/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var configuration = require('./base.config.js');

configuration.mode = 'development';
configuration.entry = {
  dashboard: './dashboard/index.js',
  login: './login/index.js'
};
configuration.output.path = require('path').resolve('./Parse-Dashboard/public/bundles');

module.exports = configuration;
