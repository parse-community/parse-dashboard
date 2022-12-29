/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/Docs/Docs.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const Docs = require('../../components/Docs/Docs.react');

describe('Docs', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/Docs/Docs.example');
    const example = require('../../components/Docs/Docs.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
