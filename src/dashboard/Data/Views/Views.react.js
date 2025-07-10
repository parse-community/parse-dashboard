import CategoryList from 'components/CategoryList/CategoryList.react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import TableHeader from 'components/Table/TableHeader.react';
import TableView from 'dashboard/TableView.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import Parse from 'parse';
import React from 'react';
import CreateViewDialog from './CreateViewDialog.react';
import * as ViewPreferences from 'lib/ViewPreferences';
import { withRouter } from 'lib/withRouter';

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
      showCreate: false,
    };
    this.action = new SidebarAction('Create a view', () =>
      this.setState({ showCreate: true })
    );
  }

  componentWillMount() {
    this.loadViews(this.context);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.loadViews(nextContext);
    }
    if (this.props.params.name !== nextProps.params.name || this.context !== nextContext) {
      this.loadData(nextProps.params.name, nextContext);
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
            });
        }
      });
      this.loadData(this.props.params.name, app);
    });
  }

  loadData(name, app = this.context) {
    if (!name) {
      this.setState({ data: [], order: [] });
      return;
    }
    const view = (this.state.views || []).find(v => v.name === name);
    if (!view) {
      this.setState({ data: [], order: [] });
      return;
    }
    new Parse.Query(view.className)
      .aggregate(view.query, { useMasterKey: true })
      .then(results => {
        const columns = {};
        results.forEach(item => {
          Object.keys(item).forEach(key => {
            if (columns[key]) return;
            const val = item[key];
            let type = 'String';
            if (typeof val === 'number') type = 'Number';
            else if (typeof val === 'boolean') type = 'Boolean';
            else if (val && typeof val === 'object') {
              if (val.__type === 'Date') type = 'Date';
              else if (val.__type === 'Pointer') type = 'Pointer';
              else if (val.__type === 'File') type = 'File';
              else if (val.__type === 'GeoPoint') type = 'GeoPoint';
              else type = 'Object';
            }
            columns[key] = { type };
          });
        });
        const order = Object.keys(columns).map(name => ({ name, width: 150 }));
        this.setState({ data: results, order, columns });
      });
  }

  tableData() {
    return this.state.data;
  }

  renderRow(row) {
    return (
      <tr key={JSON.stringify(row)}>
        {this.state.order.map(({ name }) => (
          <td key={name}>{String(row[name])}</td>
        ))}
      </tr>
    );
  }

  renderHeaders() {
    return this.state.order.map(({ name }) => (
      <TableHeader key={name} width={20} >
        {name}
      </TableHeader>
    ));
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
    if (this.state.showCreate) {
      let classNames = [];
      if (this.context?.schema) {
        const classes = this.context.schema.data.get('classes');
        if (classes) {
          classNames = Object.keys(classes.toObject());
        }
      }
      return (
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
    return null;
  }
}

export default Views;
