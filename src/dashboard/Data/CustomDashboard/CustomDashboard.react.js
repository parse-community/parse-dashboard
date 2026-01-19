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
import CanvasElement from './CanvasElement.react';
import AddElementDialog from './AddElementDialog.react';
import SaveCanvasDialog from './SaveCanvasDialog.react';
import LoadCanvasDialog from './LoadCanvasDialog.react';
import StaticTextElement from './elements/StaticTextElement.react';
import StaticTextConfigDialog from './elements/StaticTextConfigDialog.react';
import GraphElement from './elements/GraphElement.react';
import GraphConfigDialog from './elements/GraphConfigDialog.react';
import DataTableElement from './elements/DataTableElement.react';
import DataTableConfigDialog from './elements/DataTableConfigDialog.react';
import GraphPreferencesManager from 'lib/GraphPreferencesManager';
import FilterPreferencesManager from 'lib/FilterPreferencesManager';
import CanvasPreferencesManager from 'lib/CanvasPreferencesManager';
import { CurrentApp } from 'context/currentApp';
import subscribeTo from 'lib/subscribeTo';
import { withRouter } from 'lib/withRouter';
import { ActionTypes } from 'lib/stores/SchemaStore';
import generatePath from 'lib/generatePath';
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
      showSaveDialog: false,
      showLoadDialog: false,
      editingElement: null,
      availableGraphs: {},
      availableFilters: {},
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
    };
    this.autoReloadTimer = null;
    this.autoReloadProgressTimer = null;
    this.autoReloadStartTime = null;
    this.canvasPreferencesManager = null;
    this._isMounted = false;
    this._elementSeq = {};
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
      // Fetch data for all graph and data table elements
      canvas.elements?.forEach(element => {
        if (element.type === 'graph' || element.type === 'dataTable') {
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
                  this.applyFilterToQuery(query, condition);
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
      const data = results.map(obj => obj.toJSON());

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

  applyFilterToQuery(query, filter) {
    const { field, constraint, compareTo } = filter;
    if (!field || !constraint) {
      return;
    }

    switch (constraint) {
      case 'exists':
        query.exists(field);
        break;
      case 'dne':
        query.doesNotExist(field);
        break;
      case 'eq':
        query.equalTo(field, compareTo);
        break;
      case 'neq':
        query.notEqualTo(field, compareTo);
        break;
      case 'lt':
        query.lessThan(field, compareTo);
        break;
      case 'lte':
        query.lessThanOrEqualTo(field, compareTo);
        break;
      case 'gt':
        query.greaterThan(field, compareTo);
        break;
      case 'gte':
        query.greaterThanOrEqualTo(field, compareTo);
        break;
      case 'starts':
        query.startsWith(field, compareTo);
        break;
      case 'ends':
        query.endsWith(field, compareTo);
        break;
      case 'before':
        query.lessThan(field, new Date(compareTo));
        break;
      case 'after':
        query.greaterThan(field, new Date(compareTo));
        break;
      case 'containsString':
        query.contains(field, compareTo);
        break;
      case 'containsAny':
        query.containedIn(field, compareTo);
        break;
    }
  }

  handleSelectElement = (id) => {
    this.setState({ selectedElement: id });
  };

  handleDeselectElement = (e) => {
    if (e.target === e.currentTarget) {
      this.setState({ selectedElement: null });
    }
  };

  handlePositionChange = (id, x, y) => {
    this.setState(state => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, x, y } : el
      ),
    }), this.markUnsavedChanges);
  };

  handleSizeChange = (id, width, height, x, y) => {
    this.setState(state => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, width, height, x, y } : el
      ),
    }), this.markUnsavedChanges);
  };

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
    }
  };

  handleRefreshElement = (id) => {
    this.fetchElementData(id);
  };

  handleReloadAll = () => {
    const { elements } = this.state;
    elements.forEach(element => {
      if (element.type === 'graph' || element.type === 'dataTable') {
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
      showLoadDialog: false,
    }, () => {
      // Update URL to include canvas ID
      this.navigateToCanvas(canvas.id);

      // Fetch data for all graph and data table elements
      canvas.elements?.forEach(element => {
        if (element.type === 'graph' || element.type === 'dataTable') {
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

    return (
      <div className={wrapperClasses.join(' ')}>
        <div
          className={styles.canvas}
          onClick={this.handleDeselectElement}
          tabIndex={0}
        >
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
                onPositionChange={this.handlePositionChange}
                onSizeChange={this.handleSizeChange}
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
      hasUnsavedChanges,
      elements,
    } = this.state;

    const hasDataElements = elements.some(
      el => el.type === 'graph' || el.type === 'dataTable'
    );

    const hasElements = elements.length > 0;

    // Build subsection with canvas name and unsaved indicator
    let subsection = currentCanvasName || '';
    if (hasUnsavedChanges && subsection) {
      subsection += ' *';
    } else if (hasUnsavedChanges && hasElements) {
      subsection = 'Unsaved *';
    }

    return (
      <Toolbar section="Canvas" subsection={subsection}>
        <a
          className={styles.toolbarButton}
          onClick={this.handleNewCanvas}
        >
          <Icon name="files-outline" width={14} height={14} />
          <span>New</span>
        </a>
        <div className={styles.toolbarSeparator} />
        <a
          className={styles.toolbarButton}
          onClick={() => this.setState({ showLoadDialog: true })}
        >
          <Icon name="folder-outline" width={14} height={14} />
          <span>Load</span>
        </a>
        {hasElements && (
          <>
            <div className={styles.toolbarSeparator} />
            <a
              className={styles.toolbarButton}
              onClick={() => this.setState({ showSaveDialog: true })}
            >
              <Icon name="download" width={14} height={14} />
              <span>Save</span>
            </a>
          </>
        )}
        <div className={styles.toolbarSeparator} />
        <a
          className={styles.toolbarButton}
          onClick={() => this.setState({ showAddDialog: true })}
        >
          <Icon name="plus-outline" width={14} height={14} />
          <span>Add Element</span>
        </a>
        {selectedElement && (
          <>
            <div className={styles.toolbarSeparator} />
            <a
              className={styles.toolbarButton}
              onClick={this.handleEditElement}
            >
              <Icon name="edit-solid" width={14} height={14} />
              <span>Edit</span>
            </a>
            <div className={styles.toolbarSeparator} />
            <a
              className={styles.toolbarButton}
              onClick={() => this.handleDeleteElement(selectedElement)}
            >
              <Icon name="trash-solid" width={14} height={14} />
              <span>Delete</span>
            </a>
          </>
        )}
        {hasDataElements && (
          <>
            <div className={styles.toolbarSeparator} />
            <a
              className={styles.toolbarButton}
              onClick={this.handleReloadAll}
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
      showSaveDialog,
      showLoadDialog,
      editingElement,
      availableGraphs,
      availableFilters,
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
        {showSaveDialog && (
          <SaveCanvasDialog
            currentName={currentCanvasName}
            currentGroup={currentCanvasGroup}
            existingGroups={existingGroups}
            onClose={() => this.setState({ showSaveDialog: false })}
            onSave={this.handleSaveCanvas}
          />
        )}
        {showLoadDialog && (
          <LoadCanvasDialog
            canvases={savedCanvases}
            onClose={() => this.setState({ showLoadDialog: false })}
            onLoad={this.handleLoadCanvas}
            onDelete={this.handleDeleteCanvas}
          />
        )}
      </>
    );
  }
}

export default CustomDashboard;
