/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button                  from 'components/Button/Button.react';
import ChromeDatePicker        from 'components/ChromeDatePicker/ChromeDatePicker.react';
import DashboardView           from 'dashboard/DashboardView.react';
import * as DateUtils          from 'lib/DateUtils';
import EmptyState              from 'components/EmptyState/EmptyState.react';
import englishOrdinalIndicator from 'lib/englishOrdinalIndicator';
import LoaderContainer         from 'components/LoaderContainer/LoaderContainer.react';
import prettyNumber            from 'lib/prettyNumber';
import React                   from 'react';
import styles                  from 'dashboard/Analytics/Retention/Retention.scss';
import Toolbar                 from 'components/Toolbar/Toolbar.react';
import Tooltip                 from 'components/Tooltip/Tooltip.react';
import { verticalCenter }      from 'stylesheets/base.scss';

const RETENTION_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 14, 21, 28];
const REVERSED_RETENTION_DAYS = RETENTION_DAYS.slice().reverse();

let retentionChartColor = percent => {
  let red, blue, green;
  if (percent > 50) {
    red   = 23 + ( ( percent - 50 ) * 2 ) * 11 / 100;
    green = 166 - ( ( percent - 50 ) * 2 ) * 166 / 100;
    blue  = 255;
  } else {
    red   = 228 - ( percent * 2 ) * 205 / 100;
    green = 233 - ( percent * 2 ) * 67 / 100;
    blue  = 237 + ( percent * 2 ) * 18 / 100;
  }
  //return without decimals since css doesn't allow them
  return 'rgb(' + red.toFixed(0) + ', ' + green.toFixed(0) + ', ' + blue.toFixed(0) + ')';
}

export default class Retention extends DashboardView {
  constructor() {
    super();
    this.section = 'Analytics';
    this.subsection = 'Retention'
    this.xhrHandles = [];

    this.state = {
      retentions: null,
      loading: true,
      mutated: false,
      date: new Date()
    };
  }

  componentWillMount() {
    this.fetchRetention(this.context.currentApp);
  }

