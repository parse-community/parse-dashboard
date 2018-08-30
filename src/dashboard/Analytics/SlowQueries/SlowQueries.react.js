/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as AnalyticsQueryStore from 'lib/stores/AnalyticsQueryStore';
import * as SchemaStore         from 'lib/stores/SchemaStore';
import Button                   from 'components/Button/Button.react';
import DateRange                from 'components/DateRange/DateRange.react';
import EmptyState               from 'components/EmptyState/EmptyState.react';
import FlowFooter               from 'components/FlowFooter/FlowFooter.react';
import Icon                     from 'components/Icon/Icon.react';
import React                    from 'react';
import SlowQueriesFilter        from 'components/SlowQueriesFilter/SlowQueriesFilter.react';
import styles                   from 'dashboard/Analytics/SlowQueries/SlowQueries.scss';
import subscribeTo              from 'lib/subscribeTo';
import TableHeader              from 'components/Table/TableHeader.react';
import TableView                from 'dashboard/TableView.react';
import Toolbar                  from 'components/Toolbar/Toolbar.react';
import { Directions }           from 'lib/Constants';

const SLOW_QUERIES_HEADERS = ['#', 'Date Time', 'Method', 'Path', 'Parameters', 'Resp. Status', 'Resp. Time (ms)'];
const TABLE_WIDTH = [5, 17, 8, 25, 25, 10, 10];

const APP_VERSIONS_EXPLORER_QUERY = {
  type: 'json',
  limit: 1000,
  source: 'API Event',
  groups: ['OS', 'App Display Version'],
  localId: 'slow_query_app_version_query'
};

let formatQuery = (query) => {
  return query;
};

