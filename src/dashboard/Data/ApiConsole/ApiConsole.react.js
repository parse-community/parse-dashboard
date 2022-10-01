/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import CategoryList from 'components/CategoryList/CategoryList.react';
import DashboardView from 'dashboard/DashboardView.react';
import { Outlet } from 'react-router-dom';
import { withRouter } from 'lib/withRouter';

@withRouter
class ApiConsole extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'API Console';
  }

  renderSidebar() {
    const { pathname } = this.props.location;
    const current = pathname.substr(pathname.lastIndexOf('/') + 1, pathname.length - 1);
    return (
      <CategoryList
        current={current}
        linkPrefix={'api_console/'}
        categories={[
          { name: 'REST Console', id: 'rest' },
          { name: 'GraphQL Console', id: 'graphql' },
          { name: 'JS Console', id: 'js_console' }
        ]}
      />
    );
  }

  renderContent() {
    return <Outlet />;
  }
}

export default ApiConsole;
