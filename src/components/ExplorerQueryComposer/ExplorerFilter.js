/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
export const Constraints = {
  '$eq': {
    name: 'equals',
  },
  '$ne': {
    name: 'does not equal',
  },
  '$lt': {
    name: 'less than',
    field: 'Number',
    composable: true,
  },
  '$le': {
    name: 'less than or equal',
    field: 'Number',
    composable: true,
  },
  '$gt': {
    name: 'greater than',
    field: 'Number',
    composable: true,
  },
  '$ge': {
    name: 'greater than or equal',
    field: 'Number',
    composable: true,
  },
  '$contains': {
    name: 'contains string',
    field: 'String',
    composable: true,
  },
  'json_extract_scalar': {
    name: 'json',
    field: 'JSON',
    composable: true
  }
};

export const FieldConstraints = {
  'Boolean': [ '$eq' ],
  'Number': [ '$eq', '$ne', '$lt', '$le', '$gt', '$ge' ],
  'String': [ '$eq', '$ne', '$contains' ],
  'Date': [ '$eq', '$ne', '$lt', '$le', '$gt', '$ge' ],
  'JSON': [ '$eq', '$ne', 'json_extract_scalar' ],
  'JSONValue': [ '$eq', '$ne' ]
};
