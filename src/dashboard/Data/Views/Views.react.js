import CategoryList from 'components/CategoryList/CategoryList.react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import TableHeader from 'components/Table/TableHeader.react';
import TableView from 'dashboard/TableView.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import Parse from 'parse';
import React from 'react';
import Notification from 'dashboard/Data/Browser/Notification.react';
import Pill from 'components/Pill/Pill.react';
import CreateViewDialog from './CreateViewDialog.react';
import * as ViewPreferences from 'lib/ViewPreferences';
import generatePath from 'lib/generatePath';
import { withRouter } from 'lib/withRouter';
import subscribeTo from 'lib/subscribeTo';
import { ActionTypes as SchemaActionTypes } from 'lib/stores/SchemaStore';

export default
@subscribeTo('Schema', 'schema')
@withRouter
class Views extends TableView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Views';
    this.state = {
      views: [],
      counts: {},
      data: [],
      order: [],
      columns: {},
      showCreate: false,
      lastError: null,
      lastNote: null,
    };
    this.noteTimeout = null;
    this.action = new SidebarAction('Create a view', () =>
      this.setState({ showCreate: true })
    );
  }

  componentWillMount() {
    this.props.schema
      .dispatch(SchemaActionTypes.FETCH)
      .then(() => this.loadViews(this.context));
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.props.schema
        .dispatch(SchemaActionTypes.FETCH)
        .then(() => this.loadViews(nextContext));
    }
    if (this.props.params.name !== nextProps.params.name || this.context !== nextContext) {
      this.loadData(nextProps.params.name);
    }
  }

  loadViews(app) {
    const views = ViewPreferences.getViews(app.applicationId);
    this.setState({ views, counts: {} }, () => {
      views.forEach(view => {
        if (view.showCounter) {
          new Parse.Query(view.className)
            .aggregate(view.query, { useMasterKey: true })
            .then(res => {
              this.setState(({ counts }) => ({
                counts: { ...counts, [view.name]: res.length },
              }));
            })
            .catch(error => {
              this.showNote(
                `Request failed: ${error.message || 'Unknown error occurred'}`,
                true
              );
            });
        }
      });
      this.loadData(this.props.params.name);
    });
  }

  loadData(name) {
    if (!name) {
      this.setState({ data: [], order: [], columns: {} });
      return;
    }
    const view = (this.state.views || []).find(v => v.name === name);
    if (!view) {
      this.setState({ data: [], order: [], columns: {} });
      return;
    }
    new Parse.Query(view.className)
      .aggregate(view.query, { useMasterKey: true })
      .then(results => {
        const columns = {};
        results.forEach(item => {
          Object.keys(item).forEach(key => {
            if (columns[key]) {
              return;
            }
            const val = item[key];
            let type = 'String';
            if (typeof val === 'number') {
              type = 'Number';
            } else if (typeof val === 'boolean') {
              type = 'Boolean';
            } else if (val && typeof val === 'object') {
              if (val.__type === 'Date') {
                type = 'Date';
              } else if (val.__type === 'Pointer') {
                type = 'Pointer';
              } else if (val.__type === 'File') {
                type = 'File';
              } else if (val.__type === 'GeoPoint') {
                type = 'GeoPoint';
              } else {
                type = 'Object';
              }
            }
          columns[key] = { type };
        });
      });
      const colNames = Object.keys(columns);
      const width = colNames.length > 0 ? 100 / colNames.length : 0;
      const order = colNames.map(name => ({ name, width }));
      this.setState({ data: results, order, columns });
      })
      .catch(error => {
        this.showNote(
          `Request failed: ${error.message || 'Unknown error occurred'}`,
          true
        );
        this.setState({ data: [], order: [], columns: {} });
      });
  }

  tableData() {
    return this.state.data;
  }

  renderRow(row) {
    return (
      <tr key={JSON.stringify(row)}>
        {this.state.order.map(({ name, width }) => {
          const value = row[name];
          const type = this.state.columns[name]?.type;
          let content = '';
          if (type === 'Pointer' && value && value.className && value.objectId) {
            const id = value.objectId;
            const className = value.className;
            content = (
              <Pill
                value={id}
                followClick={true}
                onClick={() =>
                  this.handlePointerClick({ className, id })
                }
              />
            );
          } else if (type === 'Object') {
            content = JSON.stringify(value);
          } else {
            content = String(value);
          }
          return (
            <td key={name} style={{ width: width + '%' }}>
              {content}
            </td>
          );
        })}
      </tr>
    );
  }

  renderHeaders() {
    return this.state.order.map(({ name, width }) => (
      <TableHeader key={name} width={width}>
        {name}
      </TableHeader>
    ));
  }

  renderEmpty() {
    return <div>No data available</div>;
  }

  renderSidebar() {
    const categories = this.state.views.map(view => ({
      name: view.name,
      id: view.name,
      count: this.state.counts[view.name],
    }));
    const current = this.props.params.name || '';
    return (
      <CategoryList
        current={current}
        linkPrefix={'views/'}
        categories={categories}
      />
    );
  }

  renderToolbar() {
    const subsection = this.props.params.name || '';
    return <Toolbar section="Views" subsection={subsection} />;
  }

  renderExtras() {
    let extras = null;
    if (this.state.showCreate) {
      let classNames = [];
      if (this.props.schema?.data) {
        const classes = this.props.schema.data.get('classes');
        if (classes) {
          classNames = Object.keys(classes.toObject());
        }
      }
      extras = (
        <CreateViewDialog
          classes={classNames}
          onCancel={() => this.setState({ showCreate: false })}
          onConfirm={view => {
            this.setState(
              state => ({ showCreate: false, views: [...state.views, view] }),
              () => {
                ViewPreferences.saveViews(
                  this.context.applicationId,
                  this.state.views
                );
                this.loadViews(this.context);
              }
            );
          }}
        />
      );
    }
    let notification = null;
    if (this.state.lastError) {
      notification = <Notification note={this.state.lastError} isErrorNote={true} />;
    } else if (this.state.lastNote) {
      notification = <Notification note={this.state.lastNote} isErrorNote={false} />;
    }
    return (
      <>
        {extras}
        {notification}
      </>
    );
  }

  handlePointerClick({ className, id, field = 'objectId' }) {
    const filters = JSON.stringify([
      { field, constraint: 'eq', compareTo: id },
    ]);
    this.props.navigate(
      generatePath(
        this.context,
        `browser/${className}?filters=${encodeURIComponent(filters)}`
      )
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
}
