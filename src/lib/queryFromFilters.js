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

function addQueryConstraintFromObject(query, field, compareTo, constraintType) {
  let parsedCompareTo;
  try {
    parsedCompareTo = typeof compareTo === 'string' ? JSON.parse(compareTo) : compareTo;
  } catch (e) {
    console.error('Invalid JSON in object constraint compareTo:', e);
    return;
  }

  if (typeof parsedCompareTo !== 'object' || parsedCompareTo === null) {
    console.error('Object constraint compareTo must be an object');
    return;
  }

  for (const key of Object.keys(parsedCompareTo)) {
    query[constraintType](field + '.' + key, parsedCompareTo[key]);
  }
}

function isPointer(value) {
  return (
    typeof value === 'object' && value.hasOwnProperty('__type') && value['__type'] === 'Pointer'
  );
}

function isParseDate(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.__type === 'Date' &&
    typeof value.iso === 'string'
  );
}

function isRelativeDate(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.__type === 'RelativeDate' &&
    typeof value.value === 'number'
  );
}

function toDate(value) {
  if (isRelativeDate(value)) {
    // RelativeDate stores offset in seconds from current time
    const now = new Date();
    return new Date(now.getTime() + value.value * 1000);
  }
  if (isParseDate(value)) {
    return new Date(value.iso);
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date(value);
}

/**
 * Applies a filter constraint to a Parse Query using plain values.
 * This is the shared implementation used by both DataBrowser and Canvas.
 *
 * @param {Parse.Query} query - The Parse Query to apply the constraint to
 * @param {string} field - The field name to filter on
 * @param {string} constraint - The constraint type (e.g., 'eq', 'lt', 'onOrAfter')
 * @param {*} compareTo - The value to compare against
 * @param {string} [modifiers] - Optional modifiers (used for regex 'matches' constraint)
 * @returns {Parse.Query} The query with the constraint applied
 */
export function addConstraintFromValues(query, field, constraint, compareTo, modifiers) {
  switch (constraint) {
    case 'exists':
      query.exists(field);
      break;
    case 'dne':
      query.doesNotExist(field);
      break;
    case 'eq':
      query.equalTo(field, compareTo);
      break;
    case 'neq':
      query.notEqualTo(field, compareTo);
      break;
    case 'lt':
      query.lessThan(field, compareTo);
      break;
    case 'lte':
      query.lessThanOrEqualTo(field, compareTo);
      break;
    case 'onOrBefore':
      query.lessThanOrEqualTo(field, toDate(compareTo));
      break;
    case 'gt':
      query.greaterThan(field, compareTo);
      break;
    case 'gte':
      query.greaterThanOrEqualTo(field, compareTo);
      break;
    case 'onOrAfter':
      query.greaterThanOrEqualTo(field, toDate(compareTo));
      break;
    case 'starts':
      if (isPointer(compareTo)) {
        const pointerQuery = new Parse.Query(compareTo.className);
        pointerQuery.startsWith('objectId', compareTo.objectId);
        query.matchesQuery(field, pointerQuery);
      } else {
        query.startsWith(field, compareTo);
      }
      break;
    case 'ends':
      query.endsWith(field, compareTo);
      break;
    case 'before':
      query.lessThan(field, toDate(compareTo));
      break;
    case 'after':
      query.greaterThan(field, toDate(compareTo));
      break;
    case 'containsString':
    case 'containsNumber':
      query.equalTo(field, compareTo);
      break;
    case 'doesNotContainString':
    case 'doesNotContainNumber':
      query.notEqualTo(field, compareTo);
      break;
    case 'containedIn':
      query.containedIn(field, compareTo);
      break;
    case 'containsAny':
      query.containedIn(field, compareTo);
      break;
    case 'matches':
      query.matches(field, String(compareTo), modifiers);
      break;
    case 'keyExists':
      query.exists(field + '.' + compareTo);
      break;
    case 'keyDne':
      query.doesNotExist(field + '.' + compareTo);
      break;
    case 'keyEq':
      addQueryConstraintFromObject(query, field, compareTo, 'equalTo');
      break;
    case 'keyNeq':
      addQueryConstraintFromObject(query, field, compareTo, 'notEqualTo');
      break;
    case 'keyGt':
      addQueryConstraintFromObject(query, field, compareTo, 'greaterThan');
      break;
    case 'keyGte':
      addQueryConstraintFromObject(query, field, compareTo, 'greaterThanOrEqualTo');
      break;
    case 'keyLt':
      addQueryConstraintFromObject(query, field, compareTo, 'lessThan');
      break;
    case 'keyLte':
      addQueryConstraintFromObject(query, field, compareTo, 'lessThanOrEqualTo');
      break;
  }
  return query;
}

function addConstraint(query, filter) {
  return addConstraintFromValues(
    query,
    filter.get('field'),
    filter.get('constraint'),
    filter.get('compareTo'),
    filter.get('modifiers')
  );
}
