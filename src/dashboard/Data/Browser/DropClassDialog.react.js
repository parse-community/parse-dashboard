/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Field     from 'components/Field/Field.react';
import Label     from 'components/Label/Label.react';
import Modal     from 'components/Modal/Modal.react';
import React     from 'react';
import TextInput from 'components/TextInput/TextInput.react';

export default class DropClassDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      confirmation: ''
    };
  }

  valid() {
    if (this.state.confirmation === this.props.className || this.state.confirmation === this.props.className.substr(1)) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <Modal
        type={Modal.Types.DANGER}
        icon='warn-outline'
        title='Delete this class?'
        subtitle='This action cannot be undone!'
        disabled={!this.valid()}
        confirmText='Delete'
        cancelText='Cancel'
        onCancel={this.props.onCancel}
        onConfirm={this.props.onConfirm}>
        <Field
          label={
            <Label
              text='Confirm this action'
              description='Enter the current class name to continue' />
          }
          input={
            <TextInput
              placeholder='Current class name'
              value={this.state.confirmation}
              onChange={(confirmation) => this.setState({ confirmation })} />
          } />
      </Modal>
    );
  }
}
