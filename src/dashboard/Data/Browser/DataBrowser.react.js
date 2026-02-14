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
import GraphDialog from 'dashboard/Data/Browser/GraphDialog.react';
import GraphPanel from 'components/GraphPanel/GraphPanel.react';
import GraphPreferencesManager from 'lib/GraphPreferencesManager';
import getFileName from 'lib/getFileName';
import { getValidScripts, executeScript } from '../../../lib/ScriptUtils';
import Parse from 'parse';
import React from 'react';
import { ResizableBox } from 'react-resizable';
import ScriptConfirmationModal from '../../../components/ScriptConfirmationModal/ScriptConfirmationModal.react';
import styles from './Databrowser.scss';
import KeyboardShortcutsManager, { matchesShortcut } from 'lib/KeyboardShortcutsPreferences';
import ServerConfigStorage from 'lib/ServerConfigStorage';

import AggregationPanel from '../../../components/AggregationPanel/AggregationPanel';
import { buildRelatedTextFieldsMenuItem } from '../../../lib/RelatedRecordsUtils';

const BROWSER_SHOW_ROW_NUMBER = 'browserShowRowNumber';
const AGGREGATION_PANEL_VISIBLE = 'aggregationPanelVisible';
const BROWSER_SCROLL_TO_TOP = 'browserScrollToTop';
const AGGREGATION_PANEL_AUTO_LOAD_FIRST_ROW = 'aggregationPanelAutoLoadFirstRow';
const AGGREGATION_PANEL_SYNC_SCROLL = 'aggregationPanelSyncScroll';
const AGGREGATION_PANEL_BATCH_NAVIGATE = 'aggregationPanelBatchNavigate';
const AGGREGATION_PANEL_SHOW_CHECKBOX = 'aggregationPanelShowCheckbox';
const AGGREGATION_PANEL_WIDTH = 'aggregationPanelWidth';
const AGGREGATION_PANEL_COUNT = 'aggregationPanelCount';
const GRAPH_PANEL_VISIBLE = 'graphPanelVisible';
const GRAPH_PANEL_WIDTH = 'graphPanelWidth';
const AGGREGATION_PANEL_AUTO_SCROLL = 'aggregationPanelAutoScroll';
const AGGREGATION_PANEL_AUTO_SCROLL_REQUIRE_HOVER = 'aggregationPanelAutoScrollRequireHover';

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
    const storedAutoScroll =
      window.localStorage?.getItem(AGGREGATION_PANEL_AUTO_SCROLL) === 'true';
    const storedAutoScrollRequireHover =
      window.localStorage?.getItem(AGGREGATION_PANEL_AUTO_SCROLL_REQUIRE_HOVER) !== 'false';
    const storedGraphPanelVisible =
      window.localStorage?.getItem(GRAPH_PANEL_VISIBLE) === 'true';
    const storedGraphPanelWidth = window.localStorage?.getItem(GRAPH_PANEL_WIDTH);
    const parsedWidth = storedGraphPanelWidth ? parseInt(storedGraphPanelWidth, 10) : 400;
    const parsedGraphPanelWidth = !isNaN(parsedWidth) && parsedWidth > 0 ? parsedWidth : 400;

    // Note: We don't load graphConfig from localStorage here anymore.
    // Graphs are now loaded from server/localStorage via GraphPreferencesManager in componentDidMount
    // and componentDidUpdate. This ensures we use the new server-based storage system.

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
      isAggregationPanelResizing: false,
      isGraphPanelResizing: false,
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
      isGraphPanelVisible: storedGraphPanelVisible,
      graphPanelWidth: parsedGraphPanelWidth,
      graphConfig: null, // Will be loaded from server in componentDidMount
      availableGraphs: [],
      showGraphDialog: false,
      isCreatingNewGraph: false,
      // Auto-scroll feature state
      autoScrollEnabled: storedAutoScroll, // Whether auto-scroll feature is enabled (menu setting)
      autoScrollRequireHover: storedAutoScrollRequireHover, // Whether auto-scroll requires mouse hover over panel
      isAutoScrolling: false, // Whether auto-scroll is currently active
      isRecordingAutoScroll: false, // Whether we're recording (Command key held during scroll)
      autoScrollAmount: 0, // The registered scroll amount (pixels)
      autoScrollDelay: 1000, // The registered wait time (ms)
      autoScrollPaused: false, // Whether auto-scroll is currently paused
      recordingScrollStart: null, // Timestamp when scroll recording started
      recordingScrollEnd: null, // Timestamp when scrolling ended (before Command key release)
      recordedScrollDelta: 0, // Accumulated scroll delta during recording
      nativeContextMenuOpen: false, // Whether the browser's native context menu is open
      mouseOutsidePanel: true, // Whether the mouse is outside the AggregationPanel
      mouseOverPanelHeader: false, // Whether the mouse is over the panel header row
      commandKeyPressed: false, // Whether the Command/Meta key is currently pressed
      optionKeyPressed: false, // Whether the Option/Alt key is currently pressed (pauses auto-scroll)
      reverseAutoScrollActive: false, // Whether Cmd+Option are both held (reverses auto-scroll direction)
      reverseAutoScrollSpeedFactor: 1, // Speed multiplier for reverse auto-scroll
    };

    // Flag to skip panel clearing in componentDidUpdate during selective object refresh
    this._skipPanelClear = false;

    this.handleResizeDiv = this.handleResizeDiv.bind(this);
    this.handleResizeStart = this.handleResizeStart.bind(this);
    this.handleResizeStop = this.handleResizeStop.bind(this);
    this.updateMaxWidth = this.updateMaxWidth.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.handleHeaderDragDrop = this.handleHeaderDragDrop.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleRefreshObjects = this.handleRefreshObjects.bind(this);
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
    this.handleAggregationPanelTextContextMenu = this.handleAggregationPanelTextContextMenu.bind(this);
    this.handleWrapperWheel = this.handleWrapperWheel.bind(this);
    this.onMouseDownPanelCheckBox = this.onMouseDownPanelCheckBox.bind(this);
    this.onMouseUpPanelCheckBox = this.onMouseUpPanelCheckBox.bind(this);
    this.onMouseEnterPanelCheckBox = this.onMouseEnterPanelCheckBox.bind(this);
    this.toggleGraphPanelVisibility = this.toggleGraphPanelVisibility.bind(this);
    this.handleGraphResizeStart = this.handleGraphResizeStart.bind(this);
    this.handleGraphResizeStop = this.handleGraphResizeStop.bind(this);
    this.handleGraphResizeDiv = this.handleGraphResizeDiv.bind(this);
    this.showGraphDialog = this.showGraphDialog.bind(this);
    this.showNewGraphDialog = this.showNewGraphDialog.bind(this);
    this.hideGraphDialog = this.hideGraphDialog.bind(this);
    this.saveGraphConfig = this.saveGraphConfig.bind(this);
    this.deleteGraphConfig = this.deleteGraphConfig.bind(this);
    this.selectGraph = this.selectGraph.bind(this);
    this.toggleAutoScroll = this.toggleAutoScroll.bind(this);
    this.toggleAutoScrollRequireHover = this.toggleAutoScrollRequireHover.bind(this);
    this.handleAutoScrollKeyDown = this.handleAutoScrollKeyDown.bind(this);
    this.handleAutoScrollKeyUp = this.handleAutoScrollKeyUp.bind(this);
    this.handleAutoScrollWheel = this.handleAutoScrollWheel.bind(this);
    this.startAutoScroll = this.startAutoScroll.bind(this);
    this.stopAutoScroll = this.stopAutoScroll.bind(this);
    this.performAutoScrollStep = this.performAutoScrollStep.bind(this);
    this.pauseAutoScrollWithResume = this.pauseAutoScrollWithResume.bind(this);
    this.handlePanelMouseEnter = this.handlePanelMouseEnter.bind(this);
    this.handlePanelMouseLeave = this.handlePanelMouseLeave.bind(this);
    this.handlePanelHeaderMouseEnter = this.handlePanelHeaderMouseEnter.bind(this);
    this.handlePanelHeaderMouseLeave = this.handlePanelHeaderMouseLeave.bind(this);
    this.handleOptionKeyDown = this.handleOptionKeyDown.bind(this);
    this.handleOptionKeyUp = this.handleOptionKeyUp.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    this.handleMouseButtonDown = this.handleMouseButtonDown.bind(this);
    this.handleMouseButtonUp = this.handleMouseButtonUp.bind(this);
    this.saveOrderTimeout = null;
    this.aggregationPanelRef = React.createRef();
    this.autoScrollIntervalId = null;
    this.autoScrollTimeoutId = null;
    this.autoScrollResumeTimeoutId = null;
    this.autoScrollAnimationId = null;
    this.mouseButtonPressed = false;
    this.nativeContextMenuTracker = null;
    this.panelHeaderLeaveTimeoutId = null;
    this.panelColumnRefs = [];
    this.activePanelIndex = -1;
    this.isWheelScrolling = false;
    this.multiPanelWrapperElement = null;
    this.setMultiPanelWrapperRef = this.setMultiPanelWrapperRef.bind(this);
    this.graphPreferencesManager = new GraphPreferencesManager(props.app);
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
    // Auto-scroll event listeners
    document.body.addEventListener('keydown', this.handleAutoScrollKeyDown);
    document.body.addEventListener('keyup', this.handleAutoScrollKeyUp);
    // Option key listeners for pausing auto-scroll
    document.body.addEventListener('keydown', this.handleOptionKeyDown);
    document.body.addEventListener('keyup', this.handleOptionKeyUp);
    // Left mouse button listener for pausing auto-scroll
    window.addEventListener('mousedown', this.handleMouseButtonDown);
    window.addEventListener('mouseup', this.handleMouseButtonUp);
    // Native context menu detection for auto-scroll pause
    this.nativeContextMenuTracker = this.setupNativeContextMenuDetection();
    window.addEventListener('blur', this.handleWindowBlur);

    // Load keyboard shortcuts from server
    try {
      const manager = new KeyboardShortcutsManager(this.props.app);
      const shortcuts = await manager.getKeyboardShortcuts(this.props.app.applicationId);
      this.setState({ keyboardShortcuts: shortcuts });
    } catch (error) {
      console.warn('Failed to load keyboard shortcuts:', error);
    }

    // Load data browser settings from server
    try {
      const serverStorage = new ServerConfigStorage(this.props.app);
      const panelSettings = await serverStorage.getConfig(
        'browser.panels.settings',
        this.props.app.applicationId
      );
      if (panelSettings !== null && typeof panelSettings === 'object' && typeof panelSettings.reverseAutoScrollSpeedFactor === 'number' && panelSettings.reverseAutoScrollSpeedFactor > 0) {
        this.setState({ reverseAutoScrollSpeedFactor: panelSettings.reverseAutoScrollSpeedFactor });
      }
    } catch (error) {
      console.warn('Failed to load data browser settings:', error);
    }

    // Load graphs on initial mount
    try {
      const graphs = await this.graphPreferencesManager.getGraphs(
        this.props.app.applicationId,
        this.props.className
      );
      // Set the first graph as the current graph if any exist
      const graphConfig = graphs && graphs.length > 0 ? graphs[0] : null;
      this.setState({
        availableGraphs: graphs || [],
        graphConfig: graphConfig
      });
    } catch (error) {
      console.error('Failed to load graphs on mount:', error);
      this.setState({ availableGraphs: [], graphConfig: null });
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKey);
    window.removeEventListener('resize', this.updateMaxWidth);
    window.removeEventListener('mouseup', this.onMouseUpPanelCheckBox);
    if (this.multiPanelWrapperElement) {
      this.multiPanelWrapperElement.removeEventListener('wheel', this.handleWrapperWheel);
    }
    // Auto-scroll cleanup
    document.body.removeEventListener('keydown', this.handleAutoScrollKeyDown);
    document.body.removeEventListener('keyup', this.handleAutoScrollKeyUp);
    // Option key listeners cleanup
    document.body.removeEventListener('keydown', this.handleOptionKeyDown);
    document.body.removeEventListener('keyup', this.handleOptionKeyUp);
    window.removeEventListener('mousedown', this.handleMouseButtonDown);
    window.removeEventListener('mouseup', this.handleMouseButtonUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    if (this.nativeContextMenuTracker) {
      this.nativeContextMenuTracker.dispose();
    }
    if (this.autoScrollTimeoutId) {
      clearTimeout(this.autoScrollTimeoutId);
    }
    if (this.autoScrollResumeTimeoutId) {
      clearTimeout(this.autoScrollResumeTimeoutId);
    }
    if (this.autoScrollAnimationId) {
      cancelAnimationFrame(this.autoScrollAnimationId);
    }
    if (this.panelHeaderLeaveTimeoutId) {
      clearTimeout(this.panelHeaderLeaveTimeoutId);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    // Reload graphConfig when className changes
    if (this.props.className !== prevProps.className) {
      // Try to load from server first, fallback to localStorage
      try {
        const graphs = await this.graphPreferencesManager.getGraphs(
          this.props.app.applicationId,
          this.props.className
        );
        // Use the first graph if any exists, or null
        const graphConfig = graphs && graphs.length > 0 ? graphs[0] : null;
        this.setState({
          graphConfig,
          availableGraphs: graphs || []
        });
      } catch (error) {
        console.error('Failed to load graphs on className change:', error);
        // GraphPreferencesManager handles its own localStorage fallback
        // Just clear the state on error
        this.setState({
          graphConfig: null,
          availableGraphs: []
        });
      }
    }

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
      if (this._skipPanelClear) {
        this._skipPanelClear = false;
      } else {
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
    }

    // Note: We intentionally do NOT clear selectedObjectId when current becomes null.
    // Clicking toolbar menus sets current=null, but the info panel should persist.

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
        // If auto-scrolling and scrollToTop is enabled, restart animation from top
        if (this.state.isAutoScrolling && this.state.selectedObjectId !== prevState.selectedObjectId) {
          // Cancel current animation and restart from top
          if (this.autoScrollAnimationId) {
            cancelAnimationFrame(this.autoScrollAnimationId);
            this.autoScrollAnimationId = null;
          }
          if (this.autoScrollTimeoutId) {
            clearTimeout(this.autoScrollTimeoutId);
            this.autoScrollTimeoutId = null;
          }
          // Also reset multi-panel scroll positions
          if (this.state.panelCount > 1 && this.state.syncPanelScroll) {
            this.panelColumnRefs.forEach((ref) => {
              if (ref && ref.current) {
                ref.current.scrollTop = 0;
              }
            });
          }
          // Schedule next auto-scroll step
          this.autoScrollTimeoutId = setTimeout(() => {
            this.performAutoScrollStep();
          }, this.state.autoScrollDelay);
        }
      }
    }

    // Store the fetched panel data in multiPanelData when it changes
    if (
      this.props.AggregationPanelData !== prevProps.AggregationPanelData &&
      this.props.lastFetchedObjectId &&
      Object.keys(this.props.AggregationPanelData).length > 0
    ) {
      this.setState(prev => ({
        multiPanelData: {
          ...prev.multiPanelData,
          [this.props.lastFetchedObjectId]: this.props.AggregationPanelData
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
    this.setState({ isAggregationPanelResizing: true });
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
      isAggregationPanelResizing: false,
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

  async handleRefreshObjects(objectIds) {
    // Clear prefetch cache for the affected objects
    if (this.state.isPanelVisible) {
      const newPrefetchCache = { ...this.state.prefetchCache };
      objectIds.forEach(id => {
        delete newPrefetchCache[id];
      });

      // Clear multi-panel data for affected objects
      const newMultiPanelData = { ...this.state.multiPanelData };
      objectIds.forEach(id => {
        delete newMultiPanelData[id];
      });

      this.setState({ prefetchCache: newPrefetchCache, multiPanelData: newMultiPanelData });

      // Re-fetch info panel data for affected objects that are currently displayed
      const appId = this.props.app.applicationId;
      const className = this.props.className;

      if (this.state.selectedObjectId && objectIds.includes(this.state.selectedObjectId)) {
        this.props.callCloudFunction(this.state.selectedObjectId, className, appId);
      }

      if (this.state.panelCount > 1) {
        this.state.displayedObjectIds.forEach(displayedId => {
          if (objectIds.includes(displayedId)) {
            this.fetchDataForMultiPanel(displayedId);
          }
        });
      }
    }

    // Set flag to prevent componentDidUpdate from clearing panels when data prop changes
    this._skipPanelClear = true;

    // Refresh the table data for just these objects
    try {
      await this.props.onRefreshObjects(objectIds);
    } finally {
      this._skipPanelClear = false;
    }
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
      // Stop auto-scroll when panels are hidden
      if (this.state.isAutoScrolling) {
        this.stopAutoScroll();
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

    // Ignore keyboard events when a modal is open
    // Modals handle their own keyboard navigation and should not affect the data browser
    if (document.querySelector('[data-modal="true"]')) {
      return;
    }

    // Check if the event target is an input, textarea, or select element
    // Allow checkboxes since they don't accept text input
    const target = e.target;
    const isTextInputElement = target && (
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      (target.tagName === 'INPUT' && target.type !== 'checkbox')
    );

    // Ignore most keyboard events when focus is on text input elements
    // This allows normal text editing behavior in filter inputs and dropdown navigation
    if (isTextInputElement) {
      return;
    }

    // Handle shortcuts that work regardless of cell selection
    const shortcuts = this.state.keyboardShortcuts;

    // Scroll info panels to top shortcut (only if panels are visible)
    if (shortcuts && matchesShortcut(e, shortcuts.dataBrowserScrollInfoPanelsToTop)) {
      if (this.state.isPanelVisible) {
        // Scroll outer container
        if (this.aggregationPanelRef?.current) {
          this.aggregationPanelRef.current.scrollTop = 0;
        }
        // Scroll each individual panel column
        this.panelColumnRefs.forEach((ref) => {
          if (ref?.current) {
            ref.current.scrollTop = 0;
          }
        });
        // Pause auto-scroll with 1s resume delay
        if (this.state.isAutoScrolling) {
          this.pauseAutoScrollWithResume();
        }
        e.preventDefault();
      }
      return;
    }

    // Handle "Run script on selected rows" shortcut
    // Only works when in editable mode (onEditSelectedRow exists) and rows are selected
    if (shortcuts && matchesShortcut(e, shortcuts.dataBrowserRunScriptOnSelectedRows)) {
      const selection = this.props.selection || {};
      const selectionLength = Object.keys(selection).length;
      if (selectionLength > 0 && this.props.onExecuteScriptRows && this.props.onEditSelectedRow) {
        this.props.onExecuteScriptRows(selection);
        e.preventDefault();
        return;
      }
    }

    // Escape key stops auto-scrolling
    if (e.keyCode === 27 && this.state.isAutoScrolling) {
      e.preventDefault();
      this.stopAutoScroll();
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
            // When batch-navigate is enabled, always rebuild the batch starting from the selected row
            // to ensure prefetched data is properly utilized
            const shouldRebuildBatch = !newDisplayedObjectIds.includes(selectedObjectId) || prevState.batchNavigate;

            if (shouldRebuildBatch) {
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

    // Group 1: Navigation
    const relatedRecordsMenuItem = this.getRelatedObjectsMenuItemForPanel(objectId, className);
    if (relatedRecordsMenuItem) {
      menuItems.push(relatedRecordsMenuItem);
    }

    // Group 4: Automation
    if (validScripts.length && this.props.onEditSelectedRow) {
      if (menuItems.length > 0) {
        menuItems.push({ type: 'separator' });
      }
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
                  this.props.reloadDataTableAfterScript ? this.props.onRefresh : null,
                  this.props.reloadDataTableAfterScript ? null : this.handleRefreshObjects,
                  this.props.onScriptModalResponse
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

  handleAggregationPanelTextContextMenu(event) {
    // Only show custom menu when Alt/Option key is held
    if (!event.altKey) {
      return;
    }

    // Check if there's selected text
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    if (!selectedText) {
      return;
    }

    // Build context menu items
    const menuItems = [];

    // Add "Add to config parameter" option if available
    const arrayParams = this.props.arrayConfigParams || [];
    if (arrayParams.length > 0) {
      menuItems.push({
        text: 'Add to config parameter',
        items: arrayParams.map(param => ({
          text: param.name,
          callback: () => {
            if (this.props.onAddToArrayConfig) {
              this.props.onAddToArrayConfig(param.name, selectedText);
            }
          },
        })),
      });
    }

    // Add "Related records" option if available (search text in String fields)
    const relatedRecordsItem = buildRelatedTextFieldsMenuItem(
      this.props.schema,
      selectedText,
      this.props.onPointerCmdClick
    );
    if (relatedRecordsItem) {
      if (menuItems.length > 0) {
        menuItems.push({ type: 'separator' });
      }
      menuItems.push(relatedRecordsItem);
    }

    // Only show context menu if there are items
    if (menuItems.length === 0) {
      return;
    }

    // Prevent default context menu
    event.preventDefault();

    this.setContextMenu(event.pageX, event.pageY, menuItems);
  }

  getRelatedObjectsMenuItemForPanel(objectId, pointerClassName) {
    const { schema, onPointerCmdClick } = this.props;

    if (!pointerClassName || !schema || !onPointerCmdClick) {
      return undefined;
    }

    const relatedRecordsMenuItem = {
      text: 'Related records',
      items: [],
    };

    schema.data
      .get('classes')
      .sortBy((_v, k) => k)
      .forEach((cl, className) => {
        const classFields = [];

        cl.forEach((column, field) => {
          if (column.targetClass !== pointerClassName) {
            return;
          }
          classFields.push({
            text: field,
            callback: () => {
              const relatedObject = new Parse.Object(pointerClassName);
              relatedObject.id = objectId;
              onPointerCmdClick({
                className,
                id: relatedObject.toPointer(),
                field,
              });
            },
          });
        });

        if (classFields.length > 0) {
          classFields.sort((a, b) => a.text.localeCompare(b.text));
          relatedRecordsMenuItem.items.push({
            text: className,
            items: classFields,
          });
        }
      });

    return relatedRecordsMenuItem.items.length ? relatedRecordsMenuItem : undefined;
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

  /**
   * Checks if auto-scroll should be blocked due to user interactions.
   * Auto-scroll pauses when:
   * - A modal is displayed (script confirmation, graph dialog)
   * - A context menu is displayed (custom or native browser menu)
   * - The user is editing a cell in the databrowser table
   * - Manual scroll pause is active
   * - The Option/Alt key is pressed
   */
  isAutoScrollBlocked() {
    const {
      autoScrollPaused,
      editing,
      contextMenuItems,
      showScriptConfirmationDialog,
      showGraphDialog,
      nativeContextMenuOpen,
      mouseOutsidePanel,
      mouseOverPanelHeader,
      autoScrollRequireHover,
      optionKeyPressed,
    } = this.state;

    // disableKeyControls is true when parent Browser has a modal open
    const { disableKeyControls } = this.props;

    // Check hover-related blocking only if autoScrollRequireHover is enabled
    const hoverBlocked = autoScrollRequireHover && (mouseOutsidePanel || mouseOverPanelHeader);

    return (
      autoScrollPaused ||
      editing ||
      (contextMenuItems && contextMenuItems.length > 0) ||
      showScriptConfirmationDialog ||
      showGraphDialog ||
      nativeContextMenuOpen ||
      disableKeyControls ||
      hoverBlocked ||
      optionKeyPressed ||
      this.mouseButtonPressed
    );
  }

  toggleAutoScroll() {
    this.setState(prevState => {
      const newAutoScroll = !prevState.autoScrollEnabled;
      window.localStorage?.setItem(AGGREGATION_PANEL_AUTO_SCROLL, String(newAutoScroll));
      // If disabling auto-scroll while it's active, stop it
      if (!newAutoScroll && prevState.isAutoScrolling) {
        this.stopAutoScroll();
      }
      return { autoScrollEnabled: newAutoScroll };
    });
  }

  toggleAutoScrollRequireHover() {
    this.setState(prevState => {
      const newRequireHover = !prevState.autoScrollRequireHover;
      window.localStorage?.setItem(AGGREGATION_PANEL_AUTO_SCROLL_REQUIRE_HOVER, String(newRequireHover));
      return { autoScrollRequireHover: newRequireHover };
    });
  }

  handleAutoScrollKeyDown(e) {
    // Command/Meta key = keyCode 91 (left) or 93 (right)
    if ((e.keyCode === 91 || e.keyCode === 93) && this.state.autoScrollEnabled && this.state.isPanelVisible) {
      if (this.state.optionKeyPressed && this.state.isAutoScrolling) {
        // Option already held + Cmd pressed = activate reverse auto-scroll
        // Clear optionKeyPressed to unblock auto-scroll
        this.setState({
          commandKeyPressed: true,
          optionKeyPressed: false,
          reverseAutoScrollActive: true,
        });
      } else if (!this.state.isRecordingAutoScroll) {
        // Normal behavior: track Command key for potential scroll recording
        this.setState({ commandKeyPressed: true });
      }
    }
  }

  handleAutoScrollKeyUp(e) {
    // Command/Meta key = keyCode 91 (left) or 93 (right)
    if (e.keyCode === 91 || e.keyCode === 93) {
      if (this.state.reverseAutoScrollActive) {
        // Deactivate reverse mode; skip recording-mode logic
        this.setState({ commandKeyPressed: false, reverseAutoScrollActive: false });
      } else if (this.state.isRecordingAutoScroll) {
        const { recordedScrollDelta, recordingScrollStart, recordingScrollEnd } = this.state;

        // Only start auto-scroll if we actually recorded some scrolling
        if (recordedScrollDelta !== 0 && recordingScrollStart !== null) {
          // Calculate delay: time between scroll end and key release
          const scrollEndTime = recordingScrollEnd || Date.now();
          const delay = Math.max(200, Date.now() - scrollEndTime); // Minimum 200ms delay

          this.setState({
            commandKeyPressed: false,
            isRecordingAutoScroll: false,
            autoScrollAmount: recordedScrollDelta,
            autoScrollDelay: delay,
          }, () => {
            this.startAutoScroll();
          });
        } else {
          // No scroll was recorded, just reset
          this.setState({
            commandKeyPressed: false,
            isRecordingAutoScroll: false,
            recordedScrollDelta: 0,
            recordingScrollStart: null,
            recordingScrollEnd: null,
          });
        }
      } else {
        // Command key released without entering recording mode (no scroll occurred);
        // just clear the key state, auto-scroll continues undisturbed
        this.setState({ commandKeyPressed: false });
      }
    }
  }

  handleAutoScrollWheel(e) {
    if (this.state.isRecordingAutoScroll) {
      // Extract deltaY immediately to avoid synthetic event pooling issues
      const deltaY = e.deltaY;
      const now = Date.now();
      this.setState(prevState => ({
        recordedScrollDelta: prevState.recordedScrollDelta + deltaY,
        recordingScrollStart: prevState.recordingScrollStart || now,
        recordingScrollEnd: now,
      }));
    } else if (this.state.commandKeyPressed) {
      // First scroll while Command key is held: stop any existing auto-scroll
      // and enter recording mode
      if (this.state.isAutoScrolling) {
        this.stopAutoScroll();
      }
      const deltaY = e.deltaY;
      const now = Date.now();
      this.setState({
        isRecordingAutoScroll: true,
        recordedScrollDelta: deltaY,
        recordingScrollStart: now,
        recordingScrollEnd: now,
      });
    } else if (this.state.isAutoScrolling) {
      // User manually scrolled during auto-scroll, pause it and schedule resume
      this.pauseAutoScrollWithResume();
    }
  }

  pauseAutoScrollWithResume() {
    // Clear any existing resume timeout
    if (this.autoScrollResumeTimeoutId) {
      clearTimeout(this.autoScrollResumeTimeoutId);
    }

    // Pause auto-scroll
    if (!this.state.autoScrollPaused) {
      this.setState({ autoScrollPaused: true });
    }

    // Schedule resume after 1000ms of inactivity
    this.autoScrollResumeTimeoutId = setTimeout(() => {
      if (this.state.isAutoScrolling && this.state.autoScrollPaused) {
        // Clear so the 2-second post-block delay doesn't stack on top
        this.autoScrollLastUnblockedAt = 0;
        this.autoScrollIsBlocked = false;
        this.setState({ autoScrollPaused: false });
      }
    }, 1000);
  }

  setupNativeContextMenuDetection() {
    let cleanup = () => {};

    const onContextMenu = () => {
      this.setState({ nativeContextMenuOpen: true });

      // Remove previous close listeners if any
      cleanup();

      const close = () => {
        cleanup();
        this.setState({ nativeContextMenuOpen: false });
      };

      const onPointerDown = () => close();
      const onPointerMove = () => close();
      const onKey = () => close();
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') {
          close();
        }
      };
      const onBlur = () => close();

      window.addEventListener('pointerdown', onPointerDown, true);
      window.addEventListener('keydown', onKey, true);
      document.addEventListener('visibilitychange', onVisibility, true);
      window.addEventListener('blur', onBlur, true);

      // Delay pointermove registration to skip movement during the right-click gesture
      const pointerMoveTimerId = setTimeout(() => {
        window.addEventListener('pointermove', onPointerMove, true);
      }, 300);

      cleanup = () => {
        clearTimeout(pointerMoveTimerId);
        window.removeEventListener('pointerdown', onPointerDown, true);
        window.removeEventListener('pointermove', onPointerMove, true);
        window.removeEventListener('keydown', onKey, true);
        document.removeEventListener('visibilitychange', onVisibility, true);
        window.removeEventListener('blur', onBlur, true);
        cleanup = () => {};
      };
    };

    window.addEventListener('contextmenu', onContextMenu, true);

    return {
      isOpen: () => this.state.nativeContextMenuOpen,
      dispose: () => {
        window.removeEventListener('contextmenu', onContextMenu, true);
        cleanup();
      },
    };
  }

  handlePanelMouseEnter() {
    if (this.state.mouseOutsidePanel) {
      this.setState({ mouseOutsidePanel: false });
    }
  }

  handlePanelMouseLeave() {
    if (!this.state.mouseOutsidePanel) {
      this.setState({ mouseOutsidePanel: true });
    }
  }

  handlePanelHeaderMouseEnter() {
    // Cancel any pending leave timeout
    if (this.panelHeaderLeaveTimeoutId) {
      clearTimeout(this.panelHeaderLeaveTimeoutId);
      this.panelHeaderLeaveTimeoutId = null;
    }
    if (!this.state.mouseOverPanelHeader) {
      this.setState({ mouseOverPanelHeader: true });
    }
  }

  handlePanelHeaderMouseLeave() {
    // Use a small delay to allow moving between adjacent headers without resuming scroll
    if (this.panelHeaderLeaveTimeoutId) {
      clearTimeout(this.panelHeaderLeaveTimeoutId);
    }
    this.panelHeaderLeaveTimeoutId = setTimeout(() => {
      this.panelHeaderLeaveTimeoutId = null;
      if (this.state.mouseOverPanelHeader) {
        this.setState({ mouseOverPanelHeader: false });
      }
    }, 50);
  }

  handleWindowBlur() {
    // Reset all modifier key tracking state when the window loses focus,
    // since keyup events won't fire while the window is not focused
    if (this.state.commandKeyPressed || this.state.optionKeyPressed || this.state.reverseAutoScrollActive) {
      this.setState({
        commandKeyPressed: false,
        optionKeyPressed: false,
        reverseAutoScrollActive: false,
      });
    }
  }

  handleOptionKeyDown(e) {
    // Option/Alt key = keyCode 18
    if (e.keyCode === 18) {
      if (this.state.commandKeyPressed && this.state.isAutoScrolling) {
        // Cmd already held + Option pressed = activate reverse auto-scroll
        // Don't set optionKeyPressed (which would block auto-scroll)
        this.setState({ reverseAutoScrollActive: true });
      } else if (!this.state.optionKeyPressed) {
        // Normal behavior: track Option key to pause auto-scroll
        this.setState({ optionKeyPressed: true });
      }
    }
  }

  handleOptionKeyUp(e) {
    // Option/Alt key = keyCode 18
    if (e.keyCode === 18) {
      if (this.state.reverseAutoScrollActive) {
        // Deactivate reverse mode; don't trigger normal option-pause cleanup
        this.setState({ reverseAutoScrollActive: false });
      } else if (this.state.optionKeyPressed) {
        // Normal behavior: release Option key pause
        this.setState({ optionKeyPressed: false });
      }
    }
  }

  handleMouseButtonDown(e) {
    if (e.button === 0) {
      this.mouseButtonPressed = true;
    }
  }

  handleMouseButtonUp(e) {
    if (e.button === 0) {
      this.mouseButtonPressed = false;
      if (this.state.isAutoScrolling) {
        this.autoScrollLastUnblockedAt = Date.now();
      }
    }
  }

  startAutoScroll() {
    if (this.state.isAutoScrolling) {
      return;
    }

    this.autoScrollLastUnblockedAt = 0;
    this.autoScrollIsBlocked = false;
    this.setState({ isAutoScrolling: true, autoScrollPaused: false }, () => {
      this.performAutoScrollStep();
    });
  }

  stopAutoScroll() {
    if (this.autoScrollTimeoutId) {
      clearTimeout(this.autoScrollTimeoutId);
      this.autoScrollTimeoutId = null;
    }
    if (this.autoScrollResumeTimeoutId) {
      clearTimeout(this.autoScrollResumeTimeoutId);
      this.autoScrollResumeTimeoutId = null;
    }
    if (this.autoScrollAnimationId) {
      cancelAnimationFrame(this.autoScrollAnimationId);
      this.autoScrollAnimationId = null;
    }
    this.autoScrollLastUnblockedAt = 0;
    this.autoScrollIsBlocked = false;
    this.setState({
      isAutoScrolling: false,
      autoScrollPaused: false,
      commandKeyPressed: false,
      isRecordingAutoScroll: false,
      recordedScrollDelta: 0,
      recordingScrollStart: null,
      recordingScrollEnd: null,
      reverseAutoScrollActive: false,
    });
  }

  performAutoScrollStep() {
    if (!this.state.isAutoScrolling) {
      return;
    }

    if (this.isAutoScrollBlocked()) {
      this.autoScrollIsBlocked = true;
      this.autoScrollTimeoutId = setTimeout(() => {
        this.performAutoScrollStep();
      }, 100);
      return;
    }

    // Wait 1 second from the most recent unblock before scrolling
    if (this.autoScrollIsBlocked) {
      this.autoScrollIsBlocked = false;
      this.autoScrollLastUnblockedAt = Date.now();
    }
    if (this.autoScrollLastUnblockedAt) {
      const elapsed = Date.now() - this.autoScrollLastUnblockedAt;
      if (elapsed < 1000) {
        this.autoScrollTimeoutId = setTimeout(() => {
          this.performAutoScrollStep();
        }, 1000 - elapsed);
        return;
      }
      this.autoScrollLastUnblockedAt = 0;
    }

    // Get the scrollable container
    const container = this.aggregationPanelRef?.current;
    if (!container) {
      this.autoScrollTimeoutId = setTimeout(() => {
        this.performAutoScrollStep();
      }, this.state.autoScrollDelay);
      return;
    }

    // Animate scroll smoothly using requestAnimationFrame
    // Capture reverse state at step start so it stays consistent with scrollAmount
    // throughout the animation (prevents jump if state changes mid-frame)
    const isReversing = this.state.reverseAutoScrollActive;
    let scrollAmount = this.state.autoScrollAmount;
    if (isReversing) {
      scrollAmount = -scrollAmount * this.state.reverseAutoScrollSpeedFactor;
    }
    // Animation duration: 300ms base, scaled by scroll amount (max 500ms)
    const duration = Math.min(300 + Math.abs(scrollAmount) * 0.5, 500);
    const startTime = performance.now();
    const startScrollTop = container.scrollTop;

    // Get starting positions for multi-panel sync
    const panelStartPositions = [];
    let maxPanelStartScrollTop = 0;
    if (this.state.panelCount > 1 && this.state.syncPanelScroll) {
      this.panelColumnRefs.forEach((ref) => {
        if (ref && ref.current) {
          panelStartPositions.push(ref.current.scrollTop);
          if (ref.current.scrollTop > maxPanelStartScrollTop) {
            maxPanelStartScrollTop = ref.current.scrollTop;
          }
        } else {
          panelStartPositions.push(null);
        }
      });
    }

    const animateScroll = (currentTime) => {
      if (!this.state.isAutoScrolling || this.isAutoScrollBlocked()) {
        this.autoScrollIsBlocked = true;
        // If stopped or blocked during animation, schedule next check
        this.autoScrollTimeoutId = setTimeout(() => {
          this.performAutoScrollStep();
        }, 100);
        return;
      }

      // If reverse state changed mid-animation, restart the step immediately
      // from the current scroll position with the correct direction
      if (this.state.reverseAutoScrollActive !== isReversing) {
        this.performAutoScrollStep();
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);

      // Apply scroll to main container
      const newScrollTop = startScrollTop + (scrollAmount * easeOut);
      container.scrollTop = newScrollTop;

      // Sync scroll to other panels
      if (this.state.panelCount > 1 && this.state.syncPanelScroll) {
        if (isReversing) {
          // During reverse auto-scroll, use the max scrollTop as the base for all panels
          // so that shorter panels stay put until the longest panel catches up,
          // matching the behavior of manual wheel scrolling (handleWrapperWheel)
          const newPanelScrollTop = maxPanelStartScrollTop + (scrollAmount * easeOut);
          this.panelColumnRefs.forEach((ref) => {
            if (ref && ref.current) {
              ref.current.scrollTop = newPanelScrollTop;
            }
          });
        } else {
          this.panelColumnRefs.forEach((ref, index) => {
            if (ref && ref.current && panelStartPositions[index] !== null) {
              ref.current.scrollTop = panelStartPositions[index] + (scrollAmount * easeOut);
            }
          });
        }
      }

      if (progress < 1) {
        this.autoScrollAnimationId = requestAnimationFrame(animateScroll);
      } else {
        // Animation complete, wait the full recorded delay before next step
        this.autoScrollTimeoutId = setTimeout(() => {
          this.performAutoScrollStep();
        }, this.state.autoScrollDelay);
      }
    };

    this.autoScrollAnimationId = requestAnimationFrame(animateScroll);
  }

  toggleGraphPanelVisibility() {
    this.setState(prevState => {
      const newVisibility = !prevState.isGraphPanelVisible;
      window.localStorage?.setItem(GRAPH_PANEL_VISIBLE, newVisibility);
      return { isGraphPanelVisible: newVisibility };
    });
  }

  handleGraphResizeStart() {
    this.setState({ isGraphPanelResizing: true });
  }

  handleGraphResizeStop(event, { size }) {
    this.setState({
      isGraphPanelResizing: false,
      graphPanelWidth: size.width,
    });
    window.localStorage?.setItem(GRAPH_PANEL_WIDTH, size.width);
  }

  handleGraphResizeDiv(event, { size }) {
    this.setState({ graphPanelWidth: size.width });
  }

  showGraphDialog(isNewGraph = false) {
    this.setState({
      showGraphDialog: true,
      isCreatingNewGraph: isNewGraph
    });
  }

  showNewGraphDialog() {
    this.setState({
      showGraphDialog: true,
      isCreatingNewGraph: true
    });
  }

  hideGraphDialog() {
    this.setState({ showGraphDialog: false });
  }

  async saveGraphConfig(config) {
    // Ensure config has an ID for server storage
    const configWithId = {
      ...config,
      id: config.id || this.graphPreferencesManager.generateGraphId()
    };

    // Store previous state for potential rollback
    const previousGraphConfig = this.state.graphConfig;
    const previousAvailableGraphs = this.state.availableGraphs;

    // Optimistically update availableGraphs to include the new/updated graph
    const existingGraphIndex = this.state.availableGraphs.findIndex(g => g.id === configWithId.id);
    let updatedAvailableGraphs;
    if (existingGraphIndex >= 0) {
      // Update existing graph
      updatedAvailableGraphs = [...this.state.availableGraphs];
      updatedAvailableGraphs[existingGraphIndex] = configWithId;
    } else {
      // Add new graph
      updatedAvailableGraphs = [...this.state.availableGraphs, configWithId];
    }

    this.setState({
      graphConfig: configWithId,
      showGraphDialog: false,
      availableGraphs: updatedAvailableGraphs,
    });

    // Try to save to server/localStorage
    try {
      await this.graphPreferencesManager.saveGraph(
        this.props.app.applicationId,
        this.props.className,
        configWithId,
        [] // allGraphs not needed for single save
      );

      // Reload all graphs to update the dropdown from server
      const graphs = await this.graphPreferencesManager.getGraphs(
        this.props.app.applicationId,
        this.props.className
      );
      this.setState({ availableGraphs: graphs || [] });
    } catch (error) {
      console.error('Failed to save graph:', error);
      // Revert optimistic update on error
      this.setState({
        graphConfig: previousGraphConfig,
        availableGraphs: previousAvailableGraphs
      });
      // Show error notification to user
      if (this.props.showNote) {
        this.props.showNote('Failed to save graph. Please try again.', true);
      }
    }
  }

  selectGraph(graph) {
    this.setState({ graphConfig: graph });
  }

  async deleteGraphConfig(graphId) {
    // Store previous state for potential rollback
    const previousGraphConfig = this.state.graphConfig;
    const previousAvailableGraphs = this.state.availableGraphs;
    const previousIsGraphPanelVisible = this.state.isGraphPanelVisible;

    // Optimistically update UI
    this.setState({
      graphConfig: null,
      showGraphDialog: false,
      isGraphPanelVisible: false,
    });

    // Try to delete from server/localStorage
    try {
      await this.graphPreferencesManager.deleteGraph(
        this.props.app.applicationId,
        this.props.className,
        graphId,
        [] // allGraphs not needed for single delete
      );

      // Reload all graphs to update the dropdown
      const graphs = await this.graphPreferencesManager.getGraphs(
        this.props.app.applicationId,
        this.props.className
      );
      this.setState({ availableGraphs: graphs || [] });

      // Clear the graph panel visibility from localStorage
      window.localStorage?.setItem(GRAPH_PANEL_VISIBLE, 'false');
    } catch (error) {
      console.error('Failed to delete graph:', error);
      // Revert optimistic update on error
      this.setState({
        graphConfig: previousGraphConfig,
        availableGraphs: previousAvailableGraphs,
        isGraphPanelVisible: previousIsGraphPanelVisible
      });
      // Show error notification to user
      if (this.props.showNote) {
        this.props.showNote('Failed to delete graph. Please try again.', true);
      }
    }
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
    const now = Date.now();

    // Clean up stale entries and track which keys are removed
    if (prefetchStale) {
      Object.keys(cache).forEach(key => {
        if ((now - cache[key].timestamp) / 1000 >= prefetchStale) {
          delete cache[key];
        }
      });
    }
    if (Object.keys(cache).length !== Object.keys(this.state.prefetchCache).length) {
      this.setState({ prefetchCache: cache });
    }

    // Helper function to check if an object needs prefetching (missing or stale)
    const needsPrefetch = (objectId) => {
      if (!Object.prototype.hasOwnProperty.call(cache, objectId)) {
        return true;
      }
      if (prefetchStale) {
        const entry = cache[objectId];
        return entry && (now - entry.timestamp) / 1000 >= prefetchStale;
      }
      return false;
    };

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
        if (needsPrefetch(mainObjId)) {
          this.prefetchObject(mainObjId);
        }

        // If in multi-panel mode, also prefetch the other objects that would be displayed in the batch
        if (panelCount > 1) {
          const batchStartIndex = c + (i * stepSize);
          for (let j = 1; j < panelCount && batchStartIndex + j < this.props.data.length; j++) {
            const batchObjId = this.props.data[batchStartIndex + j].id;
            if (needsPrefetch(batchObjId)) {
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
        }, () => {
          this.props.onCellSelectionChange?.(newSelection.size, selectedData);
        });
      } else {
        this.setCurrent({ row, col });
        this.props.onCellSelectionChange?.(0, []);
      }
    } else {
      this.setState({
        selectedCells: { list: new Set(), rowStart: -1, rowEnd: -1, colStart: -1, colEnd: -1 },
        selectedData: [],
        current: { row, col },
        firstSelectedCell: clickedCellKey,
      }, () => {
        this.props.onCellSelectionChange?.(0, []);
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

    // Calculate max width for aggregation panel, accounting for graph panel's minimum width when visible
    const graphPanelMinWidth = 300;
    const aggregationMaxWidth = this.state.isGraphPanelVisible && this.state.graphConfig
      ? this.state.maxWidth - graphPanelMinWidth
      : this.state.maxWidth;

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
            getRelatedRecordsMenuItem={(textValue) => buildRelatedTextFieldsMenuItem(
              this.props.schema,
              textValue,
              this.props.onPointerCmdClick
            )}
            freezeIndex={this.state.frozenColumnIndex}
            freezeColumns={this.freezeColumns}
            unfreezeColumns={this.unfreezeColumns}
            onFilterChange={this.props.onFilterChange}
            onFilterSave={this.props.onFilterSave}
            selectedCells={this.state.selectedCells}
            handleCellClick={this.handleCellClick}
            isPanelVisible={this.state.isPanelVisible}
            panelWidth={effectivePanelWidth}
            isResizing={this.state.isAggregationPanelResizing || this.state.isGraphPanelResizing}
            setShowAggregatedData={this.setShowAggregatedData}
            showRowNumber={this.state.showRowNumber}
            setShowRowNumber={this.setShowRowNumber}
            skip={this.props.skip}
            limit={this.props.limit}
            firstSelectedCell={this.state.firstSelectedCell}
            isGraphPanelVisible={this.state.isGraphPanelVisible && !!this.state.graphConfig}
            graphPanelWidth={this.state.graphPanelWidth}
            {...other}
            onRefreshObjects={this.handleRefreshObjects}
          />
          {this.state.isPanelVisible && (
            <ResizableBox
              width={effectivePanelWidth}
              height={Infinity}
              minConstraints={[100, Infinity]}
              maxConstraints={[aggregationMaxWidth, Infinity]}
              onResizeStart={this.handleResizeStart} // Handle start of resizing
              onResizeStop={this.handleResizeStop} // Handle end of resizing
              onResize={this.handleResizeDiv}
              resizeHandles={['w']}
              className={styles.resizablePanel}
            >
              <div
                className={styles.aggregationPanelContainer}
                ref={this.aggregationPanelRef}
                onWheel={this.handleAutoScrollWheel}
                onMouseEnter={this.handlePanelMouseEnter}
                onMouseLeave={this.handlePanelMouseLeave}
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
                            onContextMenu={this.handleAggregationPanelTextContextMenu}
                            onReload={() => this.props.callCloudFunction(this.state.selectedObjectId, this.props.className, this.props.app.applicationId)}
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
                                    // Ignore right-click (button 2) and middle-click (button 1)
                                    if (e.button !== 0) {
                                      return;
                                    }
                                    e.preventDefault();
                                    this.onMouseDownPanelCheckBox(objectId, isRowSelected);
                                  }}
                                  onMouseUp={this.onMouseUpPanelCheckBox}
                                  onMouseEnter={() => {
                                    this.onMouseEnterPanelCheckBox(objectId);
                                    this.handlePanelHeaderMouseEnter();
                                  }}
                                  onMouseLeave={this.handlePanelHeaderMouseLeave}
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
                                onContextMenu={this.handleAggregationPanelTextContextMenu}
                                onReload={() => this.props.callCloudFunction(objectId, this.props.className, this.props.app.applicationId)}
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
                    onContextMenu={this.handleAggregationPanelTextContextMenu}
                    onReload={() => this.props.callCloudFunction(this.state.selectedObjectId, this.props.className, this.props.app.applicationId)}
                  />
                )}
              </div>
            </ResizableBox>
          )}
          {this.state.isGraphPanelVisible && (() => {
            // Calculate max width for graph panel, accounting for aggregation panel when visible
            const aggregationPanelWidth = this.state.isPanelVisible ? effectivePanelWidth : 0;
            const graphMaxWidth = Math.max(300, this.state.maxWidth - aggregationPanelWidth);
            // Clamp the graph panel width to the available space
            const graphPanelWidth = Math.min(this.state.graphPanelWidth, graphMaxWidth);

            return (
              <ResizableBox
                width={graphPanelWidth}
                height={Infinity}
                minConstraints={[300, Infinity]}
                maxConstraints={[graphMaxWidth, Infinity]}
                onResizeStart={this.handleGraphResizeStart}
                onResizeStop={this.handleGraphResizeStop}
                onResize={this.handleGraphResizeDiv}
                resizeHandles={['w']}
                className={styles.resizablePanel}
                style={{ right: aggregationPanelWidth }}
              >
                <div className={styles.graphPanelContainer}>
                  <GraphPanel
                    graphConfig={this.state.graphConfig}
                    data={this.props.data}
                    columns={this.props.columns}
                    isLoading={!this.props.data}
                    onRefresh={this.handleRefresh}
                    onEdit={this.showGraphDialog}
                    onClose={this.toggleGraphPanelVisibility}
                    availableGraphs={this.state.availableGraphs}
                    onGraphSelect={this.selectGraph}
                    onNewGraph={this.showNewGraphDialog}
                  />
                </div>
              </ResizableBox>
            );
          })()}
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
          autoScrollEnabled={this.state.autoScrollEnabled}
          toggleAutoScroll={this.toggleAutoScroll}
          autoScrollRequireHover={this.state.autoScrollRequireHover}
          toggleAutoScrollRequireHover={this.toggleAutoScrollRequireHover}
          isAutoScrolling={this.state.isAutoScrolling}
          stopAutoScroll={this.stopAutoScroll}
          toggleGraphPanel={this.toggleGraphPanelVisibility}
          isGraphPanelVisible={this.state.isGraphPanelVisible}
          runScriptShortcut={this.state.keyboardShortcuts?.dataBrowserRunScriptOnSelectedRows?.key?.toUpperCase()}
          {...other}
          onRefresh={this.handleRefresh}
        />

        {this.state.contextMenuX && (
          <ContextMenu
            x={this.state.contextMenuX}
            y={this.state.contextMenuY}
            items={this.state.contextMenuItems}
            onHide={() => this.setState({ contextMenuX: null, contextMenuY: null, contextMenuItems: null })}
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
                this.props.reloadDataTableAfterScript ? this.props.onRefresh : null,
                this.props.reloadDataTableAfterScript ? null : this.handleRefreshObjects,
                this.props.onScriptModalResponse
              );
              this.setState({ showScriptConfirmationDialog: false, selectedScript: null });
            }}
          />
        )}
        {this.state.showGraphDialog && (
          <GraphDialog
            columns={this.props.columns}
            className={this.props.className}
            initialConfig={this.state.isCreatingNewGraph ? null : this.state.graphConfig}
            onConfirm={this.saveGraphConfig}
            onCancel={this.hideGraphDialog}
            onDelete={this.deleteGraphConfig}
          />
        )}
      </div>
    );
  }
}
