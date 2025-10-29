/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CategoryList from 'components/CategoryList/CategoryList.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import DashboardView from 'dashboard/DashboardView.react';
import AddColumnDialog from 'dashboard/Data/Browser/AddColumnDialog.react';
import AttachRowsDialog from 'dashboard/Data/Browser/AttachRowsDialog.react';
import AttachSelectedRowsDialog from 'dashboard/Data/Browser/AttachSelectedRowsDialog.react';
import styles from 'dashboard/Data/Browser/Browser.scss';
import CloneSelectedRowsDialog from 'dashboard/Data/Browser/CloneSelectedRowsDialog.react';
import CreateClassDialog from 'dashboard/Data/Browser/CreateClassDialog.react';
import DataBrowser from 'dashboard/Data/Browser/DataBrowser.react';
import DeleteRowsDialog from 'dashboard/Data/Browser/DeleteRowsDialog.react';
import DropClassDialog from 'dashboard/Data/Browser/DropClassDialog.react';
import EditRowDialog from 'dashboard/Data/Browser/EditRowDialog.react';
import ExecuteScriptRowsDialog from 'dashboard/Data/Browser/ExecuteScriptRowsDialog.react';
import ExportDialog from 'dashboard/Data/Browser/ExportDialog.react';
import ExportSchemaDialog from 'dashboard/Data/Browser/ExportSchemaDialog.react';
import ExportSelectedRowsDialog from 'dashboard/Data/Browser/ExportSelectedRowsDialog.react';
import Notification from 'dashboard/Data/Browser/Notification.react';
import PointerKeyDialog from 'dashboard/Data/Browser/PointerKeyDialog.react';
import RemoveColumnDialog from 'dashboard/Data/Browser/RemoveColumnDialog.react';
import { List, Map } from 'immutable';
import { get } from 'lib/AJAX';
import * as ClassPreferences from 'lib/ClassPreferences';
import * as ColumnPreferences from 'lib/ColumnPreferences';
import { DefaultColumns, SpecialClasses } from 'lib/Constants';
import generatePath from 'lib/generatePath';
import prettyNumber from 'lib/prettyNumber';
import queryFromFilters from 'lib/queryFromFilters';
import { ActionTypes } from 'lib/stores/SchemaStore';
import stringCompare from 'lib/stringCompare';
import subscribeTo from 'lib/subscribeTo';
import { withRouter } from 'lib/withRouter';
import Parse from 'parse';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useBeforeUnload } from 'react-router-dom';
import BrowserFooter from './BrowserFooter.react';

const SELECTED_ROWS_MESSAGE = 'There are selected rows. Are you sure you want to leave this page?';

function SelectedRowsNavigationPrompt({ when }) {
  const message = SELECTED_ROWS_MESSAGE;

  React.useEffect(() => {
    if (!when) {
      return;
    }

    const handleBeforeUnload = event => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    const handleLinkClick = event => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.button !== 0) {
        return;
      }
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
        return;
      }
      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.target === '_blank') {
        return;
      }
      const href = anchor.getAttribute('href');
      if (!href || href === '#') {
        return;
      }
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handlePopState = () => {
      if (!window.confirm(message)) {
        window.history.go(1);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [when, message]);

  useBeforeUnload(
    React.useCallback(
      event => {
        if (when) {
          event.preventDefault();
          event.returnValue = message;
          return message;
        }
      },
      [when, message]
    )
  );

  return null;
}

// The initial and max amount of rows fetched by lazy loading
const BROWSER_LAST_LOCATION = 'browser_last_location';

