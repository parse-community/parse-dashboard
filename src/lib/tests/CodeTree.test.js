/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/CodeTree/CodeTree.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';
import TestUtils                        from 'react-addons-test-utils';

const CodeTree = require('../../components/CodeTree/CodeTree.react');

describe('CodeTree', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/CodeTree/CodeTree.example');
    const example = require('../../components/CodeTree/CodeTree.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
