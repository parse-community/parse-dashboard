/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CategoryList                       from 'components/CategoryList/CategoryList.react';
import DashboardView                      from 'dashboard/DashboardView.react';
import React                              from 'react';
import SidebarAction                      from 'components/Sidebar/SidebarAction';
import subscribeTo                        from 'lib/subscribeTo';
import Toolbar                            from 'components/Toolbar/Toolbar.react';
import { ActionTypes }                    from 'lib/stores/SchemaStore';
import { SpecialClasses }                 from 'lib/Constants';
import stringCompare                      from 'lib/stringCompare';
import prettyNumber                       from 'lib/prettyNumber';

export default
@subscribeTo('Schema', 'schema')
class Browser extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Browser'
    this.action = new SidebarAction('Create a class', () => this.setState({ showCreateClassDialog: true }));

    this.state = {
      counts: {},
    };
  }

  componentWillMount() {
    this.props.schema.dispatch(ActionTypes.FETCH);
  }

  renderSidebar() {
    //TODO: refactor this to share code with Browser.react and actually fetch counts
    let classes = this.props.schema.data.get('classes');
    if (!classes) {
      return null;
    }
    let special = [];
    let categories = [];
    classes.forEach((value, key) => {
      let count = this.state.counts[key];
      if (count === undefined) {
        count = '';
      } else if (count >= 1000) {
        count = prettyNumber(count);
      }
      if (SpecialClasses.includes(key)) {
        special.push({ name: key, id: key, count: count });
      } else {
        categories.push({ name: key, count: count });
      }
    });
    special.sort((a, b) => stringCompare(a.name, b.name));
    categories.sort((a, b) => stringCompare(a.name, b.name));
    return (
      <CategoryList
        linkPrefix={'browser/'}
        categories={special.concat(categories)} />
    );
  }

  renderContent() {
    return (
      <div>
        <Toolbar section='Schema' subsection='overview'/>
      </div>
    );
  }
}
