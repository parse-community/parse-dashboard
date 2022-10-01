/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { resolve } from 'node:path';
import configuration from './base.config.js';

configuration.mode = 'development';
configuration.entry = {PIG: './parse-interface-guide/index.js'};
configuration.output.path = resolve('./PIG/bundles');

export default configuration;
