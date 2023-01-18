/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Modal          from 'components/Modal/Modal.react';
import FileEditor     from 'components/FileEditor/FileEditor.react';
import React          from 'react';
import Pill from 'components/Pill/Pill.react';
import getFileName from 'lib/getFileName';
import { CurrentApp } from 'context/currentApp';

export default class ImportDialog extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();
    this.state = {
      progress: undefined,
      file: null,
      showFileEditor: false
    };
  }

  componentWillMount() {
    this.context.getExportProgress().then((progress) => {
      this.setState({ progress });
    });
  }

  inProgress() {
    if (this.state.progress === undefined) {
      return false;
    }
    let found = false;
    if (Array.isArray(this.state.progress)) {
      this.state.progress.forEach((obj) => {
        if (obj.id === this.props.className) {
          found = true;
        }
      });
    }
    return found;
  }

  openFileEditor() {
    this.setState({
      showFileEditor: true
    });
  }

  hideFileEditor(file) {
    this.setState({
      showFileEditor: false,
      file
    });
  }

  render() {
    let inProgress = this.inProgress();
    return (
      <div>
      <Modal
        type={Modal.Types.INFO}
        icon='up-outline'
        iconSize={40}
        title={`Import Data into ${this.props.className}`}
        subtitle='Note: If rows have a className, they will be imported into that class.'
        confirmText='Import'
        cancelText='Cancel'
        disabled={!this.state.file}
        buttonsInCenter={true}
        onCancel={this.props.onCancel}
        onConfirm={this.props.onConfirm}>
          <div style={{ padding: '25px' }}>
              {this.state.file && <Pill value={getFileName(this.state.file) }/>}
              <div style={{ cursor: 'pointer' }}>
                <Pill
                  value={this.state.file ? 'Change file' : 'Select file'}
                  onClick={() => this.openFileEditor()}
                />
                {this.state.showFileEditor && (
                  <FileEditor
                    value={this.state.file}
                    accept='.json,.csv'
                    onCommit={(file) => this.hideFileEditor(file)}
                    onCancel={() => this.hideFileEditor()}
                  />
                )}
              </div>
            </div>
      </Modal>
        </div>
    );
  }
}
