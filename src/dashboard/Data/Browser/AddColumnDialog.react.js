/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Dropdown           from 'components/Dropdown/Dropdown.react';
import Field              from 'components/Field/Field.react';
import Label              from 'components/Label/Label.react';
import Modal              from 'components/Modal/Modal.react';
import Option             from 'components/Dropdown/Option.react';
import React              from 'react';
import TextInput          from 'components/TextInput/TextInput.react';
import Toggle             from 'components/Toggle/Toggle.react';
import DateTimeInput      from 'components/DateTimeInput/DateTimeInput.react';
import SegmentSelect      from 'components/SegmentSelect/SegmentSelect.react';
import FileInput          from 'components/FileInput/FileInput.react';
import styles             from 'dashboard/Data/Browser/Browser.scss';
import Parse from 'parse'
import validateNumeric from 'lib/validateNumeric';
import {
  DataTypes,
  SpecialClasses
}                         from 'lib/Constants';

function validColumnName(name) {
  return !!name.match(/^[a-zA-Z0-9][_a-zA-Z0-9]*$/);
}

export default class AddColumnDialog extends React.Component {
  constructor(props) {
    super();
    this.state = {
      type: 'String',
      target: props.classes[0],
      name: '',
      required: false,
      defaultValue: undefined,
      isDefaultValueValid: true
    };
    console.log('props', this)
    this.renderDefaultValueInput = this.renderDefaultValueInput.bind(this)
    this.handleDefaultValueChange = this.handleDefaultValueChange.bind(this)
  }

  valid() {
    if (this.state.name.length === 0) {
      return false;
    }
    if (!validColumnName(this.state.name)) {
      return false;
    }
    if (this.props.currentColumns.indexOf(this.state.name) > -1) {
      return false;
    }
    return true;
  }

  renderClassDropdown() {
    return (
      <Dropdown
        value={this.state.target}
        onChange={(target) => this.setState({ target: target })}>
        {this.props.classes.map((c) => <Option key={c} value={c}>{SpecialClasses[c] || c}</Option>)}
      </Dropdown>
    );
  }

  async handleDefaultValueChange(defaultValue) {
    const { type, target } = this.state
    let formattedValue = undefined
    let isDefaultValueValid = true

    try {
      switch (type) {
        case 'Number':
          if (!validateNumeric(defaultValue)) throw 'Invalid number'
          formattedValue = defaultValue
          break
        case 'Array':
        case 'Object':
          formattedValue = JSON.parse(defaultValue)
          break
        case 'Date':
          formattedValue = new Date(defaultValue)
          break
        case 'Polygon':
          formattedValue = new Parse.Polygon(defaultValue)
          break
        case 'GeoPoint':
          formattedValue = new Parse.GeoPoint(defaultValue)
          break;
        case 'Pointer':
          const targetClass = new Parse.Object.extend(target)
          const query = new Parse.Query(targetClass)
          const result = await query.get(defaultValue)
          formattedValue = result.toPointer()
          break
        case 'Boolean':
          formattedValue = (defaultValue === 'True' ? true : (defaultValue === 'False' ? false : undefined))
          break
        default:
          formattedValue = defaultValue
      }
    } catch(e) {
      isDefaultValueValid = false
    }
    return await this.setState({ defaultValue: formattedValue, isDefaultValueValid })
  }

  renderDefaultValueInput() {
    const { type } = this.state
    switch (type) {
      case 'Array':
      case 'Object':
      case 'Polygon':
      case 'GeoPoint':
          return <TextInput placeholder='Set here a default value' multiline={true} onChange={async (defaultValue) => await this.handleDefaultValueChange(defaultValue)} />
      case 'Number':
      case 'String':
      case 'Pointer':
        return <TextInput placeholder='Set here a default value' onChange={async (defaultValue) => await this.handleDefaultValueChange(defaultValue)} />
      case 'Date':
        return <DateTimeInput onChange={async (defaultValue) => await this.handleDefaultValueChange(defaultValue)} />
      case 'Boolean':
        return <SegmentSelect
        values={['False', 'None', 'True']}
        current={(this.state.defaultValue ? 'True' : (this.state.defaultValue === false ? 'False' : 'None'))}
        onChange={async (defaultValue) => await this.handleDefaultValueChange(defaultValue)} />
    }
  }


  render() {
    let typeDropdown = (
      <Dropdown
        value={this.state.type}
        onChange={(type) => this.setState({ type: type })}>
        {DataTypes.map((t) => <Option key={t} value={t}>{t}</Option>)}
      </Dropdown>
    );
    return (
      <Modal
        type={Modal.Types.INFO}
        icon='ellipses'
        iconSize={30}
        title='Add a new column'
        subtitle='Store another type of data in this class.'
        disabled={!this.valid() || !this.state.isDefaultValueValid}
        confirmText='Add column'
        cancelText={'Never mind, don\u2019t.'}
        onCancel={this.props.onCancel}
        onConfirm={() => {
          console.log(this.state)
          this.props.onConfirm(this.state);
        }}>
        <Field
          label={
            <Label
              text='What type of data do you want to store?' />
          }
          input={typeDropdown} />
        {this.state.type === 'Pointer' || this.state.type === 'Relation' ?
          <Field
            label={<Label text='Target class' />}
            input={this.renderClassDropdown()} /> : null}
        <Field
          label={<Label text='What should we call it?' description={'Don\u2019t use any special characters, and start your name with a letter.'} />}
          input={<TextInput placeholder='Give it a good name...' value={this.state.name} onChange={(name) => this.setState({ name })} />}/>
        {
          this.state.type !== 'Relation' ?
            <>
              <Field
                label={<Label text='What is the default value?' description='If no value is specified for this column, it will be filled with its default value' />}
                input={this.renderDefaultValueInput()}
                className={styles.addColumnToggleWrapper} />
              <Field
                label={<Label text='Is it a required field?' description={'When true this field must be filled when a new object is created'} />}
                input={<Toggle value={this.state.required} type={Toggle.Types.YES_NO} onChange={(required) => this.setState({ required })}  additionalStyles={{ margin: '0px' }}/>}
                className={styles.addColumnToggleWrapper} />
            </>
            : null
        }
      </Modal>
    );
  }
}