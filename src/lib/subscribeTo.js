/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import * as StoreManager from 'lib/stores/StoreManager';
import { CurrentApp } from 'context/currentApp';

export default function subscribeTo(name, prop) {
  return function(Component) {
    const store = StoreManager.getStore(name);
    const displayName = Component.displayName || Component.name || 'Component';

    function SubscribedComponent(props) {
      const currentApp = React.useContext(CurrentApp);
      const [data, setData] = React.useState(store.getData(currentApp));

      React.useEffect(() => {
        setData(store.getData(currentApp));
      }, [currentApp]);

      React.useEffect(() => {
        const handleNewData = (newData) => {
          if (data !== newData) {
            setData(newData);
          }
        }

        const subscriptionId = store.subscribe(handleNewData);

        return () => {
          store.unsubscribe(subscriptionId);
        }
      }, [])

      let dispatch = (type, params={}) => {
        if (store.isGlobal) {
          return store.dispatch(type, params);
        }
        return store.dispatch(type, params, currentApp);
      };

      let extras = {
        [prop]: {
          data,
          dispatch,
        }
      };

      return <Component {...props} {...extras} />;
    }

    SubscribedComponent.displayName = `subscribeTo(${displayName})`;

    // In case you need to add static properties to the original Component
    SubscribedComponent.original = Component;

    return SubscribedComponent;
  };
}
