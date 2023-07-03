/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// Hacky way to get classnames out of a SASS/CSS file
// This should work for our testing needs

module.exports = function(src) {
  if (!src) {
    return {};
  }

  const classMatch = src.match(/\.([a-zA-Z]\w*)\s*\{/g);
  const classMap = {};
  if (classMatch) {
    for (let i = 0; i < classMatch.length; i++) {
      const c = classMatch[i].replace(/[^a-zA-Z0-9\-_]/g, '');
      classMap[c] = c;
    }
  }
  return classMap;
};
