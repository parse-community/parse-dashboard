/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import BrowserRow from 'components/BrowserRow/BrowserRow.react';
import Button from 'components/Button/Button.react';
import DataBrowserHeaderBar from 'components/DataBrowserHeaderBar/DataBrowserHeaderBar.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Icon from 'components/Icon/Icon.react';
import { CurrentApp } from 'context/currentApp';
import styles from 'dashboard/Data/Browser/Browser.scss';
import Editor from 'dashboard/Data/Browser/Editor.react';
import Parse from 'parse';
import encode from 'parse/lib/browser/encode';
import React from 'react';

const ROW_HEIGHT = 30;

const READ_ONLY = ['objectId', 'createdAt', 'updatedAt'];

export default class BrowserTable extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();

    this.state = {
      offset: 0,
      panelWidth: 300,
      isResizing: false,
      maxWidth: window.innerWidth - 300,
    };
    this.tableRef = React.createRef();
    this.handleResize = this.handleResize.bind(this);
    this.updateMaxWidth = this.updateMaxWidth.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.className !== this.props.className) {
      this.setState({
        offset: 0,
      });
      this.tableRef.current.scrollTop = 0;
    } else if (this.props.newObject !== props.newObject) {
      this.setState({ offset: 0 });
      this.tableRef.current.scrollTop = 0;
    } else if (this.props.ordering !== props.ordering) {
      this.setState({ offset: 0 });
      this.tableRef.current.scrollTop = 0;
    } else if (this.props.filters.size !== props.filters.size) {
      this.setState({ offset: 0 }, () => {
        this.tableRef.current.scrollTop = 0;
      });
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateMaxWidth);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateMaxWidth);
  }

  handleResize(event, { size }) {
    this.setState({ panelWidth: size.width });
  }

  handleMouseDown() {
    this.setState({ isResizing: true });
    document.body.style.cursor = 'ew-resize';
  }

  handleMouseMove(e) {
    if (!this.state.isResizing) {
      return;
    }
    this.setState({ panelWidth: e.clientX });
  }

  handleMouseUp() {
    if (!this.state.isResizing) {
      return;
    }
    this.setState({ isResizing: false });
    document.body.style.cursor = 'default';
  }

  updateMaxWidth = () => {
    this.setState({ maxWidth: window.innerWidth - 300 });
    if (this.state.panelWidth > window.innerWidth - 300) {
      this.setState({ panelWidth: window.innerWidth - 300 });
    }
  };

  render() {
    let ordering = {};
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

    const stickyLefts = [];
    const handleLefts = [];
    const maxRowNumber =
      this.props.skip + (this.props.data ? this.props.data.length : this.props.limit);
    const rowNumberWidth = this.props.showRowNumber
      ? maxRowNumber.toLocaleString().length * 8 + 16
      : 0;
    if (typeof this.props.freezeIndex === 'number' && this.props.freezeIndex >= 0) {
      let left = 30 + rowNumberWidth;
      headers.forEach((h, i) => {
        stickyLefts[i] = left;
        handleLefts[i] = left + h.width;
        if (h.visible) {
          left += h.width;
        }
      });
    }
    let editor = null;
    let table = <div ref={this.tableRef} />;
    if (this.props.data) {
      const rowWidth =
        this.props.order.reduce(
          (rw, { visible, width }) => (visible ? rw + width : rw),
          this.props.onAddRow ? 210 : 0
        ) + rowNumberWidth;
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
                    showRowNumber={this.props.showRowNumber}
                    rowNumberWidth={rowNumberWidth}
                    skip={this.props.skip}
                    selection={this.props.selection}
                    selectRow={this.props.selectRow}
                    setCurrent={this.props.setCurrent}
                    setEditing={this.props.setEditing}
                    setRelation={this.props.setRelation}
                    setCopyableValue={this.props.setCopyableValue}
                    selectedObjectId={this.props.selectedObjectId}
                    setSelectedObjectId={this.props.setSelectedObjectId}
                    callCloudFunction={this.props.callCloudFunction}
                    isPanelVisible={this.props.isPanelVisible}
                    setContextMenu={this.props.setContextMenu}
                    stickyLefts={stickyLefts}
                    freezeIndex={this.props.freezeIndex}
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
                    onMouseOverRow={this.props.onMouseOverRow}
                    setShowAggregatedData={this.props.setShowAggregatedData}
                    setErrorAggregatedData={this.props.setErrorAggregatedData}
                    firstSelectedCell={this.props.firstSelectedCell}
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
              showRowNumber={this.props.showRowNumber}
              rowNumberWidth={rowNumberWidth}
              skip={this.props.skip}
              selection={this.props.selection}
              selectRow={this.props.selectRow}
              setCurrent={this.props.setCurrent}
              setEditing={this.props.setEditing}
              setRelation={this.props.setRelation}
              setCopyableValue={this.props.setCopyableValue}
              selectedObjectId={this.props.selectedObjectId}
              setSelectedObjectId={this.props.setSelectedObjectId}
              callCloudFunction={this.props.callCloudFunction}
              isPanelVisible={this.props.isPanelVisible}
              setContextMenu={this.props.setContextMenu}
              stickyLefts={stickyLefts}
              freezeIndex={this.props.freezeIndex}
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
              onMouseOverRow={this.props.onMouseOverRow}
              setShowAggregatedData={this.props.setShowAggregatedData}
              setErrorAggregatedData={this.props.setErrorAggregatedData}
              firstSelectedCell={this.props.firstSelectedCell}
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
      const end = Math.min(this.state.offset + this.props.limit, this.props.data.length);
      for (let i = this.state.offset; i < end; i++) {
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
            callCloudFunction={this.props.callCloudFunction}
            order={this.props.order}
            readOnlyFields={READ_ONLY}
            row={i}
            rowValue={this.props.data[i]}
            rowWidth={rowWidth}
            showRowNumber={this.props.showRowNumber}
            rowNumberWidth={rowNumberWidth}
            skip={this.props.skip}
            selection={this.props.selection}
            selectRow={this.props.selectRow}
            setCurrent={this.props.setCurrent}
            setEditing={this.props.setEditing}
            setRelation={this.props.setRelation}
            setCopyableValue={this.props.setCopyableValue}
            selectedObjectId={this.props.selectedObjectId}
            setSelectedObjectId={this.props.setSelectedObjectId}
            isPanelVisible={this.props.isPanelVisible}
            setContextMenu={this.props.setContextMenu}
            stickyLefts={stickyLefts}
            freezeIndex={this.props.freezeIndex}
            onEditSelectedRow={this.props.onEditSelectedRow}
            showNote={this.props.showNote}
            onRefresh={this.props.onRefresh}
            scripts={this.context.scripts}
            selectedCells={this.props.selectedCells}
            handleCellClick={this.props.handleCellClick}
            onMouseDownRowCheckBox={this.props.onMouseDownRowCheckBox}
            onMouseUpRowCheckBox={this.props.onMouseUpRowCheckBox}
            onMouseOverRowCheckBox={this.props.onMouseOverRowCheckBox}
            onMouseOverRow={this.props.onMouseOverRow}
            setShowAggregatedData={this.props.setShowAggregatedData}
            setErrorAggregatedData={this.props.setErrorAggregatedData}
            firstSelectedCell={this.props.firstSelectedCell}
          />
        );
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
          let wrapLeft = 30 + rowNumberWidth;
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
                  (this.props.data.length - this.state.offset - this.props.limit) * ROW_HEIGHT
                ),
              }}
            />
            {addRow}
            {editor}
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
    const rightValue =
      this.props.panelWidth && this.props.isPanelVisible ? `${this.props.panelWidth}px` : '0px';

    return (
      <div
        className={styles.browser}
        id="browser-table"
        style={{
          right: rightValue,
          overflowX: this.props.isResizing ? 'hidden' : 'auto',
        }}
      >
        <DataBrowserHeaderBar
          selected={
            !!this.props.selection &&
            !!this.props.data &&
            this.props.data.length > 0 &&
            (!!this.props.selection['*'] ||
              Object.values(this.props.selection).filter(checked => checked).length ===
                this.props.data.length)
          }
          indeterminate={
            !!this.props.selection &&
            !!this.props.data &&
            this.props.data.length > 0 &&
            !this.props.selection['*'] &&
            Object.values(this.props.selection).filter(checked => checked).length > 0 &&
            Object.values(this.props.selection).filter(checked => checked).length !==
              this.props.data.length
          }
          selectAll={checked =>
            this.props.data.forEach(({ id }) => this.props.selectRow(id, checked))
          }
          headers={headers}
          stickyLefts={stickyLefts}
          handleLefts={handleLefts}
          freezeIndex={this.props.freezeIndex}
          freezeColumns={this.props.freezeColumns}
          unfreezeColumns={this.props.unfreezeColumns}
          updateOrdering={this.props.updateOrdering}
          showRowNumber={this.props.showRowNumber}
          setShowRowNumber={this.props.setShowRowNumber}
          rowNumberWidth={rowNumberWidth}
          readonly={!!this.props.relation || !!this.props.isUnique}
          handleDragDrop={this.props.handleHeaderDragDrop}
          onResize={this.props.handleResize}
          onAddColumn={this.props.onAddColumn}
          preventSchemaEdits={this.context.preventSchemaEdits}
          isDataLoaded={!!this.props.data}
          setSelectedObjectId={this.props.setSelectedObjectId}
          setCurrent={this.props.setCurrent}
          setContextMenu={this.props.setContextMenu}
        />
        {table}
      </div>
    );
  }
}
