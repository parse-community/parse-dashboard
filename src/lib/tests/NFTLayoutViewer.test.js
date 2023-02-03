/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/NFTLayoutViewer/NFTLayoutViewer.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const NFTLayoutViewer = require('../../components/NFTLayoutViewer/NFTLayoutViewer.react');

describe('NFTLayoutViewer', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/NFTLayoutViewer/NFTLayoutViewer.example');
    const example = require('../../components/NFTLayoutViewer/NFTLayoutViewer.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
