/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/LogView/LogViewEntry.react');

import React from 'react';
import renderer from 'react-test-renderer';
const LogViewEntry = require('../../components/LogView/LogViewEntry.react').default;

describe('LogViewEntry', () => {
  it('renders a string log message', () => {
    const text = 'I2015-09-30T00:36:45.522Z] hello world';
    const tree = renderer
      .create(<LogViewEntry text={text} timestamp="I2015-09-30T00:36:45.522Z]" />)
      .toJSON();
    expect(JSON.stringify(tree)).toContain('hello world');
  });

  it('does not crash when the message is a non-string object', () => {
    const message = { ok: 0, code: 40352, codeName: 'Location40352', name: 'MongoError' };
    let tree;
    expect(() => {
      tree = renderer
        .create(<LogViewEntry text={message} timestamp="2021-08-20T09:59:24.974Z" />)
        .toJSON();
    }).not.toThrow();
    expect(JSON.stringify(tree)).toContain('MongoError');
  });
});
