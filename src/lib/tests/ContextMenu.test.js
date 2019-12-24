/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/ContextMenu/ContextMenu.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const ContextMenu = require('../../components/ContextMenu/ContextMenu.react');

describe('ContextMenu', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/ContextMenu/ContextMenu.example');
    const example = require('../../components/ContextMenu/ContextMenu.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
