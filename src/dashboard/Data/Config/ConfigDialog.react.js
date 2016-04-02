/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimeInput   from 'components/DateTimeInput/DateTimeInput.react';
import Dropdown        from 'components/Dropdown/Dropdown.react';
import Field           from 'components/Field/Field.react';
import FileInput       from 'components/FileInput/FileInput.react';
import GeoPointInput   from 'components/GeoPointInput/GeoPointInput.react';
import Label           from 'components/Label/Label.react';
import Modal           from 'components/Modal/Modal.react';
import Option          from 'components/Dropdown/Option.react';
import Parse           from 'parse';
import React           from 'react';
import TextInput       from 'components/TextInput/TextInput.react';
import Toggle          from 'components/Toggle/Toggle.react';
import validateNumeric from 'lib/validateNumeric';

const PARAM_TYPES = [
  'Boolean',
  'String',
  'Number',
  'Date',
  'Object',
  'Array',
  'GeoPoint',
  'File'
];

function numberValidator(onChange) {
  return function(next) {
    if (validateNumeric(next)) {
      onChange(next);
    }
  }
}

function saveFile(onChange, file) {
  let value = new Parse.File(file.name, file);
  value.save().then(() => onChange(value));
}

const EDITORS = {
  Boolean: (value, onChange) => (
    <Toggle
      type={Toggle.Types.TRUE_FALSE}
      value={!!value}
      onChange={onChange} />
  ),
  String: (value, onChange) => (
    <TextInput
      multiline={true}
      value={value || ''}
      onChange={onChange} />
  ),
  Number: (value, onChange) => (
    <TextInput
      value={value || ''}
      onChange={numberValidator(onChange)} />
  ),
  Date: (value, onChange) => (
    <DateTimeInput
      fixed={true}
      value={value}
      onChange={onChange} />
  ),
  Object: (value, onChange) => (
    <TextInput
      multiline={true}
      monospace={true}
      placeholder={'{\n  ...\n}'}
      value={value || ''}
      onChange={onChange} />
  ),
  Array: (value, onChange) => (
    <TextInput
      multiline={true}
      monospace={true}
      placeholder={'[\n  ...\n]'}
      value={value}
      onChange={onChange} />
  ),
  GeoPoint: (value, onChange) => (
    <GeoPointInput value={value} onChange={onChange} />
  ),
  File: (value, onChange) => (
    <FileInput value={value ? { name: value.name(), url: value.url() } : null} onChange={saveFile.bind(null, onChange)} />
  )
};

const GET_VALUE = {
  Boolean: (value) => !!value,
  String: (value) => value,
  Number: (value) => parseFloat(value),
  Date: (value) => value,
  Object: (value) => JSON.parse(value),
  Array: (value) => JSON.parse(value),
  GeoPoint: (value) => new Parse.GeoPoint({latitude: value.latitude, longitude: value.longitude}),
  File: (value) => value
};

export default class ConfigDialog extends React.Component {
  constructor(props) {
    super();
    this.state = {
      value: null,
      type: 'String',
      name: ''
    };
    if (props.param.length > 0) {
      this.state = {
        name: props.param,
        type: props.type,
        value: props.value,
      };
    }
  }

  valid() {
    if (!this.state.name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      return false;
    }
    switch (this.state.type) {
      case 'String':
        return !!this.state.value;
      case 'Number':
        return !isNaN(parseFloat(this.state.value));
      case 'Date':
        return !isNaN(new Date(this.state.value));
      case 'Object':
        try {
          let obj = JSON.parse(this.state.value);
          if (obj && typeof obj === 'object') {
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      case 'Array':
        try {
          let obj = JSON.parse(this.state.value);
          if (obj && Array.isArray(obj)) {
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      case 'GeoPoint':
        let val = this.state.value;
        if (!val || typeof val !== 'object') {
          return false;
        }
        if (isNaN(parseFloat(val.latitude)) || isNaN(parseFloat(val.longitude))) {
          return false;
        }
        if (parseFloat(val.latitude) > 90.0 || parseFloat(val.latitude) < -90.0 || parseFloat(val.longitude) > 180.0 || parseFloat(val.longitude) < -180.0) {
        	return false;
        }
        return true;
      case 'File':
        let fileVal = this.state.value;
        if (fileVal && fileVal.url()) {
          return true;
        }
        return false;
    }
    return true;
  }

  submit() {
    this.props.onConfirm({
      name: this.state.name,
      value: GET_VALUE[this.state.type](this.state.value),
    });
  }

  render() {
    let newParam = !this.props.param;
    let typeDropdown = (
      <Dropdown
        fixed={true}
        value={this.state.type}
        disabled={this.props.param.length > 0}
        onChange={(type) => this.setState({ type: type, value: null })}>
        {PARAM_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
      </Dropdown>
    );
    return (
      <Modal
        type={Modal.Types.INFO}
        title={newParam ? 'New parameter' : 'Edit parameter'}
        icon='gear-solid'
        iconSize={30}
        subtitle={'Dynamically configure parts of your app'}
        disabled={!this.valid()}
        confirmText={newParam ? 'Create parameter' : 'Save parameter'}
        cancelText={'Cancel'}
        onCancel={this.props.onCancel}
        onConfirm={this.submit.bind(this)}>
        <Field
          label={
            <Label
              text='Parameter Name'
              description='A unique identifier for this value' />
          }
          input={
            <TextInput
              placeholder={'New parameter'}
              value={this.state.name}
              disabled={this.props.param.length > 0}
              onChange={(name) => this.setState({ name })} />
          } />
        <Field
          label={
            <Label
              text='Type' />
          }
          input={typeDropdown} />
        <Field
          label={
            <Label
              text='Value'
              description='Use this to configure your app. You can change it at any time.' />
          }
          input={EDITORS[this.state.type](this.state.value, (value) => { this.setState({ value }) })} />
      </Modal>
    );
  }
}
