/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/B4AAlert/B4AAlert.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';
import TestUtils                        from 'react-addons-test-utils';

const B4AAlert = require('../../components/B4AAlert/B4AAlert.react');

describe('B4AAlert', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/B4AAlert/B4AAlert.example');
    const example = require('../../components/B4AAlert/B4AAlert.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
