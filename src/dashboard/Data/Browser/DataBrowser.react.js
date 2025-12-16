/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ContextMenu from 'components/ContextMenu/ContextMenu.react';
import copy from 'copy-to-clipboard';
import BrowserTable from 'dashboard/Data/Browser/BrowserTable.react';
import BrowserToolbar from 'dashboard/Data/Browser/BrowserToolbar.react';
import * as ColumnPreferences from 'lib/ColumnPreferences';
import { CurrentApp } from 'context/currentApp';
import { dateStringUTC } from 'lib/DateUtils';
import getFileName from 'lib/getFileName';
import { getValidScripts, executeScript } from '../../../lib/ScriptUtils';
import Parse from 'parse';
import React from 'react';
import { ResizableBox } from 'react-resizable';
import ScriptConfirmationModal from '../../../components/ScriptConfirmationModal/ScriptConfirmationModal.react';
import styles from './Databrowser.scss';
import KeyboardShortcutsManager, { matchesShortcut } from 'lib/KeyboardShortcutsPreferences';

import AggregationPanel from '../../../components/AggregationPanel/AggregationPanel';

const BROWSER_SHOW_ROW_NUMBER = 'browserShowRowNumber';
const AGGREGATION_PANEL_VISIBLE = 'aggregationPanelVisible';
const BROWSER_SCROLL_TO_TOP = 'browserScrollToTop';
const AGGREGATION_PANEL_AUTO_LOAD_FIRST_ROW = 'aggregationPanelAutoLoadFirstRow';
const AGGREGATION_PANEL_SYNC_SCROLL = 'aggregationPanelSyncScroll';
const AGGREGATION_PANEL_BATCH_NAVIGATE = 'aggregationPanelBatchNavigate';
const AGGREGATION_PANEL_SHOW_CHECKBOX = 'aggregationPanelShowCheckbox';
const AGGREGATION_PANEL_WIDTH = 'aggregationPanelWidth';
const AGGREGATION_PANEL_COUNT = 'aggregationPanelCount';

