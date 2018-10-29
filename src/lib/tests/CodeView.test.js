/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/CodeView/CodeView.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';
import TestUtils                        from 'react-addons-test-utils';

const CodeView = require('../../components/CodeView/CodeView.react');

describe('CodeView', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/CodeView/CodeView.example');
    const example = require('../../components/CodeView/CodeView.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
