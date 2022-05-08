/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { Component } from 'react';
import GraphiQL from 'graphiql';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import styles from 'dashboard/Data/ApiConsole/ApiConsole.scss';
import { CurrentApp } from 'context/currentApp';

export default class GraphQLConsole extends Component {
  static contextType = CurrentApp;
  render() {
    const { applicationId, clientKey, graphQLServerURL, masterKey } = this.context;
    let content;
    if (!graphQLServerURL) {
      content = (
        <div className={styles.empty}>
          <EmptyState
            title='GraphQL API Console'
            description='Please update Parse-Server to version equal or above
            3.5.0 and define the "graphQLServerURL" on your app configuration
            in order to use the GraphQL API Console.'
            icon='info-solid' />
        </div>
      );
    } else {
      const parseHeaders = {
        'X-Parse-Application-Id': applicationId,
        'X-Parse-Master-Key': masterKey
      }
      if (clientKey) {
        parseHeaders['X-Parse-Client-Key'] = clientKey
      }
      content = (
        <GraphiQL
          headers={JSON.stringify(parseHeaders)}
          headerEditorEnabled={true}
          fetcher={async (graphQLParams, {headers}) => {
            const data = await fetch(
              graphQLServerURL,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...headers
              },
              body: JSON.stringify(graphQLParams),
            },
          );
          return data.json().catch(() => data.text());
          }}
        />
      );
    }

    return (
      <>
        <Toolbar section='Core' subsection='GraphQL API Console' />
        <div className={styles.content}>
          {content}
        </div>
      </>
    );
  }
}
