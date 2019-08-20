/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { dateStringUTC }    from 'lib/DateUtils';
import getFileName          from 'lib/getFileName';
import Parse                from 'parse';
import Pill                 from 'components/Pill/Pill.react';
import React                from 'react';
import styles               from 'components/BrowserCell/BrowserCell.scss';
import { unselectable }     from 'stylesheets/base.scss';
import { findDOMNode }      from 'react-dom'
import ReactTooltip         from 'react-tooltip'
import PropTypes            from 'lib/PropTypes';

class BrowserCell extends React.Component {
  constructor (){
    super()

    this.readableValue = undefined;
  }

  showTooltip(ref) {
    ReactTooltip.show(findDOMNode(this.refs[ref]))
    this.props.unsetTooltip()
  }

  componentWillReceiveProps(nextProps) {
    // show the next currentTooltip
    if (nextProps.currentTooltip !== this.props.currentTooltip && nextProps.currentTooltip) {
      this.showTooltip(nextProps.currentTooltip)
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.current && this.props.current) {
      this.props.onSelect(this.readableValue);
    }
  }

  defineCellParams() {
    let { type, value, hidden, current, setRelation, onPointerClick, readonly } = this.props
    let content = value;
    let classes = [styles.cell, unselectable];
    let readableValue = value

    if (hidden && !current) {
      content = '(hidden)';
      classes.push(styles.empty);
    } else if (value === undefined) {
      if (type === 'ACL') {
        readableValue = content = 'Public Read + Write';
      } else {
        readableValue = content = '(undefined)';
        classes.push(styles.empty);
      }
    } else if (value === null) {
      readableValue = content = '(null)';
      classes.push(styles.empty);
    } else if (value === '') {
      content = <span>&nbsp;</span>;
      classes.push(styles.empty);
    } else if (type === 'Pointer') {
      content = (
        <a href='javascript:;' onClick={onPointerClick.bind(undefined, value)}>
          <Pill value={value ? value.id : undefined} />
        </a>
      );
      readableValue = value ? value.id : undefined;
    } else if (type === 'Date') {
      readableValue = content = value ? dateStringUTC(value) : undefined;
    } else if (type === 'Boolean') {
      readableValue = content = value ? 'True' : 'False';
    } else if (type === 'Array') {
      readableValue = content = value && typeof value.map === 'function'
        ? JSON.stringify(value.map(val => val instanceof Parse.Object ? val.toPointer() : val))
        : undefined;
    } else if (type === 'Object' || type === 'Bytes') {
      readableValue = content = value ? JSON.stringify(value) : undefined;
    } else if (type === 'File') {
      if (value && value.url()) {
        content = <Pill value={getFileName(value)} />;
      } else {
        content = <Pill value={'Uploading\u2026'} />;
      }
      readableValue = getFileName(value)
    } else if (type === 'ACL') {
      let pieces = [];
      let json = value.toJSON();
      if (json.hasOwnProperty('*')) {
        if (json['*'].read && json['*'].write) {
          pieces.push('Public Read + Write');
        } else if (json['*'].read) {
          pieces.push('Public Read');
        } else if (json['*'].write) {
          pieces.push('Public Write');
        }
      }
      for (let role in json) {
        if (role !== '*') {
          pieces.push(role);
        }
      }
      if (pieces.length === 0) {
        pieces.push('Master Key Only');
      }
      readableValue = content = pieces.join(', ');
    } else if (type === 'GeoPoint') {
      readableValue = content = value ? `(${value.latitude}, ${value.longitude})` : undefined;
    } else if (type === 'Polygon') {
      readableValue = content = value ? value.coordinates.map(coord => `(${coord})`) : undefined;
    } else if (type === 'Relation') {
      content = (
        <div style={{ textAlign: 'center', cursor: 'pointer' }}>
          <Pill onClick={() => setRelation(value)} value='View relation' />
        </div>
      );
      readableValue = value
    }

    // Set read only style
    if (readonly && content !== '(hidden)')
      classes.push(styles.readonly)
    if (current) {
      classes.push(styles.current);
    }

    return { content, readableValue, classes }
  }

  render() {
    let { id, readonly , width, current, type, onSelect, onEditChange } = this.props;
    let { content, readableValue, classes } = this.defineCellParams();

    this.readableValue = readableValue;
    return (
      readonly ?
        <span
          className={classes.join(' ')}
          style={{ width }}
          ref={id}
          data-tip='Read only (CTRL+C to copy)'
          onClick={() => onSelect(readableValue)} >
          {content}
          <ReactTooltip event={'dblclick'} place={'bottom'} afterShow={() => setTimeout(ReactTooltip.hide, 2000)} />
        </span> :
        <span
          className={classes.join(' ')}
          style={{ width }}
          onClick={() => current && type !== 'Relation' ? onEditChange(true) : onSelect(readableValue)} >
          {content}
       </span>
    );
  }
}

BrowserCell.propTypes = {
  type: PropTypes.string.isRequired.describe('The column data type'),
  value: PropTypes.any.describe('The cell value (can be null/undefined as well)'),
  hidden: PropTypes.bool.describe('True if the cell value must be hidden (like passwords), false otherwise'),
  current: PropTypes.bool.describe('True if it is the BrowserCell selected, false otherwise'),
  setRelation: PropTypes.func.isRequired.describe('Function invoked when the Relation link is clicked'),
  onPointerClick: PropTypes.func.isRequired.describe('Function invoked when the Pointer link is clicked'),
  readonly: PropTypes.bool.describe('True if the cell value is read only')
}

export default BrowserCell;
