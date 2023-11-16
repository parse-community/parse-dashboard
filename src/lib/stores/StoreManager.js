/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as StateManager from 'lib/stores/StateManager';

const stores = {};
let subCount = 0;

export function registerStore(name, store, isGlobal) {
  if (stores[name]) {
    throw new Error('Conflict! Attempted to register multiple stores with the name ' + name);
  }

  stores[name] = {
    store: store,
    subscribers: {},
    isGlobal: !!isGlobal,
  };
}

export function getStore(name) {
  const storeData = stores[name];
  if (!storeData) {
    throw new Error('Unknown store! Attempted to retrieve store with the name ' + name);
  }

  const stateGetter = storeData.isGlobal ? StateManager.getGlobalState : StateManager.getAppState;

  return {
    getData: stateGetter.bind(null, name),
    isGlobal: storeData.isGlobal,
    dispatch(type, params, app) {
      const action = { ...params, type, app };
      const newState = storeData.store(stateGetter(name, app), action);
      if (newState instanceof Promise) {
        return newState.then(result => {
          if (storeData.isGlobal) {
            StateManager.setGlobalState(name, result);
          } else {
            StateManager.setAppState(name, app, result);
          }
          for (const id in storeData.subscribers) {
            storeData.subscribers[id](result);
          }
        });
      } else {
        if (storeData.isGlobal) {
          StateManager.setGlobalState(name, newState);
        } else {
          StateManager.setAppState(name, app, newState);
        }
        for (const id in storeData.subscribers) {
          storeData.subscribers[id](newState);
        }
      }
    },
    subscribe(cb) {
      const id = 'sub' + subCount++;
      storeData.subscribers[id] = cb;
      return id;
    },
    unsubscribe(id) {
      delete storeData.subscribers[id];
    },
  };
}
