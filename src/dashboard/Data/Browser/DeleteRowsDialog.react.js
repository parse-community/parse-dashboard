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

export default class DeleteRowsDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      confirmation: ''
    };
  }

  valid() {
    const selectionLength = Object.keys(this.props.selection).length;

    if (this.props.selection['*'] && this.state.confirmation.toLowerCase() === 'delete all') {
      return true;
    }
    if (selectionLength >= 10 && this.state.confirmation.toLowerCase() === 'delete selected') {
      return true;
    }
    if (!this.props.selection['*'] && selectionLength < 10) {
      return true;
    }
    return false;
  }

  render() {
    let content = null;
    let selectionLength = Object.keys(this.props.selection).length;

    if (selectionLength >= 10) {
      content = (
        <Field
          label={
            <Label
              text='Confirm this action'
              description='Enter "delete selected" word to continue.' />
          }
          input={
            <TextInput
              placeholder='delete selected'
              value={this.state.confirmation}
              onChange={(confirmation) => this.setState({ confirmation })} />
          } />
      );
    }

    if (this.props.selection['*']) {
      content = (
        <Field
          label={
            <Label
              text='Confirm this action'
              description='Enter "delete all" to continue.' />
          }
          input={
            <TextInput
              placeholder='delete all'
              value={this.state.confirmation}
              onChange={(confirmation) => this.setState({ confirmation })} />
          } />
      );
    }
    const deleteText = this.props.relation ? 'Detach' : 'Delete';
    return (
      <Modal
        type={Modal.Types.DANGER}
        icon='warn-outline'
        title={this.props.selection['*'] ? `${deleteText} all rows?` : (selectionLength === 1 ? `${deleteText} this row?` : `${deleteText} ${selectionLength} rows?`)}
        subtitle={this.props.relation ? 'You need to delete origin record. This is a reference.' : 'This action cannot be undone!'}
        disabled={!this.valid()}
        confirmText='Delete'
        cancelText='Cancel'
        onCancel={this.props.onCancel}
        onConfirm={this.props.onConfirm}>
        {content}
      </Modal>
    );
  }
}