@subscribeTo('Schema', 'schema')
@subscribeTo('AnalyticsQuery', 'customQueries')
export default class SlowQueries extends TableView {
  constructor() {
    super();
    this.section = 'Analytics';
    this.subsection = 'Slow Requests';

    let date = new Date();
    this.state = {
      slowQueries: [],
      pathOptions: [],
      statusOptions: [],
      methodOptions: [],
      loading: true,
      mutated: false,
      dateRange: {
        start: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 31
        ),
        end: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        )
      },
      className: undefined,
      os: undefined,
      version: undefined,
      method: undefined,
      path: undefined,
      respStatus: undefined,
      respTime: undefined
    };
    this.xhrHandles = [];
  }

  componentWillMount() {
    this.fetchDropdownData(this.props);
    this.fetchSlowQueries(this.context.currentApp);
  }

  componentWillUnmount() {
    this.xhrHandles.forEach(xhr => xhr.abort());
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.fetchDropdownData(nextProps);
      this.fetchSlowQueries(nextContext.currentApp);
    }
  }

  fetchDropdownData(props) {
    props.schema.dispatch(SchemaStore.ActionTypes.FETCH);
    let payload = {
      ...APP_VERSIONS_EXPLORER_QUERY,
      from: this.state.dateRange.start.getTime(),
      to: this.state.dateRange.end.getTime()
    };
    if (window.DEVELOPMENT) {
      payload.appID = 16155;
    }
    props.customQueries.dispatch(AnalyticsQueryStore.ActionTypes.FETCH, {
      query: {
        ...payload
      }
    });
  }

  fetchSlowQueries(app) {
    let { path, method, respStatus, respTime, dateRange } = this.state;

    this.setState({ loading: true }, () => {
      let { promise, xhr } = app.getAnalyticsSlowQueries({path, method, respStatus, respTime, from: dateRange.start, to: dateRange.end});
      let pathsResult = app.getAnalyticsSlowQueries({distinct: 'href', path, method, respStatus, respTime, from: dateRange.start, to: dateRange.end});
      let statusResult = app.getAnalyticsSlowQueries({distinct: 'statusCode', path, method, respStatus, respTime, from: dateRange.start, to: dateRange.end});
      let methodsResult = app.getAnalyticsSlowQueries({distinct: 'method', path, method, respStatus, respTime, from: dateRange.start, to: dateRange.end});
      promise.then(
        (result) => this.setState({ slowQueries: result && result.concat([[],[]]) || [] }),
        () => this.setState({ slowQueries: [] })
      );
      pathsResult.promise.then(
        result => this.setState({ pathOptions: result || [] }),
        () => this.setState({ pathOptions: [] })
      );
      statusResult.promise.then(
        result => this.setState({ statusOptions: result && result.map(r => `${r}`) || [] }),
        () => this.setState({ statusOptions: [] })
      );
      methodsResult.promise.then(
        result => this.setState({ methodOptions: result || [] }),
        () => this.setState({ methodOptions: [] })
      );
      Promise.all([promise, pathsResult.promise, statusResult.promise, methodsResult.promise])
        .finally(() => this.setState({ loading: false, mutated: false }))
      this.xhrHandles = [xhr, pathsResult.xhr, statusResult.xhr, methodsResult.xhr];
    });
  }

  handleDownload() {
    const csvDeclaration = 'data:text/csv;charset=utf-8,';
    let csvRows = [SLOW_QUERIES_HEADERS];
    csvRows = csvRows.concat(this.state.slowQueries);

    window.open(encodeURI(csvDeclaration + csvRows.join('\n')));
  }

  renderToolbar() {
    // Get app versions using Explorer endpoint
    // let queries = this.props.customQueries.data.get('queries') || [];
    // let appVersionExplorerQuery = queries.find((query) => query.localId === APP_VERSIONS_EXPLORER_QUERY.localId);
    // let appVersions = {};
    // if (appVersionExplorerQuery && appVersionExplorerQuery.result) {
    //   appVersionExplorerQuery.result.forEach((value) => {
    //     let os = value['OS'];
    //     let version = value['App Display Version'];
    //     if (os === null || version === null) return;
    //     if (appVersions.hasOwnProperty(os)) {
    //       appVersions[os].push(version);
    //     } else {
    //       appVersions[os] = [version];
    //     }
    //   });
    // }
    //
    // let osOptions = ['OS'];
    // if (Object.keys(appVersions) && Object.keys(appVersions).length > 0) {
    //   osOptions = Object.keys(appVersions);
    // }
    //
    // // Get class names using Schema endpoint
    // let classOptions = ['Class'];
    // let classList = this.props.schema.data.get('classes');
    // if (classList && !classList.isEmpty()) {
    //   classOptions = Object.keys(classList.toObject());
    // }

    let actions = null;
    if (!this.state.loading) {
      actions = (
        <div>
          <SlowQueriesFilter
            method={this.state.method}
            path={this.state.path}
            respStatus={this.state.respStatus}
            respTime={this.state.respTime}
            methodOptions={this.state.methodOptions}
            pathOptions={this.state.pathOptions}
            respStatusOptions={this.state.statusOptions}
            onChange={(newValue) => this.setState({
              ...newValue,
              mutated: true
            })} />
          <a
            href='javascript:;'
            role='button'
            onClick={this.handleDownload.bind(this)}
            className={styles.toolbarAction}>
            <Icon name='download' width={14} height={14} fill='#66637a' />
            Download
          </a>
        </div>
      );
    }

    return (
       <Toolbar
        section='Analytics'
        subsection='Slow Requests'>
        {actions}
      </Toolbar>
    );
  }

  renderHeaders() {
    return SLOW_QUERIES_HEADERS.map((header, index) => (
      <TableHeader key={header} width={TABLE_WIDTH[index]}>{header}</TableHeader>
    ));
  }

  tableData() {
    return this.state.slowQueries;
  }

  renderRow(query) {
    return (
      <tr key={query[0]}>
        {TABLE_WIDTH.map((width, index) => (
          <td key={'column_' + index} width={width + '%'}>{index === 1 ? formatQuery(query[index]) : query[index]}</td>
        ))}
      </tr>
    );
  }

  renderEmpty() {
    return (
      <EmptyState
        title='Slow Requests'
        description={'You haven\'t executed any queries.'}
        icon='gears'
        cta='Get started with Query'
        action={() => window.location = 'http://docs.parseplatform.org/rest/guide/#queries'} />
    );
  }

  renderExtras() {
    return (
      <FlowFooter
        borderTop='1px solid rgba(151, 151, 151, 0.27)'
        // secondary={(
        //   <span style={{ marginRight: '10px' }}>
        //     <DateRange
        //       value={this.state.dateRange}
        //       onChange={(newValue) => (this.setState({ dateRange: newValue, mutated: true }))}
        //       align={Directions.RIGHT} />
        //   </span>
        // )}
        primary={(
          <Button
            primary={true}
            disabled={!this.state.mutated}
            onClick={this.fetchSlowQueries.bind(this, this.context.currentApp)}
            value='Run query' />
        )}
        />
    );
  }
}
