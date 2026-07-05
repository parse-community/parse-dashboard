/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../queryFromFilters');

const { addConstraintFromValues } = require('../queryFromFilters');
const Parse = require('parse');

function whereFor(field, constraint, compareTo, modifiers) {
  const query = new Parse.Query('Test');
  addConstraintFromValues(query, field, constraint, compareTo, modifiers);
  return query.toJSON().where;
}

describe('addConstraintFromValues contains constraint', () => {
  it('matches a plain substring literally', () => {
    expect(whereFor('name', 'contains', 'foo')).toEqual({
      name: { $regex: '\\Qfoo\\E' },
    });
  });

  it('escapes regex metacharacters so they match literally', () => {
    expect(whereFor('name', 'contains', 'a.b(c)')).toEqual({
      name: { $regex: '\\Qa.b(c)\\E' },
    });
  });

  it('keeps matches as a raw, unescaped regex with modifiers', () => {
    expect(whereFor('name', 'matches', 'a.b(c)', 'i')).toEqual({
      name: { $regex: 'a.b(c)', $options: 'i' },
    });
  });
});
