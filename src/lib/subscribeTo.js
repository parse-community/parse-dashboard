/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { AppContext } from '../dashboard/AppData.react';
import React from 'react';
import * as StoreManager from 'lib/stores/StoreManager';

export default function subscribeTo(name, prop) {
  return function(Component) {
    const store = StoreManager.getStore(name);
    const displayName = Component.displayName || Component.name || 'Component';

    class SubscribedComponent extends React.Component {
      state = {
        data: {}
      }

      handleNewData(data) {
        if (this.state.data !== data) {
          this.setState({ data });
        }
      }

      componentDidMount() {
        this.subscriptionId = store.subscribe(this.handleNewData.bind(this));
      }

      componentWillUnmount() {
        store.unsubscribe(this.subscriptionId);
      }

      render() {
        const dispatch = (type, params={}) => {
          if (store.isGlobal) {
            return store.dispatch(type, params);
          }
          return store.dispatch(type, params, this.context.currentApp);
        };
        const data = store.getData(this.context.currentApp);
        const extras = {
          [prop]: {
            data: data,
            dispatch: dispatch,
          }
        };
        return <Component {...this.props} {...extras} />;
      }
    }

    SubscribedComponent.displayName = `subscribeTo(${displayName})`;
    SubscribedComponent.contextType = AppContext;

    // In case you need to add static properties to the original Component
    SubscribedComponent.original = Component;

    return SubscribedComponent;
  };
}
