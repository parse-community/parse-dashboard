/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../getFileName');
jest.mock('idb-keyval');

const getFileName = require('../getFileName').default;
const Parse = require('parse');

describe('getFileName', () => {
  it('get filename prefixed with hex', () => {
    const actualFilename = 'profile.jpg';
    expect(getFileName(`7b16230f584b360f667665fcb7d7a98b_${actualFilename}`)).toBe(actualFilename);

    const parseFile = new Parse.File(`7b16230f584b360f667665fcb7d7a98b_${actualFilename}`);
    expect(getFileName(parseFile)).toBe(actualFilename);
  });

  it('get filename containing underscore and prefixed with hex', () => {
    const actualFilename = 'bg_img.png';
    expect(getFileName(`7b16230f584b360f667665fcb7d7a98b_${actualFilename}`)).toBe(actualFilename);

    const parseFile = new Parse.File(`7b16230f584b360f667665fcb7d7a98b_${actualFilename}`);
    expect(getFileName(parseFile)).toBe(actualFilename);
  });
});
