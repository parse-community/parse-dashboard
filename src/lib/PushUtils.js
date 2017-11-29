/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/**
 * Utility for Push
 * Ported from PushNotificationsHelper and misc
 */

import * as PushConstants from 'dashboard/Push/PushConstants';
import LoaderDots         from 'components/LoaderDots/LoaderDots.react';
import prettyNumber       from 'lib/prettyNumber';
import React              from 'react';
import stringList         from 'lib/stringList';

// formats pointers into human readable form
let pointerToReadbleValue = (value) => {
  return value.className + ':' + value.objectId
}

/**
 * Formats Pointer, GeoPoint, and Date objects into a human readable form
 * If object is not in one of the supported forms, we return value.inspect
 * @param {Object}
 * @return {String}
 */
let objectToReadable = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  let typeValue = value['__type'];
  let res = '';
  switch(typeValue) {
    case 'Pointer':
      res = `${pointerToReadbleValue(value)}`;
      break;
    case 'GeoPoint':
      res = `GeoPoint: (${value.latitude}, ${value.longitude})`;
      break;
    case 'Date':
      if (value['iso']) {
        res = (new Date(value['iso'])).toLocaleString();
      } else {
        res = value;
      }
      break;
    default:
      res = String(value);
      break;
  }
  return res;
}

/**
 * Creates humanized version of lists that are either inclusive ('or')
 * or exclusive ('nor'). Possible outputs are:
 * foo
 * both foo and bar
 * either foo or bar
 * foo or bar              // caller will prefix with "is not"
 * all of foo, bar, and baz
 * any of foo, bar, or baz  // call may prefix with "is not"
 * @param  {Object}
 * @param  {Boolean}
 * @param  {Boolean}
 * @return {String}
 */
let humanizedList = (value, inclusive, all) => {
  if(!value.constructor === Array){
    return '';
  }
  let join = all ? 'and' : 'or';
  let prefix = '';
  let res = '';
  switch (value.length) {
    case 1:
      res = objectToReadable(value[0]);
      break;
    case 2:
      prefix = inclusive ? 'either ' : '';
      if(all) {
        prefix = 'both ';
      }
      res =  `${prefix}${objectToReadable(value[0])} ${join} ${objectToReadable(value[1])}`;
      break;
    default:
      prefix = all ? 'all of' : 'any of';
      res = `${join} ${objectToReadable(value[value.length-1])}`;
      break;
  }
  return res;
}

/**
 * Result is 3 components for the constraint, like this: ["key", "descriptor", "value"]
 * This is 3 different components so that separate formatting can be
 * applied to each component. eg ["channels", "includes", "a, b, or c"] can become
 * <strong>channels</strong> includes <strong>a, b, or c</strong>
 * @param  {Sting}
 * @param  {String}
 * @param  {Object}
 * @param  {Object}
 * @return {Array}
 */
let formatConstraintComponent = (key, operation, value, schema) => {
  let res = null;
  switch (operation) {
    case '$lt':
      res = [key, 'is less than', objectToReadable(value)];
      break;
    case '$lte':
      res = [key, 'is less than or equal to', objectToReadable(value)];
      break;
    case '$gt':
      res = [key, 'is greater than', objectToReadable(value)];
      break;
    case '$gte':
      res = [key, 'is greater than or equal to', objectToReadable(value)];
      break;
    case '$ne':
      res = [key, 'is not', objectToReadable(value)];
      break;
    case '$exists':
      res = [key, value ? 'is set' : 'is not set', ''];
      break;
    case '$in':
    case '$nin':
    case '$all':
      let isInclusive = operation === '$in';
      if(!value.constructor === Array) {
        res = [key, `constraint is malformed (${operation} operator requires an array)`, ''];
      } else if (!schema[key]) {
        res = ['', `Cannot perform operation on non-existent column ${key}`, ''];
      } else if (schema[key]['type'] === 'Array'){
        let isAll = operation === '$all';
        res = [key,
         isInclusive || isAll ? 'contains' : 'does not contain',
         humanizedList(value, isInclusive, isAll)];
      }
      break;
    default:
      res = [key, `advanced operator`, `${operation} ${JSON.stringify(value)}`];
      break;
  }
  return res;
}

/**
 * Handles formatting of Arrays and Maps
 * @param  {String}
 * @param  {Object}
 * @param  {Object}
 * @return {Array}
 */
let formatStructure = (key, constraints, schema) => {
  let rows = [];
  for(let prop in constraints){
    if(constraints.hasOwnProperty(prop)){
      rows.push(formatConstraintComponent(key, prop, constraints[prop], schema));
    }
  }
  return rows;
}

/**
 * Result is 3 components for each constraint, like this: [["key", "descriptor", "value"]]
 * This is 3 different components so that separate formatting can be
 * applied to each component. eg ["channels", "includes", "a, b, or c"] can become
 * <strong>channels</strong> includes <strong>a, b, or c</strong>
 * @param  {String}
 * @param  {Object}
 * @param  {Object}
 * @return {Array}
 */
