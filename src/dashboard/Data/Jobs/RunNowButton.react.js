/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button         from 'components/Button/Button.react';
import React          from 'react';
import { CurrentApp } from 'context/currentApp';

export default class RunNowButton extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();

    this.state = {
      progress: null,
      result: null
    };

    this.timeout = null;
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  handleClick() {
    this.setState({ progress: true });
    this.context.runJob(this.props.job).then(() => {
      this.setState({ progress: false, result: 'success' });
      this.timeout = setTimeout(() => this.setState({ result: null }), 3000);
    }, () => {
      this.setState({ progress: false, result: 'error' });
      this.timeout = setTimeout(() => this.setState({ result: null }), 3000);
    });
  }

  render() {
    let { ...other } = this.props;
    let value = 'Run now';
    if (this.state.result === 'error') {
      value = 'Failed.';
    } else if (this.state.result === 'success') {
      value = 'Success!';
    }
    return (
      <Button
        progress={this.state.progress}
        onClick={this.handleClick.bind(this)}
        color={this.state.result === 'error' ? 'red' : 'blue'}
        value={value}
        {...other} />
    );
  }
}
