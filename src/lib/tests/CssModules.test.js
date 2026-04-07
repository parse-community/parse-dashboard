/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const os = require('os');

function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats.hasErrors()) {
        return reject(new Error(stats.toJson().errors.map(e => e.message).join('\n')));
      }
      resolve(stats);
    });
  });
}

describe('CSS modules', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'css-modules-test-'));

    fs.writeFileSync(
      path.join(tmpDir, 'test.scss'),
      '.test_underscore_class { color: red; }\n.testCamelCase { color: blue; }\n'
    );

    fs.writeFileSync(
      path.join(tmpDir, 'entry.js'),
      'const styles = require("./test.scss");\n'
    );
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('preserves underscore class names in exports', async () => {
    const baseConfig = require('../../../webpack/base.config.js');
    const scssRule = baseConfig.module.rules.find(r => r.test.toString().includes('scss'));

    await runWebpack({
      mode: 'production',
      entry: path.join(tmpDir, 'entry.js'),
      output: {
        path: tmpDir,
        filename: 'bundle.js',
      },
      module: {
        rules: [{ test: /\.scss$/, use: scssRule.use }],
      },
    });

    const bundle = fs.readFileSync(path.join(tmpDir, 'bundle.js'), 'utf8');

    // Class names with underscores must be preserved as-is in the JS exports,
    // not converted to camelCase (e.g. testUnderscoreClass).
    // This broke when css-loader was bumped from v6 to v7, which changed the
    // default exportLocalsConvention from 'asIs' to 'camelCaseOnly'.
    expect(bundle).toContain('test_underscore_class');
    expect(bundle).toContain('testCamelCase');
  }, 30000);
});
