/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import keyMirror         from 'lib/keyMirror';
import Parse             from 'parse';
import { Map, List }     from 'immutable';
import { registerStore } from 'lib/stores/StoreManager';

export const ActionTypes = keyMirror([
  'FETCH',
  'CREATE',
  'EDIT',
  'DELETE'
]);

// Jobs state should be an Immutable Map with the following fields:
//   - lastFetch: the last time all data was fetched from the server
//   - jobs: An Immutable Map of schedule ids to Maps of job details

function JobsStore(state, action) {
  let path = '';
  switch (action.type) {
    case ActionTypes.FETCH:
      if (state && new Date() - state.get('lastFetch') < 60000) {
        return Parse.Promise.as(state);
      }
      path = `cloud_code/jobs?per_page=50`;
      return Parse._request('GET', path, {}, { useMasterKey: true}).then((results) => {
        return Map({ lastFetch: new Date(), jobs: List(results) });
      });
    case ActionTypes.CREATE:
      path = `cloud_code/jobs`;
      return Parse._request('POST', path, action.schedule, {useMasterKey: true}).then((result) => {
        let { ...schedule } = action.schedule.job_schedule;
        schedule.objectId = result.objectId;
        schedule.startAfter = schedule.startAfter || new Date().toISOString();
        return state.set('jobs', state.get('jobs').push(schedule));
      });
    case ActionTypes.EDIT:
      path = `cloud_code/jobs/${action.jobId}`;
      return Parse._request('PUT', path, action.updates, {useMasterKey: true}).then(() => {
        let index = state.get('jobs').findIndex((j) => j.objectId === action.jobId);
        let current = state.get('jobs').get(index);
        let { ...update } = action.updates.job_schedule;
        update.objectId = current.objectId;
        update.timeOfDay = update.timeOfDay || current.timeOfDay;
        return state.set('jobs', state.get('jobs').set(index, update));
      });
    case ActionTypes.DELETE:
      path = `cloud_code/jobs/${action.jobId}`;
      return Parse._request('DELETE', path, {}, {useMasterKey: true}).then(() => {
        let index = state.get('jobs').findIndex((j) => j.objectId === action.jobId);
        return state.set('jobs', state.get('jobs').delete(index));
      }, () => {
        return state;
      });
  }
}

registerStore('Jobs', JobsStore);
