/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* global Parse */
import React from 'react';
import DashboardView from 'dashboard/DashboardView.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Icon from 'components/Icon/Icon.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import BrowserMenu from 'components/BrowserMenu/BrowserMenu.react';
import MenuItem from 'components/BrowserMenu/MenuItem.react';
import Separator from 'components/BrowserMenu/Separator.react';
import CanvasElement from './CanvasElement.react';
import AddElementDialog from './AddElementDialog.react';
import SaveCanvasDialog from './SaveCanvasDialog.react';
import StaticTextElement from './elements/StaticTextElement.react';
import StaticTextConfigDialog from './elements/StaticTextConfigDialog.react';
import GraphElement from './elements/GraphElement.react';
import GraphConfigDialog from './elements/GraphConfigDialog.react';
import DataTableElement from './elements/DataTableElement.react';
import DataTableConfigDialog from './elements/DataTableConfigDialog.react';
import ViewElement from './elements/ViewElement.react';
import ViewConfigDialog from './elements/ViewConfigDialog.react';
import GraphPreferencesManager from 'lib/GraphPreferencesManager';
import ViewPreferencesManager from 'lib/ViewPreferencesManager';
import FilterPreferencesManager from 'lib/FilterPreferencesManager';
import { addConstraintFromValues } from 'lib/queryFromFilters';
import CanvasPreferencesManager from 'lib/CanvasPreferencesManager';
import CategoryList from 'components/CategoryList/CategoryList.react';
import { CurrentApp } from 'context/currentApp';
import subscribeTo from 'lib/subscribeTo';
import { withRouter } from 'lib/withRouter';
import { ActionTypes } from 'lib/stores/SchemaStore';
import generatePath from 'lib/generatePath';
import stringCompare from 'lib/stringCompare';
import styles from './CustomDashboard.scss';

