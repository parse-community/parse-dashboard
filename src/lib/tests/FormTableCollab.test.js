/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/FormTableCollab/FormTableCollab.react');

describe('FormTableCollab', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/FormTableCollab/FormTableCollab.example');
    const example = require('../../components/FormTableCollab/FormTableCollab.example');
    example.demos.forEach((example) => {
      example.render();
    });
  });
  // test suite goes here
});
