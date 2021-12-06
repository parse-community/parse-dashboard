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

const SLOW_QUERIES_HEADERS = ['Class', 'Normalized Query', 'Count', 'Slow%', 'Timeouts', 'Scanned (Avg)', 'Median (ms)', 'P90 (ms)'];
const TABLE_WIDTH = [15, 25, 7, 8, 10, 15, 11, 9];

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

export default
@subscribeTo('Schema', 'schema')
@subscribeTo('AnalyticsQuery', 'customQueries')
class SlowQueries extends TableView {
  constructor() {
    super();
    this.section = 'Analytics';
    this.subsection = 'Slow Queries';

    let date = new Date();
    this.state = {
      slowQueries: [],
      loading: true,
      mutated: false,
      dateRange: {
        start: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 1
        ),
        end: date
      },
      className: undefined,
      os: undefined,
      version: undefined
    };
    this.xhrHandles = [];
  }

  componentWillMount() {
    this.fetchDropdownData(this.props);
    this.fetchSlowQueries(this.context);
  }

  componentWillUnmount() {
    this.xhrHandles.forEach(xhr => xhr.abort());
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.fetchDropdownData(nextProps);
      this.fetchSlowQueries(nextContext);
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
    let { className, os, version, dateRange } = this.state;

    this.setState({ loading: true }, () => {
      let { promise, xhr } = app.getAnalyticsSlowQueries(className, os, version, dateRange.start, dateRange.end);
      promise.then(
        (result) => this.setState({ slowQueries: result || [], loading: false, mutated: false }),
        () => this.setState({ slowQueries: [], loading: false, mutated: false })
      );
      this.xhrHandles = [xhr];
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
    let queries = this.props.customQueries.data.get('queries') || [];
    let appVersionExplorerQuery = queries.find((query) => query.localId === APP_VERSIONS_EXPLORER_QUERY.localId);
    let appVersions = {};
    if (appVersionExplorerQuery && appVersionExplorerQuery.result) {
      appVersionExplorerQuery.result.forEach((value) => {
        let os = value['OS'];
        let version = value['App Display Version'];
        if (os === null || version === null) return;
        if (Object.prototype.hasOwnProperty.call(appVersions, os)) {
          appVersions[os].push(version);
        } else {
          appVersions[os] = [version];
        }
      });
    }

    let osOptions = ['OS'];
    if (Object.keys(appVersions) && Object.keys(appVersions).length > 0) {
      osOptions = Object.keys(appVersions);
    }

    // Get class names using Schema endpoint
    let classOptions = ['Class'];
    let classList = this.props.schema.data.get('classes');
    if (classList && !classList.isEmpty()) {
      classOptions = Object.keys(classList.toObject());
    }

    let actions = null;
    if (!this.state.loading) {
      actions = (
        <div>
          <SlowQueriesFilter
            className={this.state.className}
            os={this.state.os}
            version={this.state.version}
            classNameOptions={classOptions}
            osOptions={osOptions}
            versionOptions={appVersions[this.state.os] || ['Version']}
            onChange={(newValue) => this.setState({
              ...newValue,
              mutated: true
            })} />
          <button
            type='button'
            onClick={this.handleDownload.bind(this)}
            className={styles.toolbarAction}>
            <Icon name='download' width={14} height={14} fill='#66637a' />
            Download
          </button>
        </div>
      );
    }

    return (
       <Toolbar
        section='Analytics'
        subsection='Slow Queries'>
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
      <tr key={query[1]}>
        {TABLE_WIDTH.map((width, index) => (
          <td key={'column_' + index} width={width + '%'}>{index === 1 ? formatQuery(query[index]) : query[index]}</td>
        ))}
      </tr>
    );
  }

  renderEmpty() {
    return (
      <EmptyState
        title='Slow Queries'
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
        secondary={(
          <span style={{ marginRight: '10px' }}>
            <DateRange
              value={this.state.dateRange}
              onChange={(newValue) => (this.setState({ dateRange: newValue, mutated: true }))}
              align={Directions.RIGHT} />
          </span>
        )}
        primary={(
          <Button
            primary={true}
            disabled={!this.state.mutated}
            onClick={this.fetchSlowQueries.bind(this, this.context)}
            value='Run query' />
        )}
        />
    );
  }
}
