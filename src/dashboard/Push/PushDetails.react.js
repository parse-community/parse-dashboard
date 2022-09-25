/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as DateUtils         from 'lib/DateUtils';
import * as PushHelper        from './PushComposerHelper.react';
import * as SchemaStore       from 'lib/stores/SchemaStore';
import Chart                  from 'components/Chart/Chart.react';
import DashboardView          from 'dashboard/DashboardView.react';
import DateTimeInput          from 'components/DateTimeInput/DateTimeInput.react';
import Field                  from 'components/Field/Field.react';
import Fieldset               from 'components/Fieldset/Fieldset.react';
import FieldStyles            from 'components/Field/Field.scss';
import FlowView               from 'components/FlowView/FlowView.react';
import Label                  from 'components/Label/Label.react';
import LoaderContainer        from 'components/LoaderContainer/LoaderContainer.react';
import Parse                  from 'parse';
import prettyNumber           from 'lib/prettyNumber';
import PushExperimentDropdown from 'components/PushExperimentDropdown/PushExperimentDropdown.react';
import PushOpenRate           from 'components/PushOpenRate/PushOpenRate.react';
import React                  from 'react';
import SliderWrap             from 'components/SliderWrap/SliderWrap.react';
import styles                 from './PushDetails.scss';
import subscribeTo            from 'lib/subscribeTo';
import tableStyles            from 'components/Table/Table.scss';
import Toggle                 from 'components/Toggle/Toggle.react';
import Toolbar                from 'components/Toolbar/Toolbar.react';
import { Directions }         from 'lib/Constants';
import { Link }               from 'react-router-dom';
import { tableInfoBuilder }   from 'lib/PushUtils';
import generatePath from 'lib/generatePath';
import { withRouter } from 'lib/withRouter';

const EXP_STATS_URL = 'http://docs.parseplatform.org/ios/guide/#push-experiments';

let getMessage = (payload) => {
  if(payload) {
    let payloadJSON = JSON.parse(payload);
		if (payloadJSON.alert && payloadJSON.alert.body) {
			return payloadJSON.alert.body;
		} else if (payloadJSON.alert) {
			return payloadJSON.alert;
		} else {
			return payload;
		}
  }
  return '';
}

let getFormattedTime = ({ time, is_local }) => {
  let formattedTime = DateUtils.yearMonthDayTimeFormatter(new Date(time), !is_local);
  if(is_local){
    formattedTime += ' Local Time'
  }
  return formattedTime;
}

let getSentInfo = (sendTime, expiration) => {
  //expiration unit is in seconds :(
  if (!sendTime){
    return '';
  }

  let fmtSendTime = getFormattedTime({time: sendTime});
  let fmtExpiration = expiration ? getFormattedTime({time: expiration * 1000}) : null;
  if (expiration){
    return `Sent ${fmtSendTime} and expires ${fmtExpiration}`;
  } else {
    return `Sent ${fmtSendTime}`;
  }
}

let getDeliveryErrors = (deliveryErrors=[]) => {
  let res = [];

  // NOTE: odd case when when deliverErrors === [null]
  // End Point is returning this, should investigate why but defensive check for now.
  if (deliveryErrors === null) {
    return res;
  }

  deliveryErrors.forEach(({ Name, Message, Quantity }, i) => {
    if(Quantity > 0){
      res.push(
        <tr key={`deliverError${i}`} className={tableStyles.tr}>
          <td className={tableStyles.td} width={'50%'}>
            <div className={styles.deliveryName}>{Name}</div>
            <div className={styles.deliveryMessage}>{Message}</div>
          </td>
          <td className={tableStyles.td} width={'50%'}>{Quantity}</td>
        </tr>
      );
    }
  });
  return res;
}

