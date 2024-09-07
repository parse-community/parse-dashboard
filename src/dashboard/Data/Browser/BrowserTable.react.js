/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import BrowserRow from 'components/BrowserRow/BrowserRow.react';
import DataBrowserHeaderBar from 'components/DataBrowserHeaderBar/DataBrowserHeaderBar.react';
import Editor from 'dashboard/Data/Browser/Editor.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Icon from 'components/Icon/Icon.react';
import Parse from 'parse';
import encode from 'parse/lib/browser/encode';
import React from 'react';
import styles from 'dashboard/Data/Browser/Browser.scss';
import Button from 'components/Button/Button.react';
import { CurrentApp } from 'context/currentApp';

const MAX_ROWS = 200; // Number of rows to render at any time
const LIMIT_DEFAULT = 10; // Number of rows to render at any time
const ROWS_OFFSET = 160;
const ROW_HEIGHT = 30;

const READ_ONLY = ['objectId', 'createdAt', 'updatedAt'];

export default class BrowserTable extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();

    this.state = {
      offset: 0,
      limit: LIMIT_DEFAULT,
      currentPage: 1,
    };
    this.handleScroll = this.handleScroll.bind(this);
    this.tableRef = React.createRef();
  }

  handleItemsPerPageChange = (event) => {
    const itemsPerPage = Number(event.target.value);
    this.setState({
      limit: itemsPerPage,
      currentPage: 1, // Reset to first page if items per page changes
      offset: 0 // Reset the offset when changing items per page
    });
  };

  handlePreviousPage = () => {
    if (this.state.currentPage > 1) {
      this.setState((prevState) => ({
        currentPage: prevState.currentPage - 1,
        offset: (prevState.currentPage - 2) * prevState.limit
      }));
    }
  };

  handleNextPage = () => {
    const totalPages = Math.ceil(this.props.data?.length / this.state.limit);
    if (this.state.currentPage < totalPages) {
      this.setState((prevState) => ({
        currentPage: prevState.currentPage + 1,
        offset: prevState.currentPage * prevState.limit
      }));
    }
  };

  componentWillReceiveProps(props) {
    if (props.className !== this.props.className) {
      this.setState({
        offset: 0,
        limit: LIMIT_DEFAULT,
      });
      this.tableRef.current.scrollTop = 0;
    } else if (this.props.newObject !== props.newObject) {
      this.setState({ offset: 0, limit: LIMIT_DEFAULT, currentPage: 1 });
      this.tableRef.current.scrollTop = 0;
    } else if (this.props.ordering !== props.ordering) {
      this.setState({ offset: 0, limit: LIMIT_DEFAULT, currentPage: 1 });
      this.tableRef.current.scrollTop = 0;
    } else if (this.props.filters.size !== props.filters.size) {
      this.setState({ offset: 0, limit: LIMIT_DEFAULT, currentPage: 1 }, () => {
        this.tableRef.current.scrollTop = 0;
      });
    }
  }

  componentDidMount() {
    this.tableRef.current.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    this.tableRef.current.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    if (!this.props.data || this.props.data.length === 0) {
      return;
    }
    requestAnimationFrame(() => {
      const currentScrollTop = this.tableRef.current.scrollTop;
      let rowsAbove = Math.floor(currentScrollTop / ROW_HEIGHT);
      let offset = this.state.offset;
      const currentRow = rowsAbove - this.state.offset;

      // If the scroll is near the beginning or end of the offset,
      // we need to update the table data with the previous/next offset
      if (currentRow < 10 || currentRow >= ROWS_OFFSET) {
        // Rounds the number of rows above
        rowsAbove = Math.floor(rowsAbove / 10) * 10;

        offset =
          currentRow < 10
            ? Math.max(0, rowsAbove - ROWS_OFFSET) // Previous set of rows
            : rowsAbove - 10; // Next set of rows
      }
      if (this.state.offset !== offset) {
        this.setState({ offset });
        this.tableRef.current.scrollTop = currentScrollTop;
      }
      if (this.props.maxFetched - offset <= ROWS_OFFSET * 1.4) {
        this.props.fetchNextPage();
      }
    });
  }

  render() {
    const { data } = this.props;
    const { currentPage, limit, ROW_HEIGHT } = this.state;
    let ordering = {};

    // Calculate the start and end indices of the data to display
    const startIndex = (currentPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, data?.length);
    const totalPages = Math.ceil(data?.length / limit);

    if (this.props.ordering) {
      if (this.props.ordering[0] === '-') {
        ordering = {
          col: this.props.ordering.substr(1),
          direction: 'descending',
        };
      } else {
        ordering = { col: this.props.ordering, direction: 'ascending' };
      }
    }

    const headers = this.props.order.map(({ name, width, visible, preventSort, required }) => ({
      width: width,
      name: name,
      type: this.props.columns[name].type,
      targetClass: this.props.columns[name].targetClass,
      order: ordering.col === name ? ordering.direction : null,
      visible,
      preventSort,
      required,
    }));
    let editor = null;
    let table = <div ref={this.tableRef} />;
    if (this.props.data) {
      const rowWidth = this.props.order.reduce(
        (rowWidth, { visible, width }) => (visible ? rowWidth + width : rowWidth),
        this.props.onAddRow ? 210 : 0
      );
      let editCloneRows;
      if (this.props.editCloneRows) {
        editCloneRows = (
          <div>
            {this.props.editCloneRows.map((cloneRow, idx) => {
              const index = (this.props.editCloneRows.length + 1) * -1 + idx;
              const currentCol =
                this.props.current && this.props.current.row === index
                  ? this.props.current.col
                  : undefined;
              const isEditingRow =
                this.props.current && this.props.current.row === index && !!this.props.editing;
              return (
                <div key={index} style={{ borderBottom: '1px solid #169CEE' }}>
                  <BrowserRow
                    appId={this.props.appId}
                    key={index}
                    isEditing={isEditingRow}
                    className={this.props.className}
                    columns={this.props.columns}
                    schema={this.props.schema}
                    simplifiedSchema={this.props.simplifiedSchema}
                    filters={this.props.filters}
                    currentCol={currentCol}
                    isUnique={this.props.isUnique}
                    obj={cloneRow}
                    onPointerClick={this.props.onPointerClick}
                    onPointerCmdClick={this.props.onPointerCmdClick}
                    onFilterChange={this.props.onFilterChange}
                    order={this.props.order}
                    readOnlyFields={READ_ONLY}
                    row={index}
                    rowValue={this.props.data[index]}
                    rowWidth={rowWidth}
                    selection={this.props.selection}
                    selectRow={this.props.selectRow}
                    setCurrent={this.props.setCurrent}
                    setEditing={this.props.setEditing}
                    setRelation={this.props.setRelation}
                    setCopyableValue={this.props.setCopyableValue}
                    setContextMenu={this.props.setContextMenu}
                    onEditSelectedRow={this.props.onEditSelectedRow}
                    markRequiredFieldRow={this.props.markRequiredFieldRow}
                    showNote={this.props.showNote}
                    onRefresh={this.props.onRefresh}
                    scripts={this.context.scripts}
                    selectedCells={this.props.selectedCells}
                    handleCellClick={this.props.handleCellClick}
                    onMouseDownRowCheckBox={this.props.onMouseDownRowCheckBox}
                    onMouseUpRowCheckBox={this.props.onMouseUpRowCheckBox}
                    onMouseOverRowCheckBox={this.props.onMouseOverRowCheckBox}
                  />
                  <Button
                    value="Clone"
                    width="55px"
                    primary={true}
                    onClick={() => {
                      this.props.onSaveEditCloneRow(index);
                      this.props.setEditing(false);
                    }}
                    additionalStyles={{
                      fontSize: '12px',
                      height: '20px',
                      lineHeight: '20px',
                      margin: '5px',
                      padding: '0',
                    }}
                  />
                  <Button
                    value="Cancel"
                    width="55px"
                    onClick={() => this.props.onAbortEditCloneRow(index)}
                    additionalStyles={{
                      fontSize: '12px',
                      height: '20px',
                      lineHeight: '20px',
                      margin: '5px',
                      padding: '0',
                    }}
                  />
                </div>
              );
            })}
          </div>
        );
      }
      let newRow;
      if (this.props.newObject && this.state.offset <= 0) {
        const currentCol =
          this.props.current && this.props.current.row === -1 ? this.props.current.col : undefined;
        newRow = (
          <div style={{ borderBottom: '1px solid #169CEE' }}>
            <BrowserRow
              appId={this.props.appId}
              key={-1}
              className={this.props.className}
              columns={this.props.columns}
              currentCol={currentCol}
              isUnique={this.props.isUnique}
              obj={this.props.newObject}
              onPointerClick={this.props.onPointerClick}
              onPointerCmdClick={this.props.onPointerCmdClick}
              onFilterChange={this.props.onFilterChange}
              order={this.props.order}
              readOnlyFields={READ_ONLY}
              row={-1}
              rowWidth={rowWidth}
              selection={this.props.selection}
              selectRow={this.props.selectRow}
              setCurrent={this.props.setCurrent}
              setEditing={this.props.setEditing}
              setRelation={this.props.setRelation}
              setCopyableValue={this.props.setCopyableValue}
              setContextMenu={this.props.setContextMenu}
              onEditSelectedRow={this.props.onEditSelectedRow}
              markRequiredFieldRow={this.props.markRequiredFieldRow}
              showNote={this.props.showNote}
              onRefresh={this.props.onRefresh}
              scripts={this.context.scripts}
              selectedCells={this.props.selectedCells}
              handleCellClick={this.props.handleCellClick}
              onMouseDownRowCheckBox={this.props.onMouseDownRowCheckBox}
              onMouseUpRowCheckBox={this.props.onMouseUpRowCheckBox}
              onMouseOverRowCheckBox={this.props.onMouseOverRowCheckBox}
            />
            <Button
              value="Add"
              width="55px"
              primary={true}
              onClick={() => {
                this.props.onSaveNewRow();
                this.props.setEditing(false);
              }}
              additionalStyles={{
                fontSize: '12px',
                height: '20px',
                lineHeight: '20px',
                margin: '5px',
                marginRight: '0px',
                padding: '0',
              }}
            />
            <Button
              value="Cancel"
              width="55px"
              onClick={this.props.onAbortAddRow}
              additionalStyles={{
                fontSize: '12px',
                height: '20px',
                lineHeight: '20px',
                margin: '5px',
                padding: '0',
              }}
            />
          </div>
        );
      }
      const rows = [];
      for (let i = this.state.offset; i < endIndex; i++) {
        const index = i - this.state.offset;
        const obj = this.props.data[i];
        const currentCol =
          this.props.current && this.props.current.row === i ? this.props.current.col : undefined;

        // Needed in order to force BrowserRow to update and re-render (and possibly update columns values),
        // since the "obj" instance will only be updated when the update request is done.
        const isEditingRow =
          this.props.current && this.props.current.row === i && !!this.props.editing;
        rows[index] = (
          <BrowserRow
            appId={this.props.appId}
            key={index}
            isEditing={isEditingRow}
            className={this.props.className}
            columns={this.props.columns}
            schema={this.props.schema}
            simplifiedSchema={this.props.simplifiedSchema}
            filters={this.props.filters}
            currentCol={currentCol}
            isUnique={this.props.isUnique}
            obj={obj}
            onPointerClick={this.props.onPointerClick}
            onPointerCmdClick={this.props.onPointerCmdClick}
            onFilterChange={this.props.onFilterChange}
            order={this.props.order}
            readOnlyFields={READ_ONLY}
            row={i}
            rowValue={this.props.data[i]}
            rowWidth={rowWidth}
            selection={this.props.selection}
            selectRow={this.props.selectRow}
            setCurrent={this.props.setCurrent}
            setEditing={this.props.setEditing}
            setRelation={this.props.setRelation}
            setCopyableValue={this.props.setCopyableValue}
            setContextMenu={this.props.setContextMenu}
            onEditSelectedRow={this.props.onEditSelectedRow}
            showNote={this.props.showNote}
            onRefresh={this.props.onRefresh}
            scripts={this.context.scripts}
            selectedCells={this.props.selectedCells}
            handleCellClick={this.props.handleCellClick}
            onMouseDownRowCheckBox={this.props.onMouseDownRowCheckBox}
            onMouseUpRowCheckBox={this.props.onMouseUpRowCheckBox}
            onMouseOverRowCheckBox={this.props.onMouseOverRowCheckBox}
          />
        );
      }

      if (this.props.editing) {
        let visible = false;
        if (this.props.current) {
          if (this.props.current.row < 0 && this.state.offset === 0) {
            visible = true;
          } else if (this.props.current.row >= this.state.offset && this.props.current.row < endIndex) {
            visible = true;
          }
        }
        if (visible) {
          const { name, width } = this.props.order[this.props.current.col];
          const { type, targetClass } = this.props.columns[name];
          let readonly = this.props.isUnique || READ_ONLY.indexOf(name) > -1;
          if (name === 'sessionToken') {
            if (this.props.className === '_User' || this.props.className === '_Session') {
              readonly = true;
            }
          }
          if (name === 'expiresAt' && this.props.className === '_Session') {
            readonly = true;
          }
          let obj =
            this.props.current.row < 0
              ? this.props.newObject
              : this.props.data[this.props.current.row];
          let value = obj;
          if (!obj && this.props.current.row < -1) {
            obj =
              this.props.editCloneRows[
              this.props.current.row + this.props.editCloneRows.length + 1
              ];
          }
          if (!this.props.isUnique) {
            if (type === 'Array' || type === 'Object') {
              // This is needed to avoid unwanted conversions of objects to Parse.Objects.
              // "Parse._encoding" is responsible to convert Parse data into raw data.
              // Since array and object are generic types, we want to edit them the way
              // they were stored in the database.
              value = encode(obj.get(name), undefined, true);
            } else {
              value = obj.get(name);
            }
          }
          if (name === 'objectId') {
            if (!this.props.isUnique) {
              value = obj.id;
            }
          } else if (name === 'ACL' && this.props.className === '_User' && !value) {
            value = new Parse.ACL({
              '*': { read: true },
              [obj.id]: { read: true, write: true },
            });
          } else if (name === 'password' && this.props.className === '_User') {
            value = '';
          }
          let wrapTop = Math.max(0, this.props.current.row * ROW_HEIGHT);
          if (this.props.current.row < -1 && this.props.editCloneRows) {
            //for edit clone rows
            wrapTop =
              2 * ROW_HEIGHT * (this.props.current.row + (this.props.editCloneRows.length + 1));
          }
          if (this.props.current.row > -1 && this.props.newObject) {
            //for data rows when there's new row
            wrapTop += 60;
          }
          if (this.props.current.row >= -1 && this.props.editCloneRows) {
            //for data rows & new row when there are edit clone rows
            wrapTop += 2 * ROW_HEIGHT * this.props.editCloneRows.length;
          }
          let wrapLeft = 30;
          for (let i = 0; i < this.props.current.col; i++) {
            const column = this.props.order[i];
            wrapLeft += column.visible ? column.width : 0;
          }
          if (!this.props.isUnique) {
            editor = (
              <Editor
                top={wrapTop}
                left={wrapLeft}
                type={type}
                targetClass={targetClass}
                value={value}
                readonly={readonly}
                width={width}
                onCommit={newValue => {
                  if (newValue !== value) {
                    this.props.updateRow(this.props.current.row, name, newValue);
                  }
                  this.props.setEditing(false);
                }}
                onCancel={() => this.props.setEditing(false)}
              />
            );
          }
        }
      }

      let addRow = null;
      if (!this.props.newObject && this.props.onAddRow) {
        if (this.props.relation) {
          addRow = (
            <div className={styles.addRow}>
              <Button
                onClick={this.props.onAddRow}
                primary
                value={`Create a ${this.props.relation.targetClassName} and attach`}
              />{' '}
              <Button
                onClick={this.props.onAttachRows}
                primary
                value={`Attach existing rows from ${this.props.relation.targetClassName}`}
              />
            </div>
          );
        } else if (!this.props.isUnique) {
          addRow = (
            <div className={styles.addRow}>
              <a title="Add Row" onClick={this.props.onAddRow}>
                <Icon name="plus-outline" width={14} height={14} />
              </a>
            </div>
          );
        }
      }

      if (this.props.newObject || this.props.data.length > 0) {
        table = (
          <div className={styles.table} ref={this.tableRef}>
            <div style={{ height: Math.max(0, this.state.offset * ROW_HEIGHT) }} />
            {editCloneRows}
            {newRow}
            {rows}
            <div
              style={{
                height: Math.max(
                  0,
                  (this.props.data.length - this.state.offset - MAX_ROWS) * ROW_HEIGHT
                ),
              }}
            />
            {addRow}
            {editor}
            <div className={styles.paginationContainer}>
              <div className={styles.paginationItemsContainer}>
                <span className={styles.paginationTotal}>{data.length} items</span>
                <div>
                  <label htmlFor="items-per-page">Items per page:</label>
                  <select
                    id="items-per-page"
                    className={styles.paginationSelect}
                    value={limit}
                    onChange={this.handleItemsPerPageChange}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
              <div className={styles.paginationControls}>
                <span className={styles.paginationPage}>
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  className={styles.paginationBtnPrev}
                  onClick={this.handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className={styles.paginationBtnNext}
                  onClick={this.handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        );
      } else {
        table = (
          <div className={styles.table} ref={this.tableRef}>
            <div className={styles.empty}>
              {this.props.relation ? (
                <EmptyState
                  title="No data to display"
                  description="This relation has no rows. Attach existing rows or create row."
                  cta={`Create ${this.props.relation.targetClassName} and attach`}
                  action={this.props.onAddRow}
                  secondaryCta={`Attach existing rows from ${this.props.relation.targetClassName}`}
                  secondaryAction={this.props.onAttachRows}
                  icon="files-solid"
                />
              ) : (
                <EmptyState
                  title="No data to display"
                  description={this.props.onAddRow && 'Add a row to store an object in this class.'}
                  icon="files-solid"
                  cta={this.props.onAddRow && 'Add a row'}
                  action={this.props.onAddRow}
                />
              )}
            </div>
          </div>
        );
      }
    }

    return (
      <div className={styles.browser}>
        {table}
        <DataBrowserHeaderBar
          selected={
            !!this.props.selection &&
            !!this.props.data &&
            Object.values(this.props.selection).filter(checked => checked).length ===
            this.props.data.length
          }
          selectAll={checked =>
            this.props.data.forEach(({ id }) => this.props.selectRow(id, checked))
          }
          headers={headers}
          updateOrdering={this.props.updateOrdering}
          readonly={!!this.props.relation || !!this.props.isUnique}
          handleDragDrop={this.props.handleHeaderDragDrop}
          onResize={this.props.handleResize}
          onAddColumn={this.props.onAddColumn}
          preventSchemaEdits={this.context.preventSchemaEdits}
          isDataLoaded={!!this.props.data}
        />
      </div>
    );
  }
}
