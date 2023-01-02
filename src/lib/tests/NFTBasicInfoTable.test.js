/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/NFTBasicInfoTable/NFTBasicInfoTable.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const NFTBasicInfoTable = require('../../components/NFTBasicInfoTable/NFTBasicInfoTable.react');

describe('NFTBasicInfoTable', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/NFTBasicInfoTable/NFTBasicInfoTable.example');
    const example = require('../../components/NFTBasicInfoTable/NFTBasicInfoTable.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
