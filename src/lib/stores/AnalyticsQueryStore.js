/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { get, post, put } from 'lib/AJAX';
import keyMirror          from 'lib/keyMirror';
import { Map }            from 'immutable';
import { registerStore }  from 'lib/stores/StoreManager';

const LABEL_TO_KEY_MAPPING = {
  // Display Type
  'chart'               : 'time_series',
  'table'               : 'table',
  'json'                : 'raw',

  // Source
  'API Event'           : 'parse_api_events',
  'Custom Event'        : 'parse_custom_events',

  // Column
  'Request Type'        : 'op',
  'Class'               : 'collection_name',
  'Event Name'          : 'event',
  'Dimensions'          : 'dimensions',
  'Installation ID'     : 'installation_id',
  'Parse User ID'       : 'parseuser_id',
  'Parse SDK'           : 'parse_sdk',
  'Parse SDK Version'   : 'parse_sdk_version',
  'OS'                  : 'os',
  'OS Version'          : 'os_version',
  'App Build Version'   : 'app_build_version',
  'App Display Version' : 'app_display_version',
  'Timestamp (s)'       : 'event_time',
  'Latency (s)'         : 'duration',

  // Aggregate
  'Count'               : 'count',
  // TODO (hallucinogen): wtf is this countDistinct. It's not consistent with our current naming.
  // Let's make it consistent after we deprecate old explorer
  'Count Distinct'      : 'countDistinct',
  'Sum'                 : 'sum',
  'Minimum'             : 'min',
  'Median'              : 'median',
  '99th Percentile'     : 'p99',
  'Average'             : 'avg',

  // Grouping
  'Time (day)'          : 'day',
  'Time (hour)'         : 'hour',

  // Order
  'Ascending'           : true,
  'Descending'          : false
};

// This is basically a const, but it's not declared inline.
let KEY_TO_LABEL_MAPPING = {};
for (let key in LABEL_TO_KEY_MAPPING) {
  KEY_TO_LABEL_MAPPING[LABEL_TO_KEY_MAPPING[key]] = key;
}

const LAST_FETCH_TIMEOUT = 60000;

let queryToPayload = (query) => {
  let payload = {
    sources: [LABEL_TO_KEY_MAPPING[query.source]],
    enabled: query.enabled,
    type: LABEL_TO_KEY_MAPPING[query.type],
    from: query.from,
    to: query.to
  }
  if (query.limit) {
    payload.limit = query.limit;
  }
  if (query.aggregates && query.aggregates.length > 0) {
    payload.aggregates = query.aggregates.map(({col, op}) => ({
      col: LABEL_TO_KEY_MAPPING[col],
      op: LABEL_TO_KEY_MAPPING[op]
    }));
  }
  if (query.groups && query.groups.length > 0) {
    payload.groups = query.groups.map((group) => LABEL_TO_KEY_MAPPING[group]);
  }
  if (query.filters && query.filters.length > 0) {
    payload.filters = query.filters.map(({col, op, val}) => ({
      col: LABEL_TO_KEY_MAPPING[col],
      op,
      val
    }));
  }
  if (query.orders && query.orders.length > 0) {
    payload.orders = query.orders.map(({col, asc}) => ({
      col,
      asc: LABEL_TO_KEY_MAPPING[asc]
    }));
  }
  if (query.objectId) {
    payload.objectId = query.objectId;
  }
  if (query.localId) {
    payload.localId = query.localId;
  }
  if (window.DEVELOPMENT) {
    payload.appID = 16155;
  }

  return payload;
};

let payloadToQuery = (payload) => {
  let query = {
    name: payload.name,
    source: KEY_TO_LABEL_MAPPING[payload.sources[0]],
    enabled: payload.enabled,
    type: KEY_TO_LABEL_MAPPING[payload.type]
  };
  if (payload.limit) {
    query.limit = payload.limit;
  }
  if (payload.aggregates) {
    query.aggregates = payload.aggregates.map(({col, op}) => ({
      col: KEY_TO_LABEL_MAPPING[col],
      op: KEY_TO_LABEL_MAPPING[op]
    }));
  }
  if (payload.groups) {
    query.groups = payload.groups.map((group) => KEY_TO_LABEL_MAPPING[group]);
  }
  if (payload.filters) {
    query.filters = payload.filters.map(({col, op, val}) => ({
      col: KEY_TO_LABEL_MAPPING[col],
      op,
      val
    }));
  }
  if (payload.orders) {
    query.orders = payload.orders.map(({col, asc}) => ({
      col,
      asc: KEY_TO_LABEL_MAPPING[asc]
    }));
  }
  if (payload.objectId) {
    query.objectId = payload.objectId;
  }
  if (payload.localId) {
    query.localId = payload.localId;
  }

  return query;
};

export const ActionTypes = keyMirror([
  'LIST',
  'LIST_RECENT',
  'FETCH',
  'CREATE',
  'UPDATE',
  'DELETE',
]);

// AnalyticsQueryStore state should be an Immutable Map with the following fields:
//   - lastFetch: the last time all data was fetched from the server
//   - queries: An Immutable Map of analytics queries

function AnalyticsQueryStore(state, action) {
  action.app.setParseKeys();
  let urlPrefix = `/apps/${action.app.slug}/explorer`;

  switch (action.type) {
    case ActionTypes.LIST:
    case ActionTypes.LIST_RECENT:
      if (state && new Date() - state.get('lastFetch') < LAST_FETCH_TIMEOUT) {
        return Promise.resolve(state);
      }
      let type = null;
      if (action.type === ActionTypes.LIST) {
        type = 'saved';
      } else {
        type = 'recent';
      }
      return get(`${urlPrefix}/more?type=${type}&skip=0`).then((results) => {
        let queries = {};
        if (results) {
          results.forEach((payload) => {
            queries[payload.objectId] = payloadToQuery(payload);
          });
        }
        return Map({ lastFetch: new Date(), queries: Map(queries) });
      });
    case ActionTypes.FETCH:
    case ActionTypes.CREATE:
      return post(urlPrefix, queryToPayload(action.query)).then((result) => {
        result.objectId = result.id;

        let realResult = result[LABEL_TO_KEY_MAPPING[action.query.source]];
        return state.setIn(['queries', result.id], { ...action.query, result: realResult });
      });
    case ActionTypes.UPDATE:
      return put(`${urlPrefix}/${action.query.objectId}`, queryToPayload(action.query)).then(() => {
        return state.setIn(['queries', action.query.objectId], action.query);
      });
    case ActionTypes.DELETE:
      return put(`${urlPrefix}/${action.query.objectId}`, { isSaved: false }).then(() => {
        return state.deleteIn(['queries', action.query.objectId]);
      });
  }
}

registerStore('AnalyticsQuery', AnalyticsQueryStore);
