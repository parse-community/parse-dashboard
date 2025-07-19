/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse from 'parse';

export default async function queryFromFilters(className, filters) {
  let primaryQuery;
  const querieslist = [];
  if (typeof className === 'string') {
    primaryQuery = new Parse.Query(className);
  } else if (typeof className === 'object' && className instanceof Parse.Relation) {
    primaryQuery = className.query();
  }

  const queries = {};
  for (const filter of filters) {
    const filterClassName = filter.get('class');
    if (filterClassName === className || !filterClassName) {
      addConstraint(primaryQuery, filter);
    } else {
      if (!queries[filterClassName]) {
        queries[filterClassName] = new Parse.Query(filterClassName);
      }
      addConstraint(queries[filterClassName], filter);
    }
  }

  primaryQuery.applySchemaConstraints = async function () {
    try {
      const allClassesSchema = await fetchAllSchemas();
      await Promise.all(
        Object.keys(queries).map(async filterClassName => {
          let tempquery;
          if (typeof className === 'string') {
            tempquery = new Parse.Query(className);
          } else if (typeof className === 'object' && className instanceof Parse.Relation) {
            tempquery = className.query();
          }
          const reversePointerField = getPointerField(allClassesSchema, filterClassName, className);
          const pointerField = getPointerField(allClassesSchema, className, filterClassName);
          if (!pointerField && !reversePointerField) {
            console.warn(`No relationship found between ${className} and ${filterClassName}`);
          } else {
            if (pointerField) {
              tempquery.matchesQuery(pointerField, queries[filterClassName]);
            }
            if (!pointerField && reversePointerField) {
              await tempquery.matchesKeyInQuery(
                'objectId',
                `${reversePointerField}.objectId`,
                queries[filterClassName]
              );
            }
            querieslist.push(tempquery);
          }
        })
      );
    } catch (error) {
      console.error('Error fetching schemas:', error);
    }
  };

  await primaryQuery.applySchemaConstraints();
  let finalQuery;
  if (querieslist.length > 0 || filters.length > 0) {
    finalQuery = Parse.Query.and(...querieslist, primaryQuery);
  } else {
    finalQuery = primaryQuery;
  }

  return finalQuery;
}

async function fetchAllSchemas() {
  const schemas = await Parse.Schema.all();
  const schemaMap = {};
  schemas.forEach(schema => {
    schemaMap[schema.className] = schema.fields;
  });
  return schemaMap;
}

function getPointerField(allClassesSchema, fromClassName, toClassName) {
  const schema = allClassesSchema[fromClassName];
  if (schema) {
    for (const field of Object.keys(schema)) {
      if (schema[field].type === 'Pointer' && schema[field].targetClass === toClassName) {
        return field;
      }
    }
  }
  return null;
}

function addQueryConstraintFromObject(query, filter, constraintType) {
  const compareTo = JSON.parse(filter.get('compareTo'));
  for (const key of Object.keys(compareTo)) {
    query[constraintType](filter.get('field') + '.' + key, compareTo[key]);
  }
}

function isPointer(value) {
  return (
    typeof value === 'object' && value.hasOwnProperty('__type') && value['__type'] === 'Pointer'
  );
}

function addConstraint(query, filter) {
  switch (filter.get('constraint')) {
    case 'exists':
      query.exists(filter.get('field'));
      break;
    case 'dne':
      query.doesNotExist(filter.get('field'));
      break;
    case 'eq':
      query.equalTo(filter.get('field'), filter.get('compareTo'));
      break;
    case 'neq':
      query.notEqualTo(filter.get('field'), filter.get('compareTo'));
      break;
    case 'lt':
      query.lessThan(filter.get('field'), filter.get('compareTo'));
      break;
    case 'lte':
    case 'onOrBefore':
      query.lessThanOrEqualTo(filter.get('field'), filter.get('compareTo'));
      break;
    case 'gt':
      query.greaterThan(filter.get('field'), filter.get('compareTo'));
      break;
    case 'gte':
    case 'onOrAfter':
      query.greaterThanOrEqualTo(filter.get('field'), filter.get('compareTo'));
      break;
    case 'starts':
      const field = filter.get('field');
      const compareTo = filter.get('compareTo');
      if (isPointer(compareTo)) {
        const pointerQuery = new Parse.Query(compareTo.className);
        pointerQuery.startsWith('objectId', compareTo.objectId);
        query.matchesQuery(field, pointerQuery);
      } else {
        query.startsWith(field, compareTo);
      }
      break;
    case 'ends':
      query.endsWith(filter.get('field'), filter.get('compareTo'));
      break;
    case 'before':
      query.lessThan(filter.get('field'), filter.get('compareTo'));
      break;
    case 'after':
      query.greaterThan(filter.get('field'), filter.get('compareTo'));
      break;
    case 'containsString':
    case 'containsNumber':
      query.equalTo(filter.get('field'), filter.get('compareTo'));
      break;
    case 'doesNotContainString':
    case 'doesNotContainNumber':
      query.notEqualTo(filter.get('field'), filter.get('compareTo'));
      break;
    case 'containedIn':
      query.containedIn(filter.get('field'), filter.get('array'));
      break;
    case 'stringContainsString':
      query.matches(filter.get('field'), filter.get('compareTo'), 'i');
      break;
    case 'keyExists':
      query.exists(filter.get('field') + '.' + filter.get('compareTo'));
      break;
    case 'keyDne':
      query.doesNotExist(filter.get('field') + '.' + filter.get('compareTo'));
      break;
    case 'keyEq':
      addQueryConstraintFromObject(query, filter, 'equalTo');
      break;
    case 'keyNeq':
      addQueryConstraintFromObject(query, filter, 'notEqualTo');
      break;
    case 'keyGt':
      addQueryConstraintFromObject(query, filter, 'greaterThan');
      break;
    case 'keyGte':
      addQueryConstraintFromObject(query, filter, 'greaterThanOrEqualTo');
      break;
    case 'keyLt':
      addQueryConstraintFromObject(query, filter, 'lessThan');
      break;
    case 'keyLte':
      addQueryConstraintFromObject(query, filter, 'lessThanOrEqualTo');
      break;
  }
  return query;
}
