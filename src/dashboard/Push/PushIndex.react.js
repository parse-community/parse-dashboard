/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as PushConstants from './PushConstants';
import * as DateUtils     from 'lib/DateUtils';
import Button             from 'components/Button/Button.react';
import CategoryList       from 'components/CategoryList/CategoryList.react';
import DashboardView      from 'dashboard/DashboardView.react';
import EmptyState         from 'components/EmptyState/EmptyState.react';
import history            from 'dashboard/history';
import LoaderContainer    from 'components/LoaderContainer/LoaderContainer.react';
import LoaderDots         from 'components/LoaderDots/LoaderDots.react';
import React              from 'react';
import SidebarAction      from 'components/Sidebar/SidebarAction';
import StatusIndicator    from 'components/StatusIndicator/StatusIndicator.react';
import styles             from './PushIndex.scss';
import stylesTable        from 'dashboard/TableView.scss';
import TableHeader        from 'components/Table/TableHeader.react';
import Toolbar            from 'components/Toolbar/Toolbar.react';

const PUSH_TYPE_ALL = 'all';
const PUSH_TYPE_CAMPAIGN = 'campaign';
const PUSH_TYPE_EXPERIMENT = 'experiment';
const PUSH_TYPE_API = 'api';
const PUSH_TYPE_TRANSLATION = 'translation';
const PUSH_DEFAULT_LIMIT = 10;

const PUSH_CATEGORIES = {
  all: 'All',
  // campaign: 'Campaigns',
  // experiment: 'Experiments',
  // api: 'sent via API'
};

/* eslint-disable no-unused-vars */
const PUSH_TYPES = {
  campaign: PUSH_TYPE_CAMPAIGN,
  experiment: PUSH_TYPE_EXPERIMENT,
  api: PUSH_TYPE_API,
};
/* eslint-enable */

const PUSH_STATUS_COLOR = {
  succeeded: 'green',
  failed: 'red',
  pending: 'blue',
  running: 'blue',
};

const PUSH_STATUS_CONTENT = {
  succeeded: 'SENT',
  failed: 'FAILED',
  pending: 'SENDING',
  running: 'SENDING',
};

const EXPERIMENT_GROUP = {
  A: 'GROUP B',
  B: 'GROUP A',
  launch: 'LAUNCH GROUP',
}

const DEFAULT_EMPTY_STATE_CONTENT = {
  description: 'You may need to configure push notifications for your app.',
  cta: 'Get started with Parse Push'
};

let getPushStatusType = (pushData) => {
  if(pushData[PushConstants.EXPERIMENT_FIELD]){
    return PUSH_TYPE_EXPERIMENT;
  } else if (pushData[PushConstants.TRANSLATION_ID_FIELD]){
    return PUSH_TYPE_TRANSLATION;
  } else if (pushData[PushConstants.SOURCE_FIELD] === 'webui'){
    return PUSH_TYPE_CAMPAIGN;
  } else {
    return PUSH_TYPE_API;
  }
}

let isChannelTargeted = (pushData) => {
  let query = pushData[PushConstants.QUERY_FIELD];
  if(!query) {
    return false;
  }

  let queryJSON = JSON.parse(query);
  let channels = queryJSON.channels;
  if (!channels) {
    return false;
  }

  let inClause = (channels.constructor === Object) && channels['$in'];
  let eqClause = channels.constructor === String;
  let additionalKeys = false;

  for (let key in queryJSON) {
    if (queryJSON.hasOwnProperty(key)) {
      if (key !== 'deviceType' && key !== 'channels') {
        additionalKeys = true;
      }
    }
  }

  return (inClause || eqClause) && !additionalKeys;
}

let getPushTarget = (pushData, availableDevices) => {
  if (isChannelTargeted(pushData)){
    return 'Channels';
  }
  if (availableDevices === undefined) {
    return (<LoaderDots />);
  }

  let query = JSON.parse(pushData.query);
  if (query.deviceType && query.deviceType['$in'] && query.deviceType['$in'].length < availableDevices.length) {
    return 'Segment';
  }
  return 'Everyone';
}

let getPushName = (pushData) => {
  let title = pushData[PushConstants.TITLE_FIELD];
  if(title){
    return (
      <strong>{title}</strong>
    );
  } else {
    let payload = pushData[PushConstants.PAYLOAD_FIELD] || '';
    try {
      payload = JSON.parse(payload);
    } catch(e) {/**/}
    if (typeof payload === 'object') {
      if (typeof payload.alert === 'string') {
        return payload.alert;
      }
      return payload.alert ? JSON.stringify(payload.alert) : JSON.stringify(payload);
    } else {
      return '';
    }
  }
}

