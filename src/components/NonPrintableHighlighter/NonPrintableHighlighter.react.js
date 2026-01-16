/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import styles from 'components/NonPrintableHighlighter/NonPrintableHighlighter.scss';

// Non-printable character ranges and their display representations
const NON_PRINTABLE_CHARS = {
  '\x00': 'NUL',
  '\x01': 'SOH',
  '\x02': 'STX',
  '\x03': 'ETX',
  '\x04': 'EOT',
  '\x05': 'ENQ',
  '\x06': 'ACK',
  '\x07': 'BEL',
  '\x08': 'BS',
  '\x09': 'TAB',
  '\x0A': 'LF',
  '\x0B': 'VT',
  '\x0C': 'FF',
  '\x0D': 'CR',
  '\x0E': 'SO',
  '\x0F': 'SI',
  '\x10': 'DLE',
  '\x11': 'DC1',
  '\x12': 'DC2',
  '\x13': 'DC3',
  '\x14': 'DC4',
  '\x15': 'NAK',
  '\x16': 'SYN',
  '\x17': 'ETB',
  '\x18': 'CAN',
  '\x19': 'EM',
  '\x1A': 'SUB',
  '\x1B': 'ESC',
  '\x1C': 'FS',
  '\x1D': 'GS',
  '\x1E': 'RS',
  '\x1F': 'US',
  '\x7F': 'DEL',
  '\u00A0': 'NBSP',
  '\u2000': 'NQSP',
  '\u2001': 'MQSP',
  '\u2002': 'ENSP',
  '\u2003': 'EMSP',
  '\u2004': '3MSP',
  '\u2005': '4MSP',
  '\u2006': '6MSP',
  '\u2007': 'FSP',
  '\u2008': 'PSP',
  '\u2009': 'THSP',
  '\u200A': 'HSP',
  '\u200B': 'ZWSP',
  '\u200C': 'ZWNJ',
  '\u200D': 'ZWJ',
  '\u200E': 'LRM',
  '\u200F': 'RLM',
  '\u2028': 'LS',
  '\u2029': 'PS',
  // BiDi control characters (can be security risks - "Trojan Source" attacks)
  '\u202A': 'LRE',
  '\u202B': 'RLE',
  '\u202C': 'PDF',
  '\u202D': 'LRO',
  '\u202E': 'RLO',
  '\u202F': 'NNBSP',
  '\u2060': 'WJ',
  '\u2061': 'FA',
  '\u2062': 'IT',
  '\u2063': 'IS',
  '\u2064': 'IP',
  '\u2066': 'LRI',
  '\u2067': 'RLI',
  '\u2068': 'FSI',
  '\u2069': 'PDI',
  '\u205F': 'MMSP',
  '\u206A': 'ISS',
  '\u206B': 'ASS',
  '\u206C': 'IAFS',
  '\u206D': 'AAFS',
  '\u206E': 'NADS',
  '\u206F': 'NODS',
  '\u3000': 'IDSP',
  '\uFEFF': 'BOM',
  '\uFFF9': 'IAA',
  '\uFFFA': 'IAS',
  '\uFFFB': 'IAT',
  '\uFFFC': 'OBJ',
};

// Regex to match non-printable characters
const NON_PRINTABLE_REGEX = /[\x00-\x1F\x7F\u00A0\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000\uFEFF\uFFF9-\uFFFC]/g;

/**
 * Check if a string contains non-printable characters
 */
export function hasNonPrintableChars(str) {
  if (!str || typeof str !== 'string') {
    return false;
  }
  return NON_PRINTABLE_REGEX.test(str);
}

/**
 * Get a list of non-printable characters found in a string with counts and positions
 * Returns { totalCount, chars: [{ char, label, code, count, positions }] }
 */
export function getNonPrintableChars(str) {
  if (!str || typeof str !== 'string') {
    return { totalCount: 0, chars: [] };
  }

  const positionMap = new Map();
  let totalCount = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (NON_PRINTABLE_REGEX.test(char)) {
      NON_PRINTABLE_REGEX.lastIndex = 0;
      if (!positionMap.has(char)) {
        positionMap.set(char, []);
      }
      positionMap.get(char).push(i + 1);
      totalCount++;
    }
  }

  const chars = [];
  for (const [char, positions] of positionMap) {
    const label = NON_PRINTABLE_CHARS[char] || `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`;
    chars.push({
      char,
      label,
      code: `0x${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
      count: positions.length,
      positions,
    });
  }

  return { totalCount, chars };
}

/**
 * Extract all string values from a parsed JSON object/array recursively
 */
function extractStringValues(obj) {
  const strings = [];

  function traverse(value) {
    if (typeof value === 'string') {
      strings.push(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        traverse(item);
      }
    } else if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        traverse(value[key]);
      }
    }
  }

  traverse(obj);
  return strings;
}

/**
 * Get non-printable characters from JSON string values only
 * Parses the JSON and only checks string values within it
 */
export function getNonPrintableCharsFromJson(jsonStr) {
  if (!jsonStr || typeof jsonStr !== 'string') {
    return { totalCount: 0, chars: [] };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // If JSON is invalid, don't report any errors
    return { totalCount: 0, chars: [] };
  }

  const stringValues = extractStringValues(parsed);
  const combinedStr = stringValues.join('');

  return getNonPrintableChars(combinedStr);
}

/**
 * NonPrintableHighlighter component
 * Displays a warning indicator when non-printable characters are detected in the value
 *
 * Props:
 * - value: The string value to check
 * - isJson: If true, only check string values within the parsed JSON (for Array/Object types)
 * - children: The input element to wrap
 */
export default class NonPrintableHighlighter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
    };
  }

  render() {
    const { value, children, isJson } = this.props;
    const { totalCount, chars } = isJson
      ? getNonPrintableCharsFromJson(value)
      : getNonPrintableChars(value);
    const hasNonPrintable = totalCount > 0;

    return (
      <div className={styles.container}>
        {children}
        {hasNonPrintable && (
          <div className={styles.warningContainer}>
            <div
              className={`${styles.warningBadge} ${this.state.showDetails ? styles.expanded : ''}`}
              onClick={() => this.setState({ showDetails: !this.state.showDetails })}
              title="Click for details"
            >
              <span className={styles.warningIcon}>⚠</span>
              <span className={styles.warningText}>
                {totalCount} non-printable character{totalCount > 1 ? 's' : ''} detected
              </span>
            </div>
            {this.state.showDetails && (
              <div className={styles.detailsPanel}>
                <div className={styles.charList}>
                  {chars.map(({ label, code, count, positions }, i) => (
                    <div key={i} className={styles.charItem}>
                      <span className={styles.charLabel}>{label}</span>
                      <span className={styles.charCode}>{code}</span>
                      {count > 1 && <span className={styles.charCount}>×{count}</span>}
                      <span className={styles.charPositions}>
                        @ {positions.length <= 5 ? positions.join(', ') : `${positions.slice(0, 5).join(', ')}...`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
