/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ChromeDropdown from 'components/ChromeDropdown/ChromeDropdown.react';
import Autocomplete from 'components/Autocomplete/Autocomplete.react';
import { Constraints } from 'lib/Filters';
import DateTimeEntry from 'components/DateTimeEntry/DateTimeEntry.react';
import Icon from 'components/Icon/Icon.react';
import Parse from 'parse';
import PropTypes from 'lib/PropTypes';
import React, { useCallback } from 'react';
import styles from 'components/BrowserFilter/BrowserFilter.scss';
import validateNumeric from 'lib/validateNumeric';

const constraintLookup = {};
for (const c in Constraints) {
  constraintLookup[Constraints[c].name] = c;
}

function compareValue(
  info,
  value,
  onChangeCompareTo,
  onKeyDown,
  active,
  parentContentId,
  setFocus
) {
  switch (info.type) {
    case null:
      return null;
    case 'Object':
    case 'String':
      return (
        <input
          type="text"
          value={value}
          onChange={e => onChangeCompareTo(e.target.value)}
          onKeyDown={onKeyDown}
          ref={setFocus}
        />
      );
    case 'Pointer':
      return (
        <input
          type="text"
          value={value.objectId || ''}
          onChange={e => {
            const obj = new Parse.Object(info.targetClass);
            obj.id = e.target.value;
            onChangeCompareTo(obj.toPointer());
          }}
          ref={setFocus}
        />
      );
    case 'Boolean':
      return (
        <ChromeDropdown
          color={active ? 'blue' : 'purple'}
          value={value ? 'True' : 'False'}
          options={['True', 'False']}
          onChange={val => onChangeCompareTo(val === 'True')}
        />
      );
    case 'Number':
      return (
        <input
          type="text"
          value={value}
          onChange={e => {
            let val = value;
            if (!e.target.value.length || e.target.value === '-') {
              val = e.target.value;
            } else if (validateNumeric(e.target.value)) {
              val = parseFloat(e.target.value);
            }
            onChangeCompareTo(val);
          }}
          onKeyDown={onKeyDown}
        />
      );
    case 'Date':
      return (
        <DateTimeEntry
          fixed={true}
          className={styles.date}
          value={Parse._decode('date', value)}
          onChange={value => onChangeCompareTo(Parse._encode(value))}
          ref={setFocus}
          parentContentId={parentContentId}
        />
      );
  }
}

const FilterRow = ({
  fields,
  constraints,
  compareInfo,
  currentField,
  currentConstraint,
  compareTo,
  onChangeField,
  onChangeConstraint,
  onChangeCompareTo,
  onKeyDown,
  onDeleteRow,
  active,
  parentContentId,
  editMode,
}) => {
  const setFocus = useCallback(input => {
    if (input !== null && editMode) {
      input.focus();
    }
  }, []);

  const buildSuggestions = input => {
    const regex = new RegExp(input.split('').join('.*?'), 'i');
    return fields.filter(f => regex.test(f));
  };

  return (
    <div className={styles.row}>
      <Autocomplete
        inputStyle={{
          transition: '0s background-color ease-in-out',
        }}
        suggestionsStyle={{
          width: '140px',
          maxHeight: '360px',
          overflowY: 'auto',
          fontSize: '14px',
          background: '#343445',
          borderBottomLeftRadius: '5px',
          borderBottomRightRadius: '5px',
          color: 'white',
          cursor: 'pointer',
        }}
        suggestionsItemStyle={{
          background: '#343445',
          color: 'white',
          height: '30px',
          lineHeight: '30px',
          borderBottom: '0px',
        }}
        containerStyle={{
          display: 'inline-block',
          width: '140px',
          verticalAlign: 'top',
          height: '30px',
        }}
        strict={true}
        value={currentField}
        suggestions={fields}
        onChange={onChangeField}
        buildSuggestions={buildSuggestions}
        buildLabel={() => ''}
      />
      <ChromeDropdown
        width={compareInfo.type ? '175' : '325'}
        color={active ? 'blue' : 'purple'}
        value={Constraints[currentConstraint].name}
        options={constraints.map(c => Constraints[c].name)}
        onChange={c => onChangeConstraint(constraintLookup[c], compareTo)}
      />
      {compareValue(
        compareInfo,
        compareTo,
        onChangeCompareTo,
        onKeyDown,
        active,
        parentContentId,
        setFocus
      )}
      <button type="button" className={styles.remove} onClick={onDeleteRow}>
        <Icon name="minus-solid" width={14} height={14} fill="rgba(0,0,0,0.4)" />
      </button>
    </div>
  );
};

export default React.memo(FilterRow);

FilterRow.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentField: PropTypes.string.isRequired,
  constraints: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentConstraint: PropTypes.string.isRequired,
  compareTo: PropTypes.any,
  compareInfo: PropTypes.object,
};
