/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../unsetField');

const unsetField = require('../unsetField').default;
const Parse = require('parse');

describe('unsetField', () => {
  it('clears a field on an unsaved object without a Delete op', () => {
    const obj = new Parse.Object('Test');
    obj.set('username', 'bob');
    obj.set('authData', {});
    const json = unsetField(obj, 'username', true)._getSaveJSON();
    expect(json.username).toBe(undefined);
    expect(json.authData).toEqual({});
  });

  it('keeps the Delete op when unsetting a field on a saved object', () => {
    const obj = Parse.Object.fromJSON({ className: 'Test', objectId: 'abc', username: 'bob' });
    expect(unsetField(obj, 'username', false)._getSaveJSON().username).toEqual({ __op: 'Delete' });
  });
});
