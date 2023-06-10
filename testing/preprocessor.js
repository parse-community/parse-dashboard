/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import extractClassnames from './extractClassnames.js';

export default {
  process(src) {
    const matches = extractClassnames(src);
    return {
      code: `module.exports = ${JSON.stringify(matches)}`,
    };
  }
};