  componentWillUnmount() {
    this.xhrHandles.forEach((xhr) => xhr.abort());
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.fetchRetention(nextContext.currentApp);
    }
  }

  fetchRetention(app) {
    this.setState({ loading: true }, () => {
      let { promise, xhr } = app.getAnalyticsRetention(this.state.date);
      promise.then(
        (result) => this.setState({ retentions: result.content, loading: false }),
        () => this.setState({ retentions: null, loading: false })
      );
      this.xhrHandles = [xhr];
    });
  }

  renderRetentionCell(daysAgo, day) {
    let total = 0;
    let active = 0;
    // Somehow it's possible to miss some data. Probably a backend issue, but it's
    // not easily reproducible locally.
    let dayData = this.state.retentions['days_old_' + daysAgo] && this.state.retentions['days_old_' + daysAgo]['day_' + day];
    if (dayData) {
      total = dayData.total;
      active = dayData.active;
    }
    let percentage = (active / (total || 1) * 100).toFixed(1);
    let color = retentionChartColor(percentage);
    let style = {
      backgroundColor: color,
      borderColor: color
    };
    let monthDayPretty = DateUtils.monthDayStringUTC(DateUtils.daysFrom(this.state.date, day - daysAgo));

    return (
      <td key={'col_' + daysAgo + ' _' + day}>
        <Tooltip value={(
          <div>
            <b>{active}</b> of <b>{total}</b> users who signed up on <b>{monthDayPretty}</b> were still active on their <b>{englishOrdinalIndicator(day)} day</b>
          </div>
          )}>
          <div className={styles.retentionCell} style={style}>{percentage}%</div>
        </Tooltip>
      </td>
    );
  }

  renderRetentionAverage(day) {
    let total = 0;
    let active = 0;
    RETENTION_DAYS.forEach((daysAgo) => {
      if (daysAgo < day) {
        return;
      }
      let dayData = this.state.retentions['days_old_' + daysAgo] && this.state.retentions['days_old_' + daysAgo]['day_' + day];
      // Somehow it's possible to miss some data. Probably a backend issue, but it's
      // not easily reproducible locally.
      if (dayData) {
        total += dayData.total;
        active += dayData.active;
      }
    });
    let percentage = (active / (total || 1) * 100).toFixed(1);
    return (
      <td
        key={'average_' + day}
        className={[styles.average, styles.tableHeader].join(' ')}
        style={{ textAlign: 'center' }}>
        {percentage}%
      </td>
    );
  }

  renderDayAndTotalUser(daysAgo) {
    // We can assume this.state.retentions has correct data here. Otherwise let it crash.
    let dayData = this.state.retentions['days_old_' + daysAgo]['day_' + daysAgo];
    let date = DateUtils.daysFrom(this.state.date, -daysAgo);
    let formattedDate = DateUtils.monthDayStringUTC(date);
    let formattedDateSplit = formattedDate.split(" ");
    let formattedDateMonth = formattedDateSplit[0];
    let formattedDateDay   = formattedDateSplit[1];

    return (
      <td key={'header_' + daysAgo} className={styles.YaxisLabel}>
        <div className={styles.YaxisLabelDate}> 
          {(daysAgo === 28 || formattedDateDay === '1' ? formattedDateMonth : '')} 
          <span className={styles.YaxisLabelNumber}> {formattedDateDay}</span>
        </div>
        <div className={styles.YaxisLabelUsers}>
          {(daysAgo === 28 || formattedDateDay === '1' ? 'Users ' : '')} 
          <span className={styles.YaxisLabelNumber}>{prettyNumber(dayData.total)}</span>
        </div>
      </td>
    );
  }

  renderContent() {
    let toolbar = (
      <Toolbar
        section='Analytics'
        subsection='Retention'>
      </Toolbar>
    );

    let chart = null;
    let footer = null;

    if (!this.state.retentions || Object.keys(this.state.retentions).length === 0) {
      chart = (
        <EmptyState
          title={`You don't have any user retention data for this period.`}
          icon='analytics-outline'
          description={`Once you start tracking user signups, we'll chart your user retention here.`}
          cta='Get started with Users'
          action={() => window.location = 'https://parse.com/apps/quickstart'} />
      );
    } else {
      chart = (
        <table className={styles.table}>
          <tbody>
            <tr key='header_days_ago' className={styles.divider}>
              <td className={styles.tableHeader}>Still active after</td>
              <td></td>
              {RETENTION_DAYS.map((day) => (
                <td
                  key={'header_' + day}
                  className={styles.tableHeader}
                  style={{ textAlign: 'center' }}>
                  {day}
                </td>
              ))}
            </tr>

            <tr key='header_average' className={styles.divider}>
              <td className={[styles.average, styles.tableHeader].join(' ')}>Average</td>
              <td></td>
              {RETENTION_DAYS.map((day) => (
                this.renderRetentionAverage(day)
              ))}
            </tr>

            {REVERSED_RETENTION_DAYS.map((daysAgo) => {
              return (
                <tr key={'row_' + daysAgo} className={styles.tableRow}>
                  <td className={styles.YaxisSignedUp}>{ daysAgo === 28 ? 'Signed up' : '' }</td>
                  {this.renderDayAndTotalUser(daysAgo)}
                  {RETENTION_DAYS.map((day) => {
                    // Only render until daysAgo
                    if (day > daysAgo) {
                      return null;
                    }

                    return this.renderRetentionCell(daysAgo, day);
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      );

      footer = (
        <div className={styles.footer}>
          <div className={[styles.right, verticalCenter].join(' ')}>
            <span style={{ marginRight: '10px' }}>
              <ChromeDatePicker
                value={this.state.date}
                onChange={(newValue) => (this.setState({ date: newValue, mutated: true }))} />
            </span>
            <Button
              primary={true}
              disabled={!this.state.mutated}
              onClick={this.fetchRetention.bind(this, this.context.currentApp)}
              value='Refresh chart' />
          </div>
        </div>
      );
    }

    let content = (
      <LoaderContainer loading={this.state.loading}>
        <div className={styles.content}>
          {chart}
        </div>
        {footer}
      </LoaderContainer>
    );

    return (
      <div>
        {content}
        {toolbar}
      </div>
    );
  }
}
