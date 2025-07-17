/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as Filters from 'lib/Filters';
import { List, Map } from 'immutable';
import { dateStringUTC } from 'lib/DateUtils';
import getFileName from 'lib/getFileName';
import Parse from 'parse';
import Pill from 'components/Pill/Pill.react';
import React, { Component } from 'react';
import styles from 'components/BrowserCell/BrowserCell.scss';
import baseStyles from 'stylesheets/base.scss';
import * as ColumnPreferences from 'lib/ColumnPreferences';
import labelStyles from 'components/Label/Label.scss';
import Modal from 'components/Modal/Modal.react';

export default class BrowserCell extends Component {
  constructor() {
    super();

    this.cellRef = React.createRef();
    this.copyableValue = undefined;
    this.selectedScript = null;
    this.state = {
      showTooltip: false,
      content: null,
      classes: [],
      showConfirmationDialog: false,
    };
  }

  renderCellContent() {
    let content = this.props.value;
    const isNewRow = this.props.row < 0;
    this.copyableValue = content;
    const classes = [styles.cell, baseStyles.unselectable];
    if (this.props.hidden) {
      content =
        this.props.value !== undefined || !isNewRow
          ? '(hidden)'
          : this.props.isRequired
            ? '(required)'
            : '(undefined)';
      classes.push(styles.empty);
    } else if (this.props.value === undefined) {
      if (this.props.type === 'ACL') {
        this.copyableValue = content = 'Public Read + Write';
      } else {
        this.copyableValue = content = '(undefined)';
        classes.push(styles.empty);
      }
      content =
        isNewRow && this.props.isRequired && this.props.value === undefined
          ? '(required)'
          : content;
    } else if (this.props.value === null) {
      this.copyableValue = content = '(null)';
      classes.push(styles.empty);
    } else if (this.props.value === '') {
      content = <span>&nbsp;</span>;
      classes.push(styles.empty);
    } else if (this.props.type === 'Pointer') {
      const defaultPointerKey = ColumnPreferences.getPointerDefaultKey(
        this.props.appId,
        this.props.value.className
      );
      let value = this.props.value;
      let dataValue = this.props.value.id || this.props.value.objectId;
      if (defaultPointerKey !== 'objectId') {
        dataValue = this.props.value.get(defaultPointerKey);
        if (dataValue && typeof dataValue === 'object') {
          if (dataValue instanceof Date) {
            dataValue = dataValue.toLocaleString();
          } else {
            if (!this.props.value.id) {
              dataValue = this.props.value.id;
            } else {
              dataValue = '(undefined)';
            }
          }
        }
        if (!dataValue) {
          if (this.props.value.id) {
            dataValue = this.props.value.id;
          } else {
            dataValue = '(undefined)';
          }
        }
      }

      if (this.props.value && this.props.value.__type) {
        const object = new Parse.Object(this.props.value.className);
        object.id = this.props.value.objectId;
        value = object;
      }

      content = this.props.onPointerClick ? (
        <Pill
          value={dataValue}
          onClick={this.props.onPointerClick.bind(undefined, value)}
          followClick={true}
          shrinkablePill
        />
      ) : (
        dataValue
      );

      this.copyableValue = this.props.value.id;
    } else if (this.props.type === 'Array') {
      if (
        this.props.value[0] &&
        typeof this.props.value[0] === 'object' &&
        this.props.value[0].__type === 'Pointer' &&
        typeof this.props.onPointerClick === 'function'
      ) {
        const array = [];
        this.props.value.map((v, i) => {
          if (typeof v !== 'object' || v.__type !== 'Pointer') {
            throw new Error('Invalid type found in pointer array');
          }
          const object = new Parse.Object(v.className);
          object.id = v.objectId;
          array.push(
            <Pill
              key={i}
              value={v.objectId}
              onClick={this.props.onPointerClick.bind(undefined, object)}
              followClick={true}
              shrinkablePill
            />
          );
        });
        this.copyableValue = content = (
          <ul>
            {array.map(a => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        );
        if (array.length > 1) {
          classes.push(styles.hasMore);
        }
      } else {
        this.copyableValue = content = JSON.stringify(this.props.value);
      }
    } else if (this.props.type === 'Date') {
      if (typeof value === 'object' && this.props.value.__type) {
        this.props.value = new Date(this.props.value.iso);
      } else if (typeof value === 'string') {
        this.props.value = new Date(this.props.value);
      }
      this.copyableValue = content = dateStringUTC(this.props.value);
    } else if (this.props.type === 'Boolean') {
      this.copyableValue = content = this.props.value ? 'True' : 'False';
    } else if (this.props.type === 'Object' || this.props.type === 'Bytes') {
      this.copyableValue = content = JSON.stringify(this.props.value);
    } else if (this.props.type === 'File') {
      const fileName = this.props.value
        ? this.props.value.url()
          ? getFileName(this.props.value)
          : this.props.value.name()
        : 'Uploading\u2026';
      content = <Pill value={fileName} fileDownloadLink={this.props.value.url()} shrinkablePill />;
      this.copyableValue = fileName;
    } else if (this.props.type === 'ACL') {
      const pieces = [];
      const json = this.props.value.toJSON();
      if (Object.prototype.hasOwnProperty.call(json, '*')) {
        if (json['*'].read && json['*'].write) {
          pieces.push('Public Read + Write');
        } else if (json['*'].read) {
          pieces.push('Public Read');
        } else if (json['*'].write) {
          pieces.push('Public Write');
        }
      }
      for (const role in json) {
        if (role !== '*') {
          pieces.push(role);
        }
      }
      if (pieces.length === 0) {
        pieces.push('Master Key Only');
      }
      this.copyableValue = content = pieces.join(', ');
    } else if (this.props.type === 'GeoPoint') {
      this.copyableValue =
        content = `(${this.props.value.latitude}, ${this.props.value.longitude})`;
    } else if (this.props.type === 'Polygon') {
      this.copyableValue = content = this.props.value.coordinates.map(coord => `(${coord})`);
    } else if (this.props.type === 'Relation') {
      content = this.props.setRelation ? (
        <div style={{ textAlign: 'center' }}>
          <Pill
            onClick={() => this.props.setRelation(this.props.value)}
            value="View relation"
            followClick={true}
            shrinkablePill
          />
        </div>
      ) : (
        'Relation'
      );
      this.copyableValue = undefined;
    }
    this.onContextMenu = this.onContextMenu.bind(this);

    if (this.props.markRequiredField && this.props.isRequired && this.props.value == null) {
      classes.push(styles.required);
    }

    this.setState({ ...this.state, content, classes });
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.renderCellContent();
      this.props.value?._previousSave
        ?.then(() => this.renderCellContent())
        ?.catch(err => console.log(err));
    }
    if (this.props.current) {
      if (prevProps.selectedCells === this.props.selectedCells) {
        const node = this.cellRef.current;
        const { setRelation } = this.props;
        const { left, right, bottom, top } = node.getBoundingClientRect();

        // Takes into consideration Sidebar width when over 980px wide.
        // If setRelation is undefined, DataBrowser is used as ObjectPicker, so it does not have a sidebar.
        const leftBoundary = window.innerWidth > 980 && setRelation ? 300 : 0;

        // BrowserToolbar + DataBrowserHeader height
        const topBoundary = 126;
        // Account for BrowserFooter height when checking the bottom boundary
        const bottomBoundary = window.innerHeight - 36;

        if (left < leftBoundary || right > window.innerWidth) {
          node.scrollIntoView({ block: 'nearest', inline: 'start' });
        } else if (top < topBoundary || bottom > bottomBoundary) {
          node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }

      if (!this.props.hidden) {
        this.props.setCopyableValue(this.copyableValue);
      }
    }
    if (prevProps.current !== this.props.current) {
      this.setState({ showTooltip: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextState.showTooltip !== this.state.showTooltip ||
      nextState.content !== this.state.content ||
      nextState.showConfirmationDialog !== this.state.showConfirmationDialog
    ) {
      return true;
    }
    const shallowVerifyProps = [
      ...new Set(Object.keys(this.props).concat(Object.keys(nextProps))),
    ].filter(propName => propName !== 'value');
    if (shallowVerifyProps.some(propName => this.props[propName] !== nextProps[propName])) {
      return true;
    }
    const { value } = this.props;
    const { value: nextValue } = nextProps;
    if (typeof value !== typeof nextValue) {
      return true;
    }
    const isRefDifferent = value !== nextValue;
    if (isRefDifferent && typeof value === 'object') {
      return JSON.stringify(value) !== JSON.stringify(nextValue);
    }
    return isRefDifferent;
  }

  //#region Cell Context Menu related methods

  onContextMenu(event) {
    this.props.setErrorAggregatedData({});
    if (event.type !== 'contextmenu') {
      return;
    }
    event.preventDefault();

    const { field, hidden, onSelect, setCopyableValue, setContextMenu, row, col } = this.props;

    onSelect({ row, col });
    setCopyableValue(hidden ? undefined : this.copyableValue);
    if (this.props.selectedObjectId !== this.props.objectId) {
      this.props.setShowAggregatedData(true);
      this.props.setSelectedObjectId(this.props.objectId);
      if (this.props.isPanelVisible) {
        this.props.callCloudFunction(this.props.objectId, this.props.className, this.props.appId);
      }
    }

    const available = Filters.availableFilters(
      this.props.simplifiedSchema,
      this.props.filters,
      Filters.BLACKLISTED_FILTERS
    );
    const constraints = available && available[field];

    const { pageX, pageY } = event;
    const menuItems = this.getContextMenuOptions(constraints);
    menuItems.length && setContextMenu(pageX, pageY, menuItems);
  }

  getContextMenuOptions(constraints) {
    const { onEditSelectedRow, readonly } = this.props;
    const contextMenuOptions = [];

    const setFilterContextMenuOption = this.getSetFilterContextMenuOption(constraints);
    setFilterContextMenuOption && contextMenuOptions.push(setFilterContextMenuOption);

    const addFilterContextMenuOption = this.getAddFilterContextMenuOption(constraints);
    addFilterContextMenuOption && contextMenuOptions.push(addFilterContextMenuOption);

    const relatedObjectsContextMenuOption = this.getRelatedObjectsContextMenuOption();
    relatedObjectsContextMenuOption && contextMenuOptions.push(relatedObjectsContextMenuOption);

    !readonly &&
      onEditSelectedRow &&
      contextMenuOptions.push({
        text: 'Edit row',
        callback: () => {
          const { objectId, onEditSelectedRow } = this.props;
          onEditSelectedRow(true, objectId);
        },
      });

    if (this.props.type === 'Pointer') {
      onEditSelectedRow &&
        contextMenuOptions.push({
          text: 'Open pointer in new tab',
          callback: () => {
            const { value, onPointerCmdClick } = this.props;
            onPointerCmdClick(value);
          },
        });
    }

    const { className, objectId, field, scripts = [], rowValue } = this.props;
    let validator = null;
    const validScripts = (scripts || []).filter(script => {
      if (script.classes?.includes(className)) {
        return true;
      }
      for (const script of script?.classes || []) {
        if (script?.name !== className) {
          continue;
        }
        const fields = script?.fields || [];
        if (script?.fields.includes(field) || script?.fields.includes('*')) {
          return true;
        }
        for (const currentField of fields) {
          if (Object.prototype.toString.call(currentField) === '[object Object]') {
            if (currentField.name === field) {
              if (typeof currentField.validator === 'string') {
                validator = eval(currentField.validator);
              } else {
                validator = currentField.validator;
              }
              return true;
            }
          }
        }
      }
    });
    if (validScripts.length) {
      onEditSelectedRow &&
        contextMenuOptions.push({
          text: 'Scripts',
          items: validScripts.map(script => {
            return {
              text: script.title,
              disabled: validator?.(rowValue, field) === false,
              callback: () => {
                this.selectedScript = { ...script, className, objectId };
                if (script.showConfirmationDialog) {
                  this.toggleConfirmationDialog();
                } else {
                  this.executeScript(script);
                }
              },
            };
          }),
        });
    }

    return contextMenuOptions;
  }

  async executeScript(script) {
    try {
      const object = Parse.Object.extend(this.props.className).createWithoutData(
        this.props.objectId
      );
      const response = await Parse.Cloud.run(
        script.cloudCodeFunction,
        { object: object.toPointer() },
        { useMasterKey: true }
      );
      this.props.showNote(
        response ||
          `Ran script "${script.title}" on "${this.props.className}" object "${object.id}".`
      );
      this.props.onRefresh();
    } catch (e) {
      this.props.showNote(e.message, true);
      console.log(`Could not run ${script.title}: ${e}`);
    }
  }

  toggleConfirmationDialog() {
    this.setState(prevState => ({
      showConfirmationDialog: !prevState.showConfirmationDialog,
    }));
  }

  getSetFilterContextMenuOption(constraints) {
    if (constraints) {
      return {
        text: 'Set filter...',
        items: constraints.map(constraint => {
          const definition = Filters.Constraints[constraint];
          const copyableValue = String(this.copyableValue);
          // Smart ellipsis for value - if it's long trim it in the middle: Lorem ipsum dolor si... aliqua
          const value =
            copyableValue.length < 30
              ? copyableValue
              : `${copyableValue.substr(0, 20)}...${copyableValue.substr(
                copyableValue.length - 7
              )}`;
          const text = `${this.props.field} ${definition.name}${
            definition.comparable ? ' ' + value : ''
          }`;
          return {
            text,
            callback: this.pickFilter.bind(this, constraint),
          };
        }),
      };
    }
  }

  getAddFilterContextMenuOption(constraints) {
    if (constraints && this.props.filters && this.props.filters.size > 0) {
      return {
        text: 'Add filter...',
        items: constraints.map(constraint => {
          const definition = Filters.Constraints[constraint];
          const text = `${this.props.field} ${definition.name}${
            definition.comparable ? ' ' + this.copyableValue : ''
          }`;
          return {
            text,
            callback: this.pickFilter.bind(this, constraint, true),
          };
        }),
      };
    }
  }

  /**
   * Returns "Get related records from..." context menu item if cell holds a Pointer
   * or objectId and there's a class in relation.
   */
  getRelatedObjectsContextMenuOption() {
    const { value, schema, onPointerClick } = this.props;

    const pointerClassName =
      (value && value.className) || (this.props.field === 'objectId' && this.props.className);
    if (pointerClassName) {
      const relatedRecordsMenuItem = {
        text: 'Get related records from...',
        items: [],
      };
      schema.data
        .get('classes')
        .sortBy((v, k) => k)
        .forEach((cl, className) => {
          cl.forEach((column, field) => {
            if (column.targetClass !== pointerClassName) {
              return;
            }
            relatedRecordsMenuItem.items.push({
              text: `${className}`,
              subtext: `${field}`,
              callback: () => {
                let relatedObject = value;
                if (this.props.field === 'objectId') {
                  relatedObject = new Parse.Object(pointerClassName);
                  relatedObject.id = value;
                }
                onPointerClick({
                  className,
                  id: relatedObject.toPointer(),
                  field,
                });
              },
            });
          });
        });

      return relatedRecordsMenuItem.items.length ? relatedRecordsMenuItem : undefined;
    }
  }

  pickFilter(constraint, addToExistingFilter) {
    const definition = Filters.Constraints[constraint];
    const { filters, type, value, field, className } = this.props;
    const newFilters = addToExistingFilter ? filters : new List();
    let compareTo;
    if (definition.comparable) {
      switch (type) {
        case 'Pointer':
          compareTo = value.toPointer();
          break;
        case 'Date':
          compareTo = value.__type
            ? value
            : {
              __type: 'Date',
              iso: value,
            };
          break;

        default:
          compareTo = value;
          break;
      }
    }

    this.props.onFilterChange(
      newFilters.push(
        new Map({
          field,
          constraint,
          compareTo,
          class: className,
        })
      )
    );
  }

  componentDidMount() {
    this.renderCellContent();
  }

  //#endregion

  render() {
    const {
      type,
      value,
      hidden,
      width,
      current,
      onEditChange,
      setCopyableValue,
      onPointerCmdClick,
      row,
      col,
      field,
      onEditSelectedRow,
      isRequired,
      markRequiredFieldRow,
      handleCellClick,
      selectedCells,
    } = this.props;

    const classes = [...this.state.classes];

    if (current) {
      classes.push(styles.current);
    }
    if (markRequiredFieldRow === row && isRequired && value == null) {
      classes.push(styles.required);
    }

    let extras = null;
    if (this.state.showConfirmationDialog) {
      extras = (
        <Modal
          type={
            this.selectedScript.confirmationDialogStyle === 'critical'
              ? Modal.Types.DANGER
              : Modal.Types.INFO
          }
          icon="warn-outline"
          title={this.selectedScript.title}
          confirmText="Continue"
          cancelText="Cancel"
          onCancel={() => this.toggleConfirmationDialog()}
          onConfirm={() => {
            this.executeSript(this.selectedScript);
            this.toggleConfirmationDialog();
          }}
        >
          <div className={[labelStyles.label, labelStyles.text, styles.action].join(' ')}>
            {`Do you want to run script "${this.selectedScript.title}" on "${this.selectedScript.className}" object "${this.selectedScript.objectId}"?`}
          </div>
        </Modal>
      );
    }

    if (selectedCells?.list.has(`${row}-${col}`)) {
      if (selectedCells.rowStart === row) {
        classes.push(styles.topBorder);
      }
      if (selectedCells.rowEnd === row) {
        classes.push(styles.bottomBorder);
      }
      if (selectedCells.colStart === col) {
        classes.push(styles.leftBorder);
      }
      if (selectedCells.colEnd === col) {
        classes.push(styles.rightBorder);
      }
      classes.push(styles.selected);
    }

    const style = { width };
    if (this.props.stickyLeft !== undefined) {
      style.position = 'sticky';
      style.left = this.props.stickyLeft;
      style.zIndex = 1;
      style.background = this.props.rowBackground;
      style.borderBottom = '1px solid #e3e3ea';
    }

    return (
      <span
        ref={this.cellRef}
        className={classes.join(' ')}
        style={style}
        onClick={e => {
          if (e.metaKey === true && type === 'Pointer') {
            onPointerCmdClick(value);
          } else {
            setCopyableValue(hidden ? undefined : this.copyableValue);
            handleCellClick(e, row, col, this.props.objectId);
          }
        }}
        onDoubleClick={() => {
          // Since objectId can't be edited, double click event opens edit row dialog
          if (field === 'objectId' && onEditSelectedRow) {
            onEditSelectedRow(true, value);
          } else if (type !== 'Relation') {
            onEditChange(true);
          }
        }}
        onTouchEnd={e => {
          if (current && type !== 'Relation') {
            // The touch event may trigger an unwanted change in the column value
            if (['ACL', 'Boolean', 'File'].includes(type)) {
              e.preventDefault();
            }
          }
        }}
        onContextMenu={this.onContextMenu.bind(this)}
      >
        {this.state.content}
        {extras}
      </span>
    );
  }
}
