/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/PlatformCard/PlatformCard.react');

describe('PlatformCard', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/PlatformCard/PlatformCard.example');
    const example = require('../../components/PlatformCard/PlatformCard.example');
    example.demos.forEach((example) => {
      example.render();
    });
  });
});