let getPushCount = (pushData) => {
  let count = pushData[PushConstants.SENT_FIELD];
  if(count != undefined){
    return (
      <strong>{count}</strong>
    );
  } else {
    return (
      <strong>N/A</strong>
    );
  }
}

let emptyStateContent = {
  'all': {
    title: 'No pushes to display yet.',
    description: DEFAULT_EMPTY_STATE_CONTENT.description,
    cta: DEFAULT_EMPTY_STATE_CONTENT.cta,
  },
  'campaign': {
    title: 'No push campaigns to display yet.',
    description: DEFAULT_EMPTY_STATE_CONTENT.description,
    cta: DEFAULT_EMPTY_STATE_CONTENT.cta,
  },
  'experiment': {
    title: 'No push experiments to display yet',
    description: DEFAULT_EMPTY_STATE_CONTENT.description,
    cta: DEFAULT_EMPTY_STATE_CONTENT.cta,
  },
  'api': {
    title: 'No API pushes to display yet',
    description: DEFAULT_EMPTY_STATE_CONTENT.description,
    cta: DEFAULT_EMPTY_STATE_CONTENT.cta,
  }
};

let getExperimentInfo = (experiment) => {
  if(!experiment){
    return '';
  }
  return (
    <div className={styles.experimentLabel}>{EXPERIMENT_GROUP[experiment.group]}</div>
  );
}

let getTranslationInfo = (translationLocale) => {
  if(!translationLocale){
    return '';
  }
  return (
    <div className={styles.translationLabel}>{translationLocale.toUpperCase()}</div>
  );
}

let formatStatus = (status) => {
  let color = PUSH_STATUS_COLOR[status];
  let text = PUSH_STATUS_CONTENT[status];
  return (
    <StatusIndicator color={color} text={text} />
  );
}

let getPushTime = (pushTime, updatedAt) => {
  let time = pushTime || updatedAt;
  let dateTime = new Date(time);
  let isLocal = typeof time === 'string' && time.indexOf('Z') === -1;
  let timeContent = DateUtils.yearMonthDayTimeFormatter(dateTime, !isLocal);
  let result  = [];
  if (isLocal) {
    result.push(
      <div key='localTime' className={styles.localTimeLabel}>LOCAL TIME</div>
    );
  }
  result.push(
     <div key='timeContent'>{timeContent}</div>
  );
  return result;
}

export default class PushIndex extends DashboardView {
  constructor() {
    super();
    this.section = 'Push';
    this.subsection = 'Past Pushes'
    this.action = new SidebarAction('Send a push', this.navigateToNew.bind(this));
    this.state = {
      pushes: [],
      loading: true,
      paginationInfo: undefined,
      availableDevices: undefined,
    }
    this.xhrHandle = null;
  }

  handleFetch(category, page, limit){
    limit = limit || PUSH_DEFAULT_LIMIT;
    page = page || 0;
    let promise = this.context.currentApp.fetchPushNotifications(category, page, limit);

    promise.then((pushes) => {
      this.setState({
        paginationInfo: {
          has_more: (pushes.length == limit),
          page_num: page
        },
        pushes: this.state.pushes.concat(pushes),
      });
    }).always(() => {
      this.setState({
        loading: false,
        showMoreLoading: false,
      });
    });
  }

  componentWillMount() {
    this.handleFetch(this.props.params.category);
    //TODO: make xhr map and generic abort for existing xhrs.
    this.context.currentApp.fetchAvailableDevices().then(({ available_devices }) => {
      this.setState({
        availableDevices: available_devices
      });
    }, () => {
      this.setState({
        availableDevices: PushConstants.DEFAULT_DEVICES
      });
    });
  }

  componentWillUnmount() {
    if (this.xhrHandle) {
      this.xhrHandle.abort();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.category !== nextProps.params.category) {
      // The category has changed
      if (this.xhrHandle) {
        this.xhrHandle.abort();
      }
      this.handleCategoryClick(nextProps.params.category);
    }
  }

  navigateToNew() {
    history.push(this.context.generatePath('push/new'));
  }

  navigateToDetails(objectId) {
    history.push(this.context.generatePath(`push/${objectId}`));
  }

  handleShowMore(page) {
    this.setState({ showMoreLoading: true });
    this.handleFetch(this.props.params.category, page);
  }

  handleCategoryClick(category) {
    this.setState({
      pushes: [],
      loading: true,
    });
    this.handleFetch(category);
  }

