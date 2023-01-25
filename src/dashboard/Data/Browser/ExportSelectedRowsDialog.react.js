/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Modal       from 'components/Modal/Modal.react';
import React       from 'react';
import Dropdown    from 'components/Dropdown/Dropdown.react';
import Field       from 'components/Field/Field.react';
import Label       from 'components/Label/Label.react';
import Option      from 'components/Dropdown/Option.react';
import Toggle      from 'components/Toggle/Toggle.react';
import TextInput   from 'components/TextInput/TextInput.react';
import styles      from 'dashboard/Data/Browser/ExportSelectedRowsDialog.scss';

export default class ExportSelectedRowsDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      confirmation: '',
      exportType: '.csv',
      indentation: true,
    };
  }

  valid() {
    if (!this.props.selection['*']) {
      return true;
    }
    if (this.state.confirmation !== 'export all') {
      return false;
    }
    return true;
  }

  formatBytes(bytes) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const decimals = 2
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}


  render() {
    let selectionLength = Object.keys(this.props.selection).length;
    const fileSize = new TextEncoder().encode(JSON.stringify(this.props.data, null, this.state.exportType === '.json' && this.state.indentation ? 2 : null)).length / this.props.data.length
    return (
      <Modal
        type={Modal.Types.INFO}
        icon='warn-outline'
        title={this.props.selection['*'] ? 'Export all rows?' : (selectionLength === 1 ? 'Export 1 selected row?' : `Export ${selectionLength} selected rows?`)}
        disabled={!this.valid()}
        confirmText='Export'
        cancelText='Cancel'
        onCancel={this.props.onCancel}
        onConfirm={() => this.props.onConfirm(this.state.exportType, this.state.indentation)}>
        {this.props.selection['*'] && <div className={styles.row} >
          <Label text="Do you really want to export all rows?" description={<span className={styles.label}>Estimated row count: {this.props.count}<br/>Estimated export size: {this.formatBytes(fileSize * this.props.count)}<br/><br/>⚠️ Exporting all rows may severely impact server or database resources.<br/>Large datasets are exported as multiple files of up to 1 GB each.</span>}/>
        </div>
        }
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
        {this.state.exportType === '.json' && <Field
          label={<Label text='Indentation' />}
          input={<Toggle value={this.state.indentation} type={Toggle.Types.YES_NO} onChange={(indentation) => {this.setState({indentation})}} />} />
          }
        {this.props.selection['*'] && <Field
          label={
            <Label
              text='Confirm this action'
              description='Enter "export all" to continue.' />
          }
          input={
            <TextInput
              placeholder='export all'
              value={this.state.confirmation}
              onChange={(confirmation) => this.setState({ confirmation })} />
          } />
        }
      </Modal>
    );
  }
}