@subscribeTo('Schema', 'schema')
@withRouter
class Browser extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Browser';
    this.noteTimeout = null;
    this.currentQuery = null;
    const limit = window.localStorage?.getItem('browserLimit');

    this.state = {
      showCreateClassDialog: false,
      showAddColumnDialog: false,
      showRemoveColumnDialog: false,
      showDropClassDialog: false,
      showExportDialog: false,
      showExportSchemaDialog: false,
      showAttachRowsDialog: false,
      showEditRowDialog: false,
      showPointerKeyDialog: false,
      rowsToDelete: null,
      rowsToExport: null,

      relation: null,
      counts: {},
      computingClassCounts: false,
      filteredCounts: {},
      clp: {},
      filters: new List(),
      ordering: '-createdAt',
      skip: 0,
      limit: limit ? parseInt(limit) : 100,
      selection: {},
      exporting: false,
      exportingCount: 0,

      data: null,
      lastMax: -1,
      newObject: null,
      editCloneRows: null,

      lastError: null,
      lastNote: null,

      relationCount: 0,

      isUnique: false,
      uniqueField: null,
      keepAddingCols: false,
      markRequiredFieldRow: 0,
      requiredColumnFields: [],

      useMasterKey: true,
      currentUser: Parse.User.current(),

      processedScripts: 0,

      rowCheckboxDragging: false,
      draggedRowSelection: false,

      classes: {},
      allClassesSchema: {},
      configData: {},
      classwiseCloudFunctions: {},
      AggregationPanelData: {},
      isLoadingInfoPanel: false,
      errorAggregatedData: {},
    };

    this.addLocation = this.addLocation.bind(this);
    this.allClassesSchema = this.getAllClassesSchema.bind(this);
    this.removeLocation = this.removeLocation.bind(this);
    this.prefetchData = this.prefetchData.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.fetchRelation = this.fetchRelation.bind(this);
    this.fetchRelationCount = this.fetchRelationCount.bind(this);
    this.fetchNextPage = this.fetchNextPage.bind(this);
    this.updateFilters = this.updateFilters.bind(this);
    this.showRemoveColumn = this.showRemoveColumn.bind(this);
    this.showDeleteRows = this.showDeleteRows.bind(this);
    this.showDropClass = this.showDropClass.bind(this);
    this.showExport = this.showExport.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.setLoadingInfoPanel = this.setLoadingInfoPanel.bind(this);
    this.setErrorAggregatedData = this.setErrorAggregatedData.bind(this);
    this.toggleMasterKeyUsage = this.toggleMasterKeyUsage.bind(this);
    this.showAttachRowsDialog = this.showAttachRowsDialog.bind(this);
    this.cancelAttachRows = this.cancelAttachRows.bind(this);
    this.confirmAttachRows = this.confirmAttachRows.bind(this);
    this.showAttachSelectedRowsDialog = this.showAttachSelectedRowsDialog.bind(this);
    this.showExecuteScriptRowsDialog = this.showExecuteScriptRowsDialog.bind(this);
    this.confirmExecuteScriptRows = this.confirmExecuteScriptRows.bind(this);
    this.cancelExecuteScriptRowsDialog = this.cancelExecuteScriptRowsDialog.bind(this);
    this.confirmAttachSelectedRows = this.confirmAttachSelectedRows.bind(this);
    this.cancelAttachSelectedRows = this.cancelAttachSelectedRows.bind(this);
    this.showCloneSelectedRowsDialog = this.showCloneSelectedRowsDialog.bind(this);
    this.confirmCloneSelectedRows = this.confirmCloneSelectedRows.bind(this);
    this.cancelCloneSelectedRows = this.cancelCloneSelectedRows.bind(this);
    this.showExportSelectedRowsDialog = this.showExportSelectedRowsDialog.bind(this);
    this.showExportSchemaDialog = this.showExportSchemaDialog.bind(this);
    this.confirmExportSelectedRows = this.confirmExportSelectedRows.bind(this);
    this.cancelExportSelectedRows = this.cancelExportSelectedRows.bind(this);
    this.getClassRelationColumns = this.getClassRelationColumns.bind(this);
    this.showCreateClass = this.showCreateClass.bind(this);
    this.refresh = this.refresh.bind(this);
    this.deleteFilter = this.deleteFilter.bind(this);
    this.editFilter = this.editFilter.bind(this);
    this.selectRow = this.selectRow.bind(this);
    this.updateRow = this.updateRow.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.handlePointerClick = this.handlePointerClick.bind(this);
    this.handlePointerCmdClick = this.handlePointerCmdClick.bind(this);
    this.handleCLPChange = this.handleCLPChange.bind(this);
    this.setRelation = this.setRelation.bind(this);
    this.showAddColumn = this.showAddColumn.bind(this);
    this.addRow = this.addRow.bind(this);
    this.addRowWithModal = this.addRowWithModal.bind(this);
    this.showCreateClass = this.showCreateClass.bind(this);
    this.createClass = this.createClass.bind(this);
    this.addColumn = this.addColumn.bind(this);
    this.addColumnAndContinue = this.addColumnAndContinue.bind(this);
    this.removeColumn = this.removeColumn.bind(this);
    this.showNote = this.showNote.bind(this);
    this.showEditRowDialog = this.showEditRowDialog.bind(this);
    this.closeEditRowDialog = this.closeEditRowDialog.bind(this);
    this.handleShowAcl = this.handleShowAcl.bind(this);
    this.onDialogToggle = this.onDialogToggle.bind(this);
    this.addEditCloneRows = this.addEditCloneRows.bind(this);
    this.abortAddRow = this.abortAddRow.bind(this);
    this.saveNewRow = this.saveNewRow.bind(this);
    this.showPointerKeyDialog = this.showPointerKeyDialog.bind(this);
    this.onChangeDefaultKey = this.onChangeDefaultKey.bind(this);
    this.saveEditCloneRow = this.saveEditCloneRow.bind(this);
    this.abortEditCloneRow = this.abortEditCloneRow.bind(this);
    this.cancelPendingEditRows = this.cancelPendingEditRows.bind(this);
    this.redirectToFirstClass = this.redirectToFirstClass.bind(this);
    this.onMouseDownRowCheckBox = this.onMouseDownRowCheckBox.bind(this);
    this.onMouseUpRowCheckBox = this.onMouseUpRowCheckBox.bind(this);
    this.onMouseOverRowCheckBox = this.onMouseOverRowCheckBox.bind(this);
    this.classAndCloudFuntionMap = this.classAndCloudFuntionMap.bind(this);
    this.fetchAggregationPanelData = this.fetchAggregationPanelData.bind(this);
    this.setAggregationPanelData = this.setAggregationPanelData.bind(this);

    // Handle for the ongoing info panel cloud function request
    this.currentInfoPanelQuery = null;

    this.dataBrowserRef = React.createRef();

    window.addEventListener('popstate', () => {
      this.setState({
        relation: null,
      });
    });
  }

  componentWillMount() {
    const currentApp = this.context;
    if (!currentApp.preventSchemaEdits) {
      this.action = new SidebarAction('Create a class', this.showCreateClass.bind(this));
    }

    this.props.schema.dispatch(ActionTypes.FETCH).then(() => this.handleFetchedSchema());
    if (!this.props.params.className && this.props.schema.data.get('classes')) {
      this.redirectToFirstClass(this.props.schema.data.get('classes'));
    } else if (this.props.params.className) {
      this.prefetchData(this.props, this.context);
    }
  }

  componentDidMount() {
    this.addLocation(this.props.params.appId);
    window.addEventListener('mouseup', this.onMouseUpRowCheckBox);
    get('/parse-dashboard-config.json').then(data => {
      this.setState({ configData: data });
      this.classAndCloudFuntionMap(this.state.configData);
    });
  }

  componentWillUnmount() {
    if (this.currentQuery) {
      this.currentQuery.cancel();
    }
    if (this.currentInfoPanelQuery) {
      this.currentInfoPanelQuery.cancel?.();
      this.currentInfoPanelQuery = null;
    }
    this.removeLocation();
    window.removeEventListener('mouseup', this.onMouseUpRowCheckBox);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.params.appId !== this.props.params.appId) {
      this.removeLocation();
      this.addLocation(nextProps.params.appId);
    }
    if (
      this.props.params.appId !== nextProps.params.appId ||
      this.props.params.className !== nextProps.params.className ||
      this.props.location.search !== nextProps.location.search ||
      this.props.params?.relationName !== nextProps.params?.relationName
    ) {
      if (this.props.params.appId !== nextProps.params.appId || !this.props.params.className) {
        this.setState({ counts: {} });
        Parse.Object._clearAllState();

        nextProps.schema.dispatch(ActionTypes.FETCH).then(() => this.handleFetchedSchema());
      }
      this.prefetchData(nextProps, nextContext);
    }
    if (!nextProps.params.className && nextProps.schema.data.get('classes')) {
      const t = nextProps.schema.data.get('classes');
      this.classes = Object.keys(t.toObject());
      this.allClassesSchema = this.getAllClassesSchema(
        this.classes,
        nextProps.schema.data.get('classes')
      );
      this.redirectToFirstClass(nextProps.schema.data.get('classes'), nextContext);
    }
  }

  setLoadingInfoPanel(bool) {
    this.setState({
      isLoadingInfoPanel: bool,
    });
  }

  setErrorAggregatedData(data) {
    this.setState({
      errorAggregatedData: data,
    });
  }

  fetchAggregationPanelData(objectId, className, appId) {
    if (this.currentInfoPanelQuery) {
      this.currentInfoPanelQuery.cancel?.();
      this.currentInfoPanelQuery = null;
    }

    this.setState({
      isLoadingInfoPanel: true,
    });

    const params = {
      object: Parse.Object.extend(className).createWithoutData(objectId).toPointer(),
    };
    let requestTask;
    const options = {
      useMasterKey: true,
      requestTask: task => {
        requestTask = task;
      },
    };
    const appName = this.props.params.appId;
    const cloudCodeFunction =
      this.state.classwiseCloudFunctions[`${appId}${appName}`]?.[className][0].cloudCodeFunction;

    const promise = Parse.Cloud.run(cloudCodeFunction, params, options);
    promise.cancel = () => requestTask?.abort();
    this.currentInfoPanelQuery = promise;
    promise.then(
      result => {
        if (this.currentInfoPanelQuery !== promise) {
          return;
        }
        if (result && result.panel && result.panel && result.panel.segments) {
          this.setState({ AggregationPanelData: result, isLoadingInfoPanel: false });
        } else {
          this.setState({
            isLoadingInfoPanel: false,
            errorAggregatedData: 'Improper JSON format',
          });
          this.showNote(this.state.errorAggregatedData, true);
        }
      },
      error => {
        if (this.currentInfoPanelQuery !== promise) {
          return;
        }
        this.setState({
          isLoadingInfoPanel: false,
          errorAggregatedData: error.message,
        });
        this.showNote(this.state.errorAggregatedData, true);
      }
    ).finally(() => {
      if (this.currentInfoPanelQuery === promise) {
        this.currentInfoPanelQuery = null;
      }
    });
  }

  setAggregationPanelData(data) {
    this.setState({ AggregationPanelData: data });
  }
  addLocation(appId) {
    if (window.localStorage) {
      const currentSearch = this.props.location?.search;
      if (currentSearch) {
        const params = new URLSearchParams(currentSearch);
        if (params.has('filters')) {
          return;
        }
      }
      let pathname = null;
      const newLastLocations = [];

      const lastLocations = JSON.parse(window.localStorage.getItem(BROWSER_LAST_LOCATION));
      lastLocations?.forEach(lastLocation => {
        if (lastLocation.appId !== appId) {
          newLastLocations.push(lastLocation);
        } else {
          pathname = lastLocation.location;
        }
      });

      window.localStorage.setItem(BROWSER_LAST_LOCATION, JSON.stringify(newLastLocations));
      if (pathname) {
        setTimeout(
          function () {
            this.props.navigate(pathname);
          }.bind(this)
        );
      }
    }
  }

  classAndCloudFuntionMap(data) {
    const classMap = {};
    data.apps.forEach(app => {
      const appName = app.appName;
      classMap[`${app.appId}${appName}`] = {};
      app.infoPanel &&
        app.infoPanel.forEach(panel => {
          panel.classes.forEach(className => {
            if (!classMap[`${app.appId}${appName}`][className]) {
              classMap[`${app.appId}${appName}`][className] = [];
            }
            classMap[`${app.appId}${appName}`][className].push({
              title: panel.title,
              cloudCodeFunction: panel.cloudCodeFunction,
              classes: panel.classes,
              prefetchObjects: panel.prefetchObjects || 0,
              prefetchStale: panel.prefetchStale || 0,
              prefetchImage: panel.prefetchImage ?? true,
              prefetchVideo: panel.prefetchVideo ?? true,
              prefetchAudio: panel.prefetchAudio ?? true,
            });
          });
        });
    });

    this.setState({ classwiseCloudFunctions: classMap });
  }

  removeLocation() {
    if (window.localStorage) {
      const lastLocation = {
        appId: this.props.params.appId,
        location: `${this.props.location.pathname}${this.props.location.search}`,
      };
      const currentLastLocation = JSON.parse(window.localStorage.getItem(BROWSER_LAST_LOCATION));
      const updatedLastLocation = [...(currentLastLocation || []), lastLocation];
      window.localStorage.setItem(BROWSER_LAST_LOCATION, JSON.stringify(updatedLastLocation));
    }
  }

  async prefetchData(props, context) {
    const filters = this.extractFiltersFromQuery(props);
    const { className, entityId, relationName } = props.params;
    const isRelationRoute = entityId && relationName;

    // Check if we're in edit filter mode (don't load data)
    const query = new URLSearchParams(props.location.search);
    const isEditFilterMode = query.get('editFilter') === 'true';

    let relation = this.state.relation;
    if (isRelationRoute && !relation) {
      const parentObjectQuery = new Parse.Query(className);
      const { useMasterKey } = this.state;
      const parent = await parentObjectQuery.get(entityId, { useMasterKey });
      relation = parent.relation(relationName);
    }
    this.setState(
      {
        data: isEditFilterMode ? [] : null, // Set empty array in edit mode to avoid loading
        newObject: null,
        lastMax: -1,
        ordering: ColumnPreferences.getColumnSort(false, context.applicationId, className),
        selection: {},
        relation: isRelationRoute ? relation : null,
      },
      () => {
        // Only fetch data if not in edit filter mode
        if (!isEditFilterMode) {
          if (isRelationRoute) {
            this.fetchRelation(relation, filters);
          } else if (className) {
            this.fetchData(className, filters);
          }
        }
      }
    );
  }

  extractFiltersFromQuery(props) {
    let filters = new List();
    //TODO: url limit issues ( we may want to check for url limit), unlikely but possible to run into
    if (!props || !props.location || !props.location.search) {
      return filters;
    }
    const query = new URLSearchParams(props.location.search);
    if (query.has('filters')) {
      const queryFilters = JSON.parse(query.get('filters'));
      queryFilters.forEach(
        filter => {
          // Convert date strings to Parse Date objects for proper Parse query functionality
          const processedFilter = { ...filter, class: filter.class || props.params.className };

          // Check the schema to see if this field is a Date type
          const classes = props.schema?.data?.get('classes');
          const className = processedFilter.class || props.params.className;
          const fieldName = processedFilter.field;

          if (classes && className && fieldName) {
            const classSchema = classes.get(className);
            const fieldType = classSchema?.get(fieldName)?.type;

            // If field type is Date and compareTo is not already a Date object, convert it
            if (fieldType === 'Date' &&
                processedFilter.compareTo &&
                typeof processedFilter.compareTo !== 'object') {
              processedFilter.compareTo = {
                __type: 'Date',
                iso: new Date(processedFilter.compareTo).toISOString()
              };
            }
          }

          filters = filters.push(Map(processedFilter));
        }
      );
    }
    return filters;
  }

  redirectToFirstClass(classList, context) {
    if (!classList.isEmpty()) {
      const classes = Object.keys(classList.toObject());
      classes.sort((a, b) => {
        if (a[0] === '_' && b[0] !== '_') {
          return -1;
        }
        if (b[0] === '_' && a[0] !== '_') {
          return 1;
        }
        return a.toUpperCase() < b.toUpperCase() ? -1 : 1;
      });
      this.props.navigate(generatePath(context || this.context, 'browser/' + classes[0]), {
        replace: true,
      });
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

  toggleMasterKeyUsage() {
    const { useMasterKey } = this.state;
    this.setState({ useMasterKey: !useMasterKey }, () => this.refresh());
  }

  createClass(className) {
    this.props.schema
      .dispatch(ActionTypes.CREATE_CLASS, { className })
      .then(() => {
        this.state.clp[className] = this.props.schema.data.get('CLPs').toJS()[className];
        this.state.counts[className] = 0;
        this.props.navigate(generatePath(this.context, 'browser/' + className));
      })
      .finally(() => {
        this.setState({ showCreateClassDialog: false });
      });
  }

  dropClass(className) {
    this.props.schema.dispatch(ActionTypes.DROP_CLASS, { className }).then(
      () => {
        this.setState({ showDropClassDialog: false });
        delete this.state.clp[className];
        delete this.state.counts[className];
        this.props.navigate(generatePath(this.context, 'browser'));
      },
      error => {
        let msg = typeof error === 'string' ? error : error.message;
        if (msg) {
          msg = msg[0].toUpperCase() + msg.substr(1);
        }

        this.showNote(msg, true);
      }
    );
  }

  exportClass(className) {
    this.context.exportClass(className).finally(() => {
      this.setState({ showExportDialog: false });
    });
  }

  async exportSchema(className, all) {
    try {
      this.showNote('Exporting schema...');
      this.setState({ showExportSchemaDialog: false });
      let schema = [];
      if (all) {
        schema = await Parse.Schema.all();
      } else {
        schema = await new Parse.Schema(className).get();
      }
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(schema, null, 2)], {
        type: 'application/json',
      });
      element.href = URL.createObjectURL(file);
      element.download = `${all ? 'schema' : className}.json`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      document.body.removeChild(element);
    } catch (msg) {
      this.showNote(msg, true);
    }
  }

  newColumn(payload, required) {
    return this.props.schema
      .dispatch(ActionTypes.ADD_COLUMN, payload)
      .then(() => {
        if (required) {
          const requiredCols = [...this.state.requiredColumnFields, name];
          this.setState({
            requiredColumnFields: requiredCols,
          });
        }
      })
      .catch(err => {
        this.showNote(err.message, true);
      });
  }

  addColumn({ type, name, target, required, defaultValue }) {
    const payload = {
      className: this.props.params.className,
      columnType: type,
      name: name,
      targetClass: target,
      required,
      defaultValue,
    };
    this.newColumn(payload, required).finally(() => {
      this.setState({ showAddColumnDialog: false, keepAddingCols: false });
    });
  }

  addColumnAndContinue({ type, name, target, required, defaultValue }) {
    const payload = {
      className: this.props.params.className,
      columnType: type,
      name: name,
      targetClass: target,
      required,
      defaultValue,
    };
    this.newColumn(payload, required).finally(() => {
      this.setState({ showAddColumnDialog: false, keepAddingCols: false });
      this.setState({ showAddColumnDialog: true, keepAddingCols: true });
    });
  }

  addRow() {
    if (!this.state.newObject) {
      const relation = this.state.relation;
      this.setState({
        newObject: relation
          ? new Parse.Object(relation.targetClassName)
          : new Parse.Object(this.props.params.className),
      });
    }
  }

  abortAddRow() {
    if (this.state.newObject) {
      this.setState({
        newObject: null,
      });
    }
    if (this.state.markRequiredFieldRow !== 0) {
      this.setState({
        markRequiredFieldRow: 0,
      });
    }
  }

  saveNewRow() {
    const { useMasterKey } = this.state;
    const obj = this.state.newObject;
    if (!obj) {
      return;
    }

    // check if required fields are missing
    const className = this.state.newObject.className;
    const requiredCols = [];
    if (className) {
      const classColumns = this.props.schema.data.get('classes').get(className);
      classColumns.forEach(({ required }, name) => {
        if (name === 'objectId' || (this.state.isUnique && name !== this.state.uniqueField)) {
          return;
        }
        if (required) {
          requiredCols.push(name);
        }
        if (className === '_User' && (name === 'username' || name === 'password')) {
          if (!obj.get('authData')) {
            requiredCols.push(name);
          }
        }
        if (className === '_Role' && (name === 'name' || name === 'ACL')) {
          requiredCols.push(name);
        }
      });
    }
    if (requiredCols.length) {
      for (let idx = 0; idx < requiredCols.length; idx++) {
        const name = requiredCols[idx];
        if (obj.get(name) == null) {
          this.showNote('Please enter all required fields', true);
          this.setState({
            markRequiredFieldRow: -1,
          });
          return;
        }
      }
    }
    if (this.state.markRequiredFieldRow) {
      this.setState({
        markRequiredFieldRow: 0,
      });
    }
    obj.save(null, { useMasterKey }).then(
      objectSaved => {
        const msg = `${objectSaved.className} with id '${objectSaved.id}' created`;
        this.showNote(msg, false);

        const state = { data: this.state.data };
        const relation = this.state.relation;
        if (relation) {
          const parent = relation.parent;
          const parentRelation = parent.relation(relation.key);
          parentRelation.add(obj);
          const targetClassName = relation.targetClassName;
          parent.save(null, { useMasterKey }).then(
            () => {
              this.setState({
                newObject: null,
                data: [obj, ...this.state.data],
                relationCount: this.state.relationCount + 1,
                counts: {
                  ...this.state.counts,
                  [targetClassName]: this.state.counts[targetClassName] + 1,
                },
              });
            },
            error => {
              let msg = typeof error === 'string' ? error : error.message;
              if (msg) {
                msg = msg[0].toUpperCase() + msg.substr(1);
              }
              obj.revert();
              this.setState({ data: this.state.data });
              this.showNote(msg, true);
            }
          );
        } else {
          state.newObject = null;
          if (this.props.params.className === obj.className) {
            this.state.data.unshift(obj);
          }
          this.state.counts[obj.className] += 1;
        }

        this.setState(state);
      },
      error => {
        let msg = typeof error === 'string' ? error : error.message;
        if (msg) {
          msg = msg[0].toUpperCase() + msg.substr(1);
        }
        this.showNote(msg, true);
      }
    );
  }

  saveEditCloneRow(rowIndex) {
    let obj;
    if (rowIndex < -1) {
      obj = this.state.editCloneRows[rowIndex + (this.state.editCloneRows.length + 1)];
    }
    if (!obj) {
      return;
    }

    // check if required fields are missing
    const className = this.props.params.className;
    const requiredCols = [];
    if (className) {
      const classColumns = this.props.schema.data.get('classes').get(className);
      classColumns.forEach(({ required }, name) => {
        if (name === 'objectId' || (this.state.isUnique && name !== this.state.uniqueField)) {
          return;
        }
        if (required) {
          requiredCols.push(name);
        }
        if (className === '_User' && (name === 'username' || name === 'password')) {
          if (!obj.get('authData')) {
            requiredCols.push(name);
          }
        }
        if (className === '_Role' && (name === 'name' || name === 'ACL')) {
          requiredCols.push(name);
        }
      });
    }
    if (requiredCols.length) {
      for (let idx = 0; idx < requiredCols.length; idx++) {
        const name = requiredCols[idx];
        if (obj.get(name) == null) {
          this.showNote('Please enter all required fields', true);
          this.setState({
            markRequiredFieldRow: rowIndex,
          });
          return;
        }
      }
    }
    if (this.state.markRequiredFieldRow) {
      this.setState({
        markRequiredFieldRow: 0,
      });
    }

    obj.save(null, { useMasterKey: true }).then(
      objectSaved => {
        const msg = `${objectSaved.className} with id '${objectSaved.id}' created`;
        this.showNote(msg, false);

        const state = {
          data: this.state.data,
          editCloneRows: this.state.editCloneRows,
        };
        state.editCloneRows = state.editCloneRows.filter(
          cloneObj => cloneObj._localId !== obj._localId
        );
        if (state.editCloneRows.length === 0) {
          state.editCloneRows = null;
        }
        if (this.props.params.className === obj.className) {
          this.state.data.unshift(obj);
        }
        this.state.counts[obj.className] += 1;
        this.setState(state);
      },
      error => {
        let msg = typeof error === 'string' ? error : error.message;
        if (msg) {
          msg = msg[0].toUpperCase() + msg.substr(1);
        }

        this.showNote(msg, true);
      }
    );
  }

  abortEditCloneRow(rowIndex) {
    let obj;
    if (rowIndex < -1) {
      obj = this.state.editCloneRows[rowIndex + (this.state.editCloneRows.length + 1)];
    }
    if (!obj) {
      return;
    }
    const state = { editCloneRows: this.state.editCloneRows };
    state.editCloneRows = state.editCloneRows.filter(
      cloneObj => cloneObj._localId !== obj._localId
    );
    if (state.editCloneRows.length === 0) {
      state.editCloneRows = null;
    }
    this.setState(state);
  }

  addRowWithModal() {
    this.addRow();
    this.selectRow(undefined, true);
    this.showEditRowDialog();
  }

  cancelPendingEditRows() {
    this.setState({
      editCloneRows: null,
    });
  }

  addEditCloneRows(cloneRows) {
    this.setState({
      editCloneRows: cloneRows,
    });
  }

  removeColumn(name) {
    const payload = {
      className: this.props.params.className,
      name: name,
    };
    this.props.schema.dispatch(ActionTypes.DROP_COLUMN, payload).finally(() => {
      const state = { showRemoveColumnDialog: false };
      if (this.state.ordering === name || this.state.ordering === '-' + name) {
        state.ordering = '-createdAt';
      }
      this.setState(state);
    });
  }

  async handleFetchedSchema() {
    if (this.state.computingClassCounts === false) {
      this.setState({ computingClassCounts: true });

      const promises = [];
      for (const parseClass of this.props.schema.data.get('classes')) {
        const [className] = parseClass;
        const promise = this.context.getClassCount(className).then(count => {
          this.setState(prevState => ({
            counts: {
              ...prevState.counts,
              [className]: count
            }
          }));
        });
        promises.push(promise);
      }

      await Promise.all(promises);

      this.setState({
        clp: this.props.schema.data.get('CLPs').toJS(),
        computingClassCounts: false,
      });
    }
  }

  getAllClassesSchema(allClasses, allClassesData) {
    const schemaSimplifiedData = {};
    allClasses.forEach(className => {
      const classSchema = allClassesData.get(className);
      if (classSchema) {
        schemaSimplifiedData[className] = {};
        classSchema.forEach(({ type, targetClass }, col) => {
          schemaSimplifiedData[className][col] = {
            type,
            targetClass,
          };
        });
      }
    });
    return schemaSimplifiedData;
  }

  async refresh() {
    if (Object.keys(this.state.selection).length > 0) {
      if (!window.confirm(SELECTED_ROWS_MESSAGE)) {
        return;
      }
    }
    const relation = this.state.relation;
    const prevFilters = this.state.filters || new List();
    const initialState = {
      data: null,
      newObject: null,
      lastMax: -1,
      selection: {},
      editCloneRows: null,
    };
    if (relation) {
      this.setState(initialState);
      this.setRelation(relation, prevFilters);
    } else {
      this.setState({
        ...initialState,
        relation: null,
      });
      await this.fetchData(this.props.params.className, prevFilters);
    }
  }

  async fetchParseData(source, filters) {
    if (this.currentQuery) {
      this.currentQuery.cancel();
    }

    const { useMasterKey, skip, limit } = this.state;
    this.setState({
      data: null,
    });
    const query = await queryFromFilters(source, filters);
    const sortDir = this.state.ordering[0] === '-' ? '-' : '+';
    const field = this.state.ordering.substr(sortDir === '-' ? 1 : 0);

    if (sortDir === '-') {
      query.descending(field);
    } else {
      query.ascending(field);
    }
    query.skip(skip);
    query.limit(limit);

    localStorage?.setItem('browserLimit', limit);

    this.excludeFields(query, source);
    this.currentQuery = query;
    let promise = query.find({ useMasterKey });
    let isUnique = false;
    let uniqueField = null;
    filters.forEach(async filter => {
      if (filter.get('constraint') == 'unique') {
        const field = filter.get('field');
        promise = query.distinct(field);
        isUnique = true;
        uniqueField = field;
      }
    });
    this.setState({ isUnique, uniqueField });

    const data = await promise;
    return data;
  }

  excludeFields(query, className) {
    let columns = ColumnPreferences.getPreferences(this.context.applicationId, className);
    if (columns) {
      columns = columns.filter(clmn => !clmn.visible).map(clmn => clmn.name);
      for (const columnsKey in columns) {
        query.exclude(columns[columnsKey]);
      }
      ColumnPreferences.updateCachedColumns(this.context.applicationId, className);
    }
  }

  async fetchParseDataCount(source, filters) {
    const query = await queryFromFilters(source, filters);
    const { useMasterKey } = this.state;
    const count = await query.count({ useMasterKey });
    return count;
  }

  async fetchData(source, filters = new List()) {
    this.loadingFilters = JSON.stringify(filters.toJSON());
    try {
      const data = await this.fetchParseData(source, filters);
      if (this.loadingFilters !== JSON.stringify(filters.toJSON())) {
        return;
      }

      const filteredCounts = { ...this.state.filteredCounts };
      if (filters.size > 0) {
        if (this.state.isUnique) {
          filteredCounts[source] = data.length;
        } else {
          filteredCounts[source] = await this.fetchParseDataCount(source, filters);
        }
      } else {
        delete filteredCounts[source];
      }
      this.setState({
        data: data,
        filters,
        lastMax: this.state.limit,
        filteredCounts: filteredCounts,
      });
    } catch (error) {
      const msg = typeof error === 'string' ? error : error.message;
      this.setState({
        data: [],
        filters,
        lastMax: this.state.limit,
      });
      this.showNote(msg, true);
    }
  }

  async fetchRelation(relation, filters = new List()) {
    try {
      const data = await this.fetchParseData(relation, filters);
      const relationCount = await this.fetchRelationCount(relation);
      this.setState({
        relation,
        relationCount,
        selection: {},
        data,
        filters,
        lastMax: this.state.limit,
      });
    } catch (error) {
      const msg = typeof error === 'string' ? error : error.message;
      this.setState({
        data: [],
        filters,
        lastMax: this.state.limit,
      });
      this.showNote(msg, true);
    }
  }

  async fetchRelationCount(relation) {
    return await this.context.getRelationCount(relation);
  }

  async fetchNextPage() {
    if (!this.state.data || this.state.isUnique) {
      return null;
    }
    const className = this.props.params.className;
    const source = this.state.relation || className;
    let query = await queryFromFilters(source, this.state.filters);
    if (this.state.ordering !== '-createdAt') {
      // Construct complex pagination query
      const equalityQuery = queryFromFilters(source, this.state.filters);
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
      if (field === 'createdAt') {
        equalityQuery.greaterThan(
          'createdAt',
          this.state.data[this.state.data.length - 1].get('createdAt')
        );
      } else {
        equalityQuery.lessThan(
          'createdAt',
          this.state.data[this.state.data.length - 1].get('createdAt')
        );
        equalityQuery.equalTo(field, comp);
      }
      query = Parse.Query.or(query, equalityQuery);
      if (ascending) {
        query.ascending(this.state.ordering);
      } else {
        query.descending(this.state.ordering.substr(1));
      }
    } else {
      query.lessThan('createdAt', this.state.data[this.state.data.length - 1].get('createdAt'));
      query.addDescending('createdAt');
    }
    query.limit(this.state.limit);
    this.excludeFields(query, source);

    const { useMasterKey } = this.state;
    query.find({ useMasterKey }).then(nextPage => {
      if (className === this.props.params.className) {
        this.setState(state => ({
          data: state.data.concat(nextPage),
        }));
      }
    }).catch(error => {
      const msg = typeof error === 'string' ? error : error.message;
      this.showNote(msg, true);
    });
    this.setState({ lastMax: this.state.lastMax + this.state.limit });
  }

  updateFilters(filters) {
    // Check if there are selected rows
    if (Object.keys(this.state.selection).length > 0) {
      if (!window.confirm(SELECTED_ROWS_MESSAGE)) {
        return;
      }
    }

    const relation = this.state.relation;
    if (relation) {
      this.setRelation(relation, filters);
    } else {
      const source = this.props.params.className;
      const _filters = JSON.stringify(filters.toJSON());

      // Preserve filterId from current URL if it exists
      const currentUrlParams = new URLSearchParams(window.location.search);
      const currentFilterId = currentUrlParams.get('filterId');

      let url = `browser/${source}`;
      if (filters.size === 0) {
        // If no filters, don't include any query parameters
        url = `browser/${source}`;
      } else {
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.set('filters', _filters);

        // Preserve filterId if it exists in current URL
        if (currentFilterId) {
          queryParams.set('filterId', currentFilterId);
        }

        url = `browser/${source}?${queryParams.toString()}`;
      }

      // filters param change is making the fetch call
      this.props.navigate(generatePath(this.context, url));
    }

    this.setState({
      skip: 0,
    });
  }

  saveFilters(filters, name, relativeDate, filterId = null) {
    const jsonFilters = filters.toJSON();
    if (relativeDate && jsonFilters?.length) {
      for (let i = 0; i < jsonFilters.length; i++) {
        const filter = jsonFilters[i];
        const compareTo = filter.get('compareTo');
        if (compareTo?.__type === 'Date') {
          compareTo.__type = 'RelativeDate';
          const now = new Date();
          const date = new Date(compareTo.iso);
          const diff = date.getTime() - now.getTime();
          compareTo.value = Math.floor(diff / 1000);
          delete compareTo.iso;
          filter.set('compareTo', compareTo);
          jsonFilters[i] = filter;
        }
      }
    }

    const _filters = JSON.stringify(jsonFilters);
    const preferences = ClassPreferences.getPreferences(
      this.context.applicationId,
      this.props.params.className
    );

    let newFilterId = filterId;

    if (filterId && filterId.startsWith('legacy:')) {
      // Handle legacy filter update by converting to modern filter
      const legacyFilterName = filterId.substring(7); // Remove 'legacy:' prefix
      const existingLegacyFilterIndex = preferences.filters.findIndex(filter =>
        !filter.id && filter.name === legacyFilterName
      );

      if (existingLegacyFilterIndex !== -1) {
        // Convert legacy filter to modern filter by adding an ID
        newFilterId = crypto.randomUUID();
        preferences.filters[existingLegacyFilterIndex] = {
          name,
          id: newFilterId,
          filter: _filters,
        };
      } else {
        // Legacy filter not found, create new one
        newFilterId = crypto.randomUUID();
        preferences.filters.push({
          name,
          id: newFilterId,
          filter: _filters,
        });
      }
    } else if (filterId) {
      // Update existing filter
      const existingFilterIndex = preferences.filters.findIndex(filter => filter.id === filterId);
      if (existingFilterIndex !== -1) {
        preferences.filters[existingFilterIndex] = {
          name,
          id: filterId,
          filter: _filters,
        };
      } else {
        // Fallback: if filter not found, create new one
        newFilterId = crypto.randomUUID();
        preferences.filters.push({
          name,
          id: newFilterId,
          filter: _filters,
        });
      }
    } else {
      // Check if this is updating a legacy filter (no filterId but filter content matches existing filter without ID)
      const existingLegacyFilterIndex = preferences.filters.findIndex(filter =>
        !filter.id && filter.name === name && filter.filter === _filters
      );

      if (existingLegacyFilterIndex !== -1) {
        // Convert legacy filter to modern filter by adding an ID
        newFilterId = crypto.randomUUID();
        preferences.filters[existingLegacyFilterIndex] = {
          name,
          id: newFilterId,
          filter: _filters,
        };
      } else {
        // Create new filter
        newFilterId = crypto.randomUUID();
        preferences.filters.push({
          name,
          id: newFilterId,
          filter: _filters,
        });
      }
    }

    ClassPreferences.updatePreferences(
      preferences,
      this.context.applicationId,
      this.props.params.className
    );

    super.forceUpdate();

    // Return the filter ID for new filters so the caller can apply them
    return newFilterId;
  }

  deleteFilter(filterIdOrObject) {
    const preferences = ClassPreferences.getPreferences(
      this.context.applicationId,
      this.props.params.className
    );

    if (preferences.filters) {
      // Try to find by ID first (modern approach)
      let updatedFilters = preferences.filters.filter(filter => filter.id !== filterIdOrObject);

      // If no filter was removed (ID not found), use fallback method
      if (updatedFilters.length === preferences.filters.length && filterIdOrObject) {
        // Fallback: try to find by comparing the entire filter object if filterIdOrObject is actually a filter object
        if (typeof filterIdOrObject === 'object') {
          let i = preferences.filters.length;
          updatedFilters = [...preferences.filters];
          while (i--) {
            const item = updatedFilters[i];
            if (JSON.stringify(item) === JSON.stringify(filterIdOrObject)) {
              updatedFilters.splice(i, 1);
            }
          }
        }
      }

      ClassPreferences.updatePreferences(
        { ...preferences, filters: updatedFilters },
        this.context.applicationId,
        this.props.params.className
      );
    }

    super.forceUpdate();
  }

  editFilter(className, filterData) {
    // Navigate to the class with the filter loaded for editing
    const { id, filter } = filterData;

    // Build URL with filter parameters for editing
    const urlParams = new URLSearchParams();
    urlParams.set('filters', filter);
    if (id) {
      urlParams.set('filterId', id);
    }

    // Add edit mode parameter to indicate we want to edit without loading data
    urlParams.set('editFilter', 'true');

    const url = `browser/${className}?${urlParams.toString()}`;

    // Navigate to the URL which will trigger the filter dialog to open in edit mode
    this.props.navigate(generatePath(this.context, url));
  }

  updateOrdering(ordering) {
    const source = this.state.relation || this.props.params.className;
    this.setState(
      {
        ordering: ordering,
        selection: {},
        errorAggregatedData: {},
        isLoadingInfoPanel: false,
        AggregationPanelData: {},
      },
      () => this.fetchData(source, this.state.filters)
    );
    ColumnPreferences.getColumnSort(
      ordering,
      this.context.applicationId,
      this.props.params.className
    );
  }

  getRelationURL() {
    const relation = this.state.relation;
    const className = relation.parent.className;
    const entityId = relation.parent.id;
    const relationName = relation.key;
    return generatePath(this.context, `browser/${className}/${entityId}/${relationName}`);
  }

  setRelation(relation, filters) {
    this.setState(
      {
        relation: relation,
        data: null,
      },
      () => {
        // Preserve filterId from current URL if it exists
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentFilterId = currentUrlParams.get('filterId');

        let url = this.getRelationURL();
        if (filters && filters.size) {
          const queryParams = new URLSearchParams();
          queryParams.set('filters', JSON.stringify(filters.toJSON()));

          // Preserve filterId if it exists in current URL
          if (currentFilterId) {
            queryParams.set('filterId', currentFilterId);
          }

          url = `${url}?${queryParams.toString()}`;
        }

        this.props.navigate(url);
      }
    );
    this.fetchRelation(relation, filters);
  }

  handlePointerClick({ className, id, field = 'objectId' }) {
    const filters = JSON.stringify([
      {
        field,
        constraint: 'eq',
        compareTo: id,
      },
    ]);
    this.props.navigate(
      generatePath(this.context, `browser/${className}?filters=${encodeURIComponent(filters)}`)
    );

    this.setState({
      skip: 0,
    });
  }

  handlePointerCmdClick({ className, id, field = 'objectId' }) {
    const filters = JSON.stringify([
      {
        field,
        constraint: 'eq',
        compareTo: id,
      },
    ]);
    window.open(
      generatePath(
        this.context,
        `browser/${className}?filters=${encodeURIComponent(filters)}`,
        true
      ),
      '_blank'
    );
  }

  handleCLPChange(clp) {
    const p = this.props.schema.dispatch(ActionTypes.SET_CLP, {
      className: this.props.params.className,
      clp,
    });
    p.then(() => this.handleFetchedSchema());
    return p;
  }

  updateRow(row, attr, value) {
    const isNewObject = row === -1;
    const isEditCloneObj = row < -1;
    let obj = isNewObject ? this.state.newObject : this.state.data[row];
    if (isEditCloneObj) {
      obj = this.state.editCloneRows[row + (this.state.editCloneRows.length + 1)];
    }
    if (!obj) {
      return;
    }
    const prev = obj.get(attr);
    if (value === prev) {
      return;
    }
    if (value === undefined) {
      obj.unset(attr);
    } else {
      obj.set(attr, value);
    }

    if (isNewObject) {
      this.setState({
        isNewObject: obj,
      });
      return;
    }
    if (isEditCloneObj) {
      const editObjIndex = row + (this.state.editCloneRows.length + 1);
      const cloneRows = [...this.state.editCloneRows];
      cloneRows.splice(editObjIndex, 1, obj);
      this.setState({
        editCloneRows: cloneRows,
      });
      return;
    }

    const { useMasterKey } = this.state;
    obj.save(null, { useMasterKey }).then(
      objectSaved => {
        const msg = `${objectSaved.className} with id '${objectSaved.id}' updated`;
        this.showNote(msg, false);

        const state = {
          data: this.state.data,
          editCloneRows: this.state.editCloneRows,
        };

        if (isNewObject) {
          const relation = this.state.relation;
          if (relation) {
            const parent = relation.parent;
            const parentRelation = parent.relation(relation.key);
            parentRelation.add(obj);
            const targetClassName = relation.targetClassName;
            parent.save(null, { useMasterKey: true }).then(
              () => {
                this.setState({
                  newObject: null,
                  data: [obj, ...this.state.data],
                  relationCount: this.state.relationCount + 1,
                  counts: {
                    ...this.state.counts,
                    [targetClassName]: this.state.counts[targetClassName] + 1,
                  },
                });
              },
              error => {
                let msg = typeof error === 'string' ? error : error.message;
                if (msg) {
                  msg = msg[0].toUpperCase() + msg.substr(1);
                }
                obj.set(attr, prev);
                this.setState({ data: this.state.data });
                this.showNote(msg, true);
              }
            );
          } else {
            state.newObject = null;
            if (this.props.params.className === obj.className) {
              this.state.data.unshift(obj);
            }
            this.state.counts[obj.className] += 1;
          }
        }
        if (isEditCloneObj) {
          state.editCloneRows = state.editCloneRows.filter(
            cloneObj => cloneObj._localId !== obj._localId
          );
          if (state.editCloneRows.length === 0) {
            state.editCloneRows = null;
          }
          if (this.props.params.className === obj.className) {
            this.state.data.unshift(obj);
          }
          this.state.counts[obj.className] += 1;
        }
        this.setState(state);
      },
      error => {
        let msg = typeof error === 'string' ? error : error.message;
        if (msg) {
          msg = msg[0].toUpperCase() + msg.substr(1);
        }
        if (!isNewObject && !isEditCloneObj) {
          obj.set(attr, prev);
          this.setState({ data: this.state.data });
        }

        this.showNote(msg, true);
      }
    );
  }

  deleteRows(rows) {
    this.setState({ rowsToDelete: null, selection: {} });
    const className = this.props.params.className;
    if (!this.state.relation && rows['*']) {
      this.context.clearCollection(className).then(() => {
        if (this.props.params.className === className) {
          this.state.counts[className] = 0;
          this.setState({
            data: [],
            lastMax: this.state.limit,
            selection: {},
          });
        }
      });
    } else {
      const indexes = [];
      const toDelete = [];
      const seeking = Object.keys(rows).length;
      for (let i = 0; i < this.state.data.length && indexes.length < seeking; i++) {
        const obj = this.state.data[i];
        if (!obj || !obj.id) {
          continue;
        }
        if (rows[obj.id]) {
          indexes.push(i);
          toDelete.push(this.state.data[i]);
        }
      }

      const toDeleteObjectIds = [];
      toDelete.forEach(obj => {
        toDeleteObjectIds.push(obj.id);
      });

      const { useMasterKey } = this.state;
      const relation = this.state.relation;
      if (relation && toDelete.length) {
        relation.remove(toDelete);
        relation.parent.save(null, { useMasterKey }).then(() => {
          if (this.state.relation === relation) {
            for (let i = 0; i < indexes.length; i++) {
              this.state.data.splice(indexes[i] - i, 1);
            }
            this.setState({
              relationCount: this.state.relationCount - toDelete.length,
            });
          }
        });
      } else if (toDelete.length) {
        Parse.Object.destroyAll(toDelete, { useMasterKey }).then(
          () => {
            let deletedNote;

            if (toDeleteObjectIds.length == 1) {
              deletedNote = `${className} with id '${toDeleteObjectIds[0]}' deleted`;
            } else {
              deletedNote = `${toDeleteObjectIds.length} ${className} objects deleted`;
            }

            this.showNote(deletedNote, false);

            if (this.props.params.className === className) {
              for (let i = 0; i < indexes.length; i++) {
                this.state.data.splice(indexes[i] - i, 1);
              }
              this.state.counts[className] -= indexes.length;

              // If after deletion, the remaining elements on the table is lesser than the maximum allowed elements
              // we fetch more data to fill the table
              if (this.state.data.length < this.state.limit) {
                this.prefetchData(this.props, this.context);
              } else {
                this.forceUpdate();
              }
            }
          },
          error => {
            let errorDeletingNote = null;

            if (error.code === Parse.Error.AGGREGATE_ERROR) {
              if (error.errors.length == 1) {
                errorDeletingNote = `Error deleting ${className} with id '${error.errors[0].object.id}'`;
              } else if (error.errors.length < toDeleteObjectIds.length) {
                errorDeletingNote = `Error deleting ${error.errors.length} out of ${toDeleteObjectIds.length} ${className} objects`;
              } else {
                errorDeletingNote = `Error deleting all ${error.errors.length} ${className} objects`;
              }
            } else {
              if (toDeleteObjectIds.length == 1) {
                errorDeletingNote = `Error deleting ${className} with id '${toDeleteObjectIds[0]}'`;
              } else {
                errorDeletingNote = `Error deleting ${toDeleteObjectIds.length} ${className} objects`;
              }
            }

            this.showNote(errorDeletingNote, true);
          }
        );
      }
    }
  }

  selectRow(id, checked) {
    this.setState(({ selection }) => {
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
      this.state.showExportSchema ||
      this.state.rowsToDelete ||
      this.state.showAttachRowsDialog ||
      this.state.showAttachSelectedRowsDialog ||
      this.state.showCloneSelectedRowsDialog ||
      this.state.showEditRowDialog ||
      this.state.showPermissionsDialog ||
      this.state.showExportSelectedRowsDialog
    );
  }

  showAttachRowsDialog() {
    this.setState({
      showAttachRowsDialog: true,
    });
  }

  cancelAttachRows() {
    this.setState({
      showAttachRowsDialog: false,
    });
  }

  async confirmAttachRows(objectIds) {
    if (!objectIds || !objectIds.length) {
      throw 'No objectId passed';
    }
    const { useMasterKey } = this.state;
    const relation = this.state.relation;
    const query = new Parse.Query(relation.targetClassName);
    const parent = relation.parent;
    query.containedIn('objectId', objectIds);
    let objects = await query.find({ useMasterKey });
    const missedObjectsCount = objectIds.length - objects.length;
    if (missedObjectsCount) {
      const missedObjects = [];
      objectIds.forEach(objectId => {
        const object = objects.find(x => x.id === objectId);
        if (!object) {
          missedObjects.push(objectId);
        }
      });
      const errorSummary = `${
        missedObjectsCount === 1 ? 'The object is' : `${missedObjectsCount} Objects are`
      } not retrieved:`;
      throw `${errorSummary} ${JSON.stringify(missedObjects)}`;
    }
    parent.relation(relation.key).add(objects);
    await parent.save(null, { useMasterKey });
    // remove duplication
    this.state.data.forEach(
      origin => (objects = objects.filter(object => object.id !== origin.id))
    );
    this.setState({
      data: [...objects, ...this.state.data],
      relationCount: this.state.relationCount + objects.length,
      showAttachRowsDialog: false,
    });
  }

  showAttachSelectedRowsDialog() {
    this.setState({
      showAttachSelectedRowsDialog: true,
    });
  }

  cancelAttachSelectedRows() {
    this.setState({
      showAttachSelectedRowsDialog: false,
    });
  }

  showExecuteScriptRowsDialog() {
    this.setState({
      showExecuteScriptRowsDialog: true,
    });
  }

  cancelExecuteScriptRowsDialog() {
    this.setState({
      showExecuteScriptRowsDialog: false,
    });
  }

  async confirmAttachSelectedRows(
    className,
    targetObjectId,
    relationName,
    objectIds,
    targetClassName
  ) {
    const { useMasterKey } = this.state;
    const parentQuery = new Parse.Query(className);
    const parent = await parentQuery.get(targetObjectId, { useMasterKey });
    const query = new Parse.Query(targetClassName || this.props.params.className);
    query.containedIn('objectId', objectIds);
    const objects = await query.find({ useMasterKey });
    parent.relation(relationName).add(objects);
    await parent.save(null, { useMasterKey });
    this.setState({
      selection: {},
    });
  }

  async confirmExecuteScriptRows(script) {
    const batchSize = script.executionBatchSize || 1;
    try {
      const objects = Object.keys(this.state.selection).map(key =>
        Parse.Object.extend(this.props.params.className).createWithoutData(key)
      );

      let totalErrorCount = 0;
      let batchCount = 0;
      const totalBatchCount = Math.ceil(objects.length / batchSize);

      for (let i = 0; i < objects.length; i += batchSize) {
        batchCount++;
        const batch = objects.slice(i, i + batchSize);
        const promises = batch.map(object =>
          Parse.Cloud.run(
            script.cloudCodeFunction,
            { object: object.toPointer() },
            { useMasterKey: true }
          )
            .then(response => ({
              objectId: object.id,
              response,
            }))
            .catch(error => ({
              objectId: object.id,
              error,
            }))
        );

        const results = await Promise.all(promises);

        let batchErrorCount = 0;
        results.forEach(({ objectId, response, error }) => {
          this.setState(prevState => ({
            processedScripts: prevState.processedScripts + 1,
          }));

          if (error) {
            batchErrorCount += 1;
            const errorMessage = `Error running script "${script.title}" on "${objectId}": ${error.message}`;
            this.showNote(errorMessage, true);
            console.error(errorMessage, error);
          } else {
            const note =
              (typeof response === 'object' ? JSON.stringify(response) : response) ||
              `Ran script "${script.title}" on "${objectId}".`;
            this.showNote(note);
          }
        });

        totalErrorCount += batchErrorCount;

        if (objects.length > 1) {
          this.showNote(
            `Ran script "${script.title}" on ${batch.length} objects in batch ${batchCount}/${totalBatchCount} with ${batchErrorCount} errors.`,
            batchErrorCount > 0
          );
        }
      }

      if (objects.length > 1) {
        this.showNote(
          `Ran script "${script.title}" on ${objects.length} objects in ${batchCount} batches with ${totalErrorCount} errors.`,
          totalErrorCount > 0
        );
      }
      this.setState(
        { selection: {}, showExecuteScriptRowsDialog: false },
        () => this.refresh()
      );
    } catch (e) {
      this.showNote(e.message, true);
      console.log(`Could not run ${script.title}: ${e}`);
    } finally {
      this.setState({
        processedScripts: 0,
      });
    }
  }

  showCloneSelectedRowsDialog() {
    this.setState({
      showCloneSelectedRowsDialog: true,
    });
  }

  cancelCloneSelectedRows() {
    this.setState({
      showCloneSelectedRowsDialog: false,
    });
  }

  async confirmCloneSelectedRows() {
    const { useMasterKey } = this.state;
    const objectIds = [];
    for (const objectId in this.state.selection) {
      objectIds.push(objectId);
    }
    const className = this.props.params.className;
    const query = new Parse.Query(className);
    query.containedIn('objectId', objectIds);
    const objects = await query.find({ useMasterKey });
    const toClone = [];
    for (const object of objects) {
      const clonedObj = object.clone();
      if (className === '_User') {
        clonedObj.set('username', undefined);
        clonedObj.set('authData', undefined);
      }
      toClone.push(clonedObj);
    }
    try {
      await Parse.Object.saveAll(toClone, { useMasterKey });
      this.setState({
        selection: {},
        data: [...toClone, ...this.state.data],
        showCloneSelectedRowsDialog: false,
        counts: {
          ...this.state.counts,
          [className]: this.state.counts[className] + toClone.length,
        },
      });
    } catch (error) {
      //for duplicate, username missing or required field missing errors
      if (error.code === 137 || error.code === 200 || error.code === 142) {
        const failedSaveObj = [];
        const savedObjects = [];
        toClone.forEach(cloneObj => {
          cloneObj.dirty() ? failedSaveObj.push(cloneObj) : savedObjects.push(cloneObj);
        });
        if (savedObjects.length) {
          this.setState({
            data: [...savedObjects, ...this.state.data],
            counts: {
              ...this.state.counts,
              [className]: this.state.counts[className] + savedObjects.length,
            },
          });
        }
        this.addEditCloneRows(failedSaveObj);
      }
      this.setState({
        showCloneSelectedRowsDialog: false,
      });
      this.showNote(error.message, true);
    }
  }

  showExportSelectedRowsDialog(rows) {
    this.setState({
      rowsToExport: rows,
    });
  }

  showExportSchemaDialog() {
    this.setState({
      showExportSchemaDialog: true,
    });
  }

  cancelExportSelectedRows() {
    this.setState({
      rowsToExport: null,
    });
  }

  async confirmExportSelectedRows(rows, type, indentation) {
    this.setState({ rowsToExport: null, exporting: true, exportingCount: 0 });
    const className = this.props.params.className;
    const query = new Parse.Query(className);

    if (!rows['*']) {
      // Export selected
      const objectIds = [];
      for (const objectId in this.state.rowsToExport) {
        objectIds.push(objectId);
      }
      query.containedIn('objectId', objectIds);
      query.limit(objectIds.length);
    }

    const processObjects = objects => {
      const classColumns = this.getClassColumns(className, false);
      // create object with classColumns as property keys needed for ColumnPreferences.getOrder function
      const columnsObject = {};
      classColumns.forEach(column => {
        columnsObject[column.name] = column;
      });
      // get ordered list of class columns
      const columns = ColumnPreferences.getOrder(
        columnsObject,
        this.context.applicationId,
        className
      ).filter(column => column.visible);

      if (type === '.json') {
        const element = document.createElement('a');
        const file = new Blob(
          [
            JSON.stringify(
              objects.map(obj => {
                const json = obj._toFullJSON();
                delete json.__type;
                return json;
              }),
              null,
              indentation ? 2 : null
            ),
          ],
          { type: 'application/json' }
        );
        element.href = URL.createObjectURL(file);
        element.download = `${className}.json`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
        return;
      }

      let csvString = columns.map(column => column.name).join(',') + '\n';
      for (const object of objects) {
        const row = columns
          .map(column => {
            const type = columnsObject[column.name].type;
            if (column.name === 'objectId') {
              return object.id;
            } else if (type === 'Relation' || type === 'Pointer') {
              if (object.get(column.name)) {
                return object.get(column.name).id;
              } else {
                return '';
              }
            } else {
              let colValue;
              if (column.name === 'ACL') {
                colValue = object.getACL();
              } else {
                colValue = object.get(column.name);
              }
              // Stringify objects and arrays
              if (
                Object.prototype.toString.call(colValue) === '[object Object]' ||
                Object.prototype.toString.call(colValue) === '[object Array]'
              ) {
                colValue = JSON.stringify(colValue);
              }
              if (typeof colValue === 'string') {
                if (colValue.includes('"')) {
                  // Has quote in data, escape and quote
                  // If the value contains both a quote and delimiter, adding quotes and escaping will take care of both scenarios
                  colValue = colValue.split('"').join('""');
                  return `"${colValue}"`;
                } else if (colValue.includes(',')) {
                  // Has delimiter in data, surround with quote (which the value doesn't already contain)
                  return `"${colValue}"`;
                } else {
                  // No quote or delimiter, just include plainly
                  return `${colValue}`;
                }
              } else if (colValue === undefined) {
                // Export as empty CSV field
                return '';
              } else {
                return `${colValue}`;
              }
            }
          })
          .join(',');
        csvString += row + '\n';
      }

      // Deliver to browser to download file
      const element = document.createElement('a');
      const file = new Blob([csvString], { type: 'text/csv' });
      element.href = URL.createObjectURL(file);
      element.download = `${className}.csv`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      document.body.removeChild(element);
    };

    if (!rows['*']) {
      const objects = await query.find({ useMasterKey: true });
      processObjects(objects);
      this.setState({ exporting: false, exportingCount: objects.length });
    } else {
      let batch = [];
      query.eachBatch(
        obj => {
          batch.push(...obj);
          if (batch.length % 10 === 0) {
            this.setState({ exportingCount: batch.length });
          }
          const one_gigabyte = Math.pow(2, 30);
          const size = new TextEncoder().encode(JSON.stringify(batch)).length / one_gigabyte;
          if (size.length > 1) {
            processObjects(batch);
            batch = [];
          }
          if (obj.length !== 100) {
            processObjects(batch);
            batch = [];
            this.setState({ exporting: false, exportingCount: 0 });
          }
        },
        { useMasterKey: true }
      );
    }
  }

  getClassRelationColumns(className) {
    const currentClassName = this.props.params.className;
    return this.getClassColumns(className, false)
      .map(column => {
        if (column.type === 'Relation' && column.targetClass === currentClassName) {
          return column.name;
        }
      })
      .filter(column => column);
  }

  getClassColumns(className, onlyTouchable = true) {
    let columns = [];
    const classes = this.props.schema.data.get('classes');
    classes.get(className).forEach((field, name) => {
      columns.push({
        ...field,
        name,
      });
    });
    if (onlyTouchable) {
      let untouchable = DefaultColumns.All;
      if (className[0] === '_' && DefaultColumns[className]) {
        untouchable = untouchable.concat(DefaultColumns[className]);
      }
      columns = columns.filter(column => untouchable.indexOf(column.name) === -1);
    }
    return columns;
  }

  renderSidebar() {
    const current = this.props.params.className || '';
    const classes = this.props.schema.data.get('classes');
    if (!classes) {
      return null;
    }
    const special = [];
    const categories = [];
    classes.forEach((value, key) => {
      let count = this.state.counts[key];
      if (count === undefined) {
        // Show loading indicator while counts are being computed, empty string if computation is done
        count = this.state.computingClassCounts ? '...' : '';
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
    if (special.length > 0 && categories.length > 0) {
      special.push({ type: 'separator', id: 'classSeparator' });
    }
    const allCategories = [];
    for (const row of [...special, ...categories]) {
      const { filters = [] } = ClassPreferences.getPreferences(
        this.context.applicationId,
        row.name
      );
      // Set filters sorted alphabetically
      row.filters = filters.sort((a, b) => a.name.localeCompare(b.name));
      allCategories.push(row);
    }

    return (
      <CategoryList
        current={current}
        params={this.props.location?.search}
        linkPrefix={'browser/'}
        filterClicked={url => {
          this.resetPage();
          this.props.navigate(generatePath(this.context, url));
        }}
        classClicked={() => {
          this.resetPage();
        }}
        onEditFilter={this.editFilter}
        categories={allCategories}
      />
    );
  }

  /**
   * Resets the page to the first page of results and scrolls to the top.
   */
  resetPage() {
    // Unselect any currently selected cell and cancel editing action
    this.dataBrowserRef.current.setCurrent(null);
    this.dataBrowserRef.current.setEditing(false);

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // Reset pagination to page 1
    this.setState({
      skip: 0,
    });
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

  showEditRowDialog(selectRow, objectId) {
    // objectId is optional param which is used for doubleClick event on objectId BrowserCell
    if (selectRow) {
      // remove all selected rows and select doubleClicked row
      this.setState({ selection: {} });
      this.selectRow(objectId, true);
    }
    this.setState({
      showEditRowDialog: true,
    });
  }

  showPointerKeyDialog() {
    this.setState({ showPointerKeyDialog: true });
  }

  closeEditRowDialog() {
    this.setState({
      showEditRowDialog: false,
    });
  }

  handleShowAcl(row, col) {
    this.dataBrowserRef.current.setEditing(true);
    this.dataBrowserRef.current.setCurrent({ row, col });
  }

  // skips key controls handling when dialog is opened
  onDialogToggle(opened) {
    this.setState({ showPermissionsDialog: opened });
  }

  async onChangeDefaultKey(name) {
    ColumnPreferences.setPointerDefaultKey(
      this.context.applicationId,
      this.props.params.className,
      name
    );
    this.setState({ showPointerKeyDialog: false });
  }

  onMouseDownRowCheckBox(checked) {
    this.setState({
      rowCheckboxDragging: true,
      draggedRowSelection: !checked,
    });
  }

  onMouseUpRowCheckBox() {
    this.state.rowCheckboxDragging &&
      this.setState({
        rowCheckboxDragging: false,
        draggedRowSelection: false,
      });
  }

  onMouseOverRowCheckBox(id) {
    if (this.state.rowCheckboxDragging) {
      this.selectRow(id, this.state.draggedRowSelection);
    }
  }

  renderContent() {
    let browser = null;
    let className = this.props.params.className;
    if (this.state.relation) {
      className = this.state.relation.targetClassName;
    }
    const classes = this.props.schema.data.get('classes');
    if (classes) {
      if (classes.size === 0) {
        browser = (
          <div className={styles.empty}>
            <EmptyState
              title="You have no classes yet"
              description={'This is where you can view and edit your app\u2019s data'}
              icon="files-solid"
              cta="Create your first class"
              action={this.showCreateClass}
            />
          </div>
        );
      } else if (className && classes.get(className)) {
        let columns = {
          objectId: { type: 'String' },
        };
        if (this.state.isUnique) {
          columns = {};
        }
        classes.get(className).forEach(({ type, targetClass, required }, name) => {
          if (name === 'objectId' || (this.state.isUnique && name !== this.state.uniqueField)) {
            return;
          }
          const info = { type, required: !!required };
          if (
            className === '_User' &&
            (name === 'username' || name === 'password' || name === 'authData')
          ) {
            info.required = true;
          }
          if (className === '_Role' && (name === 'name' || name === 'ACL')) {
            info.required = true;
          }
          if (targetClass) {
            info.targetClass = targetClass;
          }
          columns[name] = info;
        });

        let count;
        if (this.state.relation) {
          count = this.state.relationCount;
        } else {
          if (className in this.state.filteredCounts) {
            count = this.state.filteredCounts[className];
          } else {
            count = this.state.counts[className];
          }
        }
        browser = (
          <>
            <DataBrowser
              app={this.context}
              ref={this.dataBrowserRef}
              isUnique={this.state.isUnique}
              uniqueField={this.state.uniqueField}
              count={count}
              perms={this.state.clp[className]}
              schema={this.props.schema}
              filters={this.state.filters}
              onFilterChange={this.updateFilters}
              onFilterSave={(...args) => this.saveFilters(...args)}
              onDeleteFilter={this.deleteFilter}
              onRemoveColumn={this.showRemoveColumn}
              onDeleteRows={this.showDeleteRows}
              onDropClass={this.showDropClass}
              onExport={this.showExport}
              onChangeCLP={this.handleCLPChange}
              onRefresh={this.refresh}
              onAttachRows={this.showAttachRowsDialog}
              onAttachSelectedRows={this.showAttachSelectedRowsDialog}
              onExecuteScriptRows={this.showExecuteScriptRowsDialog}
              onCloneSelectedRows={this.showCloneSelectedRowsDialog}
              onEditSelectedRow={this.showEditRowDialog}
              onEditPermissions={this.onDialogToggle}
              onExportSelectedRows={this.showExportSelectedRowsDialog}
              onExportSchema={this.showExportSchemaDialog}
              onSaveNewRow={this.saveNewRow}
              onShowPointerKey={this.showPointerKeyDialog}
              onAbortAddRow={this.abortAddRow}
              onSaveEditCloneRow={this.saveEditCloneRow}
              onAbortEditCloneRow={this.abortEditCloneRow}
              onCancelPendingEditRows={this.cancelPendingEditRows}
              currentUser={this.state.currentUser}
              useMasterKey={this.state.useMasterKey}
              login={this.login}
              logout={this.logout}
              toggleMasterKeyUsage={this.toggleMasterKeyUsage}
              markRequiredFieldRow={this.state.markRequiredFieldRow}
              requiredColumnFields={this.state.requiredColumnFields}
              columns={columns}
              className={className}
              fetchNextPage={this.fetchNextPage}
              maxFetched={this.state.lastMax}
              selectRow={this.selectRow}
              selection={this.state.selection}
              data={this.state.data}
              ordering={this.state.ordering}
              newObject={this.state.newObject}
              editCloneRows={this.state.editCloneRows}
              relation={this.state.relation}
              disableKeyControls={this.hasExtras()}
              updateRow={this.updateRow}
              updateOrdering={this.updateOrdering}
              onPointerClick={this.handlePointerClick}
              onPointerCmdClick={this.handlePointerCmdClick}
              setRelation={this.setRelation}
              onAddColumn={this.showAddColumn}
              onAddRow={this.addRow}
              onAddRowWithModal={this.addRowWithModal}
              onAddClass={this.showCreateClass}
              showNote={this.showNote}
              onMouseDownRowCheckBox={this.onMouseDownRowCheckBox}
              onMouseUpRowCheckBox={this.onMouseUpRowCheckBox}
              onMouseOverRow={this.onMouseOverRowCheckBox}
              onMouseOverRowCheckBox={this.onMouseOverRowCheckBox}
              classes={this.classes}
              classwiseCloudFunctions={this.state.classwiseCloudFunctions}
              callCloudFunction={this.fetchAggregationPanelData}
              isLoadingCloudFunction={this.state.isLoadingInfoPanel}
              setLoadingInfoPanel={this.setLoadingInfoPanel}
              AggregationPanelData={this.state.AggregationPanelData}
              setAggregationPanelData={this.setAggregationPanelData}
              setErrorAggregatedData={this.setErrorAggregatedData}
              errorAggregatedData={this.state.errorAggregatedData}
              appName={this.props.params.appId}
              limit={this.state.limit}
              skip={this.state.skip}
            />
            <BrowserFooter
              skip={this.state.skip}
              setSkip={skip => {
                this.setState({ skip });
                this.updateOrdering(this.state.ordering);
              }}
              count={count}
              limit={this.state.limit}
              setLimit={limit => {
                this.setState({ limit });
                this.updateOrdering(this.state.ordering);
              }}
              hasSelectedRows={Object.keys(this.state.selection).length > 0}
              selectedRowsMessage={SELECTED_ROWS_MESSAGE}
            />
          </>
        );
      }
    }
    let extras = null;
    if (this.state.showPointerKeyDialog) {
      const currentColumns = this.getClassColumns(className).map(column => column.name);
      extras = (
        <PointerKeyDialog
          app={this.context}
          className={className}
          currentColumns={currentColumns}
          onCancel={() => this.setState({ showPointerKeyDialog: false })}
          onConfirm={this.onChangeDefaultKey}
        />
      );
    } else if (this.state.showCreateClassDialog) {
      extras = (
        <CreateClassDialog
          currentAppSlug={this.context.slug}
          onAddColumn={this.showAddColumn}
          currentClasses={this.props.schema.data.get('classes').keySeq().toArray()}
          onCancel={() => this.setState({ showCreateClassDialog: false })}
          onConfirm={this.createClass}
        />
      );
    } else if (this.state.showAddColumnDialog) {
      const currentApp = this.context || {};
      const currentColumns = [];
      classes.get(className).forEach((field, name) => {
        currentColumns.push(name);
      });
      extras = (
        <AddColumnDialog
          onAddColumn={this.showAddColumn}
          currentColumns={currentColumns}
          classes={this.props.schema.data.get('classes').keySeq().toArray()}
          onCancel={() => this.setState({ showAddColumnDialog: false })}
          onConfirm={this.addColumn}
          onContinue={this.addColumnAndContinue}
          showNote={this.showNote}
          parseServerVersion={currentApp.serverInfo && currentApp.serverInfo.parseServerVersion}
        />
      );
    } else if (this.state.showRemoveColumnDialog) {
      const currentColumns = this.getClassColumns(className).map(column => column.name);
      extras = (
        <RemoveColumnDialog
          currentColumns={currentColumns}
          onCancel={() => this.setState({ showRemoveColumnDialog: false })}
          onConfirm={this.removeColumn}
        />
      );
    } else if (this.state.rowsToDelete) {
      extras = (
        <DeleteRowsDialog
          className={className}
          selection={this.state.rowsToDelete}
          relation={this.state.relation}
          onCancel={() => this.setState({ rowsToDelete: null })}
          onConfirm={() => this.deleteRows(this.state.rowsToDelete)}
        />
      );
    } else if (this.state.showDropClassDialog) {
      extras = (
        <DropClassDialog
          className={className}
          onCancel={() =>
            this.setState({
              showDropClassDialog: false,
              lastError: null,
              lastNote: null,
            })
          }
          onConfirm={() => this.dropClass(className)}
        />
      );
    } else if (this.state.showExportDialog) {
      extras = (
        <ExportDialog
          className={className}
          onCancel={() => this.setState({ showExportDialog: false })}
          onConfirm={() => this.exportClass(className)}
        />
      );
    } else if (this.state.showExportSchemaDialog) {
      extras = (
        <ExportSchemaDialog
          className={className}
          schema={this.props.schema.data.get('classes')}
          onCancel={() => this.setState({ showExportSchemaDialog: false })}
          onConfirm={(...args) => this.exportSchema(...args)}
        />
      );
    } else if (this.state.showAttachRowsDialog) {
      extras = (
        <AttachRowsDialog
          relation={this.state.relation}
          onCancel={this.cancelAttachRows}
          onConfirm={this.confirmAttachRows}
        />
      );
    } else if (this.state.showAttachSelectedRowsDialog) {
      extras = (
        <AttachSelectedRowsDialog
          classes={this.props.schema.data.get('classes').keySeq().toArray()}
          onSelectClass={this.getClassRelationColumns}
          selection={this.state.selection}
          onCancel={this.cancelAttachSelectedRows}
          onConfirm={this.confirmAttachSelectedRows}
        />
      );
    } else if (this.state.showExecuteScriptRowsDialog) {
      extras = (
        <ExecuteScriptRowsDialog
          currentClass={this.props.params.className}
          selection={this.state.selection}
          onCancel={this.cancelExecuteScriptRowsDialog}
          onConfirm={this.confirmExecuteScriptRows}
          processedScripts={this.state.processedScripts}
        />
      );
    } else if (this.state.showCloneSelectedRowsDialog) {
      extras = (
        <CloneSelectedRowsDialog
          className={className}
          selection={this.state.selection}
          onCancel={this.cancelCloneSelectedRows}
          onConfirm={this.confirmCloneSelectedRows}
        />
      );
    } else if (this.state.showEditRowDialog) {
      const classColumns = this.getClassColumns(className, false);
      // create object with classColumns as property keys needed for ColumnPreferences.getOrder function
      const columnsObject = {};
      classColumns.forEach(column => {
        columnsObject[column.name] = column;
      });
      // get ordered list of class columns
      const columnPreferences = this.context.columnPreference || {};
      const columns = ColumnPreferences.getOrder(
        columnsObject,
        this.context.applicationId,
        className,
        columnPreferences[className]
      );
      // extend columns with their type and targetClass properties
      columns.forEach(column => {
        const { type, targetClass } = columnsObject[column.name];
        column.type = type;
        column.targetClass = targetClass;
      });

      const { data, selection, newObject } = this.state;
      // at this moment only one row must be selected, so take the first and only one
      const selectedKey = Object.keys(selection)[0];
      // if selectedKey is string "undefined" => new row column 'objectId' was clicked
      let selectedId = selectedKey === 'undefined' ? undefined : selectedKey;
      // if selectedId is undefined and newObject is null it means new row was just saved and added to data array
      const isJustSavedObject = selectedId === undefined && newObject === null;
      // if new object just saved, remove new row selection and select new added row
      if (isJustSavedObject) {
        selectedId = data[0].id;
        this.setState({ selection: {} });
        this.selectRow(selectedId, true);
      }

      const row = data.findIndex(d => d.id === selectedId);

      const attributes = selectedId ? data[row].attributes : newObject.attributes;

      const selectedObject = {
        row: row,
        id: selectedId,
        ...attributes,
      };

      extras = (
        <EditRowDialog
          className={className}
          columns={columns}
          selectedObject={selectedObject}
          handlePointerClick={this.handlePointerClick}
          setRelation={this.setRelation}
          handleShowAcl={this.handleShowAcl}
          onClose={this.closeEditRowDialog}
          updateRow={this.updateRow}
          confirmAttachSelectedRows={this.confirmAttachSelectedRows}
          schema={this.props.schema}
          useMasterKey={this.state.useMasterKey}
          limit={this.state.limit}
        />
      );
    } else if (this.state.rowsToExport) {
      extras = (
        <ExportSelectedRowsDialog
          className={className}
          selection={this.state.rowsToExport}
          count={this.state.counts[className]}
          data={this.state.data}
          onCancel={this.cancelExportSelectedRows}
          onConfirm={(type, indentation) =>
            this.confirmExportSelectedRows(this.state.rowsToExport, type, indentation)
          }
        />
      );
    }

    let notification = null;
    const pageTitle = `${this.props.params.className} - Parse Dashboard`;

    if (this.state.lastError) {
      notification = <Notification note={this.state.lastError} isErrorNote={true} />;
    } else if (this.state.lastNote) {
      notification = <Notification note={this.state.lastNote} isErrorNote={false} />;
    } else if (this.state.exporting) {
      notification = (
        <Notification
          note={`Exporting ${this.state.exportingCount}+ objects...`}
          isErrorNote={false}
        />
      );
    }
    return (
      <div>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <SelectedRowsNavigationPrompt when={Object.keys(this.state.selection).length > 0} />
        {browser}
        {notification}
        {extras}
      </div>
    );
  }
}

export default Browser;
