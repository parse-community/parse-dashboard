/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DashboardView          from 'dashboard/DashboardView.react';
import DateTimeInput          from 'components/DateTimeInput/DateTimeInput.react';
import Dropdown               from 'components/Dropdown/Dropdown.react';
import Field                  from 'components/Field/Field.react';
import Fieldset               from 'components/Fieldset/Fieldset.react';
import FlowView               from 'components/FlowView/FlowView.react';
import IntervalInput          from 'components/IntervalInput/IntervalInput.react';
import JobScheduleReminder    from 'dashboard/Data/Jobs/JobScheduleReminder.react';
import Label                  from 'components/Label/Label.react';
import Option                 from 'components/Dropdown/Option.react';
import pluralize              from 'lib/pluralize';
import React                  from 'react';
import ReleaseInfo            from 'components/ReleaseInfo/ReleaseInfo';
import styles                 from 'dashboard/Data/Jobs/Jobs.scss';
import TextInput              from 'components/TextInput/TextInput.react';
import TimeInput              from 'components/TimeInput/TimeInput.react';
import Toggle                 from 'components/Toggle/Toggle.react';
import Toolbar                from 'components/Toolbar/Toolbar.react';
import { hoursFrom, dateStringUTC }  from 'lib/DateUtils';

export default class JobsForm extends DashboardView {
  constructor(props) {
    super(props);
    this.section = 'Core';
    this.subsection = 'Jobs';
  }

  initialChanges() {
    if (this.props.initialFields.job) {
      let changes = {};
      if (!this.props.initialFields.repeatType) {
        changes.repeatType = 'daily';
      }
      if (!this.props.initialFields.repeatStartHour) {
        changes.repeatStartHour = '12';
      }
      if (!this.props.initialFields.repeatStartMinute) {
        changes.repeatStartHour = '00';
      }
      if (!this.props.initialFields.intervalCount) {
        changes.intervalCount = 15;
      }
      if (!this.props.initialFields.intervalUnit) {
        changes.intervalUnit = 'minute';
      }
      return changes;
    }
    return {
      description: '',
      job: '',
      parameter: '',
      immediate: true,
      runAt: hoursFrom(new Date(), 1),
      repeat: false,
      repeatType: 'daily',
      repeatStartHour: '12',
      repeatStartMinute: '00',
      intervalCount: 15,
      intervalUnit: 'minute'
    };
  }

  renderRepeatFields(fields, setField) {
    if (!fields.repeat) {
      return null;
    }
    let rows = [
      <Field
        key='repeatType'
        label={<Label text='How should it repeat?' />}
        input={
          <Toggle
            type={Toggle.Types.TWO_WAY}
            value={fields.repeatType}
            optionLeft='on an interval'
            optionRight='daily'
            onChange={setField.bind(null, 'repeatType')} />
        } />
    ];
    if (fields.repeatType === 'daily') {
      rows.push(
        <Field
          key='runAt'
          labelWidth={60}
          label={<Label text='When should it run each day?' />}
          input={
            <TimeInput
              hours={fields.repeatStartHour}
              minutes={fields.repeatStartMinute}
              onChange={(hour, minute) => {
                setField('repeatStartHour', hour);
                setField('repeatStartMinute', minute);
              }} />
          } />
      );
    } else {
      rows.push(
        <Field
          key='interval'
          labelWidth={60}
          label={<Label text='Repeat on what interval?' />}
          input={<IntervalInput
            count={fields.intervalCount}
            unit={fields.intervalUnit}
            onChange={(count, unit) => {
              setField('intervalCount', count);
              setField('intervalUnit', unit);
            }} />} />
      );
      rows.push(
        <Field
          key='repeatStart'
          labelWidth={60}
          label={<Label text='Starting at what time each day?' />}
          input={
            <TimeInput
              hours={fields.repeatStartHour}
              minutes={fields.repeatStartMinute}
              onChange={(hour, minute) => {
                setField('repeatStartHour', hour);
                setField('repeatStartMinute', minute);
              }} />
          } />
      )
    }
    return rows;
  }

