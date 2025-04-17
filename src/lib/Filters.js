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
    field: null,
    comparable: false,
  },
  dne: {
    name: 'does not exist',
    field: null,
    comparable: false,
  },
  eq: {
    name: 'equals',
    comparable: true,
  },
  neq: {
    name: 'does not equal',
    comparable: true,
  },
  lt: {
    name: 'less than',
    field: 'Number',
    composable: true,
    comparable: true,
  },
  lte: {
    name: 'less than or equal',
    field: 'Number',
    composable: true,
    comparable: true,
  },
  gt: {
    name: 'greater than',
    field: 'Number',
    composable: true,
    comparable: true,
  },
  gte: {
    name: 'greater than or equal',
    field: 'Number',
    composable: true,
    comparable: true,
  },
  starts: {
    name: 'starts with',
    comparable: true,
  },
  ends: {
    name: 'ends with',
    comparable: true,
  },
  stringContainsString: {
    name: 'string contains string',
    field: 'String',
    composable: true,
    comparable: true,
  },
  before: {
    name: 'is before',
    field: 'Date',
    composable: true,
    comparable: true,
  },
  after: {
    name: 'is after',
    field: 'Date',
    composable: true,
    comparable: true,
  },
  containsString: {
    name: 'contains string',
    field: 'String',
    composable: true,
    comparable: true,
  },
  doesNotContainString: {
    name: 'without string',
    field: 'String',
    composable: true,
    comparable: true,
  },
  containsNumber: {
    name: 'contains number',
    field: 'Number',
    composable: true,
    comparable: true,
  },
  doesNotContainNumber: {
    name: 'without number',
    field: 'Number',
    composable: true,
    comparable: true,
  },
  containsAny: {
    name: 'contains',
    field: 'Array',
    comparable: true,
  },
  doesNotContainAny: {
    name: 'does not contain',
    field: 'Array',
    comparable: true,
  },
  keyExists: {
    name: 'key exists',
    field: 'String',
    composable: true,
    comparable: true,
  },
  keyDne: {
    name: 'key does not exist',
    field: 'String',
    composable: true,
    comparable: true,
  },
  keyEq: {
    name: 'key equals',
    field: 'Object',
    composable: true,
    comparable: true,
  },
  keyNeq: {
    name: 'key does not equal',
    field: 'Object',
    composable: true,
    comparable: true,
  },
  keyGt: {
    name: 'key greater than',
    field: 'Object',
    composable: true,
    comparable: true,
  },
  keyGte: {
    name: 'key greater than/equal',
    field: 'Object',
    composable: true,
    comparable: true,
  },
  keyLt: {
    name: 'key less than',
    field: 'Object',
    composable: true,
    comparable: true,
  },
  keyLte: {
    name: 'key less than/equal',
    field: 'Object',
    composable: true,
    comparable: true,
  },
  unique: {
    name: 'unique',
    field: null,
    comparable: false,
  },
};

export const FieldConstraints = {
  Pointer: ['exists', 'dne', 'eq', 'neq', 'starts', 'unique'],
  Boolean: ['exists', 'dne', 'eq', 'unique'],
  Number: ['exists', 'dne', 'eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'unique'],
  String: ['exists', 'dne', 'eq', 'neq', 'starts', 'ends', 'stringContainsString', 'unique'],
  Date: ['exists', 'dne', 'before', 'after', 'unique'],
  Object: [
    'exists',
    'dne',
    'keyExists',
    'keyDne',
    'keyEq',
    'keyNeq',
    'keyGt',
    'keyGte',
    'keyLt',
    'keyLte',
    'unique',
  ],
  Array: [
    'exists',
    'dne',
    'containsString',
    'doesNotContainString',
    'containsNumber',
    'doesNotContainNumber',
    'containsAny',
    'doesNotContainAny',
  ],
};

export const DefaultComparisons = {
  Pointer: '',
  Boolean: false,
  Number: '',
  String: '',
  Object: '',
  Date: Parse._encode(new Date()),
};

// Given a class schema and an array of current filters, this returns the remaining available filters
//   schema is a map of objects - column name -> {type string, targetClass string}
//   currentFilters is an immutable List of filters, Maps of the form { column: string, constraint: string, ... }
//   blacklist is an optional array of constraints to ignore
export function availableFilters(schema, currentFilters, blacklist) {
  blacklist = blacklist || [];
  const disabled = {};
  if (currentFilters) {
    currentFilters.forEach(filter => {
      if (!Constraints[filter.get('constraint')].composable) {
        disabled[filter.get('field')] = true;
      }
    });
  }
  const available = {};
  for (const col in schema) {
    if (disabled[col]) {
      continue;
    }
    const type = schema[col].type;
    if (!FieldConstraints[type]) {
      continue;
    }
    available[col] = FieldConstraints[type].filter(c => blacklist.indexOf(c) < 0);
  }
  return available;
}

export function findRelatedClasses(referClass, allClasses, blacklist, currentFilters) {
  const relatedClasses = {};
  if (allClasses[referClass]) {
    const availableForRefer = availableFilters(allClasses[referClass], currentFilters, blacklist);
    if (Object.keys(availableForRefer).length > 0) {
      relatedClasses[referClass] = availableForRefer;
    }
  }

  for (const className in allClasses) {
    if (className === referClass) {
      continue;
    }

    if (!checkRelation(referClass, allClasses, className)) {
      continue;
    }

    const schema = allClasses[className];
    const available = availableFilters(schema, currentFilters, blacklist);
    if (Object.keys(available).length > 0) {
      relatedClasses[className] = available;
    }
  }
  return relatedClasses;
}

const checkRelationHelper = (schema, col, className) =>
  schema[col].type === 'Pointer' && schema[col].targetClass === className;

function checkRelation(currentClassname, schemas, classToReferName) {
  const currentClassSchema = schemas[currentClassname];
  const classSchemaBeingCheckedToRefer = schemas[classToReferName];
  let flag = false;

  for (const col in currentClassSchema) {
    if (checkRelationHelper(currentClassSchema, col, classToReferName)) {
      flag = true;
    }
  }
  for (const col in classSchemaBeingCheckedToRefer) {
    if (checkRelationHelper(classSchemaBeingCheckedToRefer, col, currentClassname)) {
      flag = true;
    }
  }
  return flag;
}

export const BLACKLISTED_FILTERS = ['containsAny', 'doesNotContainAny'];

export function getFilterDetails(available) {
  const filterClass = Object.keys(available)[0];
  const filterField = Object.keys(available[filterClass])[0];
  const filterConstraint = available[filterClass][filterField][0];
  return { filterClass, filterField, filterConstraint };
}
