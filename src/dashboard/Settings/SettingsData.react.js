/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React          from 'react';
import { CurrentApp } from 'context/currentApp';
import { Outlet } from 'react-router-dom';

export default class SettingsData extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();

    this.state = {
      fields: undefined
    };
  }

  componentDidMount() {
    this.context.fetchSettingsFields().then(({ fields }) => {
      this.setState({ fields });
    });
  }

  componentWillReceiveProps(props, context) {
    if (this.context !== context) {
      this.setState({ fields: undefined });
      context.fetchSettingsFields().then(({ fields }) => {
        this.setState({ fields });
      });
    }
  }

  saveChanges(changes) {
    let promise = this.context.saveSettingsFields(changes)
    promise.then(({successes}) => {
      let newFields = {...this.state.fields, ...successes};
      this.setState({fields: newFields});
    });
    return promise;
  }

  render() {
    return (
      <Outlet
        context={{
          initialFields: this.state.fields,
          saveChanges: this.saveChanges.bind(this)
        }}
      />
    );
  }
}
