/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/NFTImage/NFTImage.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const NFTImage = require('../../components/NFTImage/NFTImage.react');

describe('NFTImage', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/NFTImage/NFTImage.example');
    const example = require('../../components/NFTImage/NFTImage.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
