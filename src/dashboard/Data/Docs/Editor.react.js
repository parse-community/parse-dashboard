/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ACLEditor      from 'components/ACLEditor/ACLEditor.react';
import BooleanEditor  from 'components/BooleanEditor/BooleanEditor.react';
import DateTimeEditor from 'components/DateTimeEditor/DateTimeEditor.react';
import FileEditor     from 'components/FileEditor/FileEditor.react';
import GeoPointEditor from 'components/GeoPointEditor/GeoPointEditor.react';
import NumberEditor   from 'components/NumberEditor/NumberEditor.react';
import Parse          from 'parse';
import decode         from 'parse/lib/browser/decode';
import React          from 'react';
import StringEditor   from 'components/StringEditor/StringEditor.react';

let Editor = ({ top, left, type, targetClass, value, readonly, width, onCommit, onCancel }) => {
  let content = null;
  if (type === 'String') {
    content = (
      <StringEditor
        value={value}
        readonly={readonly}
        multiline={!readonly}
        width={width}
        onCommit={onCommit}
        resizable={true} />
    );
  } else if (type === 'Array' || type === 'Object') {
    let encodeCommit = (json) => {
      try {
        let obj = decode(JSON.parse(json));
        onCommit(obj);
      } catch (e) {
        onCommit(value);
      }
    }
    content = (
      <StringEditor
        value={JSON.stringify(value, null, 2)}
        resizable={true}
        multiline={true}
        width={width}
        onCommit={encodeCommit} />
    );
  } else if (type === 'Polygon') {
    let encodeCommit = (json) => {
      try {
        let coordinates = JSON.parse(json);
        if (coordinates.length < 3) {
          throw 'Polygon must have at least 3 coordinates';
        }
        if (value && value.coordinates && value.coordinates.length === coordinates.length) {
          let dirty = coordinates.some((coord, index) => {
            if (value.coordinates[index][0] !== coord[0] || value.coordinates[index][1] !== coord[1]) {
              return true;
            }
          });
          if (!dirty) {
            throw 'No change in coordinates';
          }
        }
        let obj = {
          '__type': 'Polygon',
          coordinates
        }
        onCommit(obj);
      } catch (e) {
        onCommit(value);
      }
    }
    content = (
      <StringEditor
        value={JSON.stringify(value && value.coordinates || [['lat', 'lon']], null, 2)}
        resizable={true}
        multiline={true}
        width={width}
        onCommit={encodeCommit} />
    );
  } else if (type === 'Date') {
    if (readonly) {
      content = (
        <StringEditor
          value={value ? value.toISOString() : ''}
          readonly={true}
          width={width}
          onCommit={() => onCommit(value)} />
      );
    } else {
      content = (
        <DateTimeEditor
          value={value || new Date()}
          width={width}
          onCommit={onCommit} />
      );
    }
  } else if (type === 'Boolean') {
    content = (
      <BooleanEditor value={value} width={width} onCommit={onCommit} />
    );
  } else if (type === 'Number') {
    content = (
      <NumberEditor
        value={value}
        width={width}
        onCommit={onCommit} />
    );
  } else if (type === 'GeoPoint') {
    content = (
      <GeoPointEditor
        value={value}
        width={width}
        onCommit={onCommit} />
    );
  } else if (type === 'File') {
    content = (
      <FileEditor
        value={value}
        width={width}
        onCommit={onCommit}
        onCancel={onCancel} />
    );
  } else if (type === 'ACL') {
    content = (
      <ACLEditor
        value={value}
        onCommit={onCommit} />
    );
  } else if (type === 'Pointer') {
    let encodeCommit = (pointer) => {
      if (pointer.length === 0) {
        onCommit(undefined);
      } else {
        onCommit(Parse.Object.fromJSON({
          className: targetClass,
          objectId: pointer
        }));
      }
    };
    content = (
      <StringEditor
        value={value ? value.id : ''}
        width={width}
        onCommit={encodeCommit} />
    );
  }

  return (
    <div style={{ position: 'absolute', top: top, left: left }}>
      {content}
    </div>
  );
};

export default Editor;
