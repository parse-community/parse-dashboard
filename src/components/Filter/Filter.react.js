/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as Filters   from 'lib/Filters';
import { List, Map }  from 'immutable';
import PropTypes      from 'lib/PropTypes';
import React          from 'react';
import stringCompare  from 'lib/stringCompare';
import { CurrentApp } from 'context/currentApp';

function changeField(schema, filters, index, newField) {
  const allowedConstraints = Filters.FieldConstraints[schema[newField].type];
  const current = filters.get(index);
  const constraint = current.get('constraint');
  const compare = current.get('compareTo');
  const defaultCompare = Filters.DefaultComparisons[schema[newField].type];
  const useExisting = allowedConstraints.includes(constraint);
  const newFilter = new Map({
    field: newField,
    constraint: useExisting ? constraint : Filters.FieldConstraints[schema[newField].type][0],
    compareTo: (useExisting && typeof defaultCompare === typeof compare) ? compare : defaultCompare
  });
  return filters.set(index, newFilter);
}

function changeConstraint(schema, filters, index, newConstraint, prevCompareTo) {
  let field = filters.get(index).get('field');
  let compareType = schema[field].type;
  if (Object.prototype.hasOwnProperty.call(Filters.Constraints[newConstraint], 'field')) {
    compareType = Filters.Constraints[newConstraint].field;
  }
  let newFilter = new Map({
    field: field,
    constraint: newConstraint,
    compareTo: prevCompareTo ?? Filters.DefaultComparisons[compareType]
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

let Filter = ({ schema, filters, renderRow, onChange, onSearch, blacklist, className }) => {
  const currentApp = React.useContext(CurrentApp);
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

        // Get the column preference of the current class.
        const currentColumnPreference = currentApp.columnPreference ? currentApp.columnPreference[className] : null;

        // Check if the preference exists.
        if (currentColumnPreference) {
          const fieldsToSortToTop = currentColumnPreference
            .filter(item => item.filterSortToTop)
            .map(item => item.name);
          // Sort the fields.
          fields.sort((a, b) => {
            // Only "a" should sorted to the top.
            if (fieldsToSortToTop.includes(a) && !fieldsToSortToTop.includes(b)) {
              return -1
            }
            // Only "b" should sorted to the top.
            if (!fieldsToSortToTop.includes(a) && fieldsToSortToTop.includes(b)) {
              return 1;
            }
            // Both should sorted to the top -> they should be sorted to the same order as in the "fieldsToSortToTop" array.
            if (fieldsToSortToTop.includes(a) && fieldsToSortToTop.includes(b)) {
              return fieldsToSortToTop.indexOf(a) - fieldsToSortToTop.indexOf(b);
            }
            return stringCompare(a, b);
          });
        }
        // If there's no preference: Use the default sort function.
        else {
          fields.sort();
        }

        let constraints = Filters.FieldConstraints[schema[field].type].filter((c) => blacklist.indexOf(c) < 0);
        let compareType = schema[field].type;
        if (Object.prototype.hasOwnProperty.call(Filters.Constraints[constraint], 'field')) {
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
          onChangeConstraint: (newConstraint, prevCompareTo) => {
            onChange(changeConstraint(schema, filters, i, newConstraint, prevCompareTo));
          },
          onChangeCompareTo: newCompare => {
            onChange(changeCompareTo(schema, filters, i, compareType, newCompare));
          },
          onKeyDown: ({key}) => {
            if (key === 'Enter') {
              onSearch();
            }
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
