/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/B4ACloudCodeView/B4ACloudCodeView.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';
import TestUtils                        from 'react-addons-test-utils';

const B4ACloudCodeView = require('../../components/B4ACloudCodeView/B4ACloudCodeView.react');

describe('B4ACloudCodeView', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/B4ACloudCodeView/B4ACloudCodeView.example');
    const example = require('../../components/B4ACloudCodeView/B4ACloudCodeView.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
