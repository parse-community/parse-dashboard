/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/NFTPanel/NFTPanel.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const NFTPanel = require('../../components/NFTPanel/NFTPanel.react');

describe('NFTPanel', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/NFTPanel/NFTPanel.example');
    const example = require('../../components/NFTPanel/NFTPanel.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
