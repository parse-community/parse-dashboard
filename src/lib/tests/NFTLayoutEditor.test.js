/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/NFTLayoutEditor/NFTLayoutEditor.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const NFTLayoutEditor = require('../../components/NFTLayoutEditor/NFTLayoutEditor.react');

describe('NFTLayoutEditor', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/NFTLayoutEditor/NFTLayoutEditor.example');
    const example = require('../../components/NFTLayoutEditor/NFTLayoutEditor.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
