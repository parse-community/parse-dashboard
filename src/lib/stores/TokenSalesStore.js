import keyMirror from 'lib/keyMirror';
import Parse from 'parse';
import { Map, List } from 'immutable';
import { registerStore } from 'lib/stores/StoreManager';
import notification from 'lib/notification';

export const ActionTypes = keyMirror(['FETCH', 'CREATE', 'EDIT']);

const parseURL = 'classes/TokenSale';

function normalifyData({
    name,
    conntent,
}) {
    return {
        name: name || '',
        code: conntent || '',
    };
}

export function TokenSalesStore(state, action) {
    action.app.setParseKeys();
    switch (action.type) {
        case ActionTypes.FETCH:
            return Parse._request('GET', parseURL, {}, {}).then(({ results }) => {
                return Map({
                    lastFetch: new Date(),
                    tokenSales: List(results),
                });
            });
        case ActionTypes.CREATE:
            const newData = normalifyData(action);
            return Parse._request('POST', parseURL, newData, {
                useMasterKey: true,
            }).then(({ objectId }) => {
                if (objectId) {
                    notification('success', 'Successfully Created!');
                    return state.set('tokenSales', state.get('tokenSales').push({ ...newData, objectId }));
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
                        .get('tokenSales')
                        .findIndex((item) => item.objectId === action.objectId);
                    return state.setIn(['tokenSales', index], { ...updatedData, objectId: action.objectId });
                }
                return state;
            });
        default:
            return state;
    }
}

registerStore('TokenSales', TokenSalesStore);
