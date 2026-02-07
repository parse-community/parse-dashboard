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
import TextInput from 'components/TextInput/TextInput.react';
import React from 'react';

export default class RunJobDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: '',
    };
  }

  isValidJSON() {
    if (this.state.params === '') {
      return true;
    }
    try {
      JSON.parse(this.state.params);
      return true;
    } catch {
      return false;
    }
  }

  handleConfirm = () => {
    const { job, onConfirm } = this.props;
    const params = this.state.params || '{}';
    onConfirm({ ...job, params });
  };

  render() {
    const { job, onCancel } = this.props;
    const isValid = this.isValidJSON();

    return (
      <Modal
        type={Modal.Types.INFO}
        icon="cloud-happy"
        iconSize={40}
        title={`Run ${job.jobName}`}
        subtitle="Optionally specify parameters to pass to the job"
        confirmText="Run"
        cancelText="Cancel"
        disabled={!isValid}
        onCancel={onCancel}
        onConfirm={this.handleConfirm}
      >
        <Field
          label={
            <Label
              text="Parameters"
              description="Optional JSON object to pass to the job"
            />
          }
          input={
            <div style={{ width: '100%' }}>
              <TextInput
                monospace={true}
                multiline={true}
                placeholder={'{\n  \u2026\n}'}
                value={this.state.params}
                onChange={params => this.setState({ params })}
              />
              {!isValid && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    width: '100%',
                    padding: '8px 10px',
                    marginTop: 8,
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: 4,
                  }}
                >
                  <span style={{ color: '#856404', fontSize: 14 }}>⚠</span>
                  <span style={{ color: '#856404', fontSize: 12, fontWeight: 500 }}>
                    Invalid JSON
                  </span>
                </div>
              )}
            </div>
          }
        />
      </Modal>
    );
  }
}
