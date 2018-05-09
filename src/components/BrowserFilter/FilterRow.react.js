/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ChromeDropdown  from 'components/ChromeDropdown/ChromeDropdown.react';
import { Constraints } from 'lib/Filters';
import DateTimeEntry   from 'components/DateTimeEntry/DateTimeEntry.react';
import Icon            from 'components/Icon/Icon.react';
import Parse           from 'parse';
import PropTypes       from 'lib/PropTypes';
import React           from 'react';
import ReactDOM        from 'react-dom';
import styles          from 'components/BrowserFilter/BrowserFilter.scss';
import validateNumeric from 'lib/validateNumeric';

let constraintLookup = {};
for (let c in Constraints) {
  constraintLookup[Constraints[c].name] = c;
}

let setFocus = (input) => {
  if (input !== null) {
    ReactDOM.findDOMNode(input).focus();
  }
}

function compareValue(info, value, onChangeCompareTo, active) {
  switch (info.type) {
    case null:
      return null;
    case 'Object':
    case 'String':
      return <input type='text' value={value} onChange={(e) => onChangeCompareTo(e.target.value)} ref={setFocus}/>;
    case 'Pointer':
      return (
        <input
          type='text'
          value={value.objectId || ''}
          onChange={(e) => {
            let obj = new Parse.Object(info.targetClass);
            obj.id = e.target.value;
            onChangeCompareTo(obj.toPointer());
          }}
          ref={setFocus} />
      );
    case 'Boolean':
      return <ChromeDropdown color={active ? 'blue' : 'purple'} value={value ? 'True' : 'False'} options={['True', 'False']} onChange={(val) => onChangeCompareTo(val === 'True')} />;
    case 'Number':
      return (
        <input
          type='text'
          value={value}
          onChange={(e) => {
            let val = value;
            if (!e.target.value.length || e.target.value === '-') {
              val = e.target.value;
            } else if (validateNumeric(e.target.value)) {
              val = parseFloat(e.target.value);
            }
            onChangeCompareTo(val);
          }} />
      );
    case 'Date':
      return (
        <DateTimeEntry
          fixed={true}
          className={styles.date}
          value={Parse._decode('date', value)}
          onChange={(value) => onChangeCompareTo(Parse._encode(value))}
          ref={setFocus} />
      );
  }
}

let FilterRow = ({
    fields,
    constraints,
    compareInfo,
    currentField,
    currentConstraint,
    compareTo,
    onChangeField,
    onChangeConstraint,
    onChangeCompareTo,
    onDeleteRow,
    active,
  }) => (
  <div className={styles.row}>
    <ChromeDropdown
      color={active ? 'blue' : 'purple'}
      value={currentField}
      options={fields}
      onChange={onChangeField} />
    <ChromeDropdown
      width={compareInfo.type ? 175 : 325}
      color={active ? 'blue' : 'purple'}
      value={Constraints[currentConstraint].name}
      options={constraints.map((c) => Constraints[c].name)}
      onChange={(c) => onChangeConstraint(constraintLookup[c])} />
    {compareValue(compareInfo, compareTo, onChangeCompareTo, active)}
    <a role='button' href='javascript:;' className={styles.remove} onClick={onDeleteRow}><Icon name='minus-solid' width={14} height={14} fill='rgba(0,0,0,0.4)' /></a>
  </div>
);

export default FilterRow;

FilterRow.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentField: PropTypes.string.isRequired,
  constraints: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentConstraint: PropTypes.string.isRequired,
  compareTo: PropTypes.any,
  compareInfo: PropTypes.object
};
