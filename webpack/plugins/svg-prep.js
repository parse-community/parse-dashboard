/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import SvgPrep from 'svg-prep';

class SvgPrepPlugin {

  static defaultOptions = {
    output: 'sprites.svg',
  };

  constructor(options = {}) {
    this.options = { ...SvgPrepPlugin.defaultOptions, ...options };
  }

  apply(compiler) {
    const pluginName = SvgPrepPlugin.name;
    const { webpack } = compiler;
    const { Compilation } = webpack;
    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async () => {
          if (!this.options.source) {
            return Promise.resolve();
          }

          // TODO: Keep track of file hashes, so we can avoid recompiling when none have changed
          let files = (await readdir(this.options.source))
            .filter((name) => name.endsWith('.svg'))
            .map((name) => join(this.options.source, name));

          const sprited = await SvgPrep(files)
            .filter({ removeIds: true, noFill: true })
            .output();

          compilation.emitAsset(this.options.output, new RawSource(sprited));
        });
    });
  }
}

export default SvgPrepPlugin;
