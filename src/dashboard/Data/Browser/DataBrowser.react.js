/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import copy from 'copy-to-clipboard';
import BrowserTable from 'dashboard/Data/Browser/BrowserTable.react';
import BrowserToolbar from 'dashboard/Data/Browser/BrowserToolbar.react';
import ContextMenu from 'components/ContextMenu/ContextMenu.react';
import * as ColumnPreferences from 'lib/ColumnPreferences';
import React from 'react';
import { ResizableBox } from 'react-resizable';
import styles from '../Browser/Browser.scss'

import AggregationPanel from '../../../components/AggregationPanel/AggregationPanel';


/**
 * DataBrowser renders the browser toolbar and data table
 * It also manages the fetching / updating of column size prefs,
 * and the keyboard interactions for the data table.
 */
export default class DataBrowser extends React.Component {
  constructor(props) {
    super(props);

    const columnPreferences = props.app.columnPreference || {};
    const order = ColumnPreferences.getOrder(
      props.columns,
      props.app.applicationId,
      props.className,
      columnPreferences[props.className]
    );
    this.state = {
      order: order,
      current: null,
      editing: false,
      copyableValue: undefined,
      selectedObjectId: undefined,
      simplifiedSchema: this.getSimplifiedSchema(props.schema, props.className),
      allClassesSchema: this.getAllClassesSchema(props.schema, props.classes),
      isPanelVisible: false,
      selectedCells: { list: new Set(), rowStart: -1, rowEnd: -1, colStart: -1, colEnd: -1 },
      firstSelectedCell: null,
      selectedData: [],
      prevClassName: props.className,
      panelWidth: 400,
      isResizing: false,
      maxWidth: window.innerWidth - 300,
    };

    this.handleResizeDiv = this.handleResizeDiv.bind(this);
    this.handleResizeStart = this.handleResizeStart.bind(this);
    this.handleResizeStop = this.handleResizeStop.bind(this);
    this.updateMaxWidth = this.updateMaxWidth.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.handleHeaderDragDrop = this.handleHeaderDragDrop.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.togglePanelVisibility = this.togglePanelVisibility.bind(this);
    this.setCurrent = this.setCurrent.bind(this);
    this.setEditing = this.setEditing.bind(this);
    this.handleColumnsOrder = this.handleColumnsOrder.bind(this);
    this.setCopyableValue = this.setCopyableValue.bind(this);
    this.setSelectedObjectId = this.setSelectedObjectId.bind(this);
    this.setContextMenu = this.setContextMenu.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
    this.saveOrderTimeout = null;
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
        editing: false,
        simplifiedSchema: this.getSimplifiedSchema(props.schema, props.className),
        allClassesSchema: this.getAllClassesSchema(props.schema, props.classes),
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
      this.setState({ order });
    }
    this.setState({
      selectedCells: { list: new Set(), rowStart: -1, rowEnd: -1, colStart: -1, colEnd: -1 },
      firstSelectedCell: null,
      selectedData: [],
    });
    if (props && props.className) {
      if (!props.classwiseCloudFunctions[props.className]) {
        this.setState({ isPanelVisible: false });
        this.setState({ selectedObjectId: undefined });
      }
    } else {
      this.setState({ isPanelVisible: false });
      this.setState({ selectedObjectId: undefined });
    }

