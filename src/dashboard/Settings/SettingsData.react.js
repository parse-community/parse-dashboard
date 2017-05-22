/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ParseApp from 'lib/ParseApp';
import React    from 'react';

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

  componentWillReceiveProps(props, context) {
    if (this.context !== context) {
      this.setState({ fields: undefined });
      context.currentApp.fetchSettingsFields().then(({ fields }) => {
        this.setState({ fields });
      });
    }
  }

  saveChanges(changes) {
    let promise = this.context.currentApp.saveSettingsFields(changes)
    promise.then(({successes}) => {
      let newFields = {...this.state.fields, ...successes};
      this.setState({fields: newFields});
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

SettingsData.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
