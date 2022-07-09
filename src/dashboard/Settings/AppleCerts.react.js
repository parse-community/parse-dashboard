/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Modal          from 'components/Modal/Modal.react';
import PushCerts      from 'components/PushCerts/PushCerts.react';
import React          from 'react';
import { CurrentApp } from 'context/currentApp';

export default class AppleCerts extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();

    this.state = {
      certs: undefined,
      deletePending: null,
      error: null
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.context.getAppleCerts().then((certs) => {
      if (this.mounted) {
        this.setState({ certs });
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleUpload(file) {
    this.context.uploadAppleCert(file).then((cert) => {
      this.state.certs.unshift(cert);
      this.setState({ uploadPending: false });
    }, (err) => {
      this.setState({ uploadPending: false, error: err.error });
    });
    this.setState({ uploadPending: true, error: null });
  }

  handleDelete(id) {
    this.setState({ deletePending: id, error: null });
  }

  render() {
    return (
      <div>
        <PushCerts
          certs={this.state.certs}
          error={this.state.error}
          uploadPending={this.state.uploadPending}
          onUpload={this.handleUpload.bind(this)}
          onDelete={this.handleDelete.bind(this)} />
        {this.state.deletePending === null ? null :
          <Modal
            type={Modal.Types.DANGER}
            title='Delete this certificate?'
            subtitle='Notifications will no longer be sent to the associated app.'
            cancelText='Cancel'
            confirmText='Delete'
            onCancel={() => this.setState({ deletePending: null })}
            onConfirm={() => {
              let id = this.state.deletePending;
              this.context.deleteAppleCert(id).then(() => {
                for (let i = 0; i < this.state.certs.length; i++) {
                  if (this.state.certs[i].id === id) {
                    this.state.certs.splice(i, 1);
                    return this.setState({ deletePending: null });
                  }
                }
              }, (err) => {
                this.setState({ deletePending: null, error: err.error });
              })
            }}/>}
      </div>
    );
  }
}
