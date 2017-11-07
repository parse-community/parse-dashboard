/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ParseApp           from 'lib/ParseApp';
import React              from 'react';
import SegmentSelect      from 'components/SegmentSelect/SegmentSelect.react';
import styles             from 'components/PushPreview/PushPreview.scss';
import VisiblePreview     from 'components/PushPreview/VisiblePreview.react';
import {
         getDateMethod,
         MONTHS,
         pad,
       }                from 'lib/DateUtils';

let Row = ({ label, content }) => (
  <div className={styles.row}>
    <div className={styles.rowLabel}>{label}</div>
    <div className={styles.rowContent}>{content}</div>
  </div>
);

let timeString = (time, isLocal) => {
  if (time && time.constructor === Date) {
    return (
      <div>
        {MONTHS[time[getDateMethod(isLocal, 'getMonth')]()].substr(0, 3) + ' ' + time[getDateMethod(isLocal, 'getDate')]()}
        <span> at </span>
        {time[getDateMethod(isLocal, 'getHours')]()}:{pad(time[getDateMethod(isLocal, 'getMinutes')]())}
      </div>
    );
  }
}

export default class PushPreview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPreview: 'iOS',
      currentTest: 'Group A',
    };
  }

  render() {
    let pushState = this.props.pushState;
    let isExperiment = !!pushState.exp_enable;
    let audienceName = 'Everyone';
    let count = -1;
    if (pushState.audience_id === 'new_segment') {
      audienceName = 'New Segment';
    } else if (pushState.audience_id !== 'everyone' &&
        this.props.audiences &&
        this.props.audiences.data &&
        this.props.audiences.data.get('audiences')
    ) {
      this.props.audiences.data.get('audiences').forEach((a) => {
        if (a.objectId === pushState.audience_id) {
          audienceName = a.name;
          count = a.size;
          return false;
        }
      });
    }
    let messagePreview = (
      <div className={styles.section}>
        <div className={styles.title}>Message</div>
        <Row label='Message:' content={pushState.data} />
        {pushState.increment_badge ? <Row label='Badge:' content='Increment' /> : null}
      </div>
    );
    if (isExperiment && pushState.exp_type === 'message') {
      messagePreview = (
        <div className={styles.section}>
          <div className={styles.title}>A/B Test</div>
          <Row label='Name:' content={pushState.experiment_name} />
          <Row label='Testing:' content='Message' />
          <Row label='Message A:' content={pushState.data1} />
          <Row label='Message B:' content={pushState.data2} />
          {pushState.increment_badge ? <Row label='Badge:' content='Increment' /> : null}
          <Row label='Test size:' content={pushState.exp_size_in_percent + '%'} />
        </div>
      );
    }
    let expiration = 'Never';
    if (pushState.push_expires) {
      if (pushState.expiration_time_type === 'time') {
        expiration = timeString(pushState.expiration_time, pushState.local_time);
      } else {
        expiration = pushState.expiration_interval_num + ' ' + pushState.expiration_interval_unit;
      }
    }
    let timePreview = (
      <div className={styles.section}>
        <div className={styles.title}>Delivery</div>
        <Row label='Time:' content={pushState.push_time_type === 'now' ? 'Immediately' : timeString(pushState.push_time_iso, pushState.local_time)} />
        <Row label='Time Zone:' content={pushState.local_time ? 'User' : 'GMT'} />
        <Row label='Expiration:' content={expiration} />
      </div>
    );
    //TODO: clarify use of UTC or GMT as GMT is time zone and UTC is standard
    if (isExperiment && pushState.exp_type === 'time') {
      timePreview = (
        <div className={styles.section}>
          <div className={styles.title}>A/B Test</div>
          <Row label='Name:' content={pushState.experiment_name} />
          <Row label='Testing:' content='Time' />
          <Row label='Time A:' content={timeString(pushState.push_time_1_iso, pushState.local_time)} />
          <Row label='Time B:' content={timeString(pushState.push_time_2_iso, pushState.local_time)} />
          <Row label='Time Zone:' content={pushState.local_time ? 'User' : 'GMT'} />
          <Row label='Expiration:' content={expiration} />
          <Row label='Test size:' content={pushState.exp_size_in_percent + '%'} />
        </div>
      );
    }
    let previewMessage = pushState.data;
    if (isExperiment && pushState.exp_type === 'message') {
      previewMessage = this.state.currentTest === 'Group A' ? pushState.data1 : pushState.data2;
    }
    let previewTime = new Date();
    if (isExperiment && pushState.exp_type === 'time') {
      previewTime = this.state.currentTest === 'Group A' ? pushState.push_time_1_iso : pushState.push_time_2_iso;
    } else if (pushState.push_time_type !== 'now') {
      previewTime = pushState.push_time_iso;
    }

    let previewContent = (
      <VisiblePreview
        isLocal={pushState.local_time}
        type={this.state.currentPreview.toLowerCase().replace(/\s/, '')}
        message={previewMessage}
        time={previewTime || new Date()}
        appName={this.context.currentApp.name}
        fade={isExperiment} />
    );
    if (!isExperiment && pushState.data_type === 'json') {
      previewContent = null;
    } else if (isExperiment) {
      if (this.state.currentTest === 'Group A' && pushState.data_type_1 === 'json') {
        previewContent = null;
      } else if (this.state.currentTest === 'Group B' && pushState.data_type_2 === 'json') {
        previewContent = null;
      }
    }
    return (
      <div className={styles.wrap}>
        <div className={styles.left}>
          <div className={styles.section}>
            <div className={styles.title}>Audience</div>
            <Row label='Sending to:' content={audienceName + (count > -1 ? ` (${count} devices)` : '')} />
          </div>
          {messagePreview}
          {timePreview}
        </div>
        <div className={styles.right}>
          {previewContent || <div className={styles.noPreview}>No Preview</div>}
          {previewContent ?
            <div className={styles.typeSelect}>
              <SegmentSelect
                values={['iOS', 'Android', 'OS X', 'Windows']}
                current={this.state.currentPreview}
                onChange={(currentPreview) => this.setState({ currentPreview })} />
            </div> : null}
          {isExperiment ?
            <div className={styles.testSelect}>
              <SegmentSelect
                values={['Group A', 'Group B']}
                current={this.state.currentTest}
                onChange={(currentTest) => this.setState({ currentTest })} />
            </div> : null}
        </div>
      </div>
    );
  }
}

PushPreview.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
