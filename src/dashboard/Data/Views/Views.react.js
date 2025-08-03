import BrowserMenu from 'components/BrowserMenu/BrowserMenu.react';
import MenuItem from 'components/BrowserMenu/MenuItem.react';
import Separator from 'components/BrowserMenu/Separator.react';
import CategoryList from 'components/CategoryList/CategoryList.react';
import DragHandle from 'components/DragHandle/DragHandle.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Icon from 'components/Icon/Icon.react';
import LoaderContainer from 'components/LoaderContainer/LoaderContainer.react';
import Pill from 'components/Pill/Pill.react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import Toolbar from 'components/Toolbar/Toolbar.react';
import browserStyles from 'dashboard/Data/Browser/Browser.scss';
import Notification from 'dashboard/Data/Browser/Notification.react';
import TableView from 'dashboard/TableView.react';
import tableStyles from 'dashboard/TableView.scss';
import * as ViewPreferences from 'lib/ViewPreferences';
import ViewPreferencesManager from 'lib/ViewPreferencesManager';
import generatePath from 'lib/generatePath';
import stringCompare from 'lib/stringCompare';
import { ActionTypes as SchemaActionTypes } from 'lib/stores/SchemaStore';
import subscribeTo from 'lib/subscribeTo';
import { withRouter } from 'lib/withRouter';
import Parse from 'parse';
import React from 'react';
import CloudFunctionInputDialog from './CloudFunctionInputDialog.react';
import CreateViewDialog from './CreateViewDialog.react';
import DeleteViewDialog from './DeleteViewDialog.react';
import EditViewDialog from './EditViewDialog.react';
import ViewValueDialog from './ViewValueDialog.react';
import styles from './Views.scss';

