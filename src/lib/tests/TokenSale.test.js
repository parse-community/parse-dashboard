/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/TokenSales/TokenSales.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const TokenSale = require('../../components/TokenSales/TokenSales.react');

describe('TokenSale', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/TokenSale/TokenSales.example');
    const example = require('../../components/TokenSales/TokenSales.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
