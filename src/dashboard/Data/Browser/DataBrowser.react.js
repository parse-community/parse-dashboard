/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import BrowserTable           from 'dashboard/Data/Browser/BrowserTable.react';
import B4ABrowserToolbar      from 'dashboard/Data/Browser/B4ABrowserToolbar.react';
import * as ColumnPreferences from 'lib/ColumnPreferences';
import ParseApp               from 'lib/ParseApp';
import React                  from 'react';
import PropTypes              from 'lib/PropTypes';
import { SpecialClasses }     from 'lib/Constants';
import copy                   from 'copy-to-clipboard';

/**
 * DataBrowser renders the browser toolbar and data table
 * It also manages the fetching / updating of column size prefs,
 * and the keyboard interactions for the data table.
 */

const READ_ONLY = [ 'objectId', 'createdAt', 'updatedAt', 'sessionToken' ];

export default class DataBrowser extends React.Component {
  constructor(props, context) {
    super(props, context);

    let order = ColumnPreferences.getOrder(
      props.columns,
      context.currentApp.applicationId,
      props.className
    );

    this.state = {
      order: order,
      current: null,
      editing: false,
      currentTooltip: null,
      numberOfColumns: 0
    };

    this.handleKey = this.handleKey.bind(this);

    this.saveOrderTimeout = null;
  }

  componentWillReceiveProps(props, context) {
    if (props.className !== this.props.className) {
      let order = ColumnPreferences.getOrder(
        props.columns,
        context.currentApp.applicationId,
        props.className
      );
      this.setState({
        order: order,
        current: null,
        editing: false,
        currentTooltip: null
      });
    } else if (Object.keys(props.columns).length !== Object.keys(this.props.columns).length) {
      let order = ColumnPreferences.getOrder(
        props.columns,
        context.currentApp.applicationId,
        props.className
      );
      this.setState({ order });
    }
    if (this.props.columns)
      this.setState({ numberOfColumns: Object.keys(this.props.columns).length })
  }

