/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const { TestEnvironment } = require('jest-environment-node');

// Jest's require() can't load the ESM-only puppeteer, but test environments are loaded with Node.js' require(), which can
module.exports = class PuppeteerEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    this.global.puppeteer = require('puppeteer');
  }
};
