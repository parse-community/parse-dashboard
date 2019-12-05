/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/CodeEditor/CodeEditor.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const CodeEditor = require('../../components/CodeEditor/CodeEditor.react');

describe('CodeEditor', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/CodeEditor/CodeEditor.example');
    const example = require('../../components/CodeEditor/CodeEditor.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
