/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { ActionTypes }                    from 'lib/stores/SchemaStore';
import AddColumnDialog                    from 'dashboard/Data/Browser/AddColumnDialog.react';
import CategoryList                       from 'components/CategoryList/CategoryList.react';
import CreateClassDialog                  from 'dashboard/Data/Browser/CreateClassDialog.react';
import DashboardView                      from 'dashboard/DashboardView.react';
import DataBrowser                        from 'dashboard/Data/Browser/DataBrowser.react';
import { DefaultColumns, SpecialClasses } from 'lib/Constants';
import DeleteRowsDialog                   from 'dashboard/Data/Browser/DeleteRowsDialog.react';
import DropClassDialog                    from 'dashboard/Data/Browser/DropClassDialog.react';
import EmptyState                         from 'components/EmptyState/EmptyState.react';
import ExportDialog                       from 'dashboard/Data/Browser/ExportDialog.react';
import history                            from 'dashboard/history';
import { List, Map }                      from 'immutable';
import Notification                       from 'dashboard/Data/Browser/Notification.react';
import Parse                              from 'parse';
import prettyNumber                       from 'lib/prettyNumber';
import queryFromFilters                   from 'lib/queryFromFilters';
import React                              from 'react';
import RemoveColumnDialog                 from 'dashboard/Data/Browser/RemoveColumnDialog.react';
import SidebarAction                      from 'components/Sidebar/SidebarAction';
import stringCompare                      from 'lib/stringCompare';
import styles                             from 'dashboard/Data/Browser/Browser.scss';
import subscribeTo                        from 'lib/subscribeTo';
import * as ColumnPreferences             from 'lib/ColumnPreferences';

