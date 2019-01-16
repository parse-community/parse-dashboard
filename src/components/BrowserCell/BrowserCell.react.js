/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { dateStringUTC }  from 'lib/DateUtils';
import getFileName        from 'lib/getFileName';
import Parse              from 'parse';
import Pill               from 'components/Pill/Pill.react';
import React              from 'react';
import styles             from 'components/BrowserCell/BrowserCell.scss';
import { unselectable }   from 'stylesheets/base.scss';
import ReactTooltip       from 'react-tooltip'

let BrowserCell = ({ type, value, hidden, width, current, onSelect, onEditChange, setRelation,  onPointerClick, readonly }) => {
  let content = value;
  let classes = [styles.cell, unselectable];
  let readableValue = value

  // Set read only style
  readonly && classes.push(styles.readonly)
  if (hidden) {
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
        <Pill value={value.id} />
      </a>
    );
    readableValue = value.id;
  } else if (type === 'Date') {
    readableValue = content = dateStringUTC(value);
  } else if (type === 'Boolean') {
    readableValue = content = value ? 'True' : 'False';
  } else if (type === 'Array') {
    readableValue = content = JSON.stringify(value.map(val => val instanceof Parse.Object ? val.toPointer() : val))
  } else if (type === 'Object' || type === 'Bytes') {
    readableValue = content = JSON.stringify(value);
  } else if (type === 'File') {
    if (value.url()) {
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
    readableValue = content = `(${value.latitude}, ${value.longitude})`;
  } else if (type === 'Polygon') {
    readableValue = content = value.coordinates.map(coord => `(${coord})`)
  } else if (type === 'Relation') {
    content = (
      <div style={{ textAlign: 'center', cursor: 'pointer' }}>
        <Pill onClick={() => setRelation(value)} value='View relation' />
      </div>
    );
    readableValue = value
  }

  if (current) {
    classes.push(styles.current);
  }
  return (
    readonly ?
      <span
        className={classes.join(' ')}
        style={{ width }}
        data-tip='Read only (CTRL+C to copy)'
        onClick={() => onSelect(readableValue)} >
        {content}
        <ReactTooltip event={'dblclick'} place={'bottom'} afterShow={() => setTimeout(ReactTooltip.hide, 2000)} />
      </span> :
      <span
        className={classes.join(' ')}
        style={{ width }}
        onClick={() => onSelect(readableValue)}
        onDoubleClick={() => {
          if (type !== 'Relation') {
            onEditChange(true)
          }
        }}>
        {content}
      </span>

  );
};

export default BrowserCell;