function generateId() {
  return 'el_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

@subscribeTo('Schema', 'schema')
@withRouter
class CustomDashboard extends DashboardView {
  static contextType = CurrentApp;

  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Canvas';
    this.state = {
      elements: [],
      selectedElement: null,
      elementData: {},
      showAddDialog: false,
      showStaticTextDialog: false,
      showGraphDialog: false,
      showDataTableDialog: false,
      showViewDialog: false,
      showSaveDialog: false,
      editingElement: null,
      availableGraphs: {},
      availableFilters: {},
      availableViews: [],
      classes: [],
      classSchemas: {},
      autoReloadInterval: 0,
      autoReloadProgress: 0,
      savedCanvases: [],
      currentCanvasId: null,
      currentCanvasName: null,
      currentCanvasGroup: null,
      hasUnsavedChanges: false,
      isFullscreen: false,
      // Track dragging element position for canvas auto-extend
      dragPosition: null,
      // Track expanded groups in sidebar
      expandedSidebarGroups: [],
    };
    this.autoReloadTimer = null;
    this.autoReloadProgressTimer = null;
    this.autoReloadStartTime = null;
    this.canvasPreferencesManager = null;
    this._isMounted = false;
    this._elementSeq = {};
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this._isMounted = true;
    const { schema } = this.props;
    schema.dispatch(ActionTypes.FETCH);
    this.initCanvasPreferencesManager();
    // Load classes if schema data is already available (e.g., when navigating back)
    if (schema && schema.data) {
      this.loadClasses();
    }

    // Register event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('msfullscreenchange', this.handleFullscreenChange);
  }

  initCanvasPreferencesManager() {
    if (!this.context || !this.context.applicationId) {
      return;
    }

    if (!this.canvasPreferencesManager || this.canvasPreferencesManager.app !== this.context) {
      this.canvasPreferencesManager = new CanvasPreferencesManager(this.context);
    }

    this.loadSavedCanvases();
  }

  async loadSavedCanvases() {
    if (!this.canvasPreferencesManager || !this.context?.applicationId) {
      return;
    }

    try {
      const savedCanvases = await this.canvasPreferencesManager.getCanvases(
        this.context.applicationId
      );
      this.setState({ savedCanvases }, () => {
        // Load canvas from URL if canvasId is present
        const canvasId = this.props.params?.canvasId;
        if (canvasId) {
          const canvas = savedCanvases.find(c => c.id === canvasId);
          if (canvas) {
            this.loadCanvasById(canvas);
          }
        }
      });
    } catch (error) {
      console.error('Failed to load saved canvases:', error);
    }
  }

  loadCanvasById(canvas) {
    this.setState({
      elements: canvas.elements || [],
      elementData: {},
      selectedElement: null,
      currentCanvasId: canvas.id,
      currentCanvasName: canvas.name,
      currentCanvasGroup: canvas.group || null,
      hasUnsavedChanges: false,
    }, () => {
      // Fetch data for all graph, data table, and view elements
      canvas.elements?.forEach(element => {
        if (element.type === 'graph' || element.type === 'dataTable' || element.type === 'view') {
          this.fetchElementData(element.id);
        }
      });
    });
  }

  navigateToCanvas(canvasId) {
    const path = generatePath(this.context, canvasId ? `canvas/${canvasId}` : 'canvas');
    this.props.navigate(path);
  }

  componentDidUpdate(prevProps) {
    // Load classes when schema data becomes available or changes
    if (this.props.schema?.data !== prevProps.schema?.data) {
      this.loadClasses();
    }

    // Handle URL changes (browser back/forward navigation)
    const prevCanvasId = prevProps.params?.canvasId;
    const currentCanvasId = this.props.params?.canvasId;

    if (prevCanvasId !== currentCanvasId) {
      if (currentCanvasId) {
        // Load the canvas specified in URL
        const canvas = this.state.savedCanvases.find(c => c.id === currentCanvasId);
        if (canvas && this.state.currentCanvasId !== currentCanvasId) {
          this.loadCanvasById(canvas);
        }
      } else if (prevCanvasId && !currentCanvasId) {
        // URL changed from canvas/:id to canvas/ - reset to empty canvas
        if (this.state.currentCanvasId) {
          this.setState({
            elements: [],
            elementData: {},
            selectedElement: null,
            currentCanvasId: null,
            currentCanvasName: null,
            currentCanvasGroup: null,
            hasUnsavedChanges: false,
          });
        }
      }
    }
  }

  loadClasses() {
    if (!this.props.schema?.data) {
      return;
    }

    const classesData = this.props.schema.data.get('classes');
    if (!classesData) {
      return;
    }

    const classes = Object.keys(classesData.toJS());
    const classSchemas = {};
    classes.forEach(className => {
      const classSchema = classesData.get(className);
      if (classSchema) {
        classSchemas[className] = classSchema.toJS();
      }
    });

    this.setState({ classes, classSchemas }, () => {
      this.loadAvailableGraphs();
      this.loadAvailableFilters();
      this.loadAvailableViews();
    });
  }

  async loadAvailableGraphs() {
    if (!this.context || !this.context.applicationId) {
      return;
    }

    const graphPreferencesManager = new GraphPreferencesManager(this.context);
    const graphsByClass = {};

    for (const className of this.state.classes) {
      try {
        const graphs = await graphPreferencesManager.getGraphs(
          this.context.applicationId,
          className
        );
        if (graphs && graphs.length > 0) {
          graphsByClass[className] = graphs;
        }
      } catch (e) {
        console.error(`Error loading graphs for ${className}:`, e);
      }
    }

    this.setState({ availableGraphs: graphsByClass });
  }

  async loadAvailableFilters() {
    if (!this.context || !this.context.applicationId) {
      return;
    }

    const filterPreferencesManager = new FilterPreferencesManager(this.context);
    const filtersByClass = {};

    for (const className of this.state.classes) {
      try {
        const filters = await filterPreferencesManager.getFilters(
          this.context.applicationId,
          className
        );
        if (filters && filters.length > 0) {
          filtersByClass[className] = filters;
        }
      } catch (e) {
        console.error(`Error loading filters for ${className}:`, e);
      }
    }

    this.setState({ availableFilters: filtersByClass });
  }

  async loadAvailableViews() {
    if (!this.context || !this.context.applicationId) {
      return;
    }

    const viewPreferencesManager = new ViewPreferencesManager(this.context);

    try {
      const views = await viewPreferencesManager.getViews(this.context.applicationId);
      this.setState({ availableViews: views || [] });
    } catch (e) {
      console.error('Error loading views:', e);
      this.setState({ availableViews: [] });
    }
  }

  handleAddElement = (type) => {
    this.setState({ showAddDialog: false });
    switch (type) {
      case 'staticText':
        this.setState({ showStaticTextDialog: true, editingElement: null });
        break;
      case 'graph':
        this.setState({ showGraphDialog: true, editingElement: null });
        break;
      case 'dataTable':
        this.setState({ showDataTableDialog: true, editingElement: null });
        break;
      case 'view':
        this.setState({ showViewDialog: true, editingElement: null });
        break;
    }
  };

  handleSaveStaticText = (config) => {
    const { editingElement, elements } = this.state;

    if (editingElement) {
      const updatedElements = elements.map(el =>
        el.id === editingElement.id ? { ...el, config } : el
      );
      this.setState({
        elements: updatedElements,
        showStaticTextDialog: false,
        editingElement: null,
      }, this.markUnsavedChanges);
    } else {
      const newElement = {
        id: generateId(),
        type: 'staticText',
        x: 50,
        y: 50,
        width: 300,
        height: 100,
        config,
      };
      this.setState({
        elements: [...elements, newElement],
        showStaticTextDialog: false,
      }, this.markUnsavedChanges);
    }
  };

  handleSaveGraph = (config) => {
    const { editingElement, elements } = this.state;

    if (editingElement) {
      const updatedElements = elements.map(el =>
        el.id === editingElement.id ? { ...el, config } : el
      );
      this.setState({
        elements: updatedElements,
        showGraphDialog: false,
        editingElement: null,
      }, () => {
        this.fetchElementData(editingElement.id);
        this.markUnsavedChanges();
      });
    } else {
      const newElement = {
        id: generateId(),
        type: 'graph',
        x: 50,
        y: 50,
        width: 500,
        height: 350,
        config,
      };
      this.setState({
        elements: [...elements, newElement],
        showGraphDialog: false,
      }, () => {
        this.fetchElementData(newElement.id);
        this.markUnsavedChanges();
      });
    }
  };

  handleSaveDataTable = (config) => {
    const { editingElement, elements } = this.state;

    if (editingElement) {
      const updatedElements = elements.map(el =>
        el.id === editingElement.id ? { ...el, config } : el
      );
      this.setState({
        elements: updatedElements,
        showDataTableDialog: false,
        editingElement: null,
      }, () => {
        this.fetchElementData(editingElement.id);
        this.markUnsavedChanges();
      });
    } else {
      const newElement = {
        id: generateId(),
        type: 'dataTable',
        x: 50,
        y: 50,
        width: 500,
        height: 300,
        config,
      };
      this.setState({
        elements: [...elements, newElement],
        showDataTableDialog: false,
      }, () => {
        this.fetchElementData(newElement.id);
        this.markUnsavedChanges();
      });
    }
  };

  handleSaveView = (config) => {
    const { editingElement, elements } = this.state;

    if (editingElement) {
      const updatedElements = elements.map(el =>
        el.id === editingElement.id ? { ...el, config } : el
      );
      this.setState({
        elements: updatedElements,
        showViewDialog: false,
        editingElement: null,
      }, () => {
        this.fetchElementData(editingElement.id);
        this.markUnsavedChanges();
      });
    } else {
      const newElement = {
        id: generateId(),
        type: 'view',
        x: 50,
        y: 50,
        width: 500,
        height: 300,
        config,
      };
      this.setState({
        elements: [...elements, newElement],
        showViewDialog: false,
      }, () => {
        this.fetchElementData(newElement.id);
        this.markUnsavedChanges();
      });
    }
  };

  async fetchElementData(elementId) {
    const element = this.state.elements.find(el => el.id === elementId);
    if (!element) {
      return;
    }

    const { type, config } = element;
    if (type === 'staticText') {
      return;
    }

    // Increment sequence token for this element to invalidate stale responses
    this._elementSeq[elementId] = (this._elementSeq[elementId] || 0) + 1;
    const localToken = this._elementSeq[elementId];

    if (!this._isMounted) {
      return;
    }

    this.setState(state => ({
      elementData: {
        ...state.elementData,
        [elementId]: { data: null, isLoading: true, error: null },
      },
    }));

    try {
      let data;

      if (type === 'view') {
        // Handle View element - uses aggregation pipeline or cloud function
        const { cloudFunction, query: viewQuery, className } = config;

        if (cloudFunction) {
          // Cloud Function view
          const results = await Parse.Cloud.run(cloudFunction, {}, { useMasterKey: true });
          data = this.normalizeViewResults(results);
        } else if (viewQuery && Array.isArray(viewQuery) && className) {
          // Aggregation pipeline view
          const results = await new Parse.Query(className).aggregate(viewQuery, { useMasterKey: true });
          data = this.normalizeViewResults(results);
        } else {
          throw new Error('Invalid view configuration');
        }
      } else {
        // Handle DataTable and Graph elements
        const { className, filterConfig, sortField, sortOrder, limit } = config;
        const query = new Parse.Query(className);

        if (filterConfig && Array.isArray(filterConfig)) {
          filterConfig.forEach(savedFilter => {
            // Saved filters have structure: { id, name, filter: '[{field, constraint, compareTo}]' }
            // The 'filter' property contains a JSON string array of filter conditions
            if (savedFilter.filter) {
              try {
                const conditions = typeof savedFilter.filter === 'string'
                  ? JSON.parse(savedFilter.filter)
                  : savedFilter.filter;
                if (Array.isArray(conditions)) {
                  conditions.forEach(condition => {
                    addConstraintFromValues(
                      query,
                      condition.field,
                      condition.constraint,
                      condition.compareTo,
                      condition.modifiers
                    );
                  });
                }
              } catch (e) {
                console.error('Error parsing filter conditions:', e);
              }
            }
          });
        }

        if (sortField) {
          if (sortOrder === 'descending') {
            query.descending(sortField);
          } else {
            query.ascending(sortField);
          }
        }

        if (limit != null) {
          const numericLimit = Number(limit);
          if (Number.isFinite(numericLimit) && numericLimit >= 0) {
            query.limit(numericLimit);
          } else {
            query.limit(1000);
          }
        } else {
          query.limit(1000);
        }

        const results = await query.find({ useMasterKey: true });
        data = results.map(obj => obj.toJSON());
      }

      // Check if component is still mounted and this is the latest request
      if (!this._isMounted || localToken !== this._elementSeq[elementId]) {
        return;
      }

      // Check if element still exists before updating state
      if (!this.state.elements.find(el => el.id === elementId)) {
        return;
      }

      this.setState(state => ({
        elementData: {
          ...state.elementData,
          [elementId]: { data, isLoading: false, error: null },
        },
      }));
    } catch (error) {
      console.error('Error fetching element data:', error);

      // Check if component is still mounted and this is the latest request
      if (!this._isMounted || localToken !== this._elementSeq[elementId]) {
        return;
      }

      // Check if element still exists before updating state
      if (!this.state.elements.find(el => el.id === elementId)) {
        return;
      }

      this.setState(state => ({
        elementData: {
          ...state.elementData,
          [elementId]: { data: null, isLoading: false, error },
        },
      }));
    }
  }


  normalizeViewResults(results) {
    // Normalize Parse.Object instances to raw JSON for consistent rendering
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

    return results.map(item => {
      const normalized = {};
      Object.keys(item).forEach(key => {
        normalized[key] = normalizeValue(item[key]);
      });
      return normalized;
    });
  }

  handleSelectElement = (id) => {
    this.setState({ selectedElement: id });
  };

  handleDeselectElement = (e) => {
    if (e.target === e.currentTarget) {
      this.setState({ selectedElement: null });
    }
  };

  // Snap value to grid
  snapToGrid(value, gridSize = 50) {
    return Math.round(value / gridSize) * gridSize;
  }

  handlePositionChange = (id, x, y) => {
    // Snap to grid and ensure position is not negative
    const safeX = Math.max(0, this.snapToGrid(x));
    const safeY = Math.max(0, this.snapToGrid(y));
    this.setState(state => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, x: safeX, y: safeY } : el
      ),
    }), this.markUnsavedChanges);
  };

  handleSizeChange = (id, width, height, x, y) => {
    // Snap to grid and ensure position is not negative when resizing from left/top edges
    const safeX = Math.max(0, this.snapToGrid(x));
    const safeY = Math.max(0, this.snapToGrid(y));
    const snappedWidth = this.snapToGrid(width);
    const snappedHeight = this.snapToGrid(height);
    this.setState(state => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, width: snappedWidth, height: snappedHeight, x: safeX, y: safeY } : el
      ),
    }), this.markUnsavedChanges);
  };

  handleDrag = (id, x, y, width, height) => {
    // Update drag position to trigger canvas auto-extend during drag
    this.setState({
      dragPosition: { id, x, y, width, height },
    });
  };

  handleDragEnd = () => {
    // Clear drag position when drag ends
    this.setState({ dragPosition: null });
  };

  handleResize = (id, width, height, x, y) => {
    // Update drag position to trigger canvas auto-extend during resize
    this.setState({
      dragPosition: { id, x, y, width, height },
    });
  };

  handleResizeEnd = () => {
    // Clear drag position when resize ends
    this.setState({ dragPosition: null });
  };

  // Calculate the required canvas size based on all elements and current drag position
  // Returns dimensions only when content extends beyond the default CSS size
  getCanvasSize() {
    const { elements, dragPosition } = this.state;
    const padding = 50; // Extra padding to allow easy placement at edges

    let maxRight = 0;
    let maxBottom = 0;

    // Calculate bounds from all elements
    elements.forEach(el => {
      const right = el.x + el.width;
      const bottom = el.y + el.height;
      if (right > maxRight) {
        maxRight = right;
      }
      if (bottom > maxBottom) {
        maxBottom = bottom;
      }
    });

    // Include current drag position if dragging
    if (dragPosition) {
      const dragRight = dragPosition.x + dragPosition.width;
      const dragBottom = dragPosition.y + dragPosition.height;
      if (dragRight > maxRight) {
        maxRight = dragRight;
      }
      if (dragBottom > maxBottom) {
        maxBottom = dragBottom;
      }
    }

    // Add padding to content bounds
    const contentWidth = maxRight + padding;
    const contentHeight = maxBottom + padding;

    // Return the content-based dimensions (CSS handles minimum via width:100% and min-height)
    return {
      minWidth: contentWidth,
      minHeight: contentHeight,
    };
  }

  handleDeleteElement = (id) => {
    this.setState(state => ({
      elements: state.elements.filter(el => el.id !== id),
      selectedElement: state.selectedElement === id ? null : state.selectedElement,
      elementData: (() => {
        const newData = { ...state.elementData };
        delete newData[id];
        return newData;
      })(),
    }), this.markUnsavedChanges);
  };

  handleDuplicateElement = (id) => {
    const { elements } = this.state;
    const element = elements.find(el => el.id === id);

    if (!element) {
      return;
    }

    const duplicatedElement = {
      ...element,
      id: generateId(),
      x: element.x + 50,
      y: element.y + 50,
      config: { ...element.config },
    };

    this.setState(state => ({
      elements: [...state.elements, duplicatedElement],
      selectedElement: duplicatedElement.id,
    }), () => {
      if (element.type === 'graph' || element.type === 'dataTable' || element.type === 'view') {
        this.fetchElementData(duplicatedElement.id);
      }
      this.markUnsavedChanges();
    });
  };

  handleEditElement = () => {
    const { selectedElement, elements } = this.state;
    if (!selectedElement) {
      return;
    }

    const element = elements.find(el => el.id === selectedElement);
    if (!element) {
      return;
    }

    this.setState({ editingElement: element });

    switch (element.type) {
      case 'staticText':
        this.setState({ showStaticTextDialog: true });
        break;
      case 'graph':
        this.setState({ showGraphDialog: true });
        break;
      case 'dataTable':
        this.setState({ showDataTableDialog: true });
        break;
      case 'view':
        this.setState({ showViewDialog: true });
        break;
    }
  };

  handleRefreshElement = (id) => {
    this.fetchElementData(id);
  };

  handleReloadAll = () => {
    const { elements } = this.state;
    elements.forEach(element => {
      if (element.type === 'graph' || element.type === 'dataTable' || element.type === 'view') {
        this.fetchElementData(element.id);
      }
    });
  };

  handleAutoReloadChange = (interval) => {
    const seconds = parseInt(interval, 10) || 0;
    this.setState({ autoReloadInterval: seconds, autoReloadProgress: 0 });

    // Clear existing timers
    if (this.autoReloadTimer) {
      clearInterval(this.autoReloadTimer);
      this.autoReloadTimer = null;
    }
    if (this.autoReloadProgressTimer) {
      clearInterval(this.autoReloadProgressTimer);
      this.autoReloadProgressTimer = null;
    }

    // Set up new timers if interval > 0
    if (seconds > 0) {
      this.autoReloadStartTime = Date.now();

      // Progress update timer (every 100ms for smooth animation)
      this.autoReloadProgressTimer = setInterval(() => {
        const elapsed = Date.now() - this.autoReloadStartTime;
        const progress = Math.min((elapsed / (seconds * 1000)) * 100, 100);
        this.setState({ autoReloadProgress: progress });
      }, 100);

      // Reload timer
      this.autoReloadTimer = setInterval(() => {
        this.handleReloadAll();
        this.autoReloadStartTime = Date.now();
        this.setState({ autoReloadProgress: 0 });
      }, seconds * 1000);
    }
  };

  handleSaveCanvas = async (name, group) => {
    if (!this.canvasPreferencesManager || !this.context?.applicationId) {
      console.error('Canvas preferences manager not initialized');
      return;
    }

    const { elements, currentCanvasId, savedCanvases } = this.state;

    // Create canvas object
    const canvas = {
      id: currentCanvasId || this.canvasPreferencesManager.generateCanvasId(),
      name,
      group,
      elements,
    };

    try {
      // Update or add to saved canvases
      let updatedCanvases;
      if (currentCanvasId) {
        updatedCanvases = savedCanvases.map(c =>
          c.id === currentCanvasId ? canvas : c
        );
      } else {
        updatedCanvases = [...savedCanvases, canvas];
      }

      await this.canvasPreferencesManager.saveCanvas(
        this.context.applicationId,
        canvas,
        updatedCanvases
      );

      // Update URL to include canvas ID
      const isNewCanvas = !currentCanvasId;

      this.setState({
        showSaveDialog: false,
        savedCanvases: updatedCanvases,
        currentCanvasId: canvas.id,
        currentCanvasName: name,
        currentCanvasGroup: group,
        hasUnsavedChanges: false,
      }, () => {
        // Navigate to canvas URL if this is a new canvas
        if (isNewCanvas) {
          this.navigateToCanvas(canvas.id);
        }
      });
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  };

  handleLoadCanvas = (canvas) => {
    // Load elements from saved canvas
    this.setState({
      elements: canvas.elements || [],
      elementData: {},
      selectedElement: null,
      currentCanvasId: canvas.id,
      currentCanvasName: canvas.name,
      currentCanvasGroup: canvas.group || null,
      hasUnsavedChanges: false,
    }, () => {
      // Update URL to include canvas ID
      this.navigateToCanvas(canvas.id);

      // Fetch data for all graph, data table, and view elements
      canvas.elements?.forEach(element => {
        if (element.type === 'graph' || element.type === 'dataTable' || element.type === 'view') {
          this.fetchElementData(element.id);
        }
      });
    });
  };

  handleDeleteCanvas = async (canvasId) => {
    if (!this.canvasPreferencesManager || !this.context?.applicationId) {
      return;
    }

    const { savedCanvases, currentCanvasId } = this.state;
    const updatedCanvases = savedCanvases.filter(c => c.id !== canvasId);

    try {
      await this.canvasPreferencesManager.deleteCanvas(
        this.context.applicationId,
        canvasId,
        updatedCanvases
      );

      // If we deleted the currently loaded canvas, reset the state and URL
      const resetCurrentCanvas = currentCanvasId === canvasId;

      this.setState({
        savedCanvases: updatedCanvases,
        ...(resetCurrentCanvas && {
          elements: [],
          elementData: {},
          selectedElement: null,
          currentCanvasId: null,
          currentCanvasName: null,
          currentCanvasGroup: null,
          hasUnsavedChanges: false,
        }),
      }, () => {
        if (resetCurrentCanvas) {
          this.navigateToCanvas(null);
        }
      });
    } catch (error) {
      console.error('Failed to delete canvas:', error);
    }
  };

  handleNewCanvas = () => {
    this.setState({
      elements: [],
      elementData: {},
      selectedElement: null,
      currentCanvasId: null,
      currentCanvasName: null,
      currentCanvasGroup: null,
      hasUnsavedChanges: false,
    }, () => {
      // Clear canvas ID from URL
      this.navigateToCanvas(null);
    });
  };

  markUnsavedChanges = () => {
    if (!this.state.hasUnsavedChanges) {
      this.setState({ hasUnsavedChanges: true });
    }
  };

  toggleFullscreen = () => {
    const { isFullscreen } = this.state;

    if (!isFullscreen) {
      // Enter fullscreen
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      this.setState({ isFullscreen: true });
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      this.setState({ isFullscreen: false });
    }
  };

  handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
    this.setState({ isFullscreen: isCurrentlyFullscreen });
  };

  isEditableElement(element) {
    if (!element) {
      return false;
    }
    const tagName = element.tagName?.toUpperCase();
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
      return true;
    }
    if (element.isContentEditable) {
      return true;
    }
    return false;
  }

  handleKeyDown = (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.state.selectedElement && !this.isEditableElement(document.activeElement)) {
        e.preventDefault();
        this.handleDeleteElement(this.state.selectedElement);
      }
    } else if (e.key === 'Escape') {
      // Deselect element (fullscreen exit is handled by browser natively)
      if (!this.state.isFullscreen) {
        this.setState({ selectedElement: null });
      }
    } else if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
      // Duplicate selected element with Cmd/Ctrl+D
      if (this.state.selectedElement && !this.isEditableElement(document.activeElement)) {
        e.preventDefault();
        this.handleDuplicateElement(this.state.selectedElement);
      }
    } else if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
      // Edit selected element with Cmd/Ctrl+E
      if (this.state.selectedElement && !this.isEditableElement(document.activeElement)) {
        e.preventDefault();
        this.handleEditElement();
      }
    } else if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
      // Reload all elements with Cmd/Ctrl+R
      const hasDataElements = this.state.elements.some(
        el => el.type === 'graph' || el.type === 'dataTable' || el.type === 'view'
      );
      if (hasDataElements && !this.isEditableElement(document.activeElement)) {
        e.preventDefault();
        this.handleReloadAll();
      }
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('msfullscreenchange', this.handleFullscreenChange);
    if (this.autoReloadTimer) {
      clearInterval(this.autoReloadTimer);
    }
    if (this.autoReloadProgressTimer) {
      clearInterval(this.autoReloadProgressTimer);
    }
  }

  renderSidebar() {
    const { savedCanvases } = this.state;

    // Sort canvases alphabetically
    const sortedCanvases = [...savedCanvases]
      .sort((a, b) => stringCompare(a.name || '', b.name || ''));

    // Don't render sidebar if no canvases
    if (sortedCanvases.length === 0) {
      return null;
    }

    // Group canvases by their group name
    const groupedCanvases = {};
    const ungroupedCanvases = [];

    sortedCanvases.forEach(canvas => {
      if (canvas.group) {
        if (!groupedCanvases[canvas.group]) {
          groupedCanvases[canvas.group] = [];
        }
        groupedCanvases[canvas.group].push(canvas);
      } else {
        ungroupedCanvases.push(canvas);
      }
    });

    // Build categories
    const categories = [];
    const currentCanvasId = this.props.params?.canvasId || '';

    // Add ungrouped canvases as top-level items
    ungroupedCanvases.forEach(canvas => {
      categories.push({
        name: canvas.name || 'Untitled Canvas',
        id: canvas.id,
      });
    });

    // Add groups with canvases as nested filters
    const sortedGroups = Object.keys(groupedCanvases).sort((a, b) => stringCompare(a, b));
    sortedGroups.forEach(groupName => {
      const canvases = groupedCanvases[groupName];
      categories.push({
        name: groupName,
        id: `group_${groupName}`,
        link: currentCanvasId || '',
        filters: canvases.map(canvas => ({
          name: canvas.name || 'Untitled Canvas',
          filter: canvas.id,
          id: canvas.id,
        })),
      });
    });

    // Determine current category (could be a direct canvas or a group containing the canvas)
    let currentCategory = currentCanvasId;
    sortedGroups.forEach(groupName => {
      const canvases = groupedCanvases[groupName];
      if (canvases.some(c => c.id === currentCanvasId)) {
        currentCategory = `group_${groupName}`;
      }
    });

    return (
      <CategoryList
        current={currentCategory}
        linkPrefix={'canvas/'}
        categories={categories}
        params={`filters=${currentCanvasId}&filterId=${currentCanvasId}`}
        filterClicked={(url) => {
          // Extract canvas ID from the filter URL
          const match = url.match(/filterId=([^&]+)/);
          if (match) {
            this.navigateToCanvas(match[1]);
          }
        }}
      />
    );
  }

  renderElementContent(element) {
    const { elementData, classSchemas } = this.state;
    const data = elementData[element.id];

    switch (element.type) {
      case 'staticText':
        return <StaticTextElement config={element.config} />;
      case 'graph':
        return (
          <GraphElement
            config={element.config}
            data={data?.data}
            columns={classSchemas[element.config?.className]}
            isLoading={data?.isLoading}
            error={data?.error}
            onRefresh={() => this.handleRefreshElement(element.id)}
          />
        );
      case 'dataTable':
        return (
          <DataTableElement
            config={element.config}
            data={data?.data}
            columns={classSchemas[element.config?.className]}
            isLoading={data?.isLoading}
            error={data?.error}
            onRefresh={() => this.handleRefreshElement(element.id)}
          />
        );
      case 'view':
        return (
          <ViewElement
            config={element.config}
            data={data?.data}
            isLoading={data?.isLoading}
            error={data?.error}
            onRefresh={() => this.handleRefreshElement(element.id)}
          />
        );
      default:
        return null;
    }
  }

  renderContent() {
    const { elements, selectedElement, isFullscreen } = this.state;
    const toolbar = this.renderToolbar();
    const extras = this.renderExtras();

    const wrapperClasses = [styles.wrapper];
    if (isFullscreen) {
      wrapperClasses.push(styles.fullscreen);
    }

    // Calculate dynamic canvas size based on element positions
    const canvasSize = this.getCanvasSize();

    return (
      <div className={wrapperClasses.join(' ')}>
        <div
          ref={this.canvasRef}
          className={styles.canvas}
          onClick={this.handleDeselectElement}
          tabIndex={0}
        >
          {/* Invisible sizing element that expands the canvas when elements extend beyond */}
          {(canvasSize.minWidth > 0 || canvasSize.minHeight > 0) && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: canvasSize.minWidth,
                height: canvasSize.minHeight,
                pointerEvents: 'none',
              }}
            />
          )}
          {elements.length === 0 && !isFullscreen ? (
            <EmptyState
              icon="canvas-outline"
              title="Canvas"
              description="Create your own canvas by adding elements like text, graphs, and data tables."
              cta="Add Element"
              action={() => this.setState({ showAddDialog: true })}
            />
          ) : (
            elements.map(element => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={element.id === selectedElement}
                onSelect={this.handleSelectElement}
                onPositionChange={(id, x, y) => {
                  this.handleDragEnd();
                  this.handlePositionChange(id, x, y);
                }}
                onSizeChange={(id, width, height, x, y) => {
                  this.handleResizeEnd();
                  this.handleSizeChange(id, width, height, x, y);
                }}
                onDrag={this.handleDrag}
                onResize={this.handleResize}
              >
                {this.renderElementContent(element)}
              </CanvasElement>
            ))
          )}
        </div>
        {!isFullscreen && toolbar}
        {extras}
      </div>
    );
  }

  renderToolbar() {
    const {
      selectedElement,
      autoReloadInterval,
      autoReloadProgress,
      currentCanvasName,
      currentCanvasGroup,
      hasUnsavedChanges,
      elements,
    } = this.state;

    const hasDataElements = elements.some(
      el => el.type === 'graph' || el.type === 'dataTable' || el.type === 'view'
    );

    const hasElements = elements.length > 0;

    // Build subsection with group, canvas name and unsaved indicator
    let subsection = '';
    if (currentCanvasGroup && currentCanvasName) {
      subsection = `${currentCanvasGroup} | ${currentCanvasName}`;
    } else if (currentCanvasName) {
      subsection = currentCanvasName;
    }
    if (hasUnsavedChanges && subsection) {
      subsection += ' *';
    } else if (hasUnsavedChanges && hasElements) {
      subsection = 'Unsaved *';
    }

    return (
      <Toolbar section="Canvas" subsection={subsection}>
        <BrowserMenu
          title="Canvas"
          icon="canvas-outline"
          setCurrent={() => {}}
        >
          <MenuItem
            text="New"
            onClick={this.handleNewCanvas}
          />
          <MenuItem
            text="Save..."
            onClick={() => this.setState({ showSaveDialog: true })}
          />
        </BrowserMenu>
        <div className={styles.toolbarSeparator} />
        <BrowserMenu
          title="Element"
          icon="files-outline"
          setCurrent={() => {}}
        >
          <MenuItem
            text="Add"
            onClick={() => this.setState({ showAddDialog: true })}
          />
          <MenuItem
            text="Duplicate"
            shortcut="⌘D"
            disabled={!selectedElement}
            onClick={() => this.handleDuplicateElement(selectedElement)}
          />
          <MenuItem
            text="Edit"
            shortcut="⌘E"
            disabled={!selectedElement}
            onClick={this.handleEditElement}
          />
          <Separator />
          <MenuItem
            text="Delete"
            shortcut="⌫"
            disabled={!selectedElement}
            onClick={() => this.handleDeleteElement(selectedElement)}
          />
        </BrowserMenu>
        {hasDataElements && (
          <>
            <div className={styles.toolbarSeparator} />
            <a
              className={styles.toolbarButton}
              onClick={this.handleReloadAll}
              title="Reload all elements (⌘R)"
            >
              <Icon name="refresh-solid" width={14} height={14} />
              <span>Reload</span>
            </a>
            <div className={styles.toolbarSeparator} />
            <div className={styles.autoReloadWrapper}>
              <span className={styles.autoReloadLabel}>Auto-reload:</span>
              <select
                className={styles.autoReloadSelect}
                value={autoReloadInterval}
                onChange={(e) => this.handleAutoReloadChange(e.target.value)}
              >
                <option value="0">Off</option>
                <option value="5">5s</option>
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">1m</option>
                <option value="300">5m</option>
              </select>
              {autoReloadInterval > 0 && (
                <div className={styles.autoReloadProgressWrapper}>
                  <div
                    className={styles.autoReloadProgress}
                    style={{ width: `${autoReloadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </>
        )}
        {hasElements && (
          <>
            <div className={styles.toolbarSeparator} />
            <a
              className={styles.toolbarButton}
              onClick={this.toggleFullscreen}
            >
              <Icon name="laptop-outline" width={14} height={14} />
              <span>Fullscreen</span>
            </a>
          </>
        )}
      </Toolbar>
    );
  }

  renderExtras() {
    const {
      showAddDialog,
      showStaticTextDialog,
      showGraphDialog,
      showDataTableDialog,
      showViewDialog,
      showSaveDialog,
      editingElement,
      availableGraphs,
      availableFilters,
      availableViews,
      classes,
      classSchemas,
      savedCanvases,
      currentCanvasName,
      currentCanvasGroup,
    } = this.state;

    // Extract unique group names from saved canvases
    const existingGroups = [...new Set(
      savedCanvases
        .map(c => c.group)
        .filter(g => g != null && g !== '')
    )];

    return (
      <>
        {showAddDialog && (
          <AddElementDialog
            onClose={() => this.setState({ showAddDialog: false })}
            onSelectType={this.handleAddElement}
          />
        )}
        {showStaticTextDialog && (
          <StaticTextConfigDialog
            initialConfig={editingElement?.config}
            onClose={() => this.setState({ showStaticTextDialog: false, editingElement: null })}
            onSave={this.handleSaveStaticText}
          />
        )}
        {showGraphDialog && (
          <GraphConfigDialog
            initialConfig={editingElement?.config}
            availableGraphs={availableGraphs}
            availableFilters={availableFilters}
            classes={classes}
            onClose={() => this.setState({ showGraphDialog: false, editingElement: null })}
            onSave={this.handleSaveGraph}
          />
        )}
        {showDataTableDialog && (
          <DataTableConfigDialog
            initialConfig={editingElement?.config}
            availableFilters={availableFilters}
            classes={classes}
            classSchemas={classSchemas}
            onClose={() => this.setState({ showDataTableDialog: false, editingElement: null })}
            onSave={this.handleSaveDataTable}
          />
        )}
        {showViewDialog && (
          <ViewConfigDialog
            initialConfig={editingElement?.config}
            availableViews={availableViews}
            onClose={() => this.setState({ showViewDialog: false, editingElement: null })}
            onSave={this.handleSaveView}
          />
        )}
        {showSaveDialog && (
          <SaveCanvasDialog
            currentName={currentCanvasName}
            currentGroup={currentCanvasGroup}
            existingGroups={existingGroups}
            onClose={() => this.setState({ showSaveDialog: false })}
            onSave={this.handleSaveCanvas}
          />
        )}
      </>
    );
  }
}

export default CustomDashboard;