@subscribeTo('Schema', 'schema')
export default class Browser extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Browser'
    this.action = new SidebarAction('Create a class', this.showCreateClass.bind(this));

    this.state = {
      showCreateClassDialog: false,
      showAddColumnDialog: false,
      showRemoveColumnDialog: false,
      showDropClassDialog: false,
      showExportDialog: false,
      rowsToDelete: null,

      relation: null,
      counts: {},
      clp: {},
      filters: new List(),
      ordering: '-createdAt',
      selection: {},

      data: null,
      lastMax: -1,
      newObject: null,

      lastError: null,
    };
  }

  componentWillMount() {
    this.props.schema.dispatch(ActionTypes.FETCH)
    .then(() => this.fetchCollectionCounts());
    if (!this.props.params.className && this.props.schema.data.get('classes')) {
      this.redirectToFirstClass(this.props.schema.data.get('classes'));
    } else if (this.props.params.className) {
      this.fetchInfo(this.context.currentApp);
      if (this.props.location.query && this.props.location.query.filters) {
        let filters = new List();
        let queryFilters = JSON.parse(this.props.location.query.filters);
        queryFilters.forEach((filter) => {
          filters = filters.push(new Map(filter));
        });
        this.setState({ filters }, () => {
          this.fetchData(this.props.params.className, this.state.filters);
        });
      } else {
        this.fetchData(this.props.params.className, this.state.filters);
      }
      this.setState({
        ordering: ColumnPreferences.getColumnSort(
          false,
          this.context.currentApp.applicationId,
          this.props.params.className
        )
      });
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      let changes = {
        filters: new List(),
        data: null,
        newObject: null,
        lastMax: -1,
        ordering: ColumnPreferences.getColumnSort(
            false,
            nextContext.currentApp.applicationId,
            nextProps.params.className
        ),
        selection: {},
        relation: null
      };
      //TODO: url limit issues ( we may want to check for url limit), unlikely but possible to run into
      if (nextProps.location.query && nextProps.location.query.filters) {
        let queryFilters = JSON.parse(nextProps.location.query.filters);
        queryFilters.forEach((filter) => {
          changes.filters = changes.filters.push(new Map(filter));
        });
      }

      if (this.props.params.appId !== nextProps.params.appId || !this.props.params.className) {
        changes.counts = {};
        Parse.Object._clearAllState();
        this.fetchInfo(nextContext.currentApp);
      }
      this.setState(changes);
      if (nextProps.params.className) {
        this.fetchData(nextProps.params.className, nextProps.location.query && nextProps.location.query.filters ? changes.filters : []);
      }
      nextProps.schema.dispatch(ActionTypes.FETCH)
      .then(() => this.fetchCollectionCounts());

    }
    if (!nextProps.params.className && nextProps.schema.data.get('classes')) {
      this.redirectToFirstClass(nextProps.schema.data.get('classes'));
    }
  }

  redirectToFirstClass(classList) {
    if (!classList.isEmpty()) {
      let classes = Object.keys(classList.toObject());
      classes.sort((a, b) => {
        if (a[0] === '_' && b[0] !== '_') {
          return -1;
        }
        if (b[0] === '_' && a[0] !== '_') {
          return 1;
        }
        return a.toUpperCase() < b.toUpperCase() ? -1 : 1;
      });
      history.replace(this.context.generatePath('browser/' + classes[0]));
    }
  }

  showCreateClass() {
    if (!this.props.schema.data.get('classes')) {
      return;
    }
    this.setState({ showCreateClassDialog: true });
  }

  showAddColumn() {
    this.setState({ showAddColumnDialog: true });
  }

  showRemoveColumn() {
    this.setState({ showRemoveColumnDialog: true });
  }

  showDeleteRows(rows) {
    this.setState({ rowsToDelete: rows });
  }

  showDropClass() {
    this.setState({ showDropClassDialog: true });
  }

  showExport() {
    this.setState({ showExportDialog: true });
  }

  createClass(className) {
    this.props.schema.dispatch(ActionTypes.CREATE_CLASS, { className }).then(() => {
      this.state.counts[className] = 0;
      history.push(this.context.generatePath('browser/' + className));
    }).always(() => {
      this.setState({ showCreateClassDialog: false });
    });
  }

  dropClass(className) {
    this.props.schema.dispatch(ActionTypes.DROP_CLASS, { className }).then(() => {
      this.setState({showDropClassDialog: false });
      delete this.state.counts[className];
      history.push(this.context.generatePath('browser'));
    }, (error) => {
      let msg = typeof error === 'string' ? error : error.message;
      if (msg) {
        msg = msg[0].toUpperCase() + msg.substr(1);
      }
      this.setState({ lastError: msg });
    });
  }

  exportClass(className) {
    this.context.currentApp.exportClass(className).always(() => {
      this.setState({ showExportDialog: false });
    });
  }

  addColumn(type, name, target) {
    let payload = {
      className: this.props.params.className,
      columnType: type,
      name: name,
      targetClass: target
    };
    this.props.schema.dispatch(ActionTypes.ADD_COLUMN, payload).always(() => {
      this.setState({ showAddColumnDialog: false });
    });
  }

  addRow() {
    if (!this.state.newObject) {
      this.setState({ newObject: new Parse.Object(this.props.params.className) });
    }
  }

  removeColumn(name) {
    let payload = {
      className: this.props.params.className,
      name: name
    };
    this.props.schema.dispatch(ActionTypes.DROP_COLUMN, payload).always(() => {
      let state = { showRemoveColumnDialog: false };
      if (this.state.ordering === name || this.state.ordering === '-' + name) {
        state.ordering = '-createdAt';
      }
      this.setState(state);
    });
  }

  fetchCollectionCounts() {
    this.props.schema.data.get('classes').forEach((_, className) => {
      this.context.currentApp.getClassCount(className)
      .then(count => this.setState({ counts: { [className]: count, ...this.state.counts } }));
    })
  }

  fetchInfo(app) {
    app.getCollectionInfo().then(({ collections }) => {
      let counts = {};
      let clp = {};
      collections.forEach(({ id, count, client_permissions }) => {
        counts[id] = count;
        clp[id] = client_permissions;
      });
      this.setState({ counts, clp });
    });
  }

  fetchData(source, filters, last) {
    let query = queryFromFilters(source, filters);
    if (this.state.ordering[0] === '-') {
      query.descending(this.state.ordering.substr(1));
    } else {
      query.ascending(this.state.ordering);
    }
    query.addDescending('createdAt');
    query.limit(200);
    if (last) {
      for (let col in last) {
        query.greaterThan(col, last[col]);
      }
    }
    query.find({ useMasterKey: true }).then((data) => this.setState({ data: data, lastMax: 200 }));
  }

  fetchNextPage() {
    if (!this.state.data) {
      return null;
    }
    let className = this.props.params.className;
    let source = this.state.relation || className;
    let query = queryFromFilters(source, this.state.filters);
    if (this.state.ordering !== '-createdAt') {
      // Construct complex pagination query
      let equalityQuery = queryFromFilters(source, this.state.filters);
      let field = this.state.ordering;
      let ascending = true;
      let comp = this.state.data[this.state.data.length - 1].get(field);
      if (field === 'objectId' || field === '-objectId') {
        comp = this.state.data[this.state.data.length - 1].id;
      }
      if (field[0] === '-') {
        field = field.substr(1);
        query.lessThan(field, comp);
        ascending = false;
      } else {
        query.greaterThan(field, comp);
      }
      equalityQuery.equalTo(field, comp);
      equalityQuery.lessThan('createdAt', this.state.data[this.state.data.length - 1].get('createdAt'));
      query = Parse.Query.or(query, equalityQuery);
      if (ascending) {
        query.ascending(this.state.ordering);
      } else {
        query.descending(this.state.ordering.substr(1));
      }
    } else {
      query.lessThan('createdAt', this.state.data[this.state.data.length - 1].get('createdAt'));
    }
    query.addDescending('createdAt');
    query.limit(200);

    query.find({ useMasterKey: true }).then((nextPage) => {
      if (className === this.props.params.className) {
        this.setState((state) => ({ data: state.data.concat(nextPage)}));
      }
    });
    this.setState({ lastMax: this.state.lastMax + 200 });
  }

  updateFilters(filters) {
    let source = this.state.relation || this.props.params.className;
    let _filters = JSON.stringify(filters.toJSON());
    let url = `browser/${source}` + (filters.size === 0 ? '' : `?filters=${encodeURIComponent(_filters)}`);
    // filters param change is making the fetch call
    history.push(this.context.generatePath(url));
  }

  updateOrdering(ordering) {
    let source = this.state.relation || this.props.params.className;
    this.setState({
      ordering: ordering,
      selection: {}
    }, () => this.fetchData(source, this.state.filters));
    ColumnPreferences.getColumnSort(
      ordering,
      this.context.currentApp.applicationId,
      this.props.params.className
    );
  }

  setRelation(relation) {
    this.setState({
      relation: relation,
      selection: {},
    }, () => this.fetchData(relation, this.state.filters));
  }

  handlePointerClick({ className, id }) {
    let filters = JSON.stringify([{
        field: 'objectId',
        constraint: 'eq',
        compareTo: id
    }]);
    history.push(this.context.generatePath(`browser/${className}?filters=${encodeURIComponent(filters)}`));
  }

  updateRow(row, attr, value) {
    let obj = row < 0 ? this.state.newObject : this.state.data[row];
    if (!obj) {
      return;
    }
    let prev = obj.get(attr);
    if (value === prev) {
      return;
    }
    if (value === undefined) {
      obj.unset(attr);
    } else {
      obj.set(attr, value);
    }
    obj.save(null, { useMasterKey: true }).then(() => {
      let state = { data: this.state.data, lastError: null };
      if (row < 0) {
        state.newObject = null;
        if (this.props.params.className === obj.className) {
          this.state.data.unshift(obj);
        }
        this.state.counts[obj.className] += 1;
      }
      this.setState(state);
    }, (error) => {
      let msg = typeof error === 'string' ? error : error.message;
      if (msg) {
        msg = msg[0].toUpperCase() + msg.substr(1);
      }
      if (row >= 0) {
        obj.set(attr, prev);
        this.setState({ data: this.state.data, lastError: msg });
      } else {
        this.setState({ lastError: msg });
      }
    });
  }

  deleteRows(rows) {
    this.setState({ rowsToDelete: null, selection: {} });
    let className = this.props.params.className;
    if (!this.state.relation && rows['*']) {
      this.context.currentApp.clearCollection(className).then(() => {
        if (this.props.params.className === className) {
          this.state.counts[className] = 0;
          this.setState({
            data: [],
            lastMax: 200,
            selection: {},
          });
        }
      });
    } else {
      let indexes = [];
      let toDelete = [];
      let seeking = Object.keys(rows).length;
      for (let i = 0; i < this.state.data.length && indexes.length < seeking; i++) {
        let obj = this.state.data[i];
        if (rows[obj.id]) {
          indexes.push(i);
          toDelete.push(this.state.data[i]);
        }
      }
      let relation = this.state.relation;
      if (relation) {
        this.state.relation.remove(toDelete);
        this.state.relation.parent.save(null, { useMasterKey: true }).then(() => {
          if (this.state.relation === relation) {
            for (let i = 0; i < indexes.length; i++) {
              this.state.data.splice(indexes[i] - i, 1);
            }
            this.forceUpdate();
          }
        });
      } else {
        Parse.Object.destroyAll(toDelete, { useMasterKey: true }).then(() => {
          if (this.props.params.className === className) {
            for (let i = 0; i < indexes.length; i++) {
              this.state.data.splice(indexes[i] - i, 1);
            }
            this.state.counts[className] -= indexes.length;
            this.forceUpdate();
          }
        });
      }
    }
  }

  updateCLP(perms) {
    let className = this.props.params.className;
    this.state.clp[className] = perms;
    this.forceUpdate();
  }

  selectRow(id, checked) {
    this.setState(({ selection }) => {
      if (id === '*') {
        return { selection: checked ? { '*': true } : {} };
      }
      if (checked) {
        selection[id] = true;
      } else {
        delete selection[id];
      }
      return { selection };
    });
  }

  hasExtras() {
    return !!(
      this.state.showCreateClassDialog ||
      this.state.showAddColumnDialog ||
      this.state.showRemoveColumnDialog ||
      this.state.showDropClassDialog ||
      this.state.showExportDialog ||
      this.state.rowsToDelete
    );
  }

  renderSidebar() {
    let current = this.props.params.className || '';
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
      if (SpecialClasses[key]) {
        special.push({ name: SpecialClasses[key], id: key, count: count });
      } else {
        categories.push({ name: key, count: count });
      }
    });
    special.sort((a, b) => stringCompare(a.name, b.name));
    categories.sort((a, b) => stringCompare(a.name, b.name));
    return (
      <CategoryList
        current={current}
        linkPrefix={'browser/'}
        categories={special.concat(categories)} />
    );
  }

  renderContent() {
    let browser = null;
    let className = this.props.params.className;
    if (this.state.relation) {
      className = this.state.relation.targetClassName;
    }
    let classes = this.props.schema.data.get('classes');
    if (classes) {
      if (classes.size === 0) {
        browser = (
          <div className={styles.empty}>
            <EmptyState
              title='You have no classes yet'
              description={'This is where you can view and edit your app\u2019s data'}
              icon='files-solid'
              cta='Create your first class'
              action={this.showCreateClass.bind(this)} />
          </div>
        );
      } else if (className && classes.get(className)) {
        let schema = {};
        classes.get(className).forEach(({ type, targetClass }, col) => {
          schema[col] = {
            type,
            targetClass,
          };
        });

        let columns = {
          objectId: { type: 'String' }
        };
        let userPointers = [];
        classes.get(className).forEach((field, name) => {
          if (name === 'objectId') {
            return;
          }
          let info = { type: field.type };
          if (field.targetClass) {
            info.targetClass = field.targetClass;
            if (field.targetClass === '_User') {
              userPointers.push(name);
            }
          }
          columns[name] = info;
        });

        browser = (
          <DataBrowser
            count={this.state.counts[className]}
            perms={this.state.clp[className]}
            schema={schema}
            userPointers={userPointers}
            filters={this.state.filters}
            onFilterChange={this.updateFilters.bind(this)}
            onRemoveColumn={this.showRemoveColumn.bind(this)}
            onDeleteRows={this.showDeleteRows.bind(this)}
            onDropClass={this.showDropClass.bind(this)}
            onExport={this.showExport.bind(this)}
            updateCLP={this.updateCLP.bind(this)}

            columns={columns}
            className={className}
            fetchNextPage={this.fetchNextPage.bind(this)}
            maxFetched={this.state.lastMax}
            selectRow={this.selectRow.bind(this)}
            selection={this.state.selection}
            data={this.state.data}
            ordering={this.state.ordering}
            newObject={this.state.newObject}
            relation={this.state.relation}
            disableKeyControls={this.hasExtras()}
            updateRow={this.updateRow.bind(this)}
            updateOrdering={this.updateOrdering.bind(this)}
            onPointerClick={this.handlePointerClick.bind(this)}
            setRelation={this.setRelation.bind(this)}
            onAddColumn={this.showAddColumn.bind(this)}
            onAddRow={this.addRow.bind(this)}
            onAddClass={this.showCreateClass.bind(this)} />
        );
      }
    }
    let extras = null;
    if (this.state.showCreateClassDialog) {
      extras = (
        <CreateClassDialog
          currentClasses={this.props.schema.data.get('classes').keySeq().toArray()}
          onCancel={() => this.setState({ showCreateClassDialog: false })}
          onConfirm={this.createClass.bind(this)} />
      );
    } else if (this.state.showAddColumnDialog) {
      let currentColumns = [];
      classes.get(className).forEach((field, name) => {
        currentColumns.push(name);
      });
      extras = (
        <AddColumnDialog
          currentColumns={currentColumns}
          classes={this.props.schema.data.get('classes').keySeq().toArray()}
          onCancel={() => this.setState({ showAddColumnDialog: false })}
          onConfirm={this.addColumn.bind(this)} />
      );
    } else if (this.state.showRemoveColumnDialog) {
      let currentColumns = [];
      let untouchable = DefaultColumns.All;
      if (className[0] === '_' && DefaultColumns[className]) {
        untouchable = untouchable.concat(DefaultColumns[className]);
      }
      classes.get(className).forEach((field, name) => {
        if (untouchable.indexOf(name) < 0) {
          currentColumns.push(name);
        }
      });
      extras = (
        <RemoveColumnDialog
          currentColumns={currentColumns}
          onCancel={() => this.setState({ showRemoveColumnDialog: false })}
          onConfirm={this.removeColumn.bind(this)} />
      );
    } else if (this.state.rowsToDelete) {
      extras = (
        <DeleteRowsDialog
          className={SpecialClasses[className] || className}
          selection={this.state.rowsToDelete}
          onCancel={() => this.setState({ rowsToDelete: null })}
          onConfirm={() => this.deleteRows(this.state.rowsToDelete)} />
      );
    } else if (this.state.showDropClassDialog) {
      extras = (
        <DropClassDialog
          className={className}
          onCancel={() => this.setState({
            showDropClassDialog: false,
            lastError: null,
          })}
          onConfirm={() => this.dropClass(className)} />
      );
    } else if (this.state.showExportDialog) {
      extras = (
        <ExportDialog
          className={className}
          onCancel={() => this.setState({ showExportDialog: false })}
          onConfirm={() => this.exportClass(className)} />
      );
    }
    return (
      <div>
        {browser}
        <Notification note={this.state.lastError} />
        {extras}
      </div>
    );
  }
}
