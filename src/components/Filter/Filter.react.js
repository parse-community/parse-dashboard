/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as Filters from 'lib/Filters';
import { List, Map } from 'immutable';
import PropTypes from 'lib/PropTypes';
import React, { useEffect, useState } from 'react';
import stringCompare from 'lib/stringCompare';
import { CurrentApp } from 'context/currentApp';

function changeClass(schema, filters, index, newClassName) {
  const current = filters.get(index);
  const field = current.get('field');
  const constraint = current.get('constraint');
  const newClassFields = Object.keys(schema[newClassName]);
  const isFieldValid = newClassFields.includes(field);
  const newField = isFieldValid ? field : newClassFields[0];
  const allowedConstraints = Filters.FieldConstraints[schema[newClassName][newField].type];
  const isConstraintValid = allowedConstraints.includes(constraint);
  const newConstraint = isConstraintValid ? constraint : allowedConstraints[0];
  const defaultCompare = Filters.DefaultComparisons[schema[newClassName][newField].type];
  const newFilter = new Map({
    class: newClassName,
    field: newField,
    constraint: newConstraint,
    compareTo: defaultCompare,
  });

  return filters.set(index, newFilter);
}

function changeField(schema, currentClassName, filters, index, newField) {
  const allowedConstraints = Filters.FieldConstraints[schema[currentClassName][newField].type];
  const current = filters.get(index);
  const constraint = current.get('constraint');
  const compare = current.get('compareTo');
  const defaultCompare = Filters.DefaultComparisons[schema[currentClassName][newField].type];
  const useExisting = allowedConstraints.includes(constraint);
  const newFilter = new Map({
    class: currentClassName,
    field: newField,
    constraint: useExisting
      ? constraint
      : Filters.FieldConstraints[schema[currentClassName][newField].type][0],
    compareTo: useExisting && typeof defaultCompare === typeof compare ? compare : defaultCompare,
  });
  return filters.set(index, newFilter);
}

function changeConstraint(schema, currentClassName, filters, index, newConstraint, prevCompareTo) {
  const field = filters.get(index).get('field');
  let compareType = schema[currentClassName][field].type;
  if (Object.prototype.hasOwnProperty.call(Filters.Constraints[newConstraint], 'field')) {
    compareType = Filters.Constraints[newConstraint].field;
  }
  const newFilter = new Map({
    class: currentClassName,
    field: field,
    constraint: newConstraint,
    compareTo:
      compareType && prevCompareTo ? prevCompareTo : Filters.DefaultComparisons[compareType],
  });
  return filters.set(index, newFilter);
}

function changeCompareTo(schema, filters, index, type, newCompare) {
  const newValue = newCompare;
  return filters.set(index, filters.get(index).set('compareTo', newValue));
}

function deleteRow(filters, index) {
  return filters.delete(index);
}

function deleteRowDraft(setFiltersArrayDraft, index) {
  return setFiltersArrayDraft(filtersArrayDraftState =>
    filtersArrayDraftState.filter((_, indexElement) => indexElement !== index)
  );
}

function changeClassDraft(setFiltersArrayDraft, index, newClassName) {
  setFiltersArrayDraft(filtersArrayDraftState =>
    filtersArrayDraftState.map((element, indexElement) => {
      if (indexElement === index) {
        return new Map({
          class: newClassName,
          field: '',
        });
      } else {
        return element;
      }
    })
  );
}

function changeFieldDraft(
  schema,
  currentClassName,
  filters,
  index,
  newField,
  fields,
  setFiltersArrayDraft
) {
  const fieldIsValid = fields.find(field => field === newField);

  if (fieldIsValid) {
    const newFilterDraft = new Map({
      class: currentClassName,
      field: newField,
      constraint: Filters.FieldConstraints[schema[currentClassName][newField].type][0],
      compareTo: Filters.DefaultComparisons[schema[currentClassName][newField].type],
    });

    deleteRowDraft(setFiltersArrayDraft, index);
    return filters.push(newFilterDraft);
  } else {
    return filters;
  }
}

