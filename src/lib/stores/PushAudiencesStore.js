/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import keyMirror          from 'lib/keyMirror';
import Parse              from 'parse';
import { List, Map }      from 'immutable';
import { registerStore }  from 'lib/stores/StoreManager';

export const ActionTypes = keyMirror(['FETCH', 'CREATE', 'DESTROY', 'ABORT_FETCH']);

const LASTFETCHTIMEOUT = 60000;
// Audience state should be an Immutable Map with the following fields:
//   - lastFetch: the last time all data was fetched from the server
//   - audiences: An Immutable List of audiences
//   - showMore: Flag to show/hide button to fetch all audiences

// xhr map, key value pair of xhrKey, xhr reference

function PushAudiencesStore(state, action) {
  action.app.setParseKeys();
  switch (action.type) {
    case ActionTypes.FETCH:
      if (state && new Date() - state.get('lastFetch') < LASTFETCHTIMEOUT) { //check for stale store
        if (state.get('audiences') && state.get('audiences').size >= (action.min || 0)) { //check for valid audience size
          return Promise.resolve(state);
        }
      }
      const path = action.limit ? `push_audiences?limit=${action.limit}` : 'push_audiences';
      const promise = Parse._request('GET', path, {}, { useMasterKey: true });

      return promise.then(({ results, showMore }) => {
        return Map({ lastFetch: new Date(), audiences: List(results), showMore: showMore});
      });
    case ActionTypes.CREATE:
      return Parse._request('POST', 'push_audiences', { query: action.query, name: action.name, }, { useMasterKey: true })
          .then(({ new_audience }) => {
            return state.update('audiences',(audiences) => {
              return audiences.unshift({
                createdAt: new Date(),
                name: action.name,
                objectId: new_audience ? new_audience.objectId || -1 : -1,
                count: 0,
                query: JSON.parse(action.query),
              });
            });
          });
    case ActionTypes.DESTROY:
      return Parse._request('DELETE', `push_audiences/${action.objectId}`, {}, { useMasterKey: true })
          .then(() => {
            return state.update('audiences',(audiences) => {
              let index = audiences.findIndex(function(audience) {
                return audience.objectId === action.objectId;
              });
              return audiences.delete(index);
            });
          });
    case ActionTypes.ABORT_FETCH:
      return Promise.resolve(state);
  }
}

registerStore('PushAudiences', PushAudiencesStore);
