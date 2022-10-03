/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import keyMirror from 'lib/keyMirror';
import Parse from 'parse';
import { Map, List } from 'immutable';
import { registerStore } from 'lib/stores/StoreManager';

export const ActionTypes = keyMirror(['FETCH', 'CREATE', 'EDIT', 'DELETE']);

const parseURL = 'classes/Code';

function normalifyData({ triggerName, triggerClass, functionName, hookURL }) {
  return {
    triggerName: triggerName || '',
    collectionName: triggerClass || '',
    functionName: functionName || '',
    url: hookURL || '',
  };
}

function CodeStore(state, action) {
  action.app.setParseKeys();
  switch (action.type) {
    case ActionTypes.FETCH:
      return Parse._request('GET', parseURL, {}, {}).then(({ results }) => {
        return Map({
          lastFetch: new Date(),
          code: List(results),
        });
      });
    case ActionTypes.CREATE:
      const newData = normalifyData(action);
      return Parse._request('POST', parseURL, newData, {
        useMasterKey: true,
      }).then(({ objectId }) => {
        if (objectId) return state.set('code', state.get('code').push(newData));
        return state;
      });
    case ActionTypes.EDIT:
      if (action.objectId === undefined) return state;
      const updatedData = normalifyData(action);
      return Parse._request(
        'PUT',
        `${parseURL}/${action.objectId}`,
        updatedData,
        {
          useMasterKey: true,
        }
      ).then(({ updatedAt }) => {
        if (updatedAt) {
          const index = state
            .get('code')
            .findIndex((item) => item.objectId === action.objectId);
          return state.setIn(['code', index], updatedData);
        }
        return state;
      });
    case ActionTypes.DELETE:
      if (action.objectId === undefined) return state;
      return Parse._request(
        'DELETE',
        `${parseURL}/${action.objectId}`,
        {},
        {
          useMasterKey: true,
        }
      ).then(({ error }) => {
        if (! error)
          return state.set('code', state.get('code').filter((item) => !(item.objectId === action.objectId)));
        return state;
      });
  }
}

registerStore('Code', CodeStore);
