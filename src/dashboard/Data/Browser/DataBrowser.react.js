/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import BrowserTable           from 'dashboard/Data/Browser/BrowserTable.react';
import BrowserToolbar         from 'dashboard/Data/Browser/BrowserToolbar.react';
import * as ColumnPreferences from 'lib/ColumnPreferences';
import ParseApp               from 'lib/ParseApp';
import React                  from 'react';
import { SpecialClasses }     from 'lib/Constants';

/**
 * DataBrowser renders the browser toolbar and data table
 * It also manages the fetching / updating of column size prefs,
 * and the keyboard interactions for the data table.
 */
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
      });
    } else if (Object.keys(props.columns).length !== Object.keys(this.props.columns).length) {
      let order = ColumnPreferences.getOrder(
        props.columns,
        context.currentApp.applicationId,
        props.className
      );
      this.setState({ order });
    }
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
    if (this.props.disableKeyControls) {
      return;
    }
    if (this.state.editing) {
      return;
    }
    if (!this.state.current) {
      return;
    }
    switch (e.keyCode) {
      case 8:
      case 46:
        // Backspace or Delete
        let colName = this.state.order[this.state.current.col].name;
        let col = this.props.columns[colName];
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
        this.setState({
          current: {
            row: this.state.current.row,
            col: Math.max(this.state.current.col - 1, 0)
          }
        });
        e.preventDefault();
        break;
      case 38: // Up
        this.setState({
          current: {
            row: Math.max(this.state.current.row - 1, 0),
            col: this.state.current.col
          }
        });
        e.preventDefault();
        break;
      case 39: // Right
        this.setState({
          current: {
            row: this.state.current.row,
            col: Math.min(this.state.current.col + 1, this.state.order.length - 1)
          }
        });
        e.preventDefault();
        break;
      case 40: // Down
        this.setState({
          current: {
            row: Math.min(this.state.current.row + 1, this.props.data.length - 1),
            col: this.state.current.col
          }
        });
        e.preventDefault();
        break;
    }
  }

  setEditing(editing) {
    if (this.state.editing !== editing) {
      this.setState({ editing: editing });
    }
  }

  setCurrent(current) {
    if (this.state.current !== current) {
      this.setState({ current: current });
    }
  }

  render() {
    let { className, ...other } = this.props;
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
          {...other} />
        <BrowserToolbar
          hidePerms={className === '_Installation'}
          className={SpecialClasses[className] || className}
          classNameForPermissionsEditor={className}
          setCurrent={this.setCurrent.bind(this)}
          enableDeleteAllRows={this.context.currentApp.serverInfo.features.schemas.clearAllDataFromClass}
          enableExportClass={this.context.currentApp.serverInfo.features.schemas.exportClass}
          enableSecurityDialog={this.context.currentApp.serverInfo.features.schemas.editClassLevelPermissions}
          {...other}/>
      </div>
    );
  }
}

DataBrowser.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
