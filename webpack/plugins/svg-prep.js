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
const { Compilation, sources } = require('webpack');
const { RawSource } = sources;

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
  compiler.hooks.thisCompilation.tap(SvgPrepPlugin.name, (compilation) => {
    compilation.hooks.processAssets.tapPromise(
      {
        name: SvgPrepPlugin.name,
        stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
      },
      async () => {
        if (!this.options.source) {
          return Promise.resolve();
        }

        // TODO: Keep track of file hashes, so we can avoid recompiling when none have changed
        let files = fs
          .readdirSync(this.options.source)
          .filter((name) => name.endsWith('.svg'))
          .map((name) => path.join(this.options.source, name));

        const sprited = await SvgPrep(files)
          .filter({ removeIds: true, noFill: true })
          .output();

        compilation.emitAsset(this.options.output, new RawSource(sprited));
      });
  });
}

module.exports = SvgPrepPlugin;