    this.checkClassNameChange(this.state.prevClassName, props.className);
  }

  componentDidMount() {
    document.body.addEventListener('keydown', this.handleKey);
    window.addEventListener('resize', this.updateMaxWidth);
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKey);
    window.removeEventListener('resize', this.updateMaxWidth);
  }

  handleResizeStart() {
    this.setState({ isResizing: true });
  }

  handleResizeStop(event, { size }) {
    this.setState({
      isResizing: false,
      panelWidth: size.width,
    });
  }

  handleResizeDiv(event, { size }) {
    this.setState({ panelWidth: size.width });
  }

  updateMaxWidth = () => {
    this.setState({ maxWidth: window.innerWidth - 300 });
    if (this.state.panelWidth > window.innerWidth - 300) {
      this.setState({ panelWidth: window.innerWidth - 300 });
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

  togglePanelVisibility() {
    this.setState(prevState => ({ isPanelVisible: !prevState.isPanelVisible }));

    if (!this.state.isPanelVisible) {
      this.props.setAggregationPanelData({});
    }
    console.log(this.state.selectedObjectId, this.props.className ,this.state.isPanelVisible)

    if(!this.state.isPanelVisible && this.state.selectedObjectId){
      this.props.callCloudFunction(this.state.selectedObjectId, this.props.className);
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
      this.setState({
        prevClassName: className,
        isPanelVisible: false,
        selectedObjectId: undefined,
      });
      this.props.setAggregationPanelData({});
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
      case 46:
        // Backspace or Delete
        const colName = this.state.order[this.state.current.col].name;
        const col = this.props.columns[colName];
        if (col.type !== 'Relation') {
          this.props.updateRow(this.state.current.row, colName, undefined);
        }
        e.preventDefault();
        break;
      case 37:
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
      case 38:
        // Up - standalone (move to the previous row)
        // or with ctrl/meta (excel style - move to the first row)
        this.setState({
          current: {
            row: e.ctrlKey || e.metaKey ? 0 : Math.max(this.state.current.row - 1, 0),
            col: this.state.current.col,
          },
        });
        e.preventDefault();
        break;
      case 39:
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
      case 40:
        // Down - standalone (move to the next row)
        // or with ctrl/meta (excel style - move to the last row)
        this.setState({
          current: {
            row:
              e.ctrlKey || e.metaKey
                ? this.props.data.length - 1
                : Math.min(this.state.current.row + 1, this.props.data.length - 1),
            col: this.state.current.col,
          },
        });
        e.preventDefault();
        break;
      case 67: // C
        if ((e.ctrlKey || e.metaKey) && this.state.copyableValue !== undefined) {
          copy(this.state.copyableValue); // Copies current cell value to clipboard
          if (this.props.showNote) {
            this.props.showNote('Value copied to clipboard', false);
          }
          e.preventDefault();
        }
        break;
    }
  }

  getNextVisibleColumnIndex(distance = 1, min = 0, max = 0) {
    if (distance === 0) {
      return this.state.current.col;
    }
    let newIndex = this.state.current.col + distance;
    // eslint-disable-next-line no-constant-condition
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
      this.setState({ selectedObjectId });
    }
  }

  setContextMenu(contextMenuX, contextMenuY, contextMenuItems) {
    this.setState({ contextMenuX, contextMenuY, contextMenuItems });
  }

  handleColumnsOrder(order, shouldReload) {
    this.setState({ order: [...order] }, () => {
      this.updatePreferences(order, shouldReload);
    });
  }

  handleCellClick(event, row, col) {
    const { firstSelectedCell } = this.state;
    const clickedCellKey = `${row}-${col}`;

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
        this.setState({
          selectedCells: {
            list: newSelection,
            rowStart,
            rowEnd,
            colStart,
            colEnd,
          },
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
            callCloudFunction={this.props.callCloudFunction}
            setContextMenu={this.setContextMenu}
            onFilterChange={this.props.onFilterChange}
            onFilterSave={this.props.onFilterSave}
            selectedCells={this.state.selectedCells}
            handleCellClick={this.handleCellClick}
            isPanelVisible={this.state.isPanelVisible}
            panelWidth={this.state.panelWidth}
            isResizing={this.state.isResizing}
            {...other}
          />
          {this.state.isPanelVisible && (
            <ResizableBox
              width={this.state.panelWidth}
              height={Infinity}
              minConstraints={[400, Infinity]}
              maxConstraints={[this.state.maxWidth, Infinity]}
              onResizeStart={this.handleResizeStart}  // Handle start of resizing
              onResizeStop={this.handleResizeStop}    // Handle end of resizing
              onResize={this.handleResizeDiv}
              resizeHandles={['w']}
              className={styles.resizablePanel}
              style={
                {

                  position: 'fixed',
                  top: '96px',
                  right: '0',
                  bottom: '0px',
                  // 'box-shadow': '0 2px 5px rgba(0, 0, 0, 0.1)',
                  // backgroundColor: 'rgb(244, 244, 244)',
                  // zIndex: 100,
                }
              }
            >
              <div style={{
                height: '100%',
                overflow: 'auto'
              }} >
                <AggregationPanel data={this.props.AggregationPanelData} />
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
          {...other}
        />

        {this.state.contextMenuX && (
          <ContextMenu
            x={this.state.contextMenuX}
            y={this.state.contextMenuY}
            items={this.state.contextMenuItems}
          />
        )}
      </div>
    );
  }
}
