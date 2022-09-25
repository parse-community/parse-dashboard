/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AppsManager from 'lib/AppsManager';
import Dropdown    from 'components/Dropdown/Dropdown.react';
import Field       from 'components/Field/Field.react';
import Label       from 'components/Label/Label.react';
import Modal       from 'components/Modal/Modal.react';
import Option      from 'components/Dropdown/Option.react';
import React       from 'react';
import { withRouter } from 'lib/withRouter';

@withRouter
class AppSelector extends React.Component {
  constructor(props) {
    super(props);
    let apps = AppsManager.apps();
    let latestApp = apps[apps.length - 1];
    this.state = {
      slug: latestApp.slug
    };
  }

  handleConfirm() {
    let newPath = this.location.pathname.replace(/\/_(\/|$)/, '/' + this.state.slug + '/');
    this.props.navigate(newPath);
  }

  handleCancel() {
    this.props.navigate('/apps');
  }

  render() {
    let apps = AppsManager.apps();
    return (
      <Modal
        title='Hold up!'
        subtitle='Before you continue, pick which app you want to view'
        cancelText='Cancel'
        confirmText='Continue'
        onConfirm={this.handleConfirm.bind(this)}
        onCancel={this.handleCancel}>
        <Field
          label={<Label text='Select one of your apps' />}
          input={
            <Dropdown
              value={this.state.slug}
              onChange={(slug) => this.setState({ slug })}>
              {apps.map((app) => (
                <Option key={app.slug} value={app.slug}>{app.name}</Option>
              ))}
            </Dropdown>
          } />
      </Modal>
    );
  }
}

export default AppSelector;