let getStatusTable = (pushDetails, deferDeliveries) => {
  let deliverErrors = getDeliveryErrors(pushDetails.delivery_errors);

  if (deferDeliveries && deliverErrors.length === 0) {
    return null;
  }

  return (
    <div className={styles.tableSectionWrap}>
      <div className={styles.tableSectionHeader}>Delivery Report</div>
      <div className={styles.tableWrap}>
      <table className={tableStyles.table}>
        <thead className={tableStyles.head}>
          <tr>
            <th className={tableStyles.td} width={'65%'}>Status</th>
            <th className={tableStyles.td} width={'35%'}>Push Count</th>
          </tr>
        </thead>
        <tbody>
          {!deferDeliveries ?
            <tr key='pushesSent' className={tableStyles.tr}>
              <td className={tableStyles.td} width={'65%'}>
                <div className={styles.deliveryName}>Successful Deliveries</div>
                <div className={styles.deliveryMessage}>Give your test a memorable name so you remember what you were testing when you see the results.</div>
              </td>
              <td className={tableStyles.td} width={'35%'}>{pushDetails.get('numSent')}</td>
            </tr> :
            null
          }
          {deliverErrors}
        </tbody>
      </table>
      </div>
    </div>
  );
}

let getTargetTable = (query, schema) => {
  let targetRows = tableInfoBuilder(query, schema, tableStyles);
  if (!targetRows || targetRows.length === 0) {
    return null;
  } else {
    return (
      <div className={styles.tableSectionWrap}>
        <div className={styles.tableSectionHeader}>Target</div>
        <div className={styles.tableWrap}>
        <table className={tableStyles.table}>
          <thead className={tableStyles.head}>
            <tr>
              <th className={tableStyles.td} width={'25%'}>Grouping</th>
              <th className={tableStyles.td} width={'25%'}>Operator</th>
              <th className={tableStyles.td} width={'50%'}>Value</th>
            </tr>
          </thead>
          <tbody>
            {targetRows}
          </tbody>
        </table>
        </div>
      </div>
    );
  }
}

let getExperimentLoser  = (winner) => {
  return winner === 'A' ? 'B' : 'A';
}

let getExperimentPartial = (pushDetails, type, isMessageType, style) => {
  return (
    <div className={styles[`group${type.toUpperCase()}`]}>
      <div style={style} className={styles.headerTitle}>{isMessageType ? `GROUP ${type.toUpperCase()} MESSAGE` : `GROUP ${type.toUpperCase()} TIME`}</div>
      <div className={styles.headline}>{isMessageType ? getMessage(pushDetails[`group_${type}`].payload) : getSentInfo(pushDetails[`group_${type}`].send_time, pushDetails[`group_${type}`].expiration)}</div>
      <div className={styles.subline}>
        {isMessageType ? getSentInfo(pushDetails[`group_${type}`].send_time, pushDetails[`group_${type}`].expiration) : null}
      </div>
    </div>
  );
}

let getPushDetailUrl = (context, pushId) => generatePath(context, `push/${pushId}`);

let formatAnalyticsData = (data) => {
  if (!data) {
    return [];
  }
  return data.map((point) => (
    [Parse._decode('date', point[0]).getTime(), point[1]]
  ));
}

const COLOR_MAP = {
  green: '#00db7c',
  red: '#ff395e',
  darkPurple: '#8D11BA',
  blueGreen: '#11A4BA',
  blue: '#169cee',
}

const DROPDOWN_KEY_GROUP_A = 'Group A';
const DROPDOWN_KEY_GROUP_B = 'Group B';

@subscribeTo('Schema', 'schema')
@withRouter
class PushDetails extends DashboardView {
  constructor() {
    super();
    this.section = 'Push';
    this.subsection = '';
    this.state = {
      pushDetails: {},
      loading: true,
      selectedGroup: undefined,
      chartData: {},
      groupColorA: COLOR_MAP.blueGreen,
      groupColorB: COLOR_MAP.darkPurple,
      standardColor: COLOR_MAP.blue,
      groupStatusA: '',
      groupStatusB: '',
    };
    this.xhrHandles = [];
  }

