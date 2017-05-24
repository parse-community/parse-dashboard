/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Constraints } from 'lib/Filters';
import DateTimeEntry   from 'components/DateTimeEntry/DateTimeEntry.react';
import Dropdown        from 'components/Dropdown/Dropdown.react';
import Field           from 'components/Field/Field.react';
import Label           from 'components/Label/Label.react';
import { List }        from 'immutable';
import Option          from 'components/Dropdown/Option.react';
import Parse           from 'parse';
import React           from 'react';
import ReactDOM        from 'react-dom';
import styles          from 'components/PushAudienceDialog/InstallationCondition.scss';
import TextInput       from 'components/TextInput/TextInput.react';
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

function compareValue(info, value, onChangeCompareTo) {
  let type = info.type;
  switch (type) {
    case null:
      return <div className={styles.empty}>-</div>;
    case 'String':
      return <TextInput placeholder='value' value={value} onChange={(_value) => onChangeCompareTo(_value)} ref={setFocus}/>;
    case 'Pointer':
      return <TextInput
        placeholder='value'
        value={value.objectId || ''}
        onChange={(_value) => {
          let obj = new Parse.Object(info.targetClass);
          obj.id = _value;
          onChangeCompareTo(Parse._encode(obj.toPointer()));
        }}
        ref={setFocus} />
    case 'Boolean':
      return <Dropdown value={value ? 'True' : 'False'} options={['True', 'False']} onChange={(_value) => onChangeCompareTo(_value === 'True')} />;
    case 'Number':
      return <TextInput placeholder='value' className={styles.conditionValue} value={value} onChange={(_value) => onChangeCompareTo(validateNumeric(_value) ? Number(_value) : Number(value))} ref={setFocus}/>;
    case 'Date':
      return <DateTimeEntry
        fixed={true}
        className={styles.date}
        value={Parse._decode('date', value)}
        onChange={(_value) => onChangeCompareTo(Parse._encode(_value))}
        ref={setFocus} />
  }
}

export default class InstallationCondition extends React.Component {
  constructor() {
    super()
    this.state = {
      open: false,
      filters: new List(),
    };
  }

  handleChange(type, selection) {
    let stateChange = {};
    stateChange[type] = selection;
    this.setState(stateChange);
  }

  render() {
    let input = (
      <div>
        <div className={styles.conditionInput}>
          <Dropdown
            fixed={true}
            hideArrow={true}
            value={this.props.currentField}
            onChange={this.props.onChangeField}
            placeHolder='field'
            className={styles.conditionDropdown}>
            {this.props.fields.map(function(object, i){
              return <Option value={object} key={`fieldOpt${i}`}>{object}</Option>;
            })}
          </Dropdown>
        </div>
        <div className={styles.conditionInput}>
          <Dropdown
            fixed={true}
            hideArrow={true}
            value={Constraints[this.props.currentConstraint].name}
            onChange={(c) => this.props.onChangeConstraint(constraintLookup[c])}
            placeHolder='is'
            className={styles.conditionDropdown}>
            {this.props.constraints.map(function(object, i){
              return <Option value={Constraints[object].name} key={`constraintOpt${i}`}>{Constraints[object].name}</Option>;
            })}
          </Dropdown>
        </div>
        <div className={[styles.conditionInput, styles.valueInput].join(' ')}>
          {compareValue(this.props.compareInfo, this.props.compareTo, this.props.onChangeCompareTo)}
        </div>
      </div>
    );

    //TODO Shoulse use <Button> and have a link type style without border.
    let labelDescription = (
      <a
        href='javascript:;'
        role='button'
        className={styles.description}
        onClick={this.props.onDeleteRow}>
        Remove
      </a>
    );

    return (
      <Field
        labelWidth={30}
        label={<Label text='Installation Condition' description={labelDescription} />}
        input={input} />
    );
  }
}
