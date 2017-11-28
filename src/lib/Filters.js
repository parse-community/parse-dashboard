/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse from 'parse';

export const Constraints = {
  exists: {
    name: 'exists',
    field: null
  },
  dne: {
    name: 'does not exist',
    field: null
  },
  eq: {
    name: 'equals',
  },
  neq: {
    name: 'does not equal',
  },
  lt: {
    name: 'less than',
    field: 'Number',
    composable: true,
  },
  lte: {
    name: 'less than or equal',
    field: 'Number',
    composable: true,
  },
  gt: {
    name: 'greater than',
    field: 'Number',
    composable: true,
  },
  gte: {
    name: 'greater than or equal',
    field: 'Number',
    composable: true,
  },
  starts: {
    name: 'starts with',
  },
  ends: {
    name: 'ends with',
  },
  stringContainsString: {
    name: 'string contains string',
    field: 'String',
    composable: true,
  },
  before: {
    name: 'is before',
    field: 'Date',
    composable: true,
  },
  after: {
    name: 'is after',
    field: 'Date',
    composable: true,
  },
  containsString: {
    name: 'contains string',
    field: 'String',
    composable: true,
  },
  doesNotContainString: {
    name: 'without string',
    field: 'String',
    composable: true,
  },
  containsNumber: {
    name: 'contains number',
    field: 'Number',
    composable: true,
  },
  doesNotContainNumber: {
    name: 'without number',
    field: 'Number',
    composable: true,
  },
  containsAny: {
    name: 'contains',
    field: 'Array',
  },
  doesNotContainAny: {
    name: 'does not contain',
    field: 'Array',
  },
  keyExists: {
    name: 'key exists',
    field: 'Object',
    composable: true
  },
  keyDne: {
    name: 'key does not exist',
    field: 'Object',
    composable: true
  },
  keyEq: {
    name: 'key equals',
    field: 'Object',
    composable: true
  },
  keyNeq: {
    name: 'key does not equal',
    field: 'Object',
    composable: true
  },
  keyGt: {
    name: 'key greater than',
    field: 'Object',
    composable: true
  },
  keyGte: {
    name: 'key greater than/equal',
    field: 'Object',
    composable: true
  },
  keyLt: {
    name: 'key less than',
    field: 'Object',
    composable: true
  },
  keyLte: {
    name: 'key less than/equal',
    field: 'Object',
    composable: true
  },
};

export const FieldConstraints = {
  'Pointer': [ 'exists', 'dne', 'eq', 'neq'],
  'Boolean': [ 'exists', 'dne', 'eq' ],
  'Number': [ 'exists', 'dne', 'eq', 'neq', 'lt', 'lte', 'gt', 'gte' ],
  'String': [ 'exists', 'dne', 'eq', 'neq', 'starts', 'ends', 'stringContainsString' ],
  'Date': [ 'exists', 'dne', 'before', 'after' ],
  'Object': [
    'exists',
    'dne',
    'keyExists',
    'keyDne',
    'keyEq',
    'keyNeq',
    'keyGt',
    'keyGte',
    'keyLt',
    'keyLte'
  ],
  'Array': [
    'exists',
    'dne',
    'containsString',
    'doesNotContainString',
    'containsNumber',
    'doesNotContainNumber',
    'containsAny',
    'doesNotContainAny',
  ]
};

export const DefaultComparisons = {
  'Pointer': '',
  'Boolean': false,
  'Number': '',
  'String': '',
  'Object': '',
  'Date': Parse._encode(new Date()),
};

// Given a class schema and an array of current filters, this returns the remaining available filters
//   schema is a map of objects - column name -> {type string, targetClass string}
//   currentFilters is an immutable List of filters, Maps of the form { column: string, constraint: string, ... }
//   blacklist is an optional array of constraints to ignore
export function availableFilters(schema, currentFilters, blacklist) {
  blacklist = blacklist || [];
  let disabled = {};
  if (currentFilters) {
    currentFilters.forEach((filter) => {
      if (!Constraints[filter.get('constraint')].composable) {
        disabled[filter.get('field')] = true;
      }
    });
  }
  let available = {};
  for (let col in schema) {
    if (disabled[col]) {
      continue;
    }
    let type = schema[col].type;
    if (!FieldConstraints[type]) {
      continue;
    }
    available[col] = FieldConstraints[type].filter((c) => blacklist.indexOf(c) < 0);
  }
  return available;
}