  renderForm({ fields, setField }) {
    let jobs = this.props.availableJobs || [];
    if (this.props.initialFields.job) {
      jobs = [this.props.initialFields.job].concat(jobs);
    }
    return (
      <div className={styles.jobsFlow}>
        <JobScheduleReminder />
        <Fieldset
          legend='Pick a Job'
          description='Choose a job from your cloud code, and specify the parameters to run it with'>
          <Field
            label={<Label text='Description' description='Give this schedule a name that describes what it does' />}
            input={<TextInput
              placeholder={'Pick a good name\u2026'}
              value={fields.description}
              onChange={setField.bind(null, 'description')} />
            } />
          <Field
            label={<Label text='Cloud job' description='Pick which cloud code job to run' />}
            input={
              <Dropdown value={fields.job} onChange={setField.bind(null, 'job')}>
                {jobs.map((job) => <Option key={job} value={job}>{job}</Option>)}
              </Dropdown>
            } />
          <Field
            label={<Label text='Parameters' description='Specify an optional JSON object to pass to the job' />}
            input={<TextInput
              monospace={true}
              multiline={true}
              placeholder={'{\n  \u2026\n}'}
              value={fields.parameter}
              onChange={setField.bind(null, 'parameter')} />
            } />
        </Fieldset>

        <Fieldset
          legend='Schedule a time'
          description='Choose when this job runs and how often it repeats'>
          {this.props.initialFields.job ? null :
            <Field
              label={<Label text='Start immediately?' />}
              input={<Toggle value={fields.immediate} onChange={setField.bind(null, 'immediate')} />} />}
          {fields.immediate ? null : <Field
            labelWidth={60}
            label={<Label text='When should it start?' />}
            input={
              <DateTimeInput
                disabled={!!this.props.initialFields.job}
                value={fields.runAt}
                onChange={setField.bind(null, 'runAt')} />
            } />}
          <Field
            label={<Label text='Should it repeat?' description='You can schedule a job to run once every day, or on an interval' />}
            input={<Toggle value={fields.repeat} onChange={setField.bind(null, 'repeat')} />} />
          {this.renderRepeatFields(fields, setField)}
        </Fieldset>
        <Toolbar
          section='Jobs'
          subsection='Schedule a Job'
          details={ReleaseInfo({ release: this.props.release })} />
      </div>
    );
  }

  renderContent() {
    return <FlowView
      initialChanges={this.initialChanges()}
      initialFields={this.props.initialFields}
      renderForm={this.renderForm.bind(this)}
      showFooter={changes => changes.job !== ''}
      submitText='Schedule'
      onSubmit={({fields}) => this.props.submitForm(fields)}
      inProgressText={'Scheduling\u2026'}
      validate={({fields}) => {
        //Don't even display the footer if they haven't selected a name or function.
        if (!fields.job.length && !fields.description.length) {
          return '';
        }
        let errorMessages = [];
        if (!fields.description.length) {
          errorMessages.push('A description is required.');
        }
        if (!fields.job.length) {
          errorMessages.push('Pick a cloud code job to run.');
        }
        //Allow them to submit no params
        if (fields.parameter !== '') {
          try {
            JSON.parse(fields.parameter);
          } catch (e) {
            errorMessages.push('Parameters must be valid JSON.');
          }
        }
        return errorMessages.join(' ');
      }}
      footerContents={({fields}) => {
        let pieces = [];
        pieces.push(<strong>{fields.job}</strong>, ' will run ');
        if (fields.immediate) {
          pieces.push(<strong>immediately</strong>, '.')
        } else {
          pieces.push('on ', <strong>{dateStringUTC(fields.runAt)}</strong>, '.');
        }
        if (fields.repeat) {
          pieces.push(' It will repeat ');
          if (fields.repeatType === 'daily') {
            pieces.push(
              <strong>every day</strong>,
              ' at ',
              <strong>{fields.repeatStartHour}:{fields.repeatStartMinute} UTC</strong>
            );
          } else {
            pieces.push(
              <strong>{'every ' + pluralize(fields.intervalCount, fields.intervalUnit)}</strong>,
              ' after ',
              <strong>{fields.repeatStartHour}:{fields.repeatStartMinute} UTC</strong>
            );
          }
        }
        return pieces;
      }}
    />;
  }
}
