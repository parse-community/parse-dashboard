/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const SvgPrep = require('svg-prep');

function SvgPrepPlugin(options) {
  this.options = {};
  Object.assign(
    this.options,
    {
      output: 'sprites.svg'
    },
    options || {}
  );
}

SvgPrepPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    if (!this.options.source) {
      return callback();
    }

    // TODO: Keep track of file hashes, so we can avoid recompiling when none have changed
    let files = fs.readdirSync(this.options.source).filter((name) => {
      return !!name.match(/\.svg$/);
    }).map((name) => path.join(this.options.source, name));
    SvgPrep(files)
      .filter({ removeIds: true, noFill: true })
      .output().then((sprited) => {
        compilation.assets[this.options.output] = {
          source: function() {
            return sprited;
          },
          size: function() {
            return sprited.length;
          }
        };

        callback();
      });
  });
}

module.exports = SvgPrepPlugin;
