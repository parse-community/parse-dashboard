/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { ActionTypes } from 'lib/stores/JobsStore';
import JobsForm        from 'dashboard/Data/Jobs/JobsForm.react';
import React           from 'react';
import subscribeTo     from 'lib/subscribeTo';
import generatePath    from 'lib/generatePath';
import { CurrentApp }  from 'context/currentApp';
import { withRouter } from 'lib/withRouter';

@subscribeTo('Jobs', 'jobs')
@withRouter
class JobEdit extends React.Component {
  static contextType = CurrentApp;

  submitForm(changes) {
    let schedule = {
      job_schedule: {
        params: changes.parameter || '{}',
        daysOfWeek: [1, 1, 1, 1, 1, 1, 1]
      }
    };
    if (changes.description) {
      schedule.job_schedule.description = changes.description;
    }
    if (changes.job) {
      schedule.job_schedule.jobName = changes.job;
    }
    if (!changes.immediate && changes.runAt) {
      schedule.job_schedule.startAfter = changes.runAt.toISOString();
    }
    if (changes.repeat) {
      let hour = changes.repeatStartHour;
      if (hour.length < 2) {
        hour = '0' + hour;
      }
      schedule.job_schedule.timeOfDay = `${hour}:${changes.repeatStartMinute}:00.000Z`;
      let interval = 0;
      if (changes.repeatType === 'daily') {
        interval = 1440;
      } else {
        interval = changes.intervalCount * (changes.intervalUnit === 'hour' ? 60 : 1);
      }
      schedule.job_schedule.repeatMinutes = interval;
    }

    let promise = this.props.params.jobId ?
      this.props.jobs.dispatch(ActionTypes.EDIT, { jobId: this.props.params.jobId, updates: schedule }) :
      this.props.jobs.dispatch(ActionTypes.CREATE, { schedule });
    promise.then(() => {this.props.navigate(generatePath(this.context, 'jobs/scheduled'))});
    return promise;
  }

  componentWillMount() {
    this.props.jobs.dispatch(ActionTypes.FETCH);
  }

  render() {
    if (this.props.params.jobId) {
      if (this.props.jobs.data.get('jobs') && this.props.jobs.data.get('jobs').size) {
        let data = this.props.jobs.data.get('jobs').filter((obj) => obj.objectId === this.props.params.jobId).first();
        if (data) {
          let initialFields = {
            description: data.description,
            job: data.jobName,
            parameter: data.params
          };
          if (data.repeatMinutes) {
            initialFields.repeat = true;
            if (data.repeatMinutes === 1440) {
              initialFields.repeatType = 'daily';
            } else {
              initialFields.repeatType = 'on an interval';
              if (data.repeatMinutes > 60) {
                initialFields.intervalCount = (data.repeatMinutes / 60) | 0;
                initialFields.intervalUnit = 'hour';
              } else {
                initialFields.intervalCount = data.repeatMinutes;
                initialFields.intervalUnit = 'minute';
              }
            }
          }
          if (data.startAfter) {
            initialFields.runAt = new Date(data.startAfter);
          }
          if (data.timeOfDay) {
            let split = data.timeOfDay.split(':');
            initialFields.repeatStartHour = split[0] || '12';
            if (split[0][0] === '0') {
              initialFields.repeatStartHour = split[0].substr(1);
            }
            initialFields.repeatStartMinute = split[1] || '00';
          } else {
            initialFields.repeatStartHour = '12';
            initialFields.repeatStartMinute = '00';
          }
          return (
            <JobsForm
              {...this.props}
              submitForm={this.submitForm.bind(this)}
              initialFields={initialFields} />
          );
        }
      }
      return null;
    }
    return (
      <JobsForm
        {...this.props}
        submitForm={this.submitForm.bind(this)}
        initialFields={{}} />
    );
  }
}

export default JobEdit;
