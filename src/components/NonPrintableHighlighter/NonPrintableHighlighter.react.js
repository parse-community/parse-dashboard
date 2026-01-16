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
  '\u202F': 'NNBSP',
  '\u205F': 'MMSP',
  '\u3000': 'IDSP',
  '\uFEFF': 'BOM',
};

// Regex to match non-printable characters (excluding newline \x0A which is allowed in multiline)
const NON_PRINTABLE_REGEX = /[\x00-\x09\x0B-\x1F\x7F\u00A0\u2000-\u200F\u2028\u2029\u202F\u205F\u3000\uFEFF]/g;

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
 * Get a list of non-printable characters found in a string with counts
 * Returns { totalCount, chars: [{ char, label, code, count }] }
 */
export function getNonPrintableChars(str) {
  if (!str || typeof str !== 'string') {
    return { totalCount: 0, chars: [] };
  }
  const matches = str.match(NON_PRINTABLE_REGEX);
  if (!matches) {
    return { totalCount: 0, chars: [] };
  }

  const countMap = new Map();
  for (const char of matches) {
    countMap.set(char, (countMap.get(char) || 0) + 1);
  }

  const chars = [];
  for (const [char, count] of countMap) {
    const label = NON_PRINTABLE_CHARS[char] || `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`;
    chars.push({ char, label, code: `0x${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`, count });
  }

  return { totalCount: matches.length, chars };
}

/**
 * NonPrintableHighlighter component
 * Displays a warning indicator when non-printable characters are detected in the value
 */
export default class NonPrintableHighlighter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
    };
  }

  render() {
    const { value, children } = this.props;
    const { totalCount, chars } = getNonPrintableChars(value);
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
                {totalCount} non-printable char{totalCount > 1 ? 's' : ''} detected
              </span>
            </div>
            {this.state.showDetails && (
              <div className={styles.detailsPanel}>
                <div className={styles.charList}>
                  {chars.map(({ label, code, count }, i) => (
                    <div key={i} className={styles.charItem}>
                      <span className={styles.charLabel}>{label}</span>
                      <span className={styles.charCode}>{code}</span>
                      {count > 1 && <span className={styles.charCount}>×{count}</span>}
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