function getFields(available, currentClassName, field, currentApp, className) {
  let fields = [];
  if (available[currentClassName]) {
    fields = Object.keys(available[currentClassName]).concat([]);
  }
  if (field !== '' && fields.indexOf(field) < 0) {
    fields.push(field);
  }

  // Get the column preference of the current class.
  const currentColumnPreference = currentApp.columnPreference
    ? currentApp.columnPreference[className]
    : null;

  // Check if the preference exists.
  if (currentColumnPreference) {
    const fieldsToSortToTop = currentColumnPreference
      .filter(item => item.filterSortToTop)
      .map(item => item.name);
    // Sort the fields.
    fields.sort((a, b) => {
      // Only "a" should sorted to the top.
      if (fieldsToSortToTop.includes(a) && !fieldsToSortToTop.includes(b)) {
        return -1;
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

  return fields;
}

const Filter = ({
  schema,
  filters,
  allClasses,
  renderRow,
  onChange,
  onSearch,
  blacklist,
  className,
  setFiltersArrayDraft,
  filtersArrayDraft,
}) => {
  const [compare, setCompare] = useState(false);
  const [filtersArrayDraftLengthMemory, setFiltersArrayDraftLengthMemory] = useState(0);
  const hasCompareTo = filters.some(filter => filter.get('compareTo') !== undefined);

  if (compare !== hasCompareTo) {
    setCompare(hasCompareTo);
  }
  const currentApp = React.useContext(CurrentApp);
  blacklist = blacklist || [];
  const available = Filters.findRelatedClasses(className, allClasses, blacklist, filters);
  const classes = Object.keys(available).concat([]);

  useEffect(() => {
    if (filters.size === 0) {
      setFiltersArrayDraft(() => [
        new Map({
          class: className,
          field: '',
        }),
      ]);
    } else {
      setFiltersArrayDraft(() => []);
    }
  }, []);

  useEffect(() => {
    setFiltersArrayDraftLengthMemory(filtersArrayDraft.length);
  }, [filtersArrayDraft]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '12px 15px 0px 15px',
          color: '#343445',
          'font-weight': '600',
        }}
      >
        <div style={{ width: '140px' }}>Class</div>
        <div style={{ width: '140px' }}>Field</div>
        <div style={{ width: '175px' }}>Condition</div>
        {compare && <div>Value</div>}
        <div></div>
      </div>

      {filters.toArray().map((filter, i) => {
        const currentClassName = filter.get('class');
        const field = filter.get('field');
        const constraint = filter.get('constraint');
        const compareTo = filter.get('compareTo');
        const fields = getFields(available, currentClassName, field, currentApp, className);

        const constraints = Filters.FieldConstraints[schema[currentClassName][field].type].filter(
          c => blacklist.indexOf(c) < 0
        );
        let compareType = schema[currentClassName][field].type;
        if (Object.prototype.hasOwnProperty.call(Filters.Constraints[constraint], 'field')) {
          compareType = Filters.Constraints[constraint].field;
        }
        return renderRow({
          classes,
          fields,
          constraints,
          compareInfo: {
            type: compareType,
            targetClass: schema[currentClassName][field].targetClass,
          },
          currentClass: currentClassName,
          currentField: field,
          currentConstraint: constraint,
          compareTo,
          key: field + '-' + constraint + '-' + i,
          onChangeClass: newClassName => {
            onChange(changeClass(schema, filters, i, newClassName));
          },
          onChangeField: newField => {
            onChange(changeField(schema, currentClassName, filters, i, newField));
          },
          onChangeConstraint: (newConstraint, prevCompareTo) => {
            onChange(
              changeConstraint(schema, currentClassName, filters, i, newConstraint, prevCompareTo)
            );
          },
          onChangeCompareTo: newCompare => {
            onChange(changeCompareTo(schema, filters, i, compareType, newCompare));
          },
          onKeyDown: ({ key }) => {
            if (key === 'Enter') {
              onSearch();
            }
          },
          onDeleteRow: () => {
            onChange(deleteRow(filters, i));
          },
        });
      })}

      {filtersArrayDraft.map((filter, i) => {
        const currentClassName = filter.get('class');
        const field = filter.get('field');
        const fields = getFields(available, currentClassName, field, currentApp, className);

        return renderRow({
          classes,
          fields,
          constraints: ['exists'],
          compareInfo: {
            type: undefined,
            targetClass: null,
          },
          currentClass: currentClassName,
          currentField: field,
          currentConstraint: 'exists',
          key: i + 'draft' + filtersArrayDraft.length,
          initialFocusOnTheField:
            filtersArrayDraftLengthMemory === 0 ||
            (filtersArrayDraftLengthMemory < filtersArrayDraft.length &&
              filtersArrayDraft.length - 1 === i),
          onChangeClass: newClassName => {
            changeClassDraft(setFiltersArrayDraft, i, newClassName);
          },
          onChangeField: newField => {
            onChange(
              changeFieldDraft(
                schema,
                currentClassName,
                filters,
                i,
                newField,
                fields,
                setFiltersArrayDraft
              )
            );
          },
          onChangeConstraint: () => {},
          onChangeCompareTo: () => {},
          onKeyDown: () => {},
          onDeleteRow: () => {
            deleteRowDraft(setFiltersArrayDraft, i);
          },
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
  renderRow: PropTypes.func.isRequired.describe('A function for rendering a row of a filter.'),
};
