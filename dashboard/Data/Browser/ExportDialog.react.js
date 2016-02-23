/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Modal    from 'components/Modal/Modal.react';
import ParseApp from 'lib/ParseApp';
import React    from 'react';

export default class ExportDialog extends React.Component {
  constructor() {
    super();
    this.state = {
      progress: undefined
    };
  }

  componentWillMount() {
    this.context.currentApp.getExportProgress().then((progress) => {
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

  render() {
    let inProgress = this.inProgress();
    return (
      <Modal
        type={Modal.Types.INFO}
        icon='down-outline'
        iconSize={40}
        title='Export this class'
        subtitle={`We'll send you an email when your data is ready.`}
        confirmText='Export'
        cancelText='Cancel'
        disabled={this.state.progress === undefined || inProgress}
        buttonsInCenter={true}
        onCancel={this.props.onCancel}
        onConfirm={this.props.onConfirm}>
        {inProgress ?
          <div style={{ padding: 20 }}>You are currently exporting this class. We'll send you an email when that data is available for you to download.</div> : null}
      </Modal>
    );
  }
}

ExportDialog.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