  componentWillMount() {
    this.props.schema.dispatch(SchemaStore.ActionTypes.FETCH);
    let promise = this.context.fetchPushDetails(this.props.params.pushId);
    promise.then((pushDetails) => {
      if (!pushDetails) {
        return null;
      }
      this.setState({ pushDetails });
      if (pushDetails.statistics && pushDetails.statistics.confidence_interval) {
        this.setState({
          groupColorA: pushDetails.statistics.winner === 'A' ? COLOR_MAP.green : COLOR_MAP.red,
          groupColorB: pushDetails.statistics.winner !== 'A' ? COLOR_MAP.green : COLOR_MAP.red,
          groupStatusA: pushDetails.statistics.winner === 'A' ? 'WINNER!' : '',
          groupStatusB: pushDetails.statistics.winner !== 'A' ? 'WINNER!' : '',
          selectedGroup: pushDetails.statistics.winner === 'A' ? DROPDOWN_KEY_GROUP_A : DROPDOWN_KEY_GROUP_B,
        });
      }

      let pushStatusID = '';
      let pushStatusIDA = '';
      let pushStatusIDB = '';

      if (pushDetails && pushDetails.experiment_push_id) {
        pushStatusID = pushDetails.experiment_push_id;
      } else if (pushDetails.is_exp) {
        pushStatusIDA = pushDetails.group_a.id;
        pushStatusIDB = pushDetails.group_b.id;
      } else {
        pushStatusID = pushDetails.id;
      }

      let toDate = Math.round(new Date(pushDetails.to_date).getTime() / 1000);
      let fromDate = Math.round(new Date(pushDetails.from_date).getTime() / 1000);

      let query = {
        endpoint: 'app_opened_from_push_with_id',
        stride:'hour',
        from: fromDate,
        to: toDate,
      }

      let promiseList = [];

      if (pushDetails.is_exp) {
        let abortableRequestA = this.context.getAnalyticsTimeSeries({
          ...query,
          pushStatusID: pushStatusIDA,
        });
        let abortableRequestB = this.context.getAnalyticsTimeSeries({
          ...query,
          pushStatusID: pushStatusIDB,
        });

        // Push the promises
        promiseList.push(abortableRequestA.promise);
        promiseList.push(abortableRequestB.promise);

        // Push the xhrs
        this.xhrHandles = [];
        this.xhrHandles.push(abortableRequestA.xhr);
        this.xhrHandles.push(abortableRequestB.xhr);

        Promise.all(promiseList).then(([dataA, dataB]) => {
          let chartDataA = formatAnalyticsData(dataA);
          let chartDataB = formatAnalyticsData(dataB);
          if (chartDataA.length > 0 || chartDataB.length > 0) {
            this.setState({
              chartData: {
                A: {
                  color: this.state.groupColorA,
                  points: chartDataA
                },
                B: {
                  color: this.state.groupColorB,
                  points: chartDataB
                }
              }});
          }
        }).finally(() => {
          this.setState({ loading: false })
        });
      } else {
        let { promise, xhr } = this.context.getAnalyticsTimeSeries({
          ...query,
          pushStatusID: pushStatusID,
        });
        promise.then((data) => {
          let chartData = formatAnalyticsData(data);
          if (chartData.length > 0) {
            this.setState({
              chartData: {
                pushes: {
                  color: this.state.standardColor,
                  points: chartData
                }
              }});
          }
        }).finally(() => {
          this.setState({ loading: false })
        });
        this.xhrHandles = [xhr];
      }
    });
  }

