/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import BrowserCell            from 'components/BrowserCell/BrowserCell.react';
import * as browserUtils      from 'lib/browserUtils';
import DataBrowserHeaderBar   from 'components/DataBrowserHeaderBar/DataBrowserHeaderBar.react';
import Editor                 from 'dashboard/Data/Browser/Editor.react';
import EmptyState             from 'components/EmptyState/EmptyState.react';
import Icon                   from 'components/Icon/Icon.react';
import Parse                  from 'parse';
import React                  from 'react';
import styles                 from 'dashboard/Data/Browser/Browser.scss';
import Button                 from 'components/Button/Button.react';

const MAX_ROWS = 60; // Number of rows to render at any time
const ROW_HEIGHT = 31;

const READ_ONLY = [ 'objectId', 'createdAt', 'updatedAt' ];

let scrolling = false;

export default class BrowserTable extends React.Component {
  constructor() {
    super();

    this.state = {
      offset: 0,
    };
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.className !== this.props.className) {
      this.setState({
        offset: 0,
      });
      this.refs.table.scrollTop = 0;
    } else if (this.props.newObject !== props.newObject) {
      this.setState({ offset: 0 });
      this.refs.table.scrollTop = 0;
    } else if (this.props.ordering !== props.ordering) {
      this.setState({ offset: 0 });
      this.refs.table.scrollTop = 0;
    }
  }

  componentDidMount() {
    this.refs.table.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    this.refs.table.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    if (scrolling) {
      return;
    }
    if (!this.props.data || this.props.data.length === 0) {
      return;
    }
    requestAnimationFrame(() => {
      let rowsAbove = Math.floor(this.refs.table.scrollTop / ROW_HEIGHT);
      let offset = this.state.offset;
      if (rowsAbove - this.state.offset > 20) {
        offset = Math.floor(rowsAbove / 10) * 10 - 10;
      } else if (rowsAbove - this.state.offset < 10) {
        offset = Math.max(0, Math.floor(rowsAbove / 10) * 10 - 30);
      }
      if (this.state.offset !== offset) {
        this.setState({ offset });
        this.refs.table.scrollTop = rowsAbove * ROW_HEIGHT;
      }
      if (this.props.maxFetched - offset < 100) {
        this.props.fetchNextPage();
      }
    });
  }

  renderRow({ row, obj, rowWidth }) {
    let attributes = obj.attributes;
    let index = row - this.state.offset;
    return (
      <div key={`row${index}`} className={styles.tableRow} style={{ minWidth: rowWidth }}>
        <span className={styles.checkCell}>
          <input
            type='checkbox'
            checked={this.props.selection['*'] || this.props.selection[obj.id]}
            onChange={(e) => this.props.selectRow(obj.id, e.target.checked)} />
        </span>
        {this.props.order.map(({ name, width }, j) => {
          let type = this.props.columns[name].type;
          let attr = attributes[name];
          if (name === 'objectId') {
            attr = obj.id;
          } else if (name === 'ACL' && this.props.className === '_User' && !attr) {
            attr = new Parse.ACL({ '*': { read: true }, [obj.id]: { read: true, write: true }});
          } else if (type === 'Relation' && !attr && obj.id) {
            attr = new Parse.Relation(obj, name);
            attr.targetClassName = this.props.columns[name].targetClass;
          }
          let current = this.props.current && this.props.current.row === row && this.props.current.col === j;
          let hidden = false;
          if (name === 'password' && this.props.className === '_User') {
            hidden = true;
          } else if (name === 'sessionToken') {
            if (this.props.className === '_User' || this.props.className === '_Session') {
              hidden = true;
            }
          }
          return (
            <BrowserCell
              key={name}
              type={type}
              readonly={READ_ONLY.indexOf(name) > -1}
              width={width}
              current={current}
              onSelect={() => this.props.setCurrent({ row: row, col: j })}
              onEditChange={(state) => this.props.setEditing(state)}
              onPointerClick={this.props.onPointerClick}
              setRelation={this.props.setRelation}
              value={attr}
              hidden={hidden} />
          );
        })}
      </div>
    );
  }

  render() {
    let ordering = {};
    if (this.props.ordering) {
      if (this.props.ordering[0] === '-') {
        ordering = { col: this.props.ordering.substr(1), direction: 'descending' };
      } else {
        ordering = { col: this.props.ordering, direction: 'ascending' };
      }
    }

    let headers = this.props.order.map(({ name, width }) => (
      {
        width: width,
        name: name,
        type: this.props.columns[name].type,
        targetClass: this.props.columns[name].targetClass,
        order: ordering.col === name ? ordering.direction : null
      }
    ));
    let editor = null;
    let table = <div ref='table' />;
    if (this.props.data) {
      let rowWidth = 210;
      for (let i = 0; i < this.props.order.length; i++) {
        rowWidth += this.props.order[i].width;
      }
      let newRow = null;
      if (this.props.newObject && this.state.offset <= 0) {
        newRow = (
          <div style={{ marginBottom: 30, borderBottom: '1px solid #169CEE' }}>
            {this.renderRow({ row: -1, obj: this.props.newObject, rowWidth: rowWidth })}
          </div>
        );
      }
      let rows = [];
      let end = Math.min(this.state.offset + MAX_ROWS, this.props.data.length);
      for (let i = this.state.offset; i < end; i++) {
        let index = i - this.state.offset;
        let obj = this.props.data[i];
        rows[index] = this.renderRow({ row: i, obj: obj, rowWidth: rowWidth });
      }

      if (this.props.editing) {
        let visible = false;
        if (this.props.current) {
          if (this.props.current.row < 0 && this.state.offset === 0) {
            visible = true;
          } else if (this.props.current.row >= this.state.offset && this.props.current.row < end) {
            visible = true;
          }
        }
        if (visible) {
          let { name, width } = this.props.order[this.props.current.col];
          let { type, targetClass } = this.props.columns[name];
          let readonly = READ_ONLY.indexOf(name) > -1;
          if (name === 'sessionToken') {
            if (this.props.className === '_User' || this.props.className === '_Session') {
              readonly = true;
            }
          }
          let obj = this.props.current.row < 0 ? this.props.newObject : this.props.data[this.props.current.row];
          let value = obj.get(name);
          if (name === 'objectId') {
            value = obj.id;
          } else if (name === 'ACL' && this.props.className === '_User' && !value) {
            value = new Parse.ACL({ '*': { read: true }, [obj.id]: { read: true, write: true }});
          } else if (name === 'password' && this.props.className === '_User') {
            value = '';
          } else if (type === 'Array') {
            if (value) {
              value = value.map(val => {
                  if (val instanceof Parse.Object) {
                      return val.toPointer();
                  } else if (typeof val.getMonth === 'function') {
                      return { __type: "Date", iso: val.toISOString() };
                  }

                  return val;
              });
            }
          }
          let wrapTop = Math.max(0, this.props.current.row * ROW_HEIGHT);
          if (this.props.current.row > -1 && this.props.newObject) {
            wrapTop += 60;
          }
          let wrapLeft = 30;
          for (let i = 0; i < this.props.current.col; i++) {
            wrapLeft += this.props.order[i].width;
          }

          editor = (
            <Editor
              top={wrapTop}
              left={wrapLeft}
              type={type}
              targetClass={targetClass}
              value={value}
              readonly={readonly}
              width={width}
              onCommit={(newValue) => {
                if (newValue !== value) {
                  this.props.updateRow(
                    this.props.current.row,
                    name,
                    newValue
                  );
                }
                this.props.setEditing(false);
              }} />
          );
        }
      }

      let addRow = null;
      if (!this.props.newObject) {
        if (this.props.relation) {
          addRow = (
            <div className={styles.addRow}>
              <Button
                onClick={this.props.onAddRow}
                primary
                value={`Create a ${this.props.relation.targetClassName} and attach`}
              />
              {' '}
              <Button
                onClick={this.props.onAttachRows}
                primary
                value={`Attach existing rows from ${this.props.relation.targetClassName}`}
              />
            </div>
          );
        } else {
          addRow = (
            <div className={styles.addRow}>
              <a title='Add Row' onClick={this.props.onAddRow}>
                <Icon
                  name='plus-outline'
                  width={14}
                  height={14}
                />
              </a>
            </div>
          );
        }
      }

      if (this.props.newObject || this.props.data.length > 0) {
        table = (
          <div className={styles.table} ref='table'>
            <div style={{ height: Math.max(0, this.state.offset * ROW_HEIGHT) }} />
            {newRow}
            {rows}
            <div style={{ height: Math.max(0, (this.props.data.length - this.state.offset - MAX_ROWS) * ROW_HEIGHT) }} />
            {addRow}
            {editor}
          </div>
        );
      } else {
        table = (
          <div className={styles.table} ref='table'>
            <div className={styles.empty}>
              {this.props.relation ?
                <EmptyState
                  title='No data to display'
                  description='This relation has no rows. Attach existing rows or create row.'
                  cta={`Create ${this.props.relation.targetClassName} and attach`}
                  action={this.props.onAddRow}
                  secondaryCta={`Attach existing rows from ${this.props.relation.targetClassName}`}
                  secondaryAction={this.props.onAttachRows}
                  icon='files-solid' /> :
                <EmptyState
                  title='No data to display'
                  description='Add a row to store an object in this class.'
                  icon='files-solid'
                  cta='Add a row'
                  action={this.props.onAddRow} />
              }
            </div>
          </div>
        );
      }
    }

    return (
      <div className={[styles.browser, browserUtils.isSafari() ? styles.safari : ''].join(' ')}>
        {table}
        <DataBrowserHeaderBar
          selected={this.props.selection['*']}
          selectAll={this.props.selectRow.bind(null, '*')}
          headers={headers}
          updateOrdering={this.props.updateOrdering}
          readonly={!!this.props.relation}
          handleDragDrop={this.props.handleHeaderDragDrop}
          onResize={this.props.handleResize}
          onAddColumn={this.props.onAddColumn} />
      </div>
    );
  }
}
