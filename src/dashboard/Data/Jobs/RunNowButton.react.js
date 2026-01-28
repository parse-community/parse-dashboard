/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button from 'components/Button/Button.react';
import React from 'react';
import RunJobDialog from 'dashboard/Data/Jobs/RunJobDialog.react';
import { CurrentApp } from 'context/currentApp';

export default class RunNowButton extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();

    this.state = {
      progress: null,
      result: null,
      showDialog: false,
    };

    this.timeout = null;
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  handleClick() {
    this.setState({ showDialog: true });
  }

  handleCancel = () => {
    this.setState({ showDialog: false });
  };

  handleConfirm = (jobWithParams) => {
    this.setState({ showDialog: false, progress: true });
    this.context.runJob(jobWithParams).then(
      () => {
        this.setState({ progress: false, result: 'success' });
        this.timeout = setTimeout(() => this.setState({ result: null }), 3000);
      },
      () => {
        this.setState({ progress: false, result: 'error' });
        this.timeout = setTimeout(() => this.setState({ result: null }), 3000);
      }
    );
  };

  render() {
    const { job, ...other } = this.props;
    let value = 'Run...';
    if (this.state.result === 'error') {
      value = 'Failed.';
    } else if (this.state.result === 'success') {
      value = 'Success!';
    }
    return (
      <>
        <Button
          progress={this.state.progress}
          onClick={this.handleClick.bind(this)}
          color={this.state.result === 'error' ? 'red' : 'blue'}
          value={value}
          {...other}
        />
        {this.state.showDialog && (
          <RunJobDialog
            job={job}
            onCancel={this.handleCancel}
            onConfirm={this.handleConfirm}
          />
        )}
      </>
    );
  }
}