  componentDidMount() {
    document.body.addEventListener('keydown', this.handleKey);
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKey);
  }

  updatePreferences(order) {
    if (this.saveOrderTimeout) {
      clearTimeout(this.saveOrderTimeout);
    }
    let appId = this.context.currentApp.applicationId;
    let className = this.props.className;
    this.saveOrderTimeout = setTimeout(() => {
      ColumnPreferences.updatePreferences(order, appId, className)
    }, 1000);
  }

  handleResize(index, delta) {
    this.setState(({ order }) => {
      order[index].width = Math.max(60, order[index].width + delta);
      this.updatePreferences(order);
      return { order };
    });
  }

  setTooltip(ref) {
    this.setState({ currentTooltip: ref })
  }

  unsetTooltip() {
    setTimeout(() => this.setState({ currentTooltip: null }), 2000)
  }

  /**
   * drag and drop callback when header is dropped into valid location
   * @param  {Number} dragIndex  - index of  headerbar moved from
   * @param  {Number} hoverIndex - index of headerbar moved to left of
   */
  handleHeaderDragDrop(dragIndex, hoverIndex) {
    let newOrder = this.state.order;
    let movedIndex = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, movedIndex[0]);
    this.setState({ order: newOrder }, () => {
      this.updatePreferences(newOrder);
    });
  }

  handleKey(e) {
    let row, col, colName
    if (this.props.disableKeyControls) {
      return;
    }
    if (this.props.newObject) { // creating new row
      if (e.keyCode === 27) { // ESC
        this.props.onAbortAddRow();
        e.preventDefault();
      }
    }
    if (this.state.editing) {
      switch (e.keyCode) {
        case 27: // ESC
          this.setState({
            editing: false
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
    switch (e.keyCode) {
      case 8:
      case 46:
        // Backspace or Delete
        colName = this.state.order[this.state.current.col].name;
        col = this.props.columns[colName];
        if (col.type !== 'Relation') {
          this.props.updateRow(
            this.state.current.row,
            colName,
            undefined
          );
        }
        e.preventDefault();
        break;
      case 37: // Left
        row = this.state.current.row
        col = Math.max(this.state.current.col - 1, 0)
        colName = this.state.order[col].name;
        this.setState({
          current: {
            row,
            col,
            readonly: READ_ONLY.indexOf(colName) > -1,
            id: `cell-${row * this.state.numberOfColumns + col}`
          }
        });
        e.preventDefault();
        break;
      case 38: // Up
        row = Math.max(this.state.current.row - 1, 0)
        col = this.state.current.col
        colName = this.state.order[col].name;
        this.setState({
          current: {
            row,
            col,
            readonly: READ_ONLY.indexOf(colName) > -1,
            id: `cell-${row * this.state.numberOfColumns + col}`
          }
        });
        e.preventDefault();
        break;
      case 39: // Right
        row = this.state.current.row
        col = Math.min(this.state.current.col + 1, this.state.order.length - 1)
        colName = this.state.order[col].name;
        this.setState({
          current: {
            row,
            col,
            readonly: READ_ONLY.indexOf(colName) > -1,
            id: `cell-${row * this.state.numberOfColumns + col}`
          }
        });
        e.preventDefault();
        break;
      case 40: // Down
        row = Math.min(this.state.current.row + 1, this.props.data.length - 1)
        col = this.state.current.col
        colName = this.state.order[col].name;
        this.setState({
          current: {
            row,
            col,
            readonly: READ_ONLY.indexOf(colName) > -1,
            id: `cell-${row * this.state.numberOfColumns + col}`
          }
        });
        e.preventDefault();
        break;
      case 67: // c key
        if (e.ctrlKey || e.metaKey) {
          copy(this.state.currentValue) // copy current value to clipboard
          this.props.showNote('Value copied to clipboard', false)
          e.preventDefault()
        }
        break;
      case 13: // Enter
        if (!this.state.current.readonly) {
          this.setState({ editing: true });
        } else {
          this.setTooltip(this.state.current.id)
        }
        e.preventDefault();
        break;
    }
  }

  setEditing(editing) {
    if (this.state.editing !== editing) {
      this.setState({ editing: editing });
    }
  }

  setCurrent(current, currentValue) {
    if (this.state.current !== current) {
      this.setState({ current, currentValue });
    }
  }

  render() {
    let { className, ...other } = this.props;
    let { applicationId, preventSchemaEdits } = this.context.currentApp;
    return (
      <div>
        <BrowserTable
          order={this.state.order}
          current={this.state.current}
          editing={this.state.editing}
          className={className}
          handleHeaderDragDrop={this.handleHeaderDragDrop.bind(this)}
          handleResize={this.handleResize.bind(this)}
          setEditing={this.setEditing.bind(this)}
          setCurrent={this.setCurrent.bind(this)}
          currentTooltip={this.state.currentTooltip}
          unsetTooltip={this.unsetTooltip.bind(this)}
          numberOfColumns={this.state.numberOfColumns}
          {...other} />
        <B4ABrowserToolbar
          hidePerms={className === '_Installation'}
          className={SpecialClasses[className] || className}
          classNameForPermissionsEditor={className}
          setCurrent={this.setCurrent.bind(this)}
          enableDeleteAllRows={this.context.currentApp.serverInfo.features.schemas.clearAllDataFromClass && !preventSchemaEdits}
          enableExportClass={this.context.currentApp.serverInfo.features.schemas.exportClass && !preventSchemaEdits}
          enableImport={this.context.currentApp.serverInfo.features.schemas.import}
          enableSecurityDialog={this.context.currentApp.serverInfo.features.schemas.editClassLevelPermissions && !preventSchemaEdits}
          enableColumnManipulation={!preventSchemaEdits}
          enableClassManipulation={!preventSchemaEdits}
          {...other}
          applicationId={applicationId} />
      </div>
    );
  }
}

DataBrowser.contextTypes = {
  currentApp: PropTypes.instanceOf(ParseApp)
};
