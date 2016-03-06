/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as Filters  from 'lib/Filters';
import { List, Map } from 'immutable';
import PropTypes     from 'lib/PropTypes';
import React         from 'react';

function changeField(schema, filters, index, newField) {
  let newFilter = new Map({
    field: newField,
    constraint: Filters.FieldConstraints[schema[newField].type][0],
    compareTo: Filters.DefaultComparisons[schema[newField].type]
  });
  return filters.set(index, newFilter);
}

function changeConstraint(schema, filters, index, newConstraint) {
  let field = filters.get(index).get('field');
  let compareType = schema[field].type;
  if (Filters.Constraints[newConstraint].hasOwnProperty('field')) {
    compareType = Filters.Constraints[newConstraint].field;
  }
  let newFilter = new Map({
    field: field,
    constraint: newConstraint,
    compareTo: Filters.DefaultComparisons[compareType]
  })
  return filters.set(index, newFilter);
}

function changeCompareTo(schema, filters, index, type, newCompare) {
  let newValue = newCompare;
  return filters.set(index, filters.get(index).set('compareTo', newValue));
}

function deleteRow(filters, index) {
  return filters.delete(index);
}

let Filter = ({ schema, filters, renderRow, onChange, blacklist }) => {
  blacklist = blacklist || [];
  let available = Filters.availableFilters(schema, filters);
  return (
    <div>
      {filters.toArray().map((filter, i) => {
        let field = filter.get('field');
        let constraint = filter.get('constraint');
        let compareTo = filter.get('compareTo');

        let fields = Object.keys(available).concat([]);
        if (fields.indexOf(field) < 0) {
          fields.push(field);
        }
        fields.sort();
        let constraints = Filters.FieldConstraints[schema[field].type].filter((c) => blacklist.indexOf(c) < 0);
        let compareType = schema[field].type;
        if (Filters.Constraints[constraint].hasOwnProperty('field')) {
          compareType = Filters.Constraints[constraint].field;
        }
        return renderRow({
          fields,
          constraints,
          compareInfo: {
            type: compareType,
            targetClass: schema[field].targetClass,
          },
          currentField: field,
          currentConstraint: constraint,
          compareTo,
          key: field + '-' + constraint + '-' + i,

          onChangeField: newField => {
            onChange(changeField(schema, filters, i, newField));
          },
          onChangeConstraint: newConstraint => {
            onChange(changeConstraint(schema, filters, i, newConstraint));
          },
          onChangeCompareTo: newCompare => {
            onChange(changeCompareTo(schema, filters, i, compareType, newCompare));
          },
          onDeleteRow: () => {
            onChange(deleteRow(filters, i));
          }
        });
      })}
    </div>
  );
};

export default Filter;

Filter.propTypes = {
  schema: PropTypes.object.isRequired.describe(
    'A class schema, mapping field names to their Type strings'
  ),
  filters: PropTypes.instanceOf(List).isRequired.describe(
    'An array of filter objects. Each filter contains "field", "comparator", and "compareTo" fields.'
  ),
  renderRow: PropTypes.func.isRequired.describe(
    'A function for rendering a row of a filter.'
  )
};
