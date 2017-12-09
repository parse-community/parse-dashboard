import keyMirror         from 'lib/keyMirror';
import Parse             from 'parse';
import { Map, List }     from 'immutable';
import { registerStore } from 'lib/stores/StoreManager';

export const ActionTypes = keyMirror([
  'FETCH'
]);
  
// Apps state should be an Immutable Map with the following fields:
//   - lastFetch: the last time all data was fetched from the server
//   - apps: An Immutable Map of schedule ids to Maps of apps details

function AppsStore(state, action) {
  switch (action.type) {
    case ActionTypes.FETCH:
      console.log('AppsStore:FETCH');
  }
}

registerStore('Apps', AppsStore);