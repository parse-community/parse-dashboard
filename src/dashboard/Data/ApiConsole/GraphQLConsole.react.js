/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { Component } from 'react';
import { GraphiQL } from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import styles from 'dashboard/Data/ApiConsole/ApiConsole.scss';
import { CurrentApp } from 'context/currentApp';

export default class GraphQLConsole extends Component {
  static contextType = CurrentApp;

  // Build (and memoize) the fetcher so re-renders don't recreate it. The static
  // parseHeaders are injected on every request by createGraphiQLFetcher; Accept
  // and Content-Type: application/json are set automatically.
  getFetcher(graphQLServerURL, parseHeaders) {
    const key = `${graphQLServerURL}:${JSON.stringify(parseHeaders)}`;
    if (this._fetcherKey !== key) {
      this._fetcherKey = key;
      this._fetcher = createGraphiQLFetcher({ url: graphQLServerURL, headers: parseHeaders });
    }
    return this._fetcher;
  }

  render() {
    const { applicationId, clientKey, graphQLServerURL, masterKey } = this.context;
    let content;
    if (!graphQLServerURL) {
      content = (
        <div className={styles.empty}>
          <EmptyState
            title="GraphQL API Console"
            description='Please update Parse-Server to version equal or above
            3.5.0 and define the "graphQLServerURL" on your app configuration
            in order to use the GraphQL API Console.'
            icon="info-solid"
          />
        </div>
      );
    } else {
      const parseHeaders = {
        'X-Parse-Application-Id': applicationId,
        'X-Parse-Master-Key': masterKey,
      };
      if (clientKey) {
        parseHeaders['X-Parse-Client-Key'] = clientKey;
      }
      content = (
        <GraphiQL
          fetcher={this.getFetcher(graphQLServerURL, parseHeaders)}
          initialHeaders={JSON.stringify(parseHeaders, null, 2)}
        />
      );
    }

    return (
      <>
        <Toolbar section="Core" subsection="GraphQL API Console" />
        <div className={styles.content}>{content}</div>
      </>
    );
  }
}