  componentWillUnmount() {
    this.xhrHandles.forEach(xhr => xhr.abort());
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.params.pushId !== nextProps.params.pushId) {
      this.setState( {loading: true });
      this.context.fetchPushDetails(nextProps.params.pushId).then((pushDetails) => {
        this.setState({ pushDetails });
      }).finally(() => {
        this.setState({ loading: false })
      });
    }
  }

  experimentInfoHelper() {
    let isFlowView = false;
    let experimentInfo = null;
    let flowFooterDetails = null;

    let pushDetails = this.state.pushDetails;
    let statistics = pushDetails.statistics;

    let learnMore = (
      <a href={EXP_STATS_URL} target='_blank'>Learn more</a>
    );

    if (pushDetails.exp_type === 'time' || pushDetails.launch_info === null || (pushDetails.launch_info && pushDetails.launch_info.percent === 0)) {
      let headline = statistics.confidence_interval ?
        (
          <div>
            <span styles={{ color: COLOR_MAP.green }}>Group {statistics.winner}</span>
            is the winner!
          </div>
        ) :
        'Not enough data to automatically determine the winner';
      let subline = [];

      if (statistics.confidence_interval) {
        subline.push(
          <div key='subline_1'>
            We are highly confident that if this experiment were repeated, <span styles={{ color: this.state[`groupColor${statistics.winner}`] }}>{pushDetails.exp_type} {statistics.winner}</span> would yield an open rate that&#8217;s
            <span>{statistics.confidence_interval[0]}</span>&mdash;<span>{statistics.confidence_interval[statistics.confidence_interval.length-1]}</span>
            percentage points higher than sending <span styles={{ color: this.state[`groupColor${statistics.winner}`] }}>{getExperimentLoser(statistics.winner)}</span>.
          </div>
        );
      }

      if (pushDetails.launch_info === null) {
        subline.push(
          <div key='subline_2'>
            You already sent { pushDetails.launch_choice === null ? 'a message' : <strong>Message {pushDetails.launch_choice}</strong> } to the Launch Group (devices outside groups A & B). {<Link to={getPushDetailUrl(this.context, pushDetails.launch_push_id)}>View Results</Link>}
          </div>
        );
      } else {
        subline.push(
          <div key='subline_2'>
            You allocated all of this campaign&#8217;s devices to test groups A & B. {learnMore}
          </div>
        );
      }

      experimentInfo = (
        <div className={styles.header}>
          <div className={styles.headline}>{headline}</div>
          <div className={styles.content}>{subline}</div>
        </div>
      );
    } else if (statistics) {
      isFlowView = true;

      let headline = statistics.confidence_interval  ? 'Group {statistics.winner} is the winner!' : 'Not enough data to automatically determine the winner';
      let subline = [];
      let launchGroupFragment = 'These devices are outside test groups A & B.';

      subline.push(
        <div className={styles.flowFooterHeader} key='subline_0'>Ready to send your campaign to the Launch Group?</div>
      )

      if (statistics.confidence_interval) {
        subline.push(
          <div key='subline_1'>
            We are highly confident that sending {statistics.winner} to the Launch Group will yield an open rate that&#8217;s
            <span>{statistics.confidence_interval[0]}</span>&mdash;<span>{statistics.confidence_interval[statistics.confidence_interval.length-1]}</span>
            percentage points higher than sending {getExperimentLoser(statistics.winner)}. {learnMore}
          </div>
        );
      }

      if (pushDetails.launch_info && pushDetails.launch_info.recipient_count) {
        <div key='sublime_2'>
          Your Launch Group is <strong>{pushDetails.launch_info.percent}%</strong> (approximately <strong>{prettyNumber(pushDetails.launch_info.recipient_count)}</strong>) of the devices in this campaign. {launchGroupFragment}
        </div>
      } else {
        subline.push(
          <div key='sublime_2'>
            Your Launch Group is <strong>{pushDetails.launch_info.percent}%</strong> of the devices in this campaign. {launchGroupFragment}
          </div>
        );
      }

      if (statistics.confidence_interval) {
        subline.push(
          <strong key='subline_3'>
            Send the winner to the Launch Group.
          </strong>
        );
      } else {
        subline.push(
          <div key='subline_3'>
            We recommend waiting for more data from test groups, but you can still choose a message and send it to the Launch Group.
          </div>
        );
      }

      experimentInfo = (
        <div className={styles.header}>
          <div className={styles.headline}>{headline}</div>
        </div>
      );

      flowFooterDetails = subline;
    }

    return {
      isFlowView,
      experimentInfo,
      flowFooterDetails,
    };
  }

  renderPushRates(experimentInfo) {
    let pushDetails = this.state.pushDetails;
    if (!pushDetails.id) {
      return null;
    }
    let launchChoice = pushDetails.launch_choice;
    let isMessageType = pushDetails.exp_type === 'message';
    let res = null;
    let prevLaunchGroup = null;
		let alert = getMessage(pushDetails.get('payload'));

    if (pushDetails && pushDetails.experiment_push_id) {
      prevLaunchGroup = (
        <div className={styles.header}>
          <div className={styles.headline}>
            This push is the Launch Group for a previous <Link to={getPushDetailUrl(this.context, pushDetails.experiment_push_id)}>experiment</Link>.
          </div>
        </div>
      );
    }

    if (pushDetails.is_exp) {
      res = (
        <div>
          <div className={styles.groupHeader}>
            {getExperimentPartial(pushDetails, 'a', isMessageType, { color: this.state.groupColorA })}
            {getExperimentPartial(pushDetails, 'b', isMessageType, { color: this.state.groupColorB })}
          </div>
          {
            !isMessageType ?
              <div className={[styles.header, styles.messageHeader].join(' ')}>
                <div className={styles.headerTitle}>MESSAGE SENT</div>
                <div className={styles.headline}>{getMessage(pushDetails.group_a.payload)}</div>
              </div> :
              null
          }
          {prevLaunchGroup}
          {experimentInfo}
          <div className={styles.groupA}>
            <div className={styles.openRateTitle} style={{ color: this.state.groupColorA }}>{this.state.groupStatusA}</div>
            <PushOpenRate
              numOpened={pushDetails.group_a.push_opens}
              numSent={pushDetails.group_a.push_sends}
              isWinner={launchChoice === 'A'}
              customColor={this.state.groupColorA} />
          </div>
          <div className={styles.groupB}>
            <div className={styles.openRateTitle} style={{ color: this.state.groupColorB }}>{this.state.groupStatusB}</div>
            <PushOpenRate
              numOpened={pushDetails.group_b.push_opens}
              numSent={pushDetails.group_b.push_sends}
              isWinner={launchChoice === 'B'}
              customColor={this.state.groupColorB} />
          </div>
        </div>
      );
    } else {
      res = (
        <div>
          <div className={styles.groupHeader}>
            <div className={styles.headerTitle}>MESSAGE SENT</div>
							{
								(typeof alert === 'object') ?
									<div>
										<div className={styles.headline}>{alert.title}</div>
										<div className={styles.headline}>{alert.body}</div>
									</div>:
									<div className={styles.headline}>{alert}</div>
							}
            <div className={styles.subline}>
              {getSentInfo(pushDetails.get('pushTime'), pushDetails.get('expiration'))}
            </div>
          </div>
          {prevLaunchGroup}
          {experimentInfo}
          <PushOpenRate
            numOpened={pushDetails.get('numOpened') || 0}
            numSent={pushDetails.get('numSent')}
            customColor={this.state.standardColor} />
        </div>
      );
    }

    return res;
  }

  renderAnalytics() {
    if (Object.keys(this.state.chartData).length > 0) {
      return (
        <div className={styles.chartWrap}>
          <div className={styles.chartTitle}>Push opens over time</div>
          <Chart
            width={800}
            height={400}
            data={this.state.chartData}
            formatter={(value) => value + ' push' + (value !== 1 ?  'es' : '' )} />
        </div>
      )
    } else {
      return null;
    }
  }

  renderTargetTable() {
    let classes = this.props.schema.data.get('classes');
    let schema = {};
    if(classes){
      let installations = classes.get('_Installation');
      if(typeof(installations) !== 'undefined'){
        installations.forEach((type, col) => {
          schema[col] = type;
        });
      }
    }
    return getTargetTable(this.state.pushDetails.get('query'), schema, tableStyles);
  }

  renderStatusTable() {
    let pushDetails = this.state.pushDetails;
    return getStatusTable(pushDetails, pushDetails.is_exp ? true : false);
  }

  handlePushSubmit(changes) {
    let promise = new Promise();
    this.context.launchExperiment(this.props.params.pushId, changes).then(({ error }) => {
      //navigate to push index page and clear cache once push store is created
      if (error) {
        promise.reject({ error });
      } else {
        this.props.navigate(generatePath(this.context, 'push/activity'));
      }
    }, (error) => {
      promise.reject({ error });
    });
    return promise;
  }

  renderDeliveryContent(fields, setField) {
    let deliveryContent = [];
    deliveryContent.push(
      <Field
        key='push_time_type'
        className={FieldStyles.header}
        label={<Label text='Send immediately?' />}
        input={<Toggle
          type={Toggle.Types.CUSTOM}
          value={fields.push_time_type}
          labelLeft='No'
          labelRight='Yes'
          optionLeft='time'
          optionRight='now'
          colored={true}
          onChange={setField.bind(null, 'push_time_type')} />} />
    );

    if(fields.push_time_type !== 'now'){
      deliveryContent.push(
        <Field
          key='push_time'
          labelWidth={60}
          label={<Label text='When should we deliver this?' />}
          input={
            <DateTimeInput
              value={fields.push_time}
              onChange={setField.bind(null, 'push_time')} />
          } />
      );
    }

    if(fields.push_time_type !== 'now'){
      return deliveryContent.concat([
        <Field
          key='localTime'
          label={<Label text='Use user time zone?' description='This will send the message to users in their local timezones.' />}
          input={<Toggle
            value={fields.localTime}
            onChange={setField.bind(null, 'localTime')} />
          } />,
        <SliderWrap key='slider' direction={Directions.DOWN} expanded={fields.localTime} block={true}>
          <div className={styles.warning}>Installations without a time zone will not receive this campaign.</div>
        </SliderWrap>
      ]);
    } else {
      return deliveryContent;
    }
  }

  renderSecondaryFooterButton({setField}) {
    let color = this.state.standardColor;
    if (this.state.selectedGroup === DROPDOWN_KEY_GROUP_A) {
      color = this.state.groupColorA;
    } else if (this.state.selectedGroup === DROPDOWN_KEY_GROUP_B) {
      color = this.state.groupColorB;
    }

    let colorKey = Object.keys(COLOR_MAP).find((key) => {
      return COLOR_MAP[key] === color;
    });

    return <PushExperimentDropdown
      color={colorKey}
      width={'155'}
      placeholder={'Choose a group'}
      value={this.state.selectedGroup}
      onChange={(selectedGroup) => {
        //TODO: (peterjs) we should avoid content matching
        let selectedGroupId = selectedGroup ===  DROPDOWN_KEY_GROUP_A ? this.state.pushDetails.group_a.id : this.state.pushDetails.group_b.id;
        setField('winning_message_id', selectedGroupId);
        this.setState({ selectedGroup });
      }}
      options={[
        {key: DROPDOWN_KEY_GROUP_A, style: { color: this.state.groupColorA }},
        {key: DROPDOWN_KEY_GROUP_B, style: { color: this.state.groupColorB }}]} />
  }

 renderForm(flowFooterDetails, { fields, setField }) {
    let classes = this.props.schema.data.get('classes');
    let schema = {};
    if(classes){
      let installations = classes.get('_Installation');
      if(typeof(installations) !== 'undefined'){
        installations.forEach((type, col) => {
          schema[col] = type;
        });
      }
    }

    return (
      <div className={styles.pushFlow}>
        <Fieldset
          legend='Choose a delivery time'
          description='We can send the campaign immediately, or any time in the next 2 weeks.'>
          {this.renderDeliveryContent(fields, setField)}
          <Field
            label={<Label text='Should this notification expire?' />}
            input={<Toggle value={fields.push_expires} onChange={setField.bind(null, 'push_expires')} />} />
          {PushHelper.renderExpirationContent(fields, setField)}
        </Fieldset>
      </div>
    );
  }

  //TODO: (peterjs) PushPreview Component
  renderContent() {
    if (this.state.loading) {
      return;
    }
    let { isFlowView, experimentInfo, flowFooterDetails } = this.experimentInfoHelper();
    return (
      <div className={styles.detailsWrapper}>
        <LoaderContainer loading={this.state.loading}>
          {this.renderPushRates(experimentInfo)}
          {this.renderAnalytics()}
          {this.renderTargetTable()}
          {this.renderStatusTable()}
        </LoaderContainer>
        { isFlowView ?
          <FlowView
            initialFields={{}}
            submitText='Send push'
            inProgressText={'Sending\u2026'}
            onSubmit={({ changes }) => this.handlePushSubmit(changes)}
            initialChanges={{
              experiment_id: this.state.pushDetails.experiment_id,
              push_time_type: 'now',
              push_time: null,
              deliveryTime: null,
              localTime: false, //TODO: (peterjs) use push_time_zone, detect local time zone and get offset value ex: (PST, "=08:00")
              push_expires: false,
              expiration_time: null,
              expiration_time_type: 'time',
              expiration_interval_num: '24',
              expiration_interval_unit: 'days',
              expirationInterval: null,
            }}
            renderForm={this.renderForm.bind(this, flowFooterDetails)}
            defaultFooterMessage={flowFooterDetails}
            footerContents={() => flowFooterDetails}
            validate={() => this.state.selectedGroup === undefined ? 'use default' : '' }
            secondaryButton={args => this.renderSecondaryFooterButton(args)}/> :
            null
        }
        <Toolbar section='Push' subsection='Push Notification Details' details={`ID: ${this.props.params.pushId}`}/>
      </div>
    );
  }
}

export default PushDetails;
