/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import keyMirror         from 'lib/keyMirror';
import Parse             from 'parse';
import { Map, List }           from 'immutable';
import { registerStore } from 'lib/stores/StoreManager';

export const ActionTypes = keyMirror(['FETCH', 'CREATE', 'EDIT', 'DELETE']);


// Webhook state should be an Immutable Map with the following fields:
//   - lastFetch: the last time all data was fetched from the server
//   - hooks: An Immutable List of hooks

function WebhookStore(state, action) {
  action.app.setParseKeys();
  switch (action.type) {
    case ActionTypes.FETCH:
      let functionsPromise = Parse._request(
        'GET',
        'hooks/functions',
        {},
        { useMasterKey: true }
      );
      let triggersPromise = Parse._request(
        'GET',
        'hooks/triggers',
        {},
        { useMasterKey: true }
      );
      return Promise.all([functionsPromise, triggersPromise]).then((
        [functions,
        triggers]
      ) => {
        return Map({ lastFetch: new Date(), webhooks: List(functions.concat(triggers))});
      });
    case ActionTypes.CREATE:
      let addHookToStore = hook => state.set('webhooks', state.get('webhooks').push(hook));
      if (action.functionName !== undefined) {
        return Parse._request(
          'POST',
          'hooks/functions',
          {
            functionName: action.functionName,
            url: action.hookURL,
          },
          { useMasterKey: true }
        ).then(addHookToStore);
      } else {
        return Parse._request(
          'POST',
          'hooks/triggers',
          {
            triggerName: action.triggerName,
            className: action.triggerClass,
            url: action.hookURL,
          },
          { useMasterKey: true }
        ).then(addHookToStore);
      }
    case ActionTypes.EDIT:
      if (action.functionName !== undefined) {
        return Parse._request(
          'PUT',
          'hooks/functions/' + action.functionName,
          {
            url: action.hookURL,
          },
          { useMasterKey: true }
        ).then((hook) => {
          let index = state.get('webhooks').findIndex(existingHook => existingHook.functionName === hook.functionName);
          return state.setIn(['webhooks', index], hook);
        })
      } else {
        return Parse._request(
          'PUT',
          'hooks/triggers/' + action.triggerClass + '/' + action.triggerName,
          {
            url: action.hookURL,
          },
          { useMasterKey: true }
        ).then(hook => {
          let index = state.get('webhooks').findIndex(existingHook =>
            existingHook.className === hook.className && existingHook.triggerName === hook.triggerName
          );
          return state.setIn(['webhooks', index], hook);
        });
      }
    case ActionTypes.DELETE:
      if (action.functionName !== undefined) {
        return Parse._request(
          'PUT',
          'hooks/functions/' + action.functionName,
          { __op: 'Delete' },
          { useMasterKey: true }
        ).then(() => {
          return state.set('webhooks', state.get('webhooks').filter(existingHook => existingHook.functionName != action.functionName));
        });
      } else {
        return Parse._request(
          'PUT',
          'hooks/triggers/' + action.triggerClass + '/' + action.triggerName,
          { __op: 'Delete' },
          { useMasterKey: true }
        ).then(() => {
          return state.set('webhooks', state.get('webhooks').filter(existingHook =>
            !(existingHook.className === action.triggerClass && existingHook.triggerName == action.triggerName)
          ));
        });
      }
  }
}

registerStore('Webhooks', WebhookStore);
