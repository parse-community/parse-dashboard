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

export const ActionTypes = keyMirror([
  'FETCH',
  'CREATE_CLASS',
  'DROP_CLASS',
  'ADD_COLUMN',
  'DROP_COLUMN',
  'SET_CLP',
]);

// Schema state should be an Immutable Map with the following fields:
//   - lastFetch: the last time all data was fetched from the server
//   - classes: An Immutable Map of class names to Maps of column => type
//   - CLPs: An Immutable Map of class names to CLPs

function SchemaStore(state, action) {
  switch (action.type) {
    case ActionTypes.FETCH:
      if (state && new Date() - state.get('lastFetch') < 60000) {
        return Parse.Promise.as(state);
      }
      return action.app.apiRequest(
        'GET',
        'schemas',
        {},
        { useMasterKey: true }
      ).then(({ results }) => {
        let classes = {};
        let CLPs = {};
        if (results) {
          results.forEach(({ className, fields, classLevelPermissions }) => {
            classes[className] = Map(fields);
            CLPs[className] = Map(classLevelPermissions);
          });
        }
        return Map({
          lastFetch: new Date(),
          classes: Map(classes),
          CLPs: Map(CLPs),
        });
      });
    case ActionTypes.CREATE_CLASS:
      return action.app.apiRequest(
        'POST',
        'schemas/' + action.className,
        { className: action.className },
        { useMasterKey: true }
      ).then(({ fields }) => {
        return state
        .setIn(['classes', action.className], Map(fields))
        .setIn(['CLPs', action.className], Map({}));
      });
    case ActionTypes.DROP_CLASS:
      return action.app.apiRequest(
        'DELETE',
        'schemas/' + action.className,
        {},
        { useMasterKey: true }
      ).then(() => {
        return state
        .deleteIn(['classes', action.className])
        .deleteIn(['CLPs', action.className]);
      });
    case ActionTypes.ADD_COLUMN:
      let newField = {
        [action.name]: {
          type: action.columnType
        }
      };
      if (action.columnType === 'Pointer' || action.columnType === 'Relation') {
        newField[action.name].targetClass = action.targetClass;
      }
      return action.app.apiRequest(
        'PUT',
        'schemas/' + action.className,
        { className: action.className, fields: newField },
        { useMasterKey: true }
      ).then(({ fields }) => {
        return state.setIn(['classes', action.className], Map(fields));
      });
    case ActionTypes.DROP_COLUMN:
      let droppedField = {
        [action.name]: {
          __op: 'Delete'
        }
      };
      return action.app.apiRequest(
        'PUT',
        'schemas/' + action.className,
        { className: action.className, fields: droppedField },
        { useMasterKey: true }
      ).then(({ fields }) => {
        return state.setIn(['classes', action.className], Map(fields));
      });
    case ActionTypes.SET_CLP:
      return action.app.apiRequest(
        'PUT',
        'schemas/' + action.className,
        { classLevelPermissions: action.clp },
        { useMasterKey: true }
      ).then(({ classLevelPermissions, className }) => {
        return state.setIn(['CLPs', className], Map(classLevelPermissions));
      });
  }
}

registerStore('Schema', SchemaStore);
