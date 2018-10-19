/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/CloudCodeView/CloudCodeView.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';
import TestUtils                        from 'react-addons-test-utils';

const CloudCodeView = require('../../components/CloudCodeView/CloudCodeView.react');

describe('CloudCodeView', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/CloudCodeView/CloudCodeView.example');
    const example = require('../../components/CloudCodeView/CloudCodeView.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
