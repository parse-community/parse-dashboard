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
    this.state = { value: '' };
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

  render() {
    return (
      <Modal
        type={Modal.Types.INFO}
        icon="plus-solid"
        title="Add entry"
        confirmText="Add Unique"
        cancelText="Cancel"
        onCancel={this.props.onCancel}
        onConfirm={() => this.props.onConfirm(this.getValue())}
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
  }
}