  tableData() {
    return this.state.pushes;
  }

  renderSidebar() {
    let current = this.props.params.category || '';
    return (
      <CategoryList current={current} linkPrefix={'push/activity/'} categories={[
        { name: PUSH_CATEGORIES[PUSH_TYPE_ALL],
          id: PUSH_TYPE_ALL},
        // { name: PUSH_CATEGORIES[PUSH_TYPE_CAMPAIGN],
        //   id: PUSH_TYPE_CAMPAIGN},
        // { name: PUSH_CATEGORIES[PUSH_TYPE_EXPERIMENT],
        //   id: PUSH_TYPE_EXPERIMENT},
        // { name: PUSH_CATEGORIES[PUSH_TYPE_API],
        //   id: PUSH_TYPE_API},
        ]} />
    );
  }

  renderRow(push) {
    //TODO: special experimentation case for type
    return (
      <tr key={push.id} onClick={this.navigateToDetails.bind(this, push.id)} className={styles.tr}>
        <td className={styles.colType}>{getPushStatusType(push.attributes)}</td>
        <td className={styles.colTarget}>
          {getTranslationInfo(push.attributes.translation_locale)}
          {getExperimentInfo(push.attributes.experiment)}
          {getPushTarget(push.attributes, this.state.availableDevices)}
        </td>
        <td className={styles.colPushesSent}>{getPushCount(push.attributes)}</td>
        <td className={styles.colName}>{getPushName(push.attributes)}</td>
        <td className={styles.colTime}>{getPushTime(push.attributes.pushTime, push.updatedAt)}</td>
        <td className={styles.colStatus}>{formatStatus(push.attributes.status)}</td>
      </tr>
    );
  }

  renderToolbar() {
    return (
      <Toolbar
        section='Push'
        subsection={PUSH_CATEGORIES[this.props.params.category]}
        details={'push'}>
        <Button color='white' value='Send a push' onClick={this.navigateToNew.bind(this)} />
      </Toolbar>
    );
  }

  renderHeaders() {
    return [
      <TableHeader key='type' width={10}>Type</TableHeader>,
      <TableHeader key='target' width={15}>Target</TableHeader>,
      <TableHeader key='pushes_sent' width={15}>Pushes Sent</TableHeader>,
      <TableHeader key='name' width={30}>Name</TableHeader>,
      <TableHeader key='time' width={20}>Time</TableHeader>,
      <TableHeader key='status' width={10}>Status</TableHeader>,
    ];
  }

  //NOTE: current solution is 'Show more' button. Can be changed to infinite scroll if req.
  renderExtras() {
    let paginationInfo = this.state.paginationInfo;

    if (!paginationInfo) {
      return null;
    }

    if(paginationInfo.has_more && !this.state.loading){
      return (
        <div className={styles.showMore}>
          <Button progress={this.state.showMoreLoading} color='blue' value='Show more' onClick={this.handleShowMore.bind(this, paginationInfo.page_num + 1)} />
        </div>
      );
    } else {
      return null;
    }
  }

  renderEmpty() {
    let type = this.props.params.category || PUSH_TYPE_ALL;
    return (
      <EmptyState
        title={emptyStateContent[type].title}
        description={emptyStateContent[type].description}
        icon='push-solid'
        cta={emptyStateContent[type].cta}
        action={'http://docs.parseplatform.org/ios/guide/#push-notifications'} />
    );
  }

  //using custom renderContent as location of 'extras' are in different location
  renderContent() {
    let toolbar = this.renderToolbar();
    let data = this.tableData();
    let content = null;
    let headers = null;
    if (data !== undefined) {
      if (!Array.isArray(data)) {
        console.warn('tableData() needs to return an array of objects');
      } else {
        if (data.length === 0) {
          content = <div className={stylesTable.empty}>{this.renderEmpty()}</div>;
        } else {
          content = (
            <div className={stylesTable.rows}>
              <table>
                <tbody>
                  {data.map((row) => this.renderRow(row))}
                </tbody>
              </table>
            </div>
          );
          headers = this.renderHeaders();
        }
      }
    }
    let extras = this.renderExtras ? this.renderExtras() : null;
    let loading = this.state ? this.state.loading : false;
    return (
      <div>
        <LoaderContainer loading={loading}>
          <div className={stylesTable.content}>
            {content}
            {extras}
          </div>
        </LoaderContainer>
        {toolbar}
        <div className={stylesTable.headers}>{headers}</div>
      </div>
    );
  }
}
