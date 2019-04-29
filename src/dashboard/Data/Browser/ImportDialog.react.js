/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React    from 'react';
import ParseApp from 'lib/ParseApp';
import Modal    from 'components/Modal/Modal.react';
import Field    from 'components/Field/Field.react';
import PropTypes from 'lib/PropTypes';
import FileInput from 'components/FileInput/FileInput.react';
import Label    from 'components/Label/Label.react';

export default class ImportDialog extends React.Component {
  constructor() {
      super();
      this.state = {
        file: undefined,
        startedImport: false,
        errorMessage: null
      };
  }

  valid() {
    if (this.state.file != undefined && !this.state.startedImport) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <Modal
        type={Modal.Types.INFO}
        icon='down-outline'
        iconSize={40}
        title='Import data'
        subtitle={'You will receive an e-mail once your data is imported'}
        confirmText='Import'
        cancelText='Cancel'
        disabled={!this.valid()}
        buttonsInCenter={true}
        onCancel={this.props.onCancel}
        onConfirm={() => {
            this.props.onConfirm(this.state.file)
            .then((res) => {
              if (res.error) {
                this.setState({ errorMessage: res.message });
              } else {
                this.props.onCancel();
              }
            });
        }}>

        <Field
            label={
                <Label
                    text='Select a JSON file with your class data' />}
            input={
                <FileInput
                    onChange={(file) => {this.setState({ file: file });}} />}
        />
        {this.state.startedImport ?
          <div style={{ padding: 20 }}>We are importing your data. You will be notified by e-mail once it is completed.</div> : null }
        {this.state.errorMessage ?
          <div style={{ padding: 20, color: '#ff395e' }}>Import Request failed with the following error: "{ this.state.errorMessage }".</div> : null }
      </Modal>

    );
  }
}

ImportDialog.contextTypes = {
  currentApp: PropTypes.instanceOf(ParseApp)
};
