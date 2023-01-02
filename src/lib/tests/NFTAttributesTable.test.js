/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/NFTAttributesTable/NFTAttributesTable.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const NFTAttributesTable = require('../../components/NFTAttributesTable/NFTAttributesTable.react');

describe('NFTAttributesTable', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/NFTAttributesTable/NFTAttributesTable.example');
    const example = require('../../components/NFTAttributesTable/NFTAttributesTable.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
