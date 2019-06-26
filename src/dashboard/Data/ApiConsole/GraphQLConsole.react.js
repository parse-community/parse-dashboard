/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ParseApp      from 'lib/ParseApp';
import PropTypes     from 'lib/PropTypes';
import React, { Component } from 'react';
import { Provider } from 'react-redux'
import { Playground, store } from 'graphql-playground-react';

export default class GraphQLConsole extends Component {
  render() {
    const { applicationId, graphQLServerURL, masterKey } = this.context.currentApp
    const headers = {
      'X-Parse-Application-Id': applicationId,
      'X-Parse-Master-Key': masterKey
    }
    return (
      <Provider store={store}>
        <Playground endpoint={graphQLServerURL} headers={headers} />
      </Provider>
    );
  }
}

GraphQLConsole.contextTypes = {
  currentApp: PropTypes.instanceOf(ParseApp)
};
