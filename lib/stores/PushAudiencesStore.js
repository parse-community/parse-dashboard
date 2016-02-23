/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { abortableGet, post, del } from 'lib/AJAX';
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
let xhrMap = {};

function PushAudiencesStore(state, action) {
  action.app.setParseKeys();
  let urlPrefix = `/apps/${action.app.slug}/dashboard_ajax/push_audiences`;
  let legacyUrlPrefix = `/apps/${action.app.slug}/push_audiences`;
  switch (action.type) {
    case ActionTypes.FETCH:
      if (state && new Date() - state.get('lastFetch') < LASTFETCHTIMEOUT) { //check for stale store
        if (state.get('audiences') && state.get('audiences').size >= (action.min || 0)) { //check for valid audience size
          return Parse.Promise.as(state);
        }
      }
      let {xhr, promise} = abortableGet(action.limit ? urlPrefix + `?audience_limit=${action.limit}` : urlPrefix, action.xhrKey !== null);
      xhrMap[action.xhrKey] = xhr;
      return promise.then(({ audiences, showMore }) => {
        return Map({ lastFetch: new Date(), audiences: List(audiences) , showMore: showMore});
      });
    case ActionTypes.CREATE:
      return post(legacyUrlPrefix, {
        query: action.query,
        name: action.name,
      }).then(({ new_audience }) => {
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
      return del(legacyUrlPrefix + `/${action.objectId}`).then(() => {
        return state.update('audiences',(audiences) => {
          let index = audiences.findIndex(function(audience) {
            return audience.objectId === action.objectId;
          });
          return audiences.delete(index);
        });
      });
    case ActionTypes.ABORT_FETCH:
      let xhrKey = action.xhrKey;
      if (xhrMap[xhrKey]) {
        xhrMap[xhrKey].abort();
      }
      return Parse.Promise.as(state);
  }
}

registerStore('PushAudiences', PushAudiencesStore);
