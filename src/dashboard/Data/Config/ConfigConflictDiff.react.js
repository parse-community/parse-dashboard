/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import { diffLines, diffChars } from 'diff';
import styles from 'dashboard/Data/Config/ConfigConflictDiff.scss';

/**
 * Serialize a config value to a string suitable for diffing.
 * Both server and user values go through this to ensure consistent formatting.
 */
function serializeForDiff(value, type, isUserValue = false) {
  if (value === null || value === undefined) {
    return 'null';
  }

  switch (type) {
    case 'Object':
    case 'Array': {
      // User values from ConfigDialog are already JSON strings for Object/Array
      if (isUserValue && typeof value === 'string') {
        try {
          return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
          return value;
        }
      }
      return JSON.stringify(value, null, 2);
    }
    case 'Boolean':
      return String(value);
    case 'Number':
      return String(value);
    case 'Date': {
      if (typeof value === 'string') {
        return value;
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (value && value.iso) {
        return value.iso;
      }
      return String(value);
    }
    case 'GeoPoint': {
      if (value && typeof value.toJSON === 'function') {
        const json = value.toJSON();
        return JSON.stringify({ latitude: json.latitude, longitude: json.longitude }, null, 2);
      }
      if (value && (value.latitude !== undefined || value.longitude !== undefined)) {
        return JSON.stringify({ latitude: value.latitude, longitude: value.longitude }, null, 2);
      }
      return JSON.stringify(value, null, 2);
    }
    case 'File': {
      if (value && typeof value.toJSON === 'function') {
        const json = value.toJSON();
        return JSON.stringify({ name: json.name, url: json.url }, null, 2);
      }
      if (value && (value._name !== undefined || value.name !== undefined)) {
        return JSON.stringify({ name: value._name || value.name, url: value._url || value.url }, null, 2);
      }
      return JSON.stringify(value, null, 2);
    }
    case 'String':
    default:
      return String(value);
  }
}

/**
 * Render a line with character-level highlighting.
 * charDiffs is the result of diffChars() for this line pair.
 * side is 'removed' or 'added'.
 */
function renderCharHighlightedContent(charDiffs, side) {
  return charDiffs.map((part, i) => {
    if (part.added && side === 'added') {
      return <span key={i} className={styles.charAdded}>{part.value}</span>;
    }
    if (part.removed && side === 'removed') {
      return <span key={i} className={styles.charRemoved}>{part.value}</span>;
    }
    if (!part.added && !part.removed) {
      return <span key={i}>{part.value}</span>;
    }
    return null;
  });
}

/**
 * ConfigConflictDiff displays a GitHub-style unified diff between
 * the server's latest value and the user's edited value.
 */
const ConfigConflictDiff = ({ serverValue, userValue, type }) => {
  const serverStr = serializeForDiff(serverValue, type, false);
  const userStr = serializeForDiff(userValue, type, true);

  const lineDiffs = diffLines(serverStr, userStr);

  // Build diff lines with character-level highlighting
  const rows = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  for (let i = 0; i < lineDiffs.length; i++) {
    const part = lineDiffs[i];
    const lines = part.value.replace(/\n$/, '').split('\n');

    if (part.removed) {
      // Check if next part is an addition (paired change for char-level diff)
      const nextPart = lineDiffs[i + 1];
      const hasCharDiff = nextPart && nextPart.added;
      let charDiffResult = null;

      if (hasCharDiff) {
        charDiffResult = diffChars(part.value, nextPart.value);
      }

      for (const line of lines) {
        rows.push({
          type: 'removed',
          oldNum: oldLineNum++,
          newNum: null,
          prefix: '-',
          content: line,
          charDiffs: charDiffResult,
          charSide: 'removed',
          singleLineDiff: lines.length === 1,
        });
      }

      if (hasCharDiff) {
        const addedLines = nextPart.value.replace(/\n$/, '').split('\n');
        for (const line of addedLines) {
          rows.push({
            type: 'added',
            oldNum: null,
            newNum: newLineNum++,
            prefix: '+',
            content: line,
            charDiffs: charDiffResult,
            charSide: 'added',
            singleLineDiff: addedLines.length === 1,
          });
        }
        i++; // Skip the next (added) part since we handled it
      }
    } else if (part.added) {
      for (const line of lines) {
        rows.push({
          type: 'added',
          oldNum: null,
          newNum: newLineNum++,
          prefix: '+',
          content: line,
          charDiffs: null,
          charSide: null,
          singleLineDiff: false,
        });
      }
    } else {
      for (const line of lines) {
        rows.push({
          type: 'context',
          oldNum: oldLineNum++,
          newNum: newLineNum++,
          prefix: ' ',
          content: line,
          charDiffs: null,
          charSide: null,
          singleLineDiff: false,
        });
      }
    }
  }

  if (rows.length === 0 || (rows.length === 1 && rows[0].type === 'context' && rows[0].content === '')) {
    return <div className={styles.emptyDiff}>Values are identical — no differences found.</div>;
  }

  // For character-level highlighting within a single line,
  // we need to map charDiffs to individual lines. Since diffChars
  // operates on the full block text, for single-line values we can
  // highlight directly. For multi-line, we show line-level coloring only.
  const renderContent = (row) => {
    if (row.charDiffs && row.singleLineDiff) {
      return renderCharHighlightedContent(row.charDiffs, row.charSide);
    }
    return row.content;
  };

  const lineStyle = (row) => {
    if (row.type === 'removed') {
      return styles.lineRemoved;
    }
    if (row.type === 'added') {
      return styles.lineAdded;
    }
    return styles.lineContext;
  };

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className={lineStyle(row)}>
              <td className={styles.lineNumber}>{row.oldNum ?? ''}</td>
              <td className={styles.lineNumber}>{row.newNum ?? ''}</td>
              <td className={styles.prefix}>{row.prefix}</td>
              <td className={styles.content}>{renderContent(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConfigConflictDiff;
