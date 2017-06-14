/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ParseApp from 'lib/ParseApp';
import React    from 'react';

export default class JobsData extends React.Component {
  constructor() {
    super();

    this.state = {
      jobs: undefined,
      inUse: undefined,
      release: undefined
    };
  }

  // As parse-server doesn't support (yet?) these features, we are disabling
  // these calls in the meantime.

  /*
  fetchRelease(app) {
    app.getLatestRelease().then(
      ({ release }) => this.setState({ release }),
      () => this.setState({ release: null })
    );
  }
  */
  fetchJobs(app) {
    app.getAvailableJobs().then(
      ({ jobs, in_use }) => {
        let available = [];
        for (let i = 0; i < jobs.length; i++) {
          if (in_use.indexOf(jobs[i]) < 0) {
            available.push(jobs[i]);
          }
        }
        this.setState({ jobs: available, inUse: in_use })
      }, () => this.setState({ jobs: [], inUse: [] })
    );
  }

  componentDidMount() {
    this.fetchJobs(this.context.currentApp);
    // this.fetchRelease(this.context.currentApp);
  }

  componentWillReceiveProps(props, context) {
    if (this.context !== context) {
      this.fetchJobs(context.currentApp);
      // this.fetchRelease(context.currentApp);
    }
  }

  render() {
    let child = React.Children.only(this.props.children);
    return React.cloneElement(
      child,
      {
        ...child.props,
        availableJobs: this.state.jobs,
        jobsInUse: this.state.inUse,
        release: this.state.release
      }
    );
  }
}

JobsData.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
