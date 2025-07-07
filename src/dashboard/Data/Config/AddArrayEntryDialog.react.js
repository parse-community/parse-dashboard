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
        confirmText="Add"
        cancelText="Cancel"
        onCancel={this.props.onCancel}
        onConfirm={() => this.props.onConfirm(this.getValue())}
        disabled={!this.valid()}
      >
        <Field
          label={<Label text="Value" />}
          input={<TextInput autofocus={true} value={this.state.value} onChange={value => this.setState({ value })} />}
        />
      </Modal>
    );
  }
}