function formatValueForCopy(value, type) {
  if (value === undefined) {
    return '';
  }
  if (value === null) {
    return '(null)';
  }
  switch (type) {
    case 'GeoPoint':
      if (value && value.latitude !== undefined && value.longitude !== undefined) {
        return `(${value.latitude}, ${value.longitude})`;
      }
      break;
    case 'Date':
      if (value && value.iso) {
        value = new Date(value.iso);
      } else if (typeof value === 'string') {
        value = new Date(value);
      }
      if (value instanceof Date && !isNaN(value)) {
        return dateStringUTC(value);
      }
      break;
    case 'File':
      if (value && typeof value.url === 'function') {
        return getFileName(value);
      }
      break;
    case 'Boolean':
      return value ? 'True' : 'False';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * DataBrowser renders the browser toolbar and data table
 * It also manages the fetching / updating of column size prefs,
 * and the keyboard interactions for the data table.
 */
export default class DataBrowser extends React.Component {
  static contextType = CurrentApp;

  constructor(props) {
    super(props);

    const columnPreferences = props.app.columnPreference || {};
    const order = ColumnPreferences.getOrder(
      props.columns,
      props.app.applicationId,
      props.className,
      columnPreferences[props.className]
    );
    const storedRowNumber =
      window.localStorage?.getItem(BROWSER_SHOW_ROW_NUMBER) === 'true';
    const storedPanelVisible =
      window.localStorage?.getItem(AGGREGATION_PANEL_VISIBLE) === 'true';
    const storedScrollToTop =
      window.localStorage?.getItem(BROWSER_SCROLL_TO_TOP) !== 'false';
    const storedAutoLoadFirstRow =
      window.localStorage?.getItem(AGGREGATION_PANEL_AUTO_LOAD_FIRST_ROW) === 'true';
    const storedSyncPanelScroll =
      window.localStorage?.getItem(AGGREGATION_PANEL_SYNC_SCROLL) !== 'false';
    const storedBatchNavigate =
      window.localStorage?.getItem(AGGREGATION_PANEL_BATCH_NAVIGATE) !== 'false';
    const storedShowPanelCheckbox =
      window.localStorage?.getItem(AGGREGATION_PANEL_SHOW_CHECKBOX) !== 'false';
    const storedPanelWidth = window.localStorage?.getItem(AGGREGATION_PANEL_WIDTH);
    const parsedPanelWidth = storedPanelWidth ? parseInt(storedPanelWidth, 10) : 300;
    const storedPanelCount = window.localStorage?.getItem(AGGREGATION_PANEL_COUNT);
    const parsedPanelCount = storedPanelCount ? parseInt(storedPanelCount, 10) : 1;
    const hasAggregation =
      props.classwiseCloudFunctions?.[
        `${props.app.applicationId}${props.appName}`
      ]?.[props.className];

    this.state = {
      order: order,
      current: null,
      lastSelectedCol: 0,
      editing: false,
      copyableValue: undefined,
      selectedObjectId: undefined,
      simplifiedSchema: this.getSimplifiedSchema(props.schema, props.className),
      allClassesSchema: this.getAllClassesSchema(props.schema, props.classes),
      isPanelVisible: storedPanelVisible && !!hasAggregation,
      selectedCells: { list: new Set(), rowStart: -1, rowEnd: -1, colStart: -1, colEnd: -1 },
      firstSelectedCell: null,
      selectedData: [],
      prevClassName: props.className,
      panelWidth: parsedPanelWidth,
      isResizing: false,
      maxWidth: window.innerWidth - 300,
      showAggregatedData: true,
      frozenColumnIndex: -1,
      showRowNumber: storedRowNumber,
      scrollToTop: storedScrollToTop,
      autoLoadFirstRow: storedAutoLoadFirstRow,
      syncPanelScroll: storedSyncPanelScroll,
      batchNavigate: storedBatchNavigate,
      showPanelCheckbox: storedShowPanelCheckbox,
      prefetchCache: {},
      selectionHistory: [],
      displayedObjectIds: [], // Array of object IDs currently displayed in the panel
      panelCount: parsedPanelCount, // Number of panels to display
      multiPanelData: {}, // Object mapping objectId to panel data
      _objectsToFetch: [], // Temporary field for async fetch handling
      loadingObjectIds: new Set(),
      keyboardShortcuts: null, // Keyboard shortcuts from server
      showScriptConfirmationDialog: false,
      selectedScript: null,
      contextMenuX: null,
      contextMenuY: null,
      contextMenuItems: null,
      panelCheckboxDragging: false,
      draggedPanelSelection: false,
    };

    this.handleResizeDiv = this.handleResizeDiv.bind(this);
    this.handleResizeStart = this.handleResizeStart.bind(this);
    this.handleResizeStop = this.handleResizeStop.bind(this);
    this.updateMaxWidth = this.updateMaxWidth.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.handleHeaderDragDrop = this.handleHeaderDragDrop.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.togglePanelVisibility = this.togglePanelVisibility.bind(this);
    this.setCurrent = this.setCurrent.bind(this);
    this.setEditing = this.setEditing.bind(this);
    this.handleColumnsOrder = this.handleColumnsOrder.bind(this);
    this.setShowAggregatedData = this.setShowAggregatedData.bind(this);
    this.setCopyableValue = this.setCopyableValue.bind(this);
    this.setSelectedObjectId = this.setSelectedObjectId.bind(this);
    this.handleCallCloudFunction = this.handleCallCloudFunction.bind(this);
    this.setContextMenu = this.setContextMenu.bind(this);
    this.freezeColumns = this.freezeColumns.bind(this);
    this.unfreezeColumns = this.unfreezeColumns.bind(this);
    this.setShowRowNumber = this.setShowRowNumber.bind(this);
    this.toggleScrollToTop = this.toggleScrollToTop.bind(this);
    this.toggleAutoLoadFirstRow = this.toggleAutoLoadFirstRow.bind(this);
    this.toggleSyncPanelScroll = this.toggleSyncPanelScroll.bind(this);
    this.toggleBatchNavigate = this.toggleBatchNavigate.bind(this);
    this.toggleShowPanelCheckbox = this.toggleShowPanelCheckbox.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
    this.addPanel = this.addPanel.bind(this);
    this.removePanel = this.removePanel.bind(this);
    this.handlePanelScroll = this.handlePanelScroll.bind(this);
    this.handlePanelHeaderContextMenu = this.handlePanelHeaderContextMenu.bind(this);
    this.handleWrapperWheel = this.handleWrapperWheel.bind(this);
    this.onMouseDownPanelCheckBox = this.onMouseDownPanelCheckBox.bind(this);
    this.onMouseUpPanelCheckBox = this.onMouseUpPanelCheckBox.bind(this);
    this.onMouseEnterPanelCheckBox = this.onMouseEnterPanelCheckBox.bind(this);
    this.saveOrderTimeout = null;
    this.aggregationPanelRef = React.createRef();
    this.panelColumnRefs = [];
    this.activePanelIndex = -1;
    this.isWheelScrolling = false;
    this.multiPanelWrapperElement = null;
    this.setMultiPanelWrapperRef = this.setMultiPanelWrapperRef.bind(this);
  }

  setMultiPanelWrapperRef(element) {
    if (this.multiPanelWrapperElement) {
      this.multiPanelWrapperElement.removeEventListener('wheel', this.handleWrapperWheel);
    }
    this.multiPanelWrapperElement = element;
    if (element && this.state.panelCount > 1 && this.state.syncPanelScroll) {
      element.addEventListener('wheel', this.handleWrapperWheel, { passive: false });
    }
  }

  componentWillReceiveProps(props) {
    if (props.className !== this.props.className) {
      const columnPreferences = props.app.columnPreference || {};
      const order = ColumnPreferences.getOrder(
        props.columns,
        props.app.applicationId,
        props.className,
        columnPreferences[props.className]
      );
      this.setState({
        order: order,
        current: null,
        lastSelectedCol: 0,
        editing: false,
        simplifiedSchema: this.getSimplifiedSchema(props.schema, props.className),
        allClassesSchema: this.getAllClassesSchema(props.schema, props.classes),
        selectedCells: { list: new Set(), rowStart: -1, rowEnd: -1, colStart: -1, colEnd: -1 },
        firstSelectedCell: null,
        selectedData: [],
        frozenColumnIndex: -1,
        prefetchCache: {},
        selectionHistory: [],
      });
    } else if (
      Object.keys(props.columns).length !== Object.keys(this.props.columns).length ||
      (props.isUnique && props.uniqueField !== this.props.uniqueField)
    ) {
      const columnPreferences = props.app.columnPreference || {};
      const order = ColumnPreferences.getOrder(
        props.columns,
        props.app.applicationId,
        props.className,
        columnPreferences[props.className]
      );
      this.setState({ order, frozenColumnIndex: -1 });
    }
    if (props && props.className) {
      const storedPanelVisible =
        window.localStorage?.getItem(AGGREGATION_PANEL_VISIBLE) === 'true';
      const hasAggregation =
        props.classwiseCloudFunctions?.[
          `${props.app.applicationId}${props.appName}`
        ]?.[props.className];
      if (!hasAggregation) {
        this.setState({ isPanelVisible: false });
        this.setState({ selectedObjectId: undefined });
      } else {
        this.setState({ isPanelVisible: storedPanelVisible });
      }
    } else {
      this.setState({ isPanelVisible: false });
      this.setState({ selectedObjectId: undefined });
    }

    this.checkClassNameChange(this.state.prevClassName, props.className);
  }

  async componentDidMount() {
    document.body.addEventListener('keydown', this.handleKey);
    window.addEventListener('resize', this.updateMaxWidth);
    window.addEventListener('mouseup', this.onMouseUpPanelCheckBox);

    // Load keyboard shortcuts from server
    try {
      const manager = new KeyboardShortcutsManager(this.props.app);
      const shortcuts = await manager.getKeyboardShortcuts(this.props.app.applicationId);
      this.setState({ keyboardShortcuts: shortcuts });
    } catch (error) {
      console.warn('Failed to load keyboard shortcuts:', error);
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKey);
    window.removeEventListener('resize', this.updateMaxWidth);
    window.removeEventListener('mouseup', this.onMouseUpPanelCheckBox);
    if (this.multiPanelWrapperElement) {
      this.multiPanelWrapperElement.removeEventListener('wheel', this.handleWrapperWheel);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Clear panels when className changes, data becomes null, or data reloads
    const shouldClearPanels = this.state.isPanelVisible && (
      // Class changed
      this.props.className !== prevProps.className ||
      // Data became null (filter change, loading state)
      (this.props.data === null && prevProps.data !== null) ||
      // Data reloaded (script execution, refresh)
      (this.props.data !== null && prevProps.data !== null && this.props.data !== prevProps.data)
    );

    if (shouldClearPanels) {
      // Clear panel data and selection to show "No object selected"
      this.props.setAggregationPanelData({});
      this.props.setLoadingInfoPanel(false);
      this.setState({
        selectedObjectId: undefined,
        showAggregatedData: true, // Keep true to show "No object selected" message
        multiPanelData: {},
        displayedObjectIds: [],
        prefetchCache: {}, // Clear cache to prevent memory leak
      });
    }

    if (
      this.state.current === null &&
      this.state.selectedObjectId !== undefined &&
      prevState.selectedObjectId !== undefined
    ) {
      this.setState({
        selectedObjectId: undefined,
        showAggregatedData: true, // Keep true to show "No object selected" message
      });
      this.props.setAggregationPanelData({});
      if (this.props.errorAggregatedData != {}) {
        this.props.setErrorAggregatedData({});
      }
    }

    if (this.state.current && this.state.current !== prevState.current) {
      if (this.state.current.col !== this.state.lastSelectedCol) {
        this.setState({ lastSelectedCol: this.state.current.col });
      }
    }

    // Auto-load first row if enabled and conditions are met
    if (
      this.state.autoLoadFirstRow &&
      this.state.isPanelVisible &&
      this.props.data &&
      this.props.data.length > 0 &&
      !this.state.selectedObjectId &&
      ((!prevProps.data || prevProps.data.length === 0) ||
       prevProps.className !== this.props.className ||
       prevState.isPanelVisible !== this.state.isPanelVisible)
    ) {
      const firstRowObjectId = this.props.data[0].id;
      this.setShowAggregatedData(true);
      this.setSelectedObjectId(firstRowObjectId);
      // Also set the current cell to the first cell of the first row
      let col =
        this.state.lastSelectedCol !== undefined &&
        prevProps.className === this.props.className
          ? this.state.lastSelectedCol
          : 0;
      if (col >= this.state.order.length) {
        col = 0;
      }
      this.setCurrent({ row: 0, col });
      this.handleCallCloudFunction(
        firstRowObjectId,
        this.props.className,
        this.props.app.applicationId
      );
    }

    if (
      (this.props.AggregationPanelData !== prevProps.AggregationPanelData ||
        this.state.selectedObjectId !== prevState.selectedObjectId) &&
      this.state.isPanelVisible &&
      this.aggregationPanelRef?.current
    ) {
      if (this.state.scrollToTop) {
        this.aggregationPanelRef.current.scrollTop = 0;
      }
    }

    // Store the fetched panel data in multiPanelData when it changes
    if (
      this.props.AggregationPanelData !== prevProps.AggregationPanelData &&
      this.state.selectedObjectId &&
      Object.keys(this.props.AggregationPanelData).length > 0
    ) {
      this.setState(prev => ({
        multiPanelData: {
          ...prev.multiPanelData,
          [this.state.selectedObjectId]: this.props.AggregationPanelData
        }
      }));
    }

    // Manage wheel event listener based on state changes
    const prevNeedsListener = prevState.panelCount > 1 && prevState.syncPanelScroll;
    const nowNeedsListener = this.state.panelCount > 1 && this.state.syncPanelScroll;

    if (prevNeedsListener !== nowNeedsListener && this.multiPanelWrapperElement) {
      if (nowNeedsListener) {
        // Add listener
        this.multiPanelWrapperElement.addEventListener('wheel', this.handleWrapperWheel, { passive: false });
      } else {
        // Remove listener
        this.multiPanelWrapperElement.removeEventListener('wheel', this.handleWrapperWheel);
      }
    }
  }

  handleResizeStart() {
    this.setState({ isResizing: true });
  }

  handleResizeStop(event, { size }) {
    // Convert effective width back to full panel width when there are hidden panels
    let newPanelWidth = size.width;
    if (this.state.panelCount > 1 && this.state.displayedObjectIds.length < this.state.panelCount) {
      const actualPanelCount = Math.max(this.state.displayedObjectIds.length, 1);
      // Reverse the calculation: fullWidth = (effectiveWidth / actualPanelCount) * panelCount
      newPanelWidth = (size.width / actualPanelCount) * this.state.panelCount;
    }

    this.setState({
      isResizing: false,
      panelWidth: newPanelWidth,
    });
    window.localStorage?.setItem(AGGREGATION_PANEL_WIDTH, newPanelWidth);
  }

  handleResizeDiv(event, { size }) {
    // Convert effective width back to full panel width when there are hidden panels
    let newPanelWidth = size.width;
    if (this.state.panelCount > 1 && this.state.displayedObjectIds.length < this.state.panelCount) {
      const actualPanelCount = Math.max(this.state.displayedObjectIds.length, 1);
      // Reverse the calculation: fullWidth = (effectiveWidth / actualPanelCount) * panelCount
      newPanelWidth = (size.width / actualPanelCount) * this.state.panelCount;
    }

    this.setState({ panelWidth: newPanelWidth });
  }

  setShowAggregatedData(bool) {
    this.setState({
      showAggregatedData: bool,
    });
  }

  updateMaxWidth = () => {
    const SidePanelWidth = 300;
    this.setState({ maxWidth: window.innerWidth - SidePanelWidth });
    if (this.state.panelWidth > window.innerWidth - SidePanelWidth) {
      this.setState({ panelWidth: window.innerWidth - SidePanelWidth });
    }
  };

  updatePreferences(order, shouldReload) {
    if (this.saveOrderTimeout) {
      clearTimeout(this.saveOrderTimeout);
    }
    const appId = this.props.app.applicationId;
    const className = this.props.className;
    this.saveOrderTimeout = setTimeout(() => {
      ColumnPreferences.updatePreferences(order, appId, className);
      shouldReload && this.props.onRefresh();
    }, 1000);
  }

  async handleRefresh() {
    // If panel is visible, clear it immediately and show "No object selected"
    if (this.state.isPanelVisible) {
      // Clear the cache for all selected objects so they will be refreshed
      const newPrefetchCache = { ...this.state.prefetchCache };

      if (this.state.selectedObjectId) {
        delete newPrefetchCache[this.state.selectedObjectId];
      }

      if (this.state.panelCount > 1 && this.state.displayedObjectIds.length > 0) {
        this.state.displayedObjectIds.forEach(objectId => {
          delete newPrefetchCache[objectId];
        });
      }

      // Clear panel data immediately (shows "No object selected" message)
      this.props.setAggregationPanelData({});
      this.props.setLoadingInfoPanel(false);
      this.setState({
        prefetchCache: newPrefetchCache,
        multiPanelData: {}, // Clear multi-panel data as well
        displayedObjectIds: [], // Clear displayed object IDs
        selectedObjectId: undefined, // Clear selection to show "No object selected"
        showAggregatedData: true, // Keep true to show "No object selected" message
      });
    }

    await this.props.onRefresh();
  }

  togglePanelVisibility() {
    const newVisibility = !this.state.isPanelVisible;
    this.setState({ isPanelVisible: newVisibility });
    window.localStorage?.setItem(AGGREGATION_PANEL_VISIBLE, newVisibility);

    if (!newVisibility) {
      this.props.setAggregationPanelData({});
      this.props.setLoadingInfoPanel(false);
      if (this.props.errorAggregatedData != {}) {
        this.props.setErrorAggregatedData({});
      }
    }

    // Auto-load first row when opening panel if enabled and no row is selected
    if (
      newVisibility &&
      this.state.autoLoadFirstRow &&
      !this.state.selectedObjectId &&
      this.props.data &&
      this.props.data.length > 0
    ) {
      const firstRowObjectId = this.props.data[0].id;
      this.setShowAggregatedData(true);
      this.setSelectedObjectId(firstRowObjectId);
      let col =
        this.state.lastSelectedCol !== undefined ? this.state.lastSelectedCol : 0;
      if (col >= this.state.order.length) {
        col = 0;
      }
      this.setCurrent({ row: 0, col });
      this.handleCallCloudFunction(
        firstRowObjectId,
        this.props.className,
        this.props.app.applicationId
      );
    }

    if (!newVisibility && this.state.selectedObjectId) {
      if (this.props.errorAggregatedData != {}) {
        this.props.setErrorAggregatedData({});
      }
      this.handleCallCloudFunction(
        this.state.selectedObjectId,
        this.props.className,
        this.props.app.applicationId
      );
    }
  }

  getAllClassesSchema(schema) {
    const allClasses = Object.keys(schema.data.get('classes').toObject());
    const schemaSimplifiedData = {};
    allClasses.forEach(className => {
      const classSchema = schema.data.get('classes').get(className);
      if (classSchema) {
        schemaSimplifiedData[className] = {};
        classSchema.forEach(({ type, targetClass }, col) => {
          schemaSimplifiedData[className][col] = {
            type,
            targetClass,
          };
        });
      }
      return schemaSimplifiedData;
    });
    return schemaSimplifiedData;
  }

  checkClassNameChange(prevClassName, className) {
    if (prevClassName !== className) {
      const storedPanelVisible =
        window.localStorage?.getItem(AGGREGATION_PANEL_VISIBLE) === 'true';
      const hasAggregation =
        this.props.classwiseCloudFunctions?.[
          `${this.props.app.applicationId}${this.props.appName}`
        ]?.[className];
      this.setState({
        prevClassName: className,
        isPanelVisible: storedPanelVisible && !!hasAggregation,
        selectedObjectId: undefined,
      });
      this.props.setAggregationPanelData({});
      if (this.props.errorAggregatedData != {}) {
        this.props.setErrorAggregatedData({});
      }
    }
  }

  getSimplifiedSchema(schema, classNameForEditors) {
    const schemaSimplifiedData = {};
    const classSchema = schema.data.get('classes').get(classNameForEditors);
    if (classSchema) {
      classSchema.forEach(({ type, targetClass }, col) => {
        schemaSimplifiedData[col] = {
          type,
          targetClass,
        };
      });
    }
    return schemaSimplifiedData;
  }
  handleResize(index, delta) {
    this.setState(({ order }) => {
      order[index].width = Math.max(60, order[index].width + delta);
      this.updatePreferences(order);
      return { order };
    });
  }

  /**
   * drag and drop callback when header is dropped into valid location
   * @param  {Number} dragIndex  - index of  headerbar moved from
   * @param  {Number} hoverIndex - index of headerbar moved to left of
   */
  handleHeaderDragDrop(dragIndex, hoverIndex) {
    const newOrder = [...this.state.order];
    const movedIndex = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, movedIndex[0]);
    this.setState({ order: newOrder }, () => {
      this.updatePreferences(newOrder);
    });
  }

  handleKey(e) {
    if (this.props.disableKeyControls) {
      return;
    }

    // Check if the event target is an input, textarea, or select element
    const target = e.target;
    const isInputElement = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

    // Ignore all keyboard events when focus is on input/textarea/select elements
    // This allows normal text editing behavior in filter inputs and dropdown navigation
    if (isInputElement) {
      return;
    }

    if (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) {
      // Check for text selection FIRST
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString() : '';

      // If there's text selected, check if we're in the aggregation panel
      if (selectedText.length > 0) {
        const target = e.target;
        const isWithinPanel = this.aggregationPanelRef?.current && this.aggregationPanelRef.current.contains(target);

        if (isWithinPanel) {
          // Let the browser handle the copy operation for selected text
          return;
        }
      }

      // check if there is multiple selected cells
      const { rowStart, rowEnd, colStart, colEnd } = this.state.selectedCells;
      if (rowStart !== -1 && rowEnd !== -1 && colStart !== -1 && colEnd !== -1) {
        let copyableValue = '';

        for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex++) {
          const rowData = [];

          for (let colIndex = colStart; colIndex <= colEnd; colIndex++) {
            const field = this.state.order[colIndex].name;
            const type = field === 'objectId' ? 'String' : this.props.columns[field].type;
            const value =
              field === 'objectId'
                ? this.props.data[rowIndex].id
                : this.props.data[rowIndex].attributes[field];

            if (typeof value === 'number' && !isNaN(value)) {
              rowData.push(String(value));
            } else {
              rowData.push(formatValueForCopy(value, type));
            }
          }

          copyableValue += rowData.join('\t');
          if (rowIndex < rowEnd) {
            copyableValue += '\r\n';
          }
        }
        this.setCopyableValue(copyableValue);
        copy(copyableValue);

        if (this.props.showNote) {
          this.props.showNote('Value copied to clipboard', false);
        }
        e.preventDefault();
      }
    }
    if (
      this.state.editing &&
      this.state.current &&
      this.state.current.row === -1 &&
      this.props.newObject
    ) {
      // if user is editing new row and want to cancel editing cell
      if (e.keyCode === 27) {
        this.setState({
          editing: false,
        });
        e.preventDefault();
      }
      return;
    }
    if (!this.state.editing && this.props.newObject) {
      // if user is not editing any row but there's new row
      if (e.keyCode === 27) {
        this.props.onAbortAddRow();
        e.preventDefault();
      }
    }
    if (this.state.editing) {
      switch (e.keyCode) {
        case 27: // ESC
          this.setState({
            editing: false,
          });
          e.preventDefault();
          break;
        default:
          return;
      }
    }
    if (!this.state.current) {
      return;
    }

    const visibleColumnIndexes = [];
    this.state.order.forEach((column, index) => {
      column.visible && visibleColumnIndexes.push(index);
    });
    const firstVisibleColumnIndex = Math.min(...visibleColumnIndexes);
    const lastVisibleColumnIndex = Math.max(...visibleColumnIndexes);

    switch (e.keyCode) {
      case 8:
      case 46: {
        // Backspace or Delete
        const colName = this.state.order[this.state.current.col].name;
        const col = this.props.columns[colName];
        if (col.type !== 'Relation') {
          this.props.updateRow(this.state.current.row, colName, undefined);
        }
        e.preventDefault();
        break;
      }
      case 37: {
        // Left - standalone (move to the next visible column on the left)
        // or with ctrl/meta (excel style - move to the first visible column)

        this.setState({
          current: {
            row: this.state.current.row,
            col:
              e.ctrlKey || e.metaKey
                ? firstVisibleColumnIndex
                : this.getNextVisibleColumnIndex(
                  -1,
                  firstVisibleColumnIndex,
                  lastVisibleColumnIndex
                ),
          },
        });
        e.preventDefault();
        break;
      }
      case 38: {
        // Up - standalone (move to the previous row)
        // or with ctrl/meta (excel style - move to the first row)
        const prevObjectID = this.state.selectedObjectId;
        // Calculate step size based on batch navigation mode
        const stepSize = this.state.panelCount > 1 && this.state.batchNavigate && this.state.isPanelVisible ? this.state.panelCount : 1;
        const newRow = e.ctrlKey || e.metaKey ? 0 : Math.max(this.state.current.row - stepSize, 0);
        this.setState({
          current: {
            row: newRow,
            col: this.state.current.col,
          },
        });
        const newObjectId = this.props.data[newRow].id;
        this.setSelectedObjectId(newObjectId);
        this.setState({ showAggregatedData: true });
        if (prevObjectID !== newObjectId && this.state.isPanelVisible) {
          this.handleCallCloudFunction(
            newObjectId,
            this.props.className,
            this.props.app.applicationId
          );
        }
        e.preventDefault();
        break;
      }
      case 39: {
        // Right - standalone (move to the next visible column on the right)
        // or with ctrl/meta (excel style - move to the last visible column)
        this.setState({
          current: {
            row: this.state.current.row,
            col:
              e.ctrlKey || e.metaKey
                ? lastVisibleColumnIndex
                : this.getNextVisibleColumnIndex(
                  1,
                  firstVisibleColumnIndex,
                  lastVisibleColumnIndex
                ),
          },
        });
        e.preventDefault();
        break;
      }
      case 40: {
        // Down - standalone (move to the next row)
        // or with ctrl/meta (excel style - move to the last row)
        const prevObjectID = this.state.selectedObjectId;
        // Calculate step size based on batch navigation mode
        const stepSizeDown = this.state.panelCount > 1 && this.state.batchNavigate && this.state.isPanelVisible ? this.state.panelCount : 1;
        const newRow =
          e.ctrlKey || e.metaKey
            ? this.props.data.length - 1
            : Math.min(this.state.current.row + stepSizeDown, this.props.data.length - 1);
        this.setState({
          current: {
            row: newRow,
            col: this.state.current.col,
          },
        });

        const newObjectIdDown = this.props.data[newRow].id;
        this.setSelectedObjectId(newObjectIdDown);
        this.setState({ showAggregatedData: true });
        if (prevObjectID !== newObjectIdDown && this.state.isPanelVisible) {
          this.handleCallCloudFunction(
            newObjectIdDown,
            this.props.className,
            this.props.app.applicationId
          );
        }

        e.preventDefault();
        break;
      }
      case 67: { // C
        if ((e.ctrlKey || e.metaKey) && this.state.copyableValue !== undefined) {
          copy(this.state.copyableValue); // Copies current cell value to clipboard
          if (this.props.showNote) {
            this.props.showNote('Value copied to clipboard', false);
          }
          e.preventDefault();
        }
        break;
      }
      case 32: { // Space
        // Only handle space if not editing and there's a current row selected
        if (!this.state.editing && this.state.current?.row >= 0) {
          const rowId = this.props.data[this.state.current.row].id;
          const isSelected = this.props.selection[rowId];
          this.props.selectRow(rowId, !isSelected);
          e.preventDefault();
        }
        break;
      }
      case 13: { // Enter (enable editing)
        if (!this.state.editing && this.state.current) {
          this.setEditing(true);
          e.preventDefault();
        }
        break;
      }
      default: {
        // Handle custom keyboard shortcuts from server
        const shortcuts = this.state.keyboardShortcuts;
        if (!shortcuts) {
          break;
        }

        // Reload data shortcut (only if enabled)
        if (matchesShortcut(e, shortcuts.dataBrowserReloadData)) {
          this.handleRefresh();
          e.preventDefault();
          break;
        }

        // Toggle panels shortcut (only if enabled and class has info panels configured)
        if (matchesShortcut(e, shortcuts.dataBrowserToggleInfoPanels)) {
          const hasAggregation =
            this.props.classwiseCloudFunctions?.[
              `${this.props.app.applicationId}${this.props.appName}`
            ]?.[this.props.className];
          if (hasAggregation) {
            this.togglePanelVisibility();
            e.preventDefault();
          }
          break;
        }
        break;
      }
    }
  }

  getNextVisibleColumnIndex(distance = 1, min = 0, max = 0) {
    if (distance === 0) {
      return this.state.current.col;
    }
    let newIndex = this.state.current.col + distance;

    while (true) {
      if (this.state.order[newIndex]?.visible) {
        return newIndex;
      }
      if (newIndex <= min) {
        return min;
      }
      if (newIndex >= max) {
        return max;
      }
      newIndex += distance;
    }
  }

  setEditing(editing) {
    if (this.props.updateRow) {
      if (this.state.editing !== editing) {
        this.setState({ editing: editing });
      }
    }
  }

  setCurrent(current) {
    if (JSON.stringify(this.state.current) !== JSON.stringify(current)) {
      this.setState({ current });
    }
  }

  setCopyableValue(copyableValue) {
    if (this.state.copyableValue !== copyableValue) {
      this.setState({ copyableValue });
    }
  }

  setSelectedObjectId(selectedObjectId) {
    if (this.state.selectedObjectId !== selectedObjectId) {
      const index = this.props.data?.findIndex(obj => obj.id === selectedObjectId);
      this.setState(
        prevState => {
          const history = [...prevState.selectionHistory];
          if (index !== undefined && index > -1) {
            history.push(index);
          }
          if (history.length > 3) {
            history.shift();
          }

          // Check if the new object is already displayed in the panel
          let newDisplayedObjectIds = [...prevState.displayedObjectIds];
          const newMultiPanelData = { ...prevState.multiPanelData };
          const objectsToFetch = [];

          if (prevState.panelCount > 1 && selectedObjectId) {
            // If the selected object is not in the displayed list, update displayed objects
            if (!newDisplayedObjectIds.includes(selectedObjectId)) {
              const currentIndex = this.props.data?.findIndex(obj => obj.id === selectedObjectId);
              if (currentIndex !== -1) {
                const { prefetchCache } = prevState;
                const { prefetchStale } = this.getPrefetchSettings();

                // Calculate the starting index for the new batch
                // Always position the selected object at the START of the batch for consistency
                const startIndex = currentIndex;

                // Build the new batch of displayed objects
                newDisplayedObjectIds = [];
                for (let i = 0; i < prevState.panelCount && startIndex + i < this.props.data.length; i++) {
                  const objectId = this.props.data[startIndex + i].id;
                  newDisplayedObjectIds.push(objectId);

                  // Check if data is already available
                  if (!newMultiPanelData[objectId]) {
                    const cached = prefetchCache[objectId];
                    if (cached && (!prefetchStale || (Date.now() - cached.timestamp) / 1000 < prefetchStale)) {
                      // Use cached data immediately
                      newMultiPanelData[objectId] = cached.data;
                    } else {
                      // Mark for fetching
                      objectsToFetch.push({ objectId, delay: i * 100 });
                    }
                  }
                }
              }
            }
          }

          return {
            selectedObjectId,
            selectionHistory: history,
            displayedObjectIds: newDisplayedObjectIds,
            multiPanelData: newMultiPanelData,
            _objectsToFetch: objectsToFetch // Temporary field to handle after setState
          };
        },
        () => {
          // Fetch any objects that weren't in cache
          if (this.state._objectsToFetch && this.state._objectsToFetch.length > 0) {
            this.state._objectsToFetch.forEach(({ objectId, delay }) => {
              setTimeout(() => {
                this.fetchDataForMultiPanel(objectId);
              }, delay);
            });
            // Clean up temporary field
            this.setState({ _objectsToFetch: [] });
          }
          this.handlePrefetch();
        }
      );
    }
  }

  setContextMenu(contextMenuX, contextMenuY, contextMenuItems) {
    this.setState({ contextMenuX, contextMenuY, contextMenuItems });
  }

  handlePanelHeaderContextMenu(event, objectId) {
    const { scripts = [] } = this.context || {};
    const className = this.props.className;
    const field = 'objectId';

    const { validScripts, validator } = getValidScripts(scripts, className, field);

    const menuItems = [];

    // Add Scripts menu if there are valid scripts
    if (validScripts.length && this.props.onEditSelectedRow) {
      menuItems.push({
        text: 'Scripts',
        items: validScripts.map(script => {
          return {
            text: script.title,
            disabled: validator?.(objectId, field) === false,
            callback: () => {
              const selectedScript = { ...script, className, objectId };
              if (script.showConfirmationDialog) {
                this.setState({
                  showScriptConfirmationDialog: true,
                  selectedScript
                });
              } else {
                executeScript(
                  script,
                  className,
                  objectId,
                  this.props.showNote,
                  this.props.onRefresh
                );
              }
            },
          };
        }),
      });
    }

    const { pageX, pageY } = event;
    if (menuItems.length) {
      this.setContextMenu(pageX, pageY, menuItems);
    }
  }

  freezeColumns(index) {
    this.setState({ frozenColumnIndex: index });
  }

  unfreezeColumns() {
    this.setState({ frozenColumnIndex: -1 });
  }

  setShowRowNumber(show) {
    this.setState({ showRowNumber: show });
    window.localStorage?.setItem(BROWSER_SHOW_ROW_NUMBER, show);
  }

  toggleScrollToTop() {
    this.setState(prevState => {
      const newScrollToTop = !prevState.scrollToTop;
      window.localStorage?.setItem(BROWSER_SCROLL_TO_TOP, newScrollToTop);
      return { scrollToTop: newScrollToTop };
    });
  }

  toggleAutoLoadFirstRow() {
    this.setState(prevState => {
      const newAutoLoadFirstRow = !prevState.autoLoadFirstRow;
      window.localStorage?.setItem(AGGREGATION_PANEL_AUTO_LOAD_FIRST_ROW, newAutoLoadFirstRow);
      return { autoLoadFirstRow: newAutoLoadFirstRow };
    });
  }

  toggleSyncPanelScroll() {
    this.setState(prevState => {
      const newSyncPanelScroll = !prevState.syncPanelScroll;
      window.localStorage?.setItem(AGGREGATION_PANEL_SYNC_SCROLL, newSyncPanelScroll);
      return { syncPanelScroll: newSyncPanelScroll };
    });
  }

  toggleBatchNavigate() {
    this.setState(prevState => {
      const newBatchNavigate = !prevState.batchNavigate;
      window.localStorage?.setItem(AGGREGATION_PANEL_BATCH_NAVIGATE, newBatchNavigate);
      return { batchNavigate: newBatchNavigate };
    });
  }

  toggleShowPanelCheckbox() {
    this.setState(prevState => {
      const newShowPanelCheckbox = !prevState.showPanelCheckbox;
      window.localStorage?.setItem(AGGREGATION_PANEL_SHOW_CHECKBOX, String(newShowPanelCheckbox));
      return { showPanelCheckbox: newShowPanelCheckbox };
    });
  }

  handlePanelScroll(event, index) {
    if (!this.state.syncPanelScroll || this.state.panelCount <= 1) {
      return;
    }

    if (this.isWheelScrolling) {
      return;
    }

    if (
      this.activePanelIndex !== -1 &&
      this.activePanelIndex !== undefined &&
      this.activePanelIndex !== index
    ) {
      return;
    }

    // Sync scroll position to all other panel columns
    const scrollTop = event.target.scrollTop;
    this.panelColumnRefs.forEach((ref, i) => {
      if (i !== index && ref && ref.current) {
        ref.current.scrollTop = scrollTop;
      }
    });
  }

  onMouseDownPanelCheckBox(objectId, checked) {
    const newSelectionState = !checked;
    this.props.selectRow(objectId, newSelectionState);
    this.setState({
      panelCheckboxDragging: true,
      draggedPanelSelection: newSelectionState,
    });
  }

  onMouseUpPanelCheckBox() {
    if (this.state.panelCheckboxDragging) {
      this.setState({
        panelCheckboxDragging: false,
        draggedPanelSelection: false,
      });
    }
  }

  onMouseEnterPanelCheckBox(objectId) {
    if (this.state.panelCheckboxDragging) {
      this.props.selectRow(objectId, this.state.draggedPanelSelection);
    }
  }

  handleWrapperWheel(event) {
    if (!this.state.syncPanelScroll || this.state.panelCount <= 1) {
      return;
    }

    // Set wheel scrolling flag
    this.isWheelScrolling = true;
    if (this.wheelTimeout) {
      clearTimeout(this.wheelTimeout);
    }
    this.wheelTimeout = setTimeout(() => {
      this.isWheelScrolling = false;
    }, 100);

    // Prevent default scrolling
    event.preventDefault();

    // Find the maximum scrollTop among all panels to use as the base
    let maxScrollTop = 0;
    this.panelColumnRefs.forEach((ref) => {
      if (ref && ref.current && ref.current.scrollTop > maxScrollTop) {
        maxScrollTop = ref.current.scrollTop;
      }
    });

    // Apply delta to the max scrollTop and set it to all panels
    const delta = event.deltaY;
    const newScrollTop = maxScrollTop + delta;

    this.panelColumnRefs.forEach((ref) => {
      if (ref && ref.current) {
        ref.current.scrollTop = newScrollTop;
      }
    });
  }

  fetchDataForMultiPanel(objectId) {
    // Fetch data for a specific object and store it in both prefetchCache and multiPanelData
    const { className, app } = this.props;
    const { prefetchCache } = this.state;
    const { prefetchStale } = this.getPrefetchSettings();

    const cached = prefetchCache[objectId];
    if (cached && (!prefetchStale || (Date.now() - cached.timestamp) / 1000 < prefetchStale)) {
      // Use cached data
      this.setState(prev => ({
        multiPanelData: {
          ...prev.multiPanelData,
          [objectId]: cached.data
        }
      }));
    } else {
      // Fetch fresh data
      const cloudCodeFunction =
        this.props.classwiseCloudFunctions?.[
          `${app.applicationId}${this.props.appName}`
        ]?.[className]?.[0]?.cloudCodeFunction;

      if (!cloudCodeFunction) {
        return;
      }

      const params = {
        object: Parse.Object.extend(className)
          .createWithoutData(objectId)
          .toPointer(),
      };
      const options = { useMasterKey: true };

      this.setState(prev => ({
        loadingObjectIds: new Set(prev.loadingObjectIds).add(objectId)
      }));

      Parse.Cloud.run(cloudCodeFunction, params, options).then(result => {
        // Store in both prefetchCache and multiPanelData
        this.setState(prev => {
          const newLoading = new Set(prev.loadingObjectIds);
          newLoading.delete(objectId);
          return {
            loadingObjectIds: newLoading,
            prefetchCache: {
              ...prev.prefetchCache,
              [objectId]: { data: result, timestamp: Date.now() }
            },
            multiPanelData: {
              ...prev.multiPanelData,
              [objectId]: result
            }
          };
        });
      }).catch(error => {
        console.error(`Failed to fetch panel data for ${objectId}:`, error);
        this.setState(prev => {
          const newLoading = new Set(prev.loadingObjectIds);
          newLoading.delete(objectId);
          return { loadingObjectIds: newLoading };
        });
      });
    }
  }

  addPanel() {
    const currentIndex = this.props.data?.findIndex(obj => obj.id === this.state.selectedObjectId);
    const newPanelCount = this.state.panelCount + 1;
    const newDisplayedObjectIds = [];

    if (currentIndex !== -1 && currentIndex !== undefined) {
      // First, ensure current object data is in multiPanelData
      const currentObjectData = { ...this.state.multiPanelData };
      if (this.state.selectedObjectId && !currentObjectData[this.state.selectedObjectId] &&
          Object.keys(this.props.AggregationPanelData).length > 0) {
        currentObjectData[this.state.selectedObjectId] = this.props.AggregationPanelData;
      }

      const { prefetchCache } = this.state;
      const { prefetchStale } = this.getPrefetchSettings();
      const objectsToFetch = [];

      for (let i = 0; i < newPanelCount && currentIndex + i < this.props.data.length; i++) {
        const objectId = this.props.data[currentIndex + i].id;
        newDisplayedObjectIds.push(objectId);

        // Check if data is already available
        if (!currentObjectData[objectId]) {
          const cached = prefetchCache[objectId];
          if (cached && (!prefetchStale || (Date.now() - cached.timestamp) / 1000 < prefetchStale)) {
            // Use cached data immediately
            currentObjectData[objectId] = cached.data;
          } else {
            // Mark for fetching
            objectsToFetch.push(objectId);
          }
        }
      }

      // Update state with all available data
      const newWidth = (this.state.panelWidth / this.state.panelCount) * newPanelCount;
      const limitedWidth = Math.min(newWidth, this.state.maxWidth);

      this.setState({
        panelCount: newPanelCount,
        displayedObjectIds: newDisplayedObjectIds,
        multiPanelData: currentObjectData,
        panelWidth: limitedWidth,
      });
      window.localStorage?.setItem(AGGREGATION_PANEL_COUNT, newPanelCount);
      window.localStorage?.setItem(AGGREGATION_PANEL_WIDTH, limitedWidth);

      // Fetch missing data asynchronously
      objectsToFetch.forEach((objectId, i) => {
        setTimeout(() => {
          this.fetchDataForMultiPanel(objectId);
        }, i * 100);
      });
    }
  }

  removePanel() {
    this.setState(prevState => {
      if (prevState.panelCount <= 1) {
        return {};
      }
      const newPanelCount = prevState.panelCount - 1;
      // Remove the last displayed object
      const newDisplayedObjectIds = prevState.displayedObjectIds.slice(0, -1);

      const newWidth = (prevState.panelWidth / prevState.panelCount) * newPanelCount;

      window.localStorage?.setItem(AGGREGATION_PANEL_COUNT, newPanelCount);
      window.localStorage?.setItem(AGGREGATION_PANEL_WIDTH, newWidth);

      return {
        panelCount: newPanelCount,
        displayedObjectIds: newDisplayedObjectIds,
        panelWidth: newWidth,
      };
    });
  }

  getPrefetchSettings() {
    const config =
      this.props.classwiseCloudFunctions?.[
        `${this.props.app.applicationId}${this.props.appName}`
      ]?.[this.props.className]?.[0];
    return {
      prefetchObjects: config?.prefetchObjects || 0,
      prefetchStale: config?.prefetchStale || 0,
      prefetchImage: config?.prefetchImage ?? true,
      prefetchVideo: config?.prefetchVideo ?? true,
      prefetchAudio: config?.prefetchAudio ?? true,
    };
  }

  handlePrefetch() {
    const { prefetchObjects, prefetchStale } = this.getPrefetchSettings();
    if (!prefetchObjects) {
      return;
    }

    const cache = { ...this.state.prefetchCache };
    if (prefetchStale) {
      const now = Date.now();
      Object.keys(cache).forEach(key => {
        if ((now - cache[key].timestamp) / 1000 >= prefetchStale) {
          delete cache[key];
        }
      });
    }
    if (Object.keys(cache).length !== Object.keys(this.state.prefetchCache).length) {
      this.setState({ prefetchCache: cache });
    }

    const history = this.state.selectionHistory;
    if (history.length < 3) {
      return;
    }
    const [a, b, c] = history.slice(-3);
    // Detect step size from the last two selections
    const stepAB = b - a;
    const stepBC = c - b;
    // Check if we have a consistent navigation pattern (same step size)
    if (stepAB === stepBC && stepAB > 0) {
      // Prefetch ahead based on the detected step size
      const stepSize = stepAB;
      const panelCount = this.state.panelCount;

      // When in multi-panel mode, prefetch all objects in the upcoming batches
      for (
        let i = 1;
        i <= prefetchObjects && c + (i * stepSize) < this.props.data.length;
        i++
      ) {
        // For each step ahead, prefetch the main object
        const mainObjId = this.props.data[c + (i * stepSize)].id;
        if (!Object.prototype.hasOwnProperty.call(cache, mainObjId)) {
          this.prefetchObject(mainObjId);
        }

        // If in multi-panel mode, also prefetch the other objects that would be displayed in the batch
        if (panelCount > 1) {
          const batchStartIndex = c + (i * stepSize);
          for (let j = 1; j < panelCount && batchStartIndex + j < this.props.data.length; j++) {
            const batchObjId = this.props.data[batchStartIndex + j].id;
            if (!Object.prototype.hasOwnProperty.call(cache, batchObjId)) {
              this.prefetchObject(batchObjId);
            }
          }
        }
      }
    }
  }

  isSafeHttpUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  extractMediaUrls(data) {
    const urls = { images: new Set(), videos: new Set(), audios: new Set() };

    if (!data?.panel?.segments) {
      return urls;
    }

    data.panel.segments.forEach(segment => {
      if (segment.items) {
        segment.items.forEach(item => {
          if (item.type === 'image' && item.url && this.isSafeHttpUrl(item.url)) {
            urls.images.add(item.url);
          } else if (item.type === 'video' && item.url && this.isSafeHttpUrl(item.url)) {
            urls.videos.add(item.url);
          } else if (item.type === 'audio' && item.url && this.isSafeHttpUrl(item.url)) {
            urls.audios.add(item.url);
          }
        });
      }
    });

    return urls;
  }

  prefetchMedia(urls, mediaType) {
    if (!urls || urls.size === 0) {
      return;
    }

    urls.forEach(url => {
      // Use link-based prefetching for better browser optimization and caching
      const link = document.createElement('link');
      link.rel = mediaType === 'image' ? 'preload' : 'prefetch';
      link.as = mediaType;
      link.href = url;

      link.onload = () => {
        // Resource successfully cached, safe to remove the link element
        link.remove();
      };

      link.onerror = () => {
        console.error(`Failed to prefetch ${mediaType}: ${url}`);
        // Failed to fetch, remove the link element
        link.remove();
      };

      document.head.appendChild(link);
    });
  }

  prefetchObject(objectId) {
    const { className, app } = this.props;
    const cloudCodeFunction =
      this.props.classwiseCloudFunctions?.[
        `${app.applicationId}${this.props.appName}`
      ]?.[className]?.[0]?.cloudCodeFunction;
    if (!cloudCodeFunction) {
      return;
    }
    const params = {
      object: Parse.Object.extend(className)
        .createWithoutData(objectId)
        .toPointer(),
    };
    const options = { useMasterKey: true };
    Parse.Cloud.run(cloudCodeFunction, params, options).then(result => {
      this.setState(prev => ({
        prefetchCache: {
          ...prev.prefetchCache,
          [objectId]: { data: result, timestamp: Date.now() },
        },
      }));

      // Prefetch media if enabled
      const { prefetchImage, prefetchVideo, prefetchAudio } = this.getPrefetchSettings();
      const mediaUrls = this.extractMediaUrls(result);

      if (prefetchImage && mediaUrls.images.size > 0) {
        this.prefetchMedia(mediaUrls.images, 'image');
      }
      if (prefetchVideo && mediaUrls.videos.size > 0) {
        this.prefetchMedia(mediaUrls.videos, 'video');
      }
      if (prefetchAudio && mediaUrls.audios.size > 0) {
        this.prefetchMedia(mediaUrls.audios, 'audio');
      }
    }).catch(error => {
      console.error(`Failed to prefetch object ${objectId}:`, error);
    });
  }

  handleCallCloudFunction(objectId, className, appId) {
    const { prefetchCache } = this.state;
    const { prefetchStale } = this.getPrefetchSettings();
    const cached = prefetchCache[objectId];
    if (
      cached &&
      (!prefetchStale || (Date.now() - cached.timestamp) / 1000 < prefetchStale)
    ) {
      this.props.setAggregationPanelData(cached.data);
      this.props.setLoadingInfoPanel(false);
      // Also store in multiPanelData for multi-panel display
      this.setState(prev => ({
        multiPanelData: {
          ...prev.multiPanelData,
          [objectId]: cached.data
        }
      }));
    } else {
      if (cached) {
        this.setState(prev => {
          const n = { ...prev.prefetchCache };
          delete n[objectId];
          return { prefetchCache: n };
        });
      }
      this.props.callCloudFunction(objectId, className, appId);
    }
  }

  handleColumnsOrder(order, shouldReload) {
    this.setState({ order: [...order] }, () => {
      this.updatePreferences(order, shouldReload);
    });
  }

  handleCellClick(event, row, col, objectId) {
    const { firstSelectedCell } = this.state;
    const clickedCellKey = `${row}-${col}`;

    if (this.state.selectedObjectId !== objectId) {
      this.setShowAggregatedData(true);
      this.setSelectedObjectId(objectId);
      if (
        objectId &&
        this.state.isPanelVisible &&
        ((event.shiftKey && !firstSelectedCell) || !event.shiftKey)
      ) {
        this.handleCallCloudFunction(
          objectId,
          this.props.className,
          this.props.app.applicationId
        );
      }
    }

    if (event.shiftKey && firstSelectedCell) {
      const [firstRow, firstCol] = firstSelectedCell.split('-').map(Number);
      const [lastRow, lastCol] = clickedCellKey.split('-').map(Number);

      const rowStart = Math.min(firstRow, lastRow);
      const rowEnd = Math.max(firstRow, lastRow);
      const colStart = Math.min(firstCol, lastCol);
      const colEnd = Math.max(firstCol, lastCol);

      let validColumns = true;
      for (let i = colStart; i <= colEnd; i++) {
        const name = this.state.order[i].name;
        if (this.props.columns[name].type !== 'Number') {
          validColumns = false;
          break;
        }
      }

      const newSelection = new Set();
      const selectedData = [];
      for (let x = rowStart; x <= rowEnd; x++) {
        let rowData = null;
        if (validColumns) {
          rowData = this.props.data[x];
        }
        for (let y = colStart; y <= colEnd; y++) {
          if (rowData) {
            const value = rowData.attributes[this.state.order[y].name];
            if (typeof value === 'number' && !isNaN(value)) {
              selectedData.push(rowData.attributes[this.state.order[y].name]);
            }
          }
          newSelection.add(`${x}-${y}`);
        }
      }

      if (newSelection.size > 1) {
        this.setCurrent(null);
        this.props.setLoadingInfoPanel(false);
        this.setState({
          selectedCells: {
            list: newSelection,
            rowStart,
            rowEnd,
            colStart,
            colEnd,
          },
          selectedObjectId: undefined,
          selectedData,
        });
      } else {
        this.setCurrent({ row, col });
      }
    } else {
      this.setState({
        selectedCells: { list: new Set(), rowStart: -1, rowEnd: -1, colStart: -1, colEnd: -1 },
        selectedData: [],
        current: { row, col },
        firstSelectedCell: clickedCellKey,
      });
    }
  }

  render() {
    const {
      className,
      count,
      disableSecurityDialog,
      onCancelPendingEditRows,
      editCloneRows,
      app,
      ...other
    } = this.props;
    const { preventSchemaEdits, applicationId } = app;

    // Calculate effective panel width based on actual displayed panels
    // When panelCount > 1 but fewer panels are actually displayed, reduce width proportionally
    let effectivePanelWidth = this.state.panelWidth;
    if (this.state.panelCount > 1 && this.state.displayedObjectIds.length < this.state.panelCount) {
      // Width per panel = total width / configured panel count
      // Effective width = width per panel * actual number of displayed panels (or 1 if none)
      const actualPanelCount = Math.max(this.state.displayedObjectIds.length, 1);
      effectivePanelWidth = (this.state.panelWidth / this.state.panelCount) * actualPanelCount;
    }

    return (
      <div>
        <div>
          <BrowserTable
            appId={applicationId}
            order={this.state.order}
            current={this.state.current}
            editing={this.state.editing}
            simplifiedSchema={this.state.simplifiedSchema}
            className={className}
            editCloneRows={editCloneRows}
            handleHeaderDragDrop={this.handleHeaderDragDrop}
            handleResize={this.handleResize}
            setEditing={this.setEditing}
            setCurrent={this.setCurrent}
            setCopyableValue={this.setCopyableValue}
            selectedObjectId={this.state.selectedObjectId}
            setSelectedObjectId={this.setSelectedObjectId}
            callCloudFunction={this.handleCallCloudFunction}
            setContextMenu={this.setContextMenu}
            freezeIndex={this.state.frozenColumnIndex}
            freezeColumns={this.freezeColumns}
            unfreezeColumns={this.unfreezeColumns}
            onFilterChange={this.props.onFilterChange}
            onFilterSave={this.props.onFilterSave}
            selectedCells={this.state.selectedCells}
            handleCellClick={this.handleCellClick}
            isPanelVisible={this.state.isPanelVisible}
            panelWidth={effectivePanelWidth}
            isResizing={this.state.isResizing}
            setShowAggregatedData={this.setShowAggregatedData}
            showRowNumber={this.state.showRowNumber}
            setShowRowNumber={this.setShowRowNumber}
            skip={this.props.skip}
            limit={this.props.limit}
            firstSelectedCell={this.state.firstSelectedCell}
            {...other}
          />
          {this.state.isPanelVisible && (
            <ResizableBox
              width={effectivePanelWidth}
              height={Infinity}
              minConstraints={[100, Infinity]}
              maxConstraints={[this.state.maxWidth, Infinity]}
              onResizeStart={this.handleResizeStart} // Handle start of resizing
              onResizeStop={this.handleResizeStop} // Handle end of resizing
              onResize={this.handleResizeDiv}
              resizeHandles={['w']}
              className={styles.resizablePanel}
            >
              <div
                className={styles.aggregationPanelContainer}
                ref={this.aggregationPanelRef}
              >
                {this.state.panelCount > 1 ? (
                  <div
                    className={styles.multiPanelWrapper}
                    ref={this.setMultiPanelWrapperRef}
                  >
                    {(() => {
                      // If no objects are displayed, show a single panel
                      if (this.state.displayedObjectIds.length === 0) {
                        // If there's a selected object, show its data
                        const panelData = this.state.selectedObjectId
                          ? (this.state.multiPanelData[this.state.selectedObjectId] || this.props.AggregationPanelData)
                          : {};
                        const isLoading = this.state.selectedObjectId && this.props.isLoadingCloudFunction;

                        return (
                          <AggregationPanel
                            data={panelData}
                            isLoadingCloudFunction={isLoading}
                            showAggregatedData={true}
                            errorAggregatedData={this.state.selectedObjectId ? this.props.errorAggregatedData : {}}
                            showNote={this.props.showNote}
                            setErrorAggregatedData={this.props.setErrorAggregatedData}
                            setSelectedObjectId={this.setSelectedObjectId}
                            selectedObjectId={this.state.selectedObjectId}
                            appName={this.props.appName}
                            className={this.props.className}
                          />
                        );
                      }

                      // Initialize refs array if needed
                      if (this.panelColumnRefs.length !== this.state.displayedObjectIds.length) {
                        this.panelColumnRefs = this.state.displayedObjectIds.map(() => React.createRef());
                      }
                      return this.state.displayedObjectIds.map((objectId, index) => {
                        const panelData = this.state.multiPanelData[objectId] || {};
                        const isLoading = (objectId === this.state.selectedObjectId && this.props.isLoadingCloudFunction) || this.state.loadingObjectIds.has(objectId);
                        const isRowSelected = this.props.selection[objectId];
                        return (
                          <React.Fragment key={objectId}>
                            <div
                              className={styles.panelColumn}
                              ref={this.panelColumnRefs[index]}
                              onMouseEnter={() => (this.activePanelIndex = index)}
                              onTouchStart={() => (this.activePanelIndex = index)}
                              onFocus={() => (this.activePanelIndex = index)}
                              onScroll={(e) => this.handlePanelScroll(e, index)}
                            >
                              {this.state.showPanelCheckbox && (
                                <div
                                  className={styles.panelHeader}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    this.onMouseDownPanelCheckBox(objectId, isRowSelected);
                                  }}
                                  onMouseUp={this.onMouseUpPanelCheckBox}
                                  onMouseEnter={() => this.onMouseEnterPanelCheckBox(objectId)}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    this.handlePanelHeaderContextMenu(e, objectId);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!isRowSelected}
                                    readOnly
                                  />
                                </div>
                              )}
                              <AggregationPanel
                                data={panelData}
                                isLoadingCloudFunction={isLoading}
                                showAggregatedData={true}
                                errorAggregatedData={objectId === this.state.selectedObjectId ? this.props.errorAggregatedData : {}}
                                showNote={this.props.showNote}
                                setErrorAggregatedData={this.props.setErrorAggregatedData}
                                setSelectedObjectId={this.setSelectedObjectId}
                                selectedObjectId={objectId}
                                appName={this.props.appName}
                                className={this.props.className}
                              />
                            </div>
                            {index < this.state.displayedObjectIds.length - 1 && (
                              <div className={styles.panelSeparator} />
                            )}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <AggregationPanel
                    data={this.props.AggregationPanelData}
                    isLoadingCloudFunction={this.props.isLoadingCloudFunction}
                    showAggregatedData={this.state.showAggregatedData}
                    errorAggregatedData={this.props.errorAggregatedData}
                    showNote={this.props.showNote}
                    setErrorAggregatedData={this.props.setErrorAggregatedData}
                    setSelectedObjectId={this.setSelectedObjectId}
                    selectedObjectId={this.state.selectedObjectId}
                    appName={this.props.appName}
                    className={this.props.className}
                  />
                )}
              </div>
            </ResizableBox>
          )}
        </div>

        <BrowserToolbar
          count={count}
          hidePerms={className === '_Installation'}
          className={className}
          classNameForEditors={className}
          setCurrent={this.setCurrent}
          enableDeleteAllRows={
            app.serverInfo.features.schemas.clearAllDataFromClass && !preventSchemaEdits
          }
          enableExportClass={app.serverInfo.features.schemas.exportClass && !preventSchemaEdits}
          enableSecurityDialog={
            app.serverInfo.features.schemas.editClassLevelPermissions &&
            !disableSecurityDialog &&
            !preventSchemaEdits
          }
          enableColumnManipulation={!preventSchemaEdits}
          enableClassManipulation={!preventSchemaEdits}
          handleColumnDragDrop={this.handleHeaderDragDrop}
          handleColumnsOrder={this.handleColumnsOrder}
          editCloneRows={editCloneRows}
          onCancelPendingEditRows={onCancelPendingEditRows}
          order={this.state.order}
          selectedData={this.state.selectedData}
          allClasses={Object.keys(this.props.schema.data.get('classes').toObject())}
          allClassesSchema={this.state.allClassesSchema}
          togglePanel={this.togglePanelVisibility}
          isPanelVisible={this.state.isPanelVisible}
          addPanel={this.addPanel}
          removePanel={this.removePanel}
          panelCount={this.state.panelCount}
          appId={this.props.app.applicationId}
          appName={this.props.appName}
          scrollToTop={this.state.scrollToTop}
          toggleScrollToTop={this.toggleScrollToTop}
          autoLoadFirstRow={this.state.autoLoadFirstRow}
          toggleAutoLoadFirstRow={this.toggleAutoLoadFirstRow}
          syncPanelScroll={this.state.syncPanelScroll}
          toggleSyncPanelScroll={this.toggleSyncPanelScroll}
          batchNavigate={this.state.batchNavigate}
          toggleBatchNavigate={this.toggleBatchNavigate}
          showPanelCheckbox={this.state.showPanelCheckbox}
          toggleShowPanelCheckbox={this.toggleShowPanelCheckbox}
          {...other}
          onRefresh={this.handleRefresh}
        />

        {this.state.contextMenuX && (
          <ContextMenu
            x={this.state.contextMenuX}
            y={this.state.contextMenuY}
            items={this.state.contextMenuItems}
          />
        )}
        {this.state.showScriptConfirmationDialog && (
          <ScriptConfirmationModal
            script={this.state.selectedScript}
            onCancel={() => this.setState({ showScriptConfirmationDialog: false, selectedScript: null })}
            onConfirm={() => {
              executeScript(
                this.state.selectedScript,
                this.state.selectedScript.className,
                this.state.selectedScript.objectId,
                this.props.showNote,
                this.props.onRefresh
              );
              this.setState({ showScriptConfirmationDialog: false, selectedScript: null });
            }}
          />
        )}
      </div>
    );
  }
}
