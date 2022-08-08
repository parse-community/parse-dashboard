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

export default class CloneSelectedRowsDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      confirmation: ''
    };
  }

  valid() {
    if (this.state.confirmation === this.props.className) {
      return true;
    }
    if (!this.props.selection['*'] && Object.keys(this.props.selection).length < 10) {
      return true;
    }
    return false;
  }

  render() {
    let content = null;
    let selectionLength = Object.keys(this.props.selection).length;
    if (this.props.selection['*'] || selectionLength >= 10) {
      content = (
        <Field
          label={
            <Label
              text='Confirm this action'
              description='Enter the current class name to continue.' />
          }
          input={
            <TextInput
              placeholder='Current class name'
              value={this.state.confirmation}
              onChange={(confirmation) => this.setState({ confirmation })} />
          } />
      );
    }
    return (
      <Modal
        type={Modal.Types.DANGER}
        icon='warn-outline'
        title={this.props.selection['*'] ? 'Clone all rows?' : (selectionLength === 1 ? 'Clone this row?' : `Clone ${selectionLength} rows?`)}
        subtitle={''}
        disabled={!this.valid()}
        confirmText='Clone'
        cancelText='Cancel'
        onCancel={this.props.onCancel}
        onConfirm={this.props.onConfirm}>
        {content}
      </Modal>
    );
  }
}
