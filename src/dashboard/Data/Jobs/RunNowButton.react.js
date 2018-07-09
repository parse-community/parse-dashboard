/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button   from 'components/Button/Button.react';
import ParseApp from 'lib/ParseApp';
import React    from 'react';

export default class RunNowButton extends React.Component {
  constructor() {
    super();

    this.state = {
      progress: null,
      result: null,
      error: null
    };

    this.timeout = null;
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  handleClick() {
    this.setState({ progress: true });
    this.context.currentApp.runJob(this.props.job).then(() => {
      this.setState({ progress: false, result: 'success' });
      this.timeout = setTimeout(() => this.setState({ result: null }), 3000);
    }, err => {
      // Verify error message, used to control collaborators permissions
      if(err && err.message)
        this.setState({ progress: false, result: 'error', error: err });
      else
        this.setState({ progress: false, result: 'error', error: null });
      this.timeout = setTimeout(() => this.setState({ result: null, error: null }), 3000);
    });
  }

  render() {
    let { ...other } = this.props;
    let value = 'Run now';
    if (this.state.result === 'error') {
      // Verify error message, used to control collaborators permissions
      if (this.state.error && this.state.error.code === 403) {
        value = 'Permission denied'
        other.width = '150px'
      }
      else
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

RunNowButton.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp),
};
