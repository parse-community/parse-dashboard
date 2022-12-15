/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React                              from 'react';
import { Helmet }                         from 'react-helmet';
import Parse                              from 'parse';
import { List, Map }                      from 'immutable';

import DashboardView                      from 'dashboard/DashboardView.react';
import DocsContracts                      from 'dashboard/Data/Docs/DocsContracts.react';
import Notification                       from 'dashboard/Data/Docs/Notification.react';
import styles                             from 'dashboard/Data/Docs/Docs.scss';

import CategoryList                       from 'components/CategoryList/CategoryList.react';
import EmptyState                         from 'components/EmptyState/EmptyState.react';
import Markdown                           from 'components/Markdown/Markdown.react';
import SidebarAction                      from 'components/Sidebar/SidebarAction';
import Toolbar                            from 'components/Toolbar/Toolbar.react';

import { ActionTypes }                    from 'lib/stores/SchemaStore';
import { DefaultColumns, SpecialClasses } from 'lib/Constants';
import prettyNumber                       from 'lib/prettyNumber';
import stringCompare                      from 'lib/stringCompare';
import subscribeTo                        from 'lib/subscribeTo';
import { withRouter }                     from 'lib/withRouter';

@subscribeTo('Schema', 'schema')
@withRouter
class Docs extends DashboardView {
  constructor(props) {
    super(props);
    this.section = 'Core';
    this.subsection = 'Docs';
    // This is the list of sections that will be displayed in the sidebar
    // The structure is an array of objects with a name and an id
    this.docsSubsections = [
      { name: 'Getting Started', id: 'getting-started' },
      { name: 'Troubleshooting', id: 'troubleshooting' },
      { name: 'Deployed Contracts', id: 'contracts' },
    ];
    this.noteTimeout = null;
    this.state = {
      lastError: null,
      lastNote: null,
      currentUser: Parse.User.current()
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.showNote = this.showNote.bind(this);
  }

  async login(username, password) {
    if (Parse.User.current()) {
      await Parse.User.logOut();
    }

    const currentUser = await Parse.User.logIn(username, password);
    this.setState({ currentUser: currentUser, useMasterKey: false }, () => this.refresh());
  }

  async logout() {
    await Parse.User.logOut();
    this.setState({ currentUser: null, useMasterKey: true }, () => this.refresh());
  }

  hasExtras() {
    return false;
  }

  // async confirmAttachSelectedRows(className, targetObjectId, relationName, objectIds, targetClassName) {
  //   const { useMasterKey } = this.state;
  //   const parentQuery = new Parse.Query(className);
  //   const parent = await parentQuery.get(targetObjectId, { useMasterKey });
  //   const query = new Parse.Query(targetClassName || this.props.params.className);
  //   query.containedIn('objectId', objectIds);
  //   const objects = await query.find({ useMasterKey });
  //   parent.relation(relationName).add(objects);
  //   await parent.save(null, { useMasterKey });
  // }

  get currentSubsectionId() {
    const { pathname } = this.props.location;

    // Get the current subsection between .../docs/SUBSECTION/...
    const pathMatch = pathname.match(/docs\/([^\/]+)$/) || [];
    return pathMatch[1] || this.docsSubsections[0].id; 
  }

  get currentSubsectionName() {
    return this.docsSubsections.find(s => s.id === this.currentSubsectionId)?.name;
  }

  renderSidebar() {
    return (
      <CategoryList
        current={this.currentSubsectionId}
        linkPrefix={'docs/'}
        categories={this.docsSubsections}
      />
    );
  }

  showNote(message, isError) {
    if (!message) {
      return;
    }

    clearTimeout(this.noteTimeout);

    if (isError) {
      this.setState({ lastError: message, lastNote: null });
    } else {
      this.setState({ lastNote: message, lastError: null });
    }

    this.noteTimeout = setTimeout(() => {
      this.setState({ lastError: null, lastNote: null });
    }, 3500);
  }

  renderContent() {
    let notification = null;

    if (this.state.lastError) {
      notification = (
        <Notification note={this.state.lastError} isErrorNote={true}/>
      );
    } else if (this.state.lastNote) {
      notification = (
        <Notification note={this.state.lastNote} isErrorNote={false}/>
      );
    }

    let content = null;
    switch(this.currentSubsectionId) {
      case 'contracts':
        content = <DocsContracts></DocsContracts>
        break;
      case 'getting-started': //intentional fallthrough
      case 'troubleshooting':
        content = <Markdown content={`# ${this.currentSubsectionName}`} />
        break;
    }

    return (
      <div>
        <Helmet>
          <title>Docs - {this.currentSubsectionName}</title>
        </Helmet>
        <Toolbar section="Documentation" subsection={this.currentSubsectionName}>
          {/* <Button
          color="white"
          value="Create a Page"
          onClick={this.openNewPageModal.bind(this)}
        /> */}
        </Toolbar>
        <div className={styles.content}>
          {content}
        </div>
        {notification}
      </div>
    );
  }
}

export default Docs;
