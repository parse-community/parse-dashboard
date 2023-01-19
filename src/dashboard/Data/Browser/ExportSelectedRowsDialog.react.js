/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Modal     from 'components/Modal/Modal.react';
import React     from 'react';
import Dropdown    from 'components/Dropdown/Dropdown.react';
import Field       from 'components/Field/Field.react';
import Label       from 'components/Label/Label.react';
import Option      from 'components/Dropdown/Option.react';

export default class ExportSelectedRowsDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      confirmation: '',
      exportType: '.csv'
    };
  }

  valid() {
    return true;
  }

  render() {
    let selectionLength = Object.keys(this.props.selection).length;
    return (
      <Modal
        type={Modal.Types.INFO}
        icon='warn-outline'
        title={this.props.selection['*'] ? 'Export all rows?' : (selectionLength === 1 ? 'Export 1 selected row?' : `Export ${selectionLength} selected rows?`)}
        subtitle={this.props.selection['*'] ? 'Note: This will export mutliple files with maximum 1gb each. This might take a while.' : ''}
        disabled={!this.valid()}
        confirmText='Export'
        cancelText='Cancel'
        onCancel={this.props.onCancel}
        onConfirm={() => this.props.onConfirm(this.state.exportType)}>
        <Field
          label={<Label text='Select export type' />}
          input={
            <Dropdown
              value={this.state.exportType}
              onChange={(exportType) => this.setState({ exportType })}>
                <Option value='.csv'>.csv</Option>
                <Option value='.json'>.json</Option>
            </Dropdown>
          } />
      </Modal>
    );
  }
}
