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
import notification from 'lib/notification';

export const ActionTypes = keyMirror(['FETCH', 'CREATE', 'EDIT', 'DELETE']);

const parseURL = 'classes/Page';

function normalifyData({
  name,
  content,
}) {
  return {
    name: name || '',
    code: content || '',
  };
}

function PageStore(state, action) {
  action.app.setParseKeys();
  switch (action.type) {
    case ActionTypes.FETCH:
      return Parse._request('GET', parseURL, {}, {}).then(({ results }) => {
        return Map({
          lastFetch: new Date(),
          page: List(results),
        });
      });
    case ActionTypes.CREATE:
      const newData = normalifyData(action);
      return Parse._request('POST', parseURL, newData, {
        useMasterKey: true,
      }).then(({ objectId }) => {
        if (objectId) {
          notification('success', 'Successfully Created!');
          return state.set('page', state.get('page').push({ ...newData, objectId }));
        }
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
          notification('success', 'Successfully Updated!');
          const index = state
            .get('page')
            .findIndex((item) => item.objectId === action.objectId);
          return state.setIn(['page', index], { ...updatedData, objectId: action.objectId });
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
        if (!error) {
          notification('success', 'Successfully Removed!');
          return state.set('page', state.get('page').filter((item) => !(item.objectId === action.objectId)));
        }
        return state;
      });
  }
}

registerStore('Page', PageStore);
