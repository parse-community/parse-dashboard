/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import keyMirror         from 'lib/keyMirror';
import Parse             from 'parse';
import { Map }           from 'immutable';
import { registerStore } from 'lib/stores/StoreManager';

export const ActionTypes = keyMirror(['FETCH', 'SET', 'DELETE']);


// Config state should be an Immutable Map with the following fields:
//   - lastFetch: the last time all data was fetched from the server
//   - params: An Immutable Map of parameter strings to values
//   - masterKeyOnly: An Immutable Map of parameter properties for read with master key only

function ConfigStore(state, action) {
  action.app.setParseKeys();
  switch (action.type) {
    case ActionTypes.FETCH:
      return Parse._request(
        'GET',
        'config',
        {},
        { useMasterKey: true }
      ).then((result) => {
        return Map({ lastFetch: new Date(), params: Map(result.params), masterKeyOnly: Map(result.masterKeyOnly) });
      });
    case ActionTypes.SET:
      return Parse._request(
        'PUT',
        'config',
        { params: { [action.param]: Parse._encode(action.value) }, masterKeyOnly: { [action.param]: action.masterKeyOnly} },
        { useMasterKey: true }
      ).then(() => {
        return state
        .setIn(['params', action.param], action.value)
        .setIn(['masterKeyOnly', action.param], action.masterKeyOnly);
      });
    case ActionTypes.DELETE:
      return Parse._request(
        'PUT',
        'config',
        { params: { [action.param]: { __op: 'Delete' } }, masterKeyOnly: { [action.param]: { __op: 'Delete' } } },
        { useMasterKey: true }
      ).then(() => {
        return state.deleteIn(['params', action.param]);
      });
  }
}

registerStore('Config', ConfigStore);