export function formatConstraint(key, constraints, schema) {
  let rows = [];
  if(constraints.constructor === Object){
    rows.push(formatStructure(key, constraints, schema));
  } else if(constraints.constructor === Array) {
    // legacy comment: Not sure how we want to display grouped subclauses
    for(let i = 0; i<constraints.length; i++) {
      if(constraints[i].constructor === Object){
        rows = rows.concat(formatStructure(key, constraints[i], schema));
      } else {
        rows.push(formatStructure(key, {'$in': constraints[i]}, schema));
        break;
      }
    }
  } else if(constraints.constructor === Boolean) {
    rows.push([[key, 'is', constraints ? 'true' : 'false']]);
  } else {
    rows.push([[key, 'is', constraints]]);
  }
  return rows;
}

/**
 * maps list of devices to friendly content
 * @param  {Array} devices - platform list
 * @return {Array} platform list in friendly form
 */
let devicesToReadableList = (devices) => {
  return devices.map((device) => {
    return PushConstants.DEVICE_MAP[device];
  });
}

/**
 * build short for query information
 * @param  {Object} query
 * @param  {Object} schema
 * @return {String}
 */
export function shortInfoBuilder(query, schema) {
  if(!query){
    return '';
  }

  let platformString = query.deviceType && query.deviceType['$in'] ? devicesToReadableList(query.deviceType['$in']).join(', ') : '';
  let otherConstraints = [];
  for(let entry in query){
    if(entry !== 'deviceType'){ //filter out deviceType entry
      formatConstraint(entry, query[entry], schema).forEach(
        (constraint) => {
          constraint.forEach(
            ([key, description, value]) => {
              otherConstraints.push([key, description, value].join(' '));
            }
          )
        }
      );
    }
  }
  return [platformString, otherConstraints.join(', ')].join(', ');
}

/**
 * build long form query information
 * @param  {Object} query
 * @param  {Object} schema
 * @return {Object} React Element
 */
export function largeInfoBuilder(query, schema, styles = {}) {
  if(!query) {
    return;
  }
  let platforms = query.deviceType && query.deviceType['$in'] ? devicesToReadableList(query.deviceType['$in']) : [];
  let platformRows = [];

  for (let platform in platforms) {
    platformRows.push(
      <li key={`platforms${platform}`}>
        {platforms[platform]}
      </li>
    );
  }

  let conditionRows = [];
  for(let entry in query){
    if(entry !== 'deviceType'){ //filter out deviceType entry
      formatConstraint(entry, query[entry], schema).forEach(
        (constraint) => {
          constraint.forEach(
            ([key, description, value]) => {
              conditionRows.push(
                <li key={`condition${entry}`}>
                  <strong>{key}</strong> {description} <strong>{value}</strong>
                </li>
              );
            }
          )
        }
      );
    }
  }
  return (
    <div className={styles.longInfo}>
      <ul className={styles.platformInfo}>
        <li className={styles.detailsHeaderListItem}>PLATFORMS</li>
        {platformRows}
      </ul>
      { conditionRows.length > 0 ?
        <ul className={styles.installationInfo}>
          <li className={styles.detailsHeaderListItem}>INSTALLATION CONDITIONS</li>
          {conditionRows}
        </ul> : 
        null
      }    
    </div>
  )
}

let tableInfoBuilderHelper = (styles, key, description, value) => {
  return (
    <tr className={styles.tr}>
      <td className={styles.td}>{key}</td>
      <td className={styles.td}>{description}</td>
      <td className={styles.td} style={{ wordBreak: 'break-word' }}>{value}</td>
    </tr>
  );
}

export function tableInfoBuilder(query, schema, styles = {}) {
  try {
    query = JSON.parse(query);
  } catch(e) {/**/} 

  if(!query) {
    return;
  }

  let platforms = query.deviceType && query.deviceType['$in'] ? devicesToReadableList(query.deviceType['$in']) : [];
  // special case: ex: {deviceType: "ios"}
  if (query.deviceType && query.deviceType.constructor === String) {
    platforms.push(query.deviceType)
  }

  let platformStr = stringList(platforms, 'or');
  let tableInfoRows = [];

  if (platformStr) {
    tableInfoRows.push(
      <tr key='platforms' className={styles.tr}>
        <td className={styles.td}>deviceType</td>
        <td className={styles.td}>is</td>
        <td className={styles.td}>{platformStr}</td>
      </tr>
    );
  }

  for(let entry in query){
    if(entry !== 'deviceType'){ //filter out deviceType entry
      formatConstraint(entry, query[entry], schema).forEach(
        (constraint) => {
          if (constraint && Array.isArray(constraint[0])) {
            // case 1: contraint = [[key, description, value]]
            constraint.forEach(
              ([key, description, value]) => {
                tableInfoRows.push(tableInfoBuilderHelper(styles, key, description, value));
              }
            );
          } else {
            // case 2: contraint = [key, description, value]
            let [key, description, value] = constraint;
            tableInfoRows.push(tableInfoBuilderHelper(styles, key, description, value));
          }
        }
      );
    }
  }
  return tableInfoRows;
}

export function formatCountDetails(count, approximate) {
  if(count === undefined) {
    return (<LoaderDots />);
  } else if (count === 0 && approximate) {
    return 'very small';
  } else {
    return prettyNumber(count);
  }
}

export function formatAudienceSchema(classes) {
  let schema = {};
  if(classes){
    let installations = classes.get('_Installation');
    if(typeof(installations) !== 'undefined'){
      installations.forEach((type, col) => {
        schema[col] = type;
      });
    }
  }
  return schema;
}