export default
@subscribeTo('Schema', 'schema')
@withRouter
class Views extends TableView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Views';
    this._isMounted = false;
    this.viewPreferencesManager = null; // Will be initialized when context is available
    this.state = {
      views: [],
      counts: {},
      data: [],
      order: [],
      columns: {},
      tableWidth: 0,
      showCreate: false,
      editView: null,
      editIndex: null,
      deleteIndex: null,
      lastError: null,
      lastNote: null,
      loading: false,
      viewValue: null,
      showCloudFunctionInput: false,
      cloudFunctionInputConfig: null,
    };
    this.headersRef = React.createRef();
    this.noteTimeout = null;
    this.action = new SidebarAction('Create a view', () => this.setState({ showCreate: true }));
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillMount() {
    this.props.schema.dispatch(SchemaActionTypes.FETCH).then(() => this.loadViews(this.context));
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearTimeout(this.noteTimeout);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.props.schema.dispatch(SchemaActionTypes.FETCH).then(() => this.loadViews(nextContext));
    }
    if (this.props.params.name !== nextProps.params.name || this.context !== nextContext) {
      window.scrollTo({ top: 0 });
      this.loadData(nextProps.params.name);
    }
  }

  async loadViews(app) {
    // Initialize ViewPreferencesManager if not already done or if app changed
    if (!this.viewPreferencesManager || this.viewPreferencesManager.app !== app) {
      this.viewPreferencesManager = new ViewPreferencesManager(app);
    }

    try {
      const views = await this.viewPreferencesManager.getViews(app.applicationId);
      this.setState({ views, counts: {} }, () => {
        views.forEach(view => {
          if (view.showCounter) {
            if (view.cloudFunction) {
              // For Cloud Function views, call the function to get count
              Parse.Cloud.run(view.cloudFunction, {}, { useMasterKey: true })
                .then(res => {
                  if (this._isMounted) {
                    this.setState(({ counts }) => ({
                      counts: { ...counts, [view.name]: Array.isArray(res) ? res.length : 0 },
                    }));
                  }
                })
                .catch(error => {
                  if (this._isMounted) {
                    this.showNote(`Request failed: ${error.message || 'Unknown error occurred'}`, true);
                  }
                });
            } else if (view.query && Array.isArray(view.query)) {
              // For aggregation pipeline views, use existing logic
              new Parse.Query(view.className)
                .aggregate(view.query, { useMasterKey: true })
                .then(res => {
                  if (this._isMounted) {
                    this.setState(({ counts }) => ({
                      counts: { ...counts, [view.name]: res.length },
                    }));
                  }
                })
                .catch(error => {
                  if (this._isMounted) {
                    this.showNote(`Request failed: ${error.message || 'Unknown error occurred'}`, true);
                  }
                });
            }
          }
        });
        if (this._isMounted) {
          this.loadData(this.props.params.name);
        }
      });
    } catch (error) {
      console.error('Failed to load views from server, falling back to local storage:', error);
      // Fallback to local storage
      const views = ViewPreferences.getViews(app.applicationId);
      this.setState({ views, counts: {} }, () => {
        if (this._isMounted) {
          this.loadData(this.props.params.name);
        }
      });
    }
  }

  loadData(name) {
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    if (!name) {
      if (this._isMounted) {
        this.setState({ data: [], order: [], columns: {}, loading: false });
      }
      return;
    }
    const view = (this.state.views || []).find(v => v.name === name);
    if (!view) {
      if (this._isMounted) {
        this.setState({ data: [], order: [], columns: {}, loading: false });
      }
      return;
    }

    // Check if cloud function view requires input
    if (view.cloudFunction && (view.requireTextInput || view.requireFileUpload)) {
      if (this._isMounted) {
        this.setState({
          loading: false,
          showCloudFunctionInput: true,
          cloudFunctionInputConfig: {
            view,
            requireTextInput: view.requireTextInput,
            requireFileUpload: view.requireFileUpload,
          },
        });
      }
      return;
    }

    this.executeCloudFunctionOrQuery(view);
  }

  executeCloudFunctionOrQuery(view, params = {}) {
    // Choose data source: Cloud Function or Aggregation Pipeline
    const dataPromise = view.cloudFunction
      ? Parse.Cloud.run(view.cloudFunction, params, { useMasterKey: true })
      : new Parse.Query(view.className).aggregate(view.query || [], { useMasterKey: true });

    dataPromise
      .then(results => {
        // Normalize Parse.Object instances to raw JSON for consistent rendering as pointer
        const normalizeValue = val => {
          if (val && typeof val === 'object' && val instanceof Parse.Object) {
            return {
              __type: 'Pointer',
              className: val.className,
              objectId: val.id
            };
          }
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            const normalized = {};
            Object.keys(val).forEach(key => {
              normalized[key] = normalizeValue(val[key]);
            });
            return normalized;
          }
          if (Array.isArray(val)) {
            return val.map(normalizeValue);
          }
          return val;
        };

        const normalizedResults = results.map(item => {
          const normalized = {};
          Object.keys(item).forEach(key => {
            normalized[key] = normalizeValue(item[key]);
          });
          return normalized;
        });

        const columns = {};
        const computeWidth = str => {
          let text = str;
          if (text === undefined) {
            text = '';
          } else if (text && typeof text === 'object') {
            if (text.__type === 'Date' && text.iso) {
              text = text.iso;
            } else if (text.__type === 'Link' && text.text) {
              text = text.text;
            } else {
              text = JSON.stringify(text);
            }
          }
          text = String(text);
          if (typeof document !== 'undefined') {
            const canvas =
              computeWidth._canvas || (computeWidth._canvas = document.createElement('canvas'));
            const context = canvas.getContext('2d');
            context.font = '12px "Source Code Pro", "Courier New", monospace';
            const width = context.measureText(text).width + 32;
            return Math.max(width, 40);
          }
          return Math.max((text.length + 2) * 12, 40);
        };
        normalizedResults.forEach(item => {
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
                if (val.className && val.objectId) {
                  type = 'Pointer';
                } else {
                  type = 'Object';
                }
              } else if (val.__type === 'File') {
                type = 'File';
              } else if (val.__type === 'GeoPoint') {
                type = 'GeoPoint';
              } else if (val.__type === 'Link') {
                type = 'Link';
              } else if (val.__type === 'Image') {
                type = 'Image';
              } else {
                type = 'Object';
              }
            }
            if (!columns[key]) {
              columns[key] = { type, width: Math.min(computeWidth(key), 200) };
            }
            const width = computeWidth(val);
            if (width > columns[key].width && columns[key].width < 200) {
              columns[key].width = Math.min(width, 200);
            }
          });
        });
        const colNames = Object.keys(columns);
        const order = colNames.map(name => ({ name, width: columns[name].width }));
        const tableWidth = order.reduce((sum, col) => sum + col.width, 0);
        if (this._isMounted) {
          this.setState({ data: normalizedResults, order, columns, tableWidth, loading: false });
        }
      })
      .catch(error => {
        if (this._isMounted) {
          this.showNote(`Request failed: ${error.message || 'Unknown error occurred'}`, true);
          this.setState({ data: [], order: [], columns: {}, loading: false });
        }
      });
  }

  onRefresh() {
    // Clear any existing cloud function input modal first
    if (this.state.showCloudFunctionInput) {
      this.setState({
        showCloudFunctionInput: false,
        cloudFunctionInputConfig: null,
      });
    }
    this.loadData(this.props.params.name);
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
          content = (
            <div className={tableStyles.empty} style={{ top: 96 }}>
              {this.renderEmpty()}
            </div>
          );
        } else {
          content = (
            <div className={tableStyles.rows}>
              <table style={{ width: this.state.tableWidth, tableLayout: 'fixed' }}>
                {this.renderColGroup()}
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
        <LoaderContainer loading={loading} solid={false}>
          <div className={tableStyles.content} style={{ overflowX: 'auto', paddingTop: 96 }}>
            <div style={{ width: this.state.tableWidth }}>
              <div
                className={tableStyles.headers}
                style={{
                  width: this.state.tableWidth,
                  right: 'auto',
                  position: 'sticky',
                  top: 0,
                  left: 0,
                }}
                ref={this.headersRef}
              >
                {headers}
              </div>
              {content}
            </div>
          </div>
        </LoaderContainer>
        {toolbar}
        {extras}
      </div>
    );
  }

  renderRow(row) {
    return (
      <tr key={JSON.stringify(row)} className={styles.tableRow}>
        {this.state.order.map(({ name }) => {
          const value = row[name];
          let type = 'String';
          if (typeof value === 'number') {
            type = 'Number';
          } else if (typeof value === 'boolean') {
            type = 'Boolean';
          } else if (value && typeof value === 'object') {
            if (value.__type === 'Date') {
              type = 'Date';
            } else if (value.__type === 'Pointer') {
              if (value.className && value.objectId) {
                type = 'Pointer';
              } else {
                type = 'Object';
              }
            } else if (value.__type === 'File') {
              type = 'File';
            } else if (value.__type === 'GeoPoint') {
              type = 'GeoPoint';
            } else if (value.__type === 'Link') {
              type = 'Link';
            } else if (value.__type === 'Image') {
              type = 'Image';
            } else {
              type = 'Object';
            }
          }
          let content = '';
          const hasPill = type === 'Pointer' && value && value.className && value.objectId;
          if (hasPill) {
            const id = value.objectId;
            const className = value.className;
            content = (
              <Pill
                value={id}
                onClick={() => this.handlePointerClick({ className, id })}
                followClick
                shrinkablePill
              />
            );
          } else if (type === 'Object') {
            content = JSON.stringify(value);
          } else if (type === 'Date') {
            content = value && value.iso ? value.iso : String(value);
          } else if (type === 'Link') {
            // Sanitize URL
            let url = value.url;
            if (
              url.match(/javascript/i) ||
              url.match(/<script/i)
            ) {
              url = '#';
            } else {
              url = value.isRelativeUrl
                ? `apps/${this.context.slug}/${url}${value.urlQuery ? `?${new URLSearchParams(value.urlQuery).toString()}` : ''}`
                : url;
            }
            // Sanitize text
            let text = value.text;
            if (
              text.match(/javascript/i) ||
              text.match(/<script/i) ||
              !text ||
              text.trim() === ''
            ) {
              text = 'Link';
            }
            content = (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            );
          } else if (type === 'Image') {
            // Sanitize URL
            let url = value.url;
            if (
              !url ||
              url.match(/javascript/i) ||
              url.match(/<script/i)
            ) {
              url = '#';
            }

            // Parse dimensions, ensuring they are positive numbers
            const width = value.width && parseInt(value.width, 10) > 0 ? parseInt(value.width, 10) : null;
            const height = value.height && parseInt(value.height, 10) > 0 ? parseInt(value.height, 10) : null;

            // Create style object for scale-to-fit behavior
            const imgStyle = {
              maxWidth: width ? `${width}px` : '100%',
              maxHeight: height ? `${height}px` : '100%',
              objectFit: 'contain', // This ensures scale-to-fit behavior maintaining aspect ratio
              display: 'block'
            };

            content = (
              <img
                src={url}
                alt={value.alt || 'Image'}
                style={imgStyle}
                onError={(e) => {
                  if (e.target && e.target.style) {
                    e.target.style.display = 'none';
                  }
                }}
              />
            );
          } else if (value === undefined) {
            content = '';
          } else {
            content = String(value);
          }
          const isViewable = ['String', 'Number', 'Object'].includes(type);
          const classes = [styles.cell];
          if (hasPill) {
            classes.push(styles.pillCell);
          }
          let cellContent = content;
          if (isViewable) {
            cellContent = (
              <span
                className={styles.clickableText}
                onClick={() => this.handleValueClick(value)}
              >
                {content}
              </span>
            );
          }
          return (
            <td
              key={name}
              className={classes.join(' ')}
              onClick={e => {
                if (hasPill && e.metaKey) {
                  this.handlePointerCmdClick({
                    className: value.className,
                    id: value.objectId,
                  });
                }
              }}
            >
              {cellContent}
            </td>
          );
        })}
      </tr>
    );
  }

  renderColGroup() {
    return (
      <colgroup>
        {this.state.order.map(({ width }, i) => (
          <col key={i} style={{ width }} />
        ))}
      </colgroup>
    );
  }

  handleResize(index, delta) {
    this.setState(({ order }) => {
      const newOrder = [...order];
      newOrder[index] = {
        ...newOrder[index],
        width: Math.max(40, newOrder[index].width + delta),
      };
      const tableWidth = newOrder.reduce((sum, col) => sum + col.width, 0);
      return { order: newOrder, tableWidth };
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
    if (!this.props.params.name) {
      if (this.state.views.length > 0) {
        return (
          <EmptyState icon="visibility" title="Views" description="Select a view to load the data." />
        );
      }
      return (
        <EmptyState
          icon="visibility"
          title="Views"
          description={
            <span>
              Use views to display aggregated data from your classes.{' '}
              <a
                href="https://docs.parseplatform.org/dashboard/guide/#views"
                target="_blank"
                rel="noreferrer"
              >
                Learn more
              </a>
              .
            </span>
          }
          cta="Create a view"
          action={() => this.setState({ showCreate: true })}
        />
      );
    }
    return <div>No data available</div>;
  }

  renderSidebar() {
    const categories = this.state.views.map((view, index) => ({
      name: view.name,
      id: view.name,
      count: this.state.counts[view.name],
      onEdit: () => {
        this.setState({ editView: view, editIndex: index });
      },
    }));
    // Sort views alphabetically like in the Browser component
    categories.sort((a, b) => stringCompare(a.name, b.name));
    const current = this.props.params.name || '';
    return (
      <CategoryList
        current={current}
        params={this.props.location?.search}
        linkPrefix={'views/'}
        classClicked={() => {
          window.scrollTo({ top: 0 });
        }}
        categories={categories}
      />
    );
  }

  renderToolbar() {
    const subsection = this.props.params.name || '';
    let editMenu = null;
    let refreshButton = null;
    if (this.props.params.name) {
      editMenu = (
        <BrowserMenu title="Edit" icon="edit-solid" setCurrent={() => {}}>
          <MenuItem
            text="Edit view"
            onClick={() => {
              const index = this.state.views.findIndex(v => v.name === this.props.params.name);
              if (index >= 0) {
                this.setState({
                  editView: this.state.views[index],
                  editIndex: index,
                });
              }
            }}
          />
          <Separator />
          <MenuItem
            text="Delete view"
            onClick={() => {
              const index = this.state.views.findIndex(v => v.name === this.props.params.name);
              if (index >= 0) {
                this.setState({ deleteIndex: index });
              }
            }}
          />
        </BrowserMenu>
      );
      refreshButton = (
        <>
          <a className={browserStyles.toolbarButton} onClick={this.onRefresh.bind(this)}>
            <Icon name="refresh-solid" width={14} height={14} />
            <span>Refresh</span>
          </a>
          <div className={browserStyles.toolbarSeparator} />
        </>
      );
    }

    return (
      <Toolbar section="Views" subsection={subsection}>
        {refreshButton}
        {editMenu}
      </Toolbar>
    );
  }

  renderExtras() {
    let extras = null;
    if (this.state.viewValue !== null) {
      extras = (
        <ViewValueDialog
          value={this.state.viewValue}
          onClose={() => this.setState({ viewValue: null })}
        />
      );
    } else if (this.state.showCreate) {
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
              async () => {
                if (this.viewPreferencesManager) {
                  try {
                    await this.viewPreferencesManager.saveViews(this.context.applicationId, this.state.views);
                  } catch (error) {
                    console.error('Failed to save views:', error);
                    this.showNote('Failed to save view changes', true);
                  }
                }
                this.loadViews(this.context);
              }
            );
          }}
        />
      );
    } else if (this.state.editView) {
      let classNames = [];
      if (this.props.schema?.data) {
        const classes = this.props.schema.data.get('classes');
        if (classes) {
          classNames = Object.keys(classes.toObject());
        }
      }
      extras = (
        <EditViewDialog
          classes={classNames}
          view={this.state.editView}
          onCancel={() => this.setState({ editView: null, editIndex: null })}
          onConfirm={view => {
            this.setState(
              state => {
                const newViews = [...state.views];
                newViews[state.editIndex] = view;
                return { editView: null, editIndex: null, views: newViews };
              },
              async () => {
                if (this.viewPreferencesManager) {
                  try {
                    await this.viewPreferencesManager.saveViews(this.context.applicationId, this.state.views);
                  } catch (error) {
                    console.error('Failed to save views:', error);
                    this.showNote('Failed to save view changes', true);
                  }
                }
                this.loadViews(this.context);
              }
            );
          }}
        />
      );
    } else if (this.state.deleteIndex !== null) {
      const name = this.state.views[this.state.deleteIndex]?.name || '';
      extras = (
        <DeleteViewDialog
          name={name}
          onCancel={() => this.setState({ deleteIndex: null })}
          onConfirm={() => {
            this.setState(
              state => {
                const newViews = state.views.filter((_, i) => i !== state.deleteIndex);
                return { deleteIndex: null, views: newViews };
              },
              async () => {
                if (this.viewPreferencesManager) {
                  try {
                    await this.viewPreferencesManager.saveViews(this.context.applicationId, this.state.views);
                  } catch (error) {
                    console.error('Failed to save views:', error);
                    this.showNote('Failed to save view changes', true);
                  }
                }
                if (this.props.params.name === name) {
                  const path = generatePath(this.context, 'views');
                  this.props.navigate(path);
                }
                this.loadViews(this.context);
              }
            );
          }}
        />
      );
    } else if (this.state.showCloudFunctionInput && this.state.cloudFunctionInputConfig) {
      const config = this.state.cloudFunctionInputConfig;
      extras = (
        <CloudFunctionInputDialog
          requireTextInput={config.requireTextInput}
          requireFileUpload={config.requireFileUpload}
          onCancel={() => this.setState({
            showCloudFunctionInput: false,
            cloudFunctionInputConfig: null,
            loading: false,
          })}
          onConfirm={(params) => {
            this.setState({
              showCloudFunctionInput: false,
              cloudFunctionInputConfig: null,
              loading: true,
            });
            this.executeCloudFunctionOrQuery(config.view, params);
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
    const filters = JSON.stringify([{ field, constraint: 'eq', compareTo: id }]);
    const path = generatePath(
      this.context,
      `browser/${className}?filters=${encodeURIComponent(filters)}`
    );
    this.props.navigate(path);
  }

  handlePointerCmdClick({ className, id, field = 'objectId' }) {
    const filters = JSON.stringify([{ field, constraint: 'eq', compareTo: id }]);
    window.open(
      generatePath(
        this.context,
        `browser/${className}?filters=${encodeURIComponent(filters)}`,
        true
      ),
      '_blank'
    );
  }

  handleValueClick(value) {
    this.setState({ viewValue: value });
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
