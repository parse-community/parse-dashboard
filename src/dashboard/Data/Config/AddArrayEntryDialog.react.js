/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';

export default class AddArrayEntryDialog extends React.Component {
  constructor() {
    super();
    this.state = { value: '', showWarning: false, parsedValue: null, parsedType: '' };
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  valid() {
    return this.state.value !== '';
  }

  getValue() {
    try {
      return JSON.parse(this.state.value);
    } catch {
      return this.state.value;
    }
  }

  getType(value) {
    if (Array.isArray(value)) {
      return 'array';
    }
    if (value === null) {
      return 'null';
    }
    return typeof value;
  }

  handleConfirm() {
    const parsed = this.getValue();
    const entryType = this.getType(parsed);
    const lastType = this.props.lastType;
    if (lastType && entryType !== lastType && !this.state.showWarning) {
      this.setState({ showWarning: true, parsedValue: parsed, parsedType: entryType });
      return;
    }
    this.props.onConfirm(parsed);
    this.setState({ showWarning: false, parsedValue: null, parsedType: '' });
  }

  render() {
    const addEntryModal = (
      <Modal
        type={Modal.Types.INFO}
        icon="plus-solid"
        title="Add entry"
        confirmText="Add Unique"
        cancelText="Cancel"
        onCancel={this.props.onCancel}
        onConfirm={this.handleConfirm.bind(this)}
        disabled={!this.valid()}
      >
        <Field
          label={
            <Label
              text="Value"
              description="The type is determined based on the entered value. Use quotation marks to enforce string type."
            />
          }
          input={
            <TextInput
              placeholder={'Enter value'}
              ref={this.inputRef}
              value={this.state.value}
              onChange={value => this.setState({ value })}
            />
          }
        />
      </Modal>
    );

    const warningModal = this.state.showWarning ? (
      <Modal
        type={Modal.Types.WARNING}
        icon="warn-outline"
        title="Type Mismatch"
        confirmText="Add"
        cancelText="Cancel"
        onCancel={() => this.setState({ showWarning: false })}
        onConfirm={() => this.handleConfirm()}
      >
        <div>
          The type of the previous item (<strong>{this.props.lastType}</strong>) does not correspond to the type of the entry (<strong>{this.state.parsedType}</strong>). Do you want to proceed?
        </div>
      </Modal>
    ) : null;

    return (
      <>
        {addEntryModal}
        {warningModal}
      </>
    );
  }
}
