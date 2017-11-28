/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/Markdown/Markdown.react');

describe('Markdown', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/Markdown/Markdown.example');
    const example = require('../../components/Markdown/Markdown.example');
    example.demos.forEach((example) => {
      example.render();
    });
  });
  // test suite goes here
});
