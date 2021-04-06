/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React      from 'react';
import { AppContext } from '../AppData.react';

export default class SettingsData extends React.Component {
  constructor() {
    super();

    this.state = {
      fields: undefined
    };
  }

  componentDidMount() {
    this.context.currentApp.fetchSettingsFields().then(({ fields }) => {
      this.setState({ fields });
    });
  }

  saveChanges(changes) {
    let promise = this.context.currentApp.saveSettingsFields(changes)
    promise.then(({successes}) => {
      this.setState(prevState => {
        const newFields = { ...prevState.fields, ...successes};
        return {fields: newFields};
      });
    });
    return promise;
  }

  render() {
    let child = React.Children.only(this.props.children);
    return React.cloneElement(
      child,
      {
        ...child.props,
        initialFields: this.state.fields,
        saveChanges: this.saveChanges.bind(this)
      }
    );
  }
}

SettingsData.contextType = AppContext;
