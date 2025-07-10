import CategoryList from 'components/CategoryList/CategoryList.react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import TableView from 'dashboard/TableView.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import LoaderContainer from 'components/LoaderContainer/LoaderContainer.react';
import Parse from 'parse';
import React from 'react';
import Notification from 'dashboard/Data/Browser/Notification.react';
import Icon from 'components/Icon/Icon.react';
import DragHandle from 'components/DragHandle/DragHandle.react';
import CreateViewDialog from './CreateViewDialog.react';
import * as ViewPreferences from 'lib/ViewPreferences';
import generatePath from 'lib/generatePath';
import { withRouter } from 'lib/withRouter';
import subscribeTo from 'lib/subscribeTo';
import { ActionTypes as SchemaActionTypes } from 'lib/stores/SchemaStore';
import styles from './Views.scss';
import tableStyles from 'dashboard/TableView.scss';


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
      tableWidth: 0,
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
        const computeWidth = str =>
          Math.min(100, Math.max((String(str).length + 2) * 8, 40));
        results.forEach(item => {
          Object.keys(item).forEach(key => {
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
            const content =
              type === 'Pointer'
                ? val.objectId
                : type === 'Object'
                  ? JSON.stringify(val)
                  : val;
            const width = computeWidth(content || key);
            if (!columns[key]) {
              columns[key] = { type, width };
            } else if (width > columns[key].width) {
              columns[key].width = width;
            }
          });
        });
        const colNames = Object.keys(columns);
        const order = colNames.map(name => ({ name, width: columns[name].width }));
        const tableWidth = order.reduce((sum, col) => sum + col.width, 0);
        this.setState({ data: results, order, columns, tableWidth });
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

  renderContent() {
    const toolbar = this.renderToolbar();
    const data = this.tableData();
    const footer = this.renderFooter();
    let content = null;
    let headers = null;
    if (data !== undefined) {
      if (!Array.isArray(data)) {
        console.warn('tableData() needs to return an array of objects');
      } else {
        if (data.length === 0) {
          content = <div className={tableStyles.empty}>{this.renderEmpty()}</div>;
        } else {
          content = (
            <div className={tableStyles.rows}>
              <table style={{ width: this.state.tableWidth, tableLayout: 'fixed' }}>
                <tbody>{data.map(row => this.renderRow(row))}</tbody>
              </table>
              {footer}
            </div>
          );
          headers = this.renderHeaders();
        }
      }
    }
    const extras = this.renderExtras ? this.renderExtras() : null;
    const loading = this.state ? this.state.loading : false;
    return (
      <div>
        <LoaderContainer loading={loading}>
          <div className={tableStyles.content}>{content}</div>
        </LoaderContainer>
        {toolbar}
        <div className={tableStyles.headers} style={{ width: this.state.tableWidth }}>
          {headers}
        </div>
        {extras}
      </div>
    );
  }

  renderRow(row) {
    return (
      <tr key={JSON.stringify(row)} className={styles.tableRow}>
        {this.state.order.map(({ name, width }) => {
          const value = row[name];
          const type = this.state.columns[name]?.type;
          let content = '';
          if (type === 'Pointer' && value && value.className && value.objectId) {
            const id = value.objectId;
            const className = value.className;
            content = (
              <span
                className={styles.pointerLink}
                onClick={() => this.handlePointerClick({ className, id })}
              >
                {id}
                <Icon name="right-outline" width={12} height={12} fill="#1669a1" />
              </span>
            );
          } else if (type === 'Object') {
            content = JSON.stringify(value);
          } else {
            content = String(value);
          }
          return (
            <td key={name} className={styles.cell} style={{ width }}>
              {content}
            </td>
          );
        })}
      </tr>
    );
  }

  handleResize(index, delta) {
    this.setState(({ order, tableWidth }) => {
      const newOrder = [...order];
      const next = Math.max(40, newOrder[index].width + delta);
      const diff = next - newOrder[index].width;
      newOrder[index] = { ...newOrder[index], width: next };
      return { order: newOrder, tableWidth: tableWidth + diff };
    });
  }

  renderHeaders() {
    return this.state.order.map(({ name, width }, i) => (
      <div key={name} className={styles.headerWrap} style={{ width }}>
        {name}
        <DragHandle className={styles.handle} onDrag={delta => this.handleResize(i, delta)} />
      </div>
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
    const path = generatePath(
      this.context,
      `browser/${className}?filters=${encodeURIComponent(filters)}`
    );
    this.props.navigate(path);
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
