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
const { Compilation, sources } = require('webpack');
const { RawSource } = sources;

/**
 * Builds an SVG sprite from individual SVG files. Each SVG becomes a
 * <symbol> element identified by its filename (without extension).
 */
function buildSvgSprite(files) {
  const symbols = files.map(file => {
    const name = path.basename(file, '.svg');
    const svg = fs.readFileSync(file, 'utf-8');

    // Extract viewBox from the root <svg> element
    const viewBoxMatch = svg.match(/viewBox="([^"]*)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 100 100';

    // Extract inner content between <svg ...> and </svg>
    const innerMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    const inner = innerMatch ? innerMatch[1] : '';

    // Strip elements that are unnecessary or potential XSS vectors
    // Remove attributes that interfere with sprite styling or pose security risks
    const cleaned = inner
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<defs[\s\S]*?<\/defs>/gi, '')
      .replace(/<title[\s\S]*?<\/title>/gi, '')
      .replace(/<desc[\s\S]*?<\/desc>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+id="[^"]*"/g, '')
      .replace(/\s+fill="[^"]*"/g, '')
      .replace(/\s+class="[^"]*"/g, '')
      .replace(/\s+style="[^"]*"/g, '')
      .replace(/\s+stroke="[^"]*"/g, '')
      .replace(/\s+stroke-[a-z]+="[^"]*"/g, '')
      .replace(/\s+on[a-zA-Z]+="[^"]*"/g, '')
      .replace(/\s+on[a-zA-Z]+='[^']*'/g, '')
      .replace(/\s+href="[^"]*"/g, '')
      .replace(/\s+xlink:href="[^"]*"/g, '');

    return `  <symbol id="${name}" viewBox="${viewBox}">\n    ${cleaned.trim()}\n  </symbol>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<svg id="sprites" xmlns="http://www.w3.org/2000/svg" style="display:none">',
    symbols.join('\n'),
    '</svg>',
  ].join('\n');
}

function SvgPrepPlugin(options) {
  this.options = {};
  Object.assign(
    this.options,
    {
      output: 'sprites.svg',
    },
    options || {}
  );
}

SvgPrepPlugin.prototype.apply = function (compiler) {
  compiler.hooks.thisCompilation.tap(SvgPrepPlugin.name, compilation => {
    compilation.hooks.processAssets.tapPromise(
      {
        name: SvgPrepPlugin.name,
        stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
      },
      async () => {
        if (!this.options.source) {
          return;
        }

        const files = fs
          .readdirSync(this.options.source)
          .filter(name => name.endsWith('.svg'))
          .sort()
          .map(name => path.join(this.options.source, name));

        const sprited = buildSvgSprite(files);
        compilation.emitAsset(this.options.output, new RawSource(sprited));
      }
    );
  });
};

module.exports = SvgPrepPlugin;
