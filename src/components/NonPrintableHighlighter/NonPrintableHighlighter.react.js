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
  // C0 Control Characters (0x00-0x1F)
  '\x00': 'NUL', // Null
  '\x01': 'SOH', // Start of Heading
  '\x02': 'STX', // Start of Text
  '\x03': 'ETX', // End of Text
  '\x04': 'EOT', // End of Transmission
  '\x05': 'ENQ', // Enquiry
  '\x06': 'ACK', // Acknowledge
  '\x07': 'BEL', // Bell
  '\x08': 'BS', // Backspace
  '\x09': 'TAB', // Horizontal Tab
  '\x0A': 'LF', // Line Feed
  '\x0B': 'VT', // Vertical Tab
  '\x0C': 'FF', // Form Feed
  '\x0D': 'CR', // Carriage Return
  '\x0E': 'SO', // Shift Out
  '\x0F': 'SI', // Shift In
  '\x10': 'DLE', // Data Link Escape
  '\x11': 'DC1', // Device Control 1
  '\x12': 'DC2', // Device Control 2
  '\x13': 'DC3', // Device Control 3
  '\x14': 'DC4', // Device Control 4
  '\x15': 'NAK', // Negative Acknowledge
  '\x16': 'SYN', // Synchronous Idle
  '\x17': 'ETB', // End of Transmission Block
  '\x18': 'CAN', // Cancel
  '\x19': 'EM', // End of Medium
  '\x1A': 'SUB', // Substitute
  '\x1B': 'ESC', // Escape
  '\x1C': 'FS', // File Separator
  '\x1D': 'GS', // Group Separator
  '\x1E': 'RS', // Record Separator
  '\x1F': 'US', // Unit Separator
  '\x7F': 'DEL', // Delete

  // Unicode Space Characters
  '\u00A0': 'NBSP', // No-Break Space
  '\u2000': 'NQSP', // En Quad Space
  '\u2001': 'MQSP', // Em Quad Space
  '\u2002': 'ENSP', // En Space
  '\u2003': 'EMSP', // Em Space
  '\u2004': '3MSP', // Three-Per-Em Space
  '\u2005': '4MSP', // Four-Per-Em Space
  '\u2006': '6MSP', // Six-Per-Em Space
  '\u2007': 'FSP', // Figure Space
  '\u2008': 'PSP', // Punctuation Space
  '\u2009': 'THSP', // Thin Space
  '\u200A': 'HSP', // Hair Space

  // Zero-Width Characters
  '\u200B': 'ZWSP', // Zero Width Space
  '\u200C': 'ZWNJ', // Zero Width Non-Joiner
  '\u200D': 'ZWJ', // Zero Width Joiner

  // Directional Formatting Characters
  '\u200E': 'LRM', // Left-to-Right Mark
  '\u200F': 'RLM', // Right-to-Left Mark

  // Line/Paragraph Separators
  '\u2028': 'LS', // Line Separator
  '\u2029': 'PS', // Paragraph Separator

  // BiDi Control Characters (security-sensitive - "Trojan Source" attacks)
  '\u202A': 'LRE', // Left-to-Right Embedding
  '\u202B': 'RLE', // Right-to-Left Embedding
  '\u202C': 'PDF', // Pop Directional Formatting
  '\u202D': 'LRO', // Left-to-Right Override
  '\u202E': 'RLO', // Right-to-Left Override
  '\u202F': 'NNBSP', // Narrow No-Break Space
  '\u2066': 'LRI', // Left-to-Right Isolate
  '\u2067': 'RLI', // Right-to-Left Isolate
  '\u2068': 'FSI', // First Strong Isolate
  '\u2069': 'PDI', // Pop Directional Isolate

  // General Punctuation Format Characters
  '\u2060': 'WJ', // Word Joiner
  '\u2061': 'FA', // Function Application
  '\u2062': 'IT', // Invisible Times
  '\u2063': 'IS', // Invisible Separator
  '\u2064': 'IP', // Invisible Plus
  '\u205F': 'MMSP', // Medium Mathematical Space

  // Deprecated Format Characters
  '\u206A': 'ISS', // Inhibit Symmetric Swapping
  '\u206B': 'ASS', // Activate Symmetric Swapping
  '\u206C': 'IAFS', // Inhibit Arabic Form Shaping
  '\u206D': 'AAFS', // Activate Arabic Form Shaping
  '\u206E': 'NADS', // National Digit Shapes
  '\u206F': 'NODS', // Nominal Digit Shapes

  // Other Special Characters
  '\u3000': 'IDSP', // Ideographic Space
  '\uFEFF': 'BOM', // Byte Order Mark

  // Interlinear Annotation Characters
  '\uFFF9': 'IAA', // Interlinear Annotation Anchor
  '\uFFFA': 'IAS', // Interlinear Annotation Separator
  '\uFFFB': 'IAT', // Interlinear Annotation Terminator
  '\uFFFC': 'OBJ', // Object Replacement Character
};

// Build regex
const NON_PRINTABLE_REGEX = new RegExp(
  '[' +
    Object.keys(NON_PRINTABLE_CHARS)
      .map(char => {
        const code = char.charCodeAt(0);
        if (code < 0x100) {
          return '\\x' + code.toString(16).padStart(2, '0');
        }
        return '\\u' + code.toString(16).padStart(4, '0');
      })
      .join('') +
    ']',
  'g'
);

/**
 * Check if a string contains non-printable characters
 */
export function hasNonPrintableChars(str) {
  if (!str || typeof str !== 'string') {
    return false;
  }
  NON_PRINTABLE_REGEX.lastIndex = 0;
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
      positionMap.get(char).push(i);
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
 * Returns array of { value, path } where path is the JSON path (e.g., "[0]", "key", "key[0].nested")
 */
function extractStringValuesWithPaths(obj, path = '') {
  const results = [];

  if (typeof obj === 'string') {
    results.push({ value: obj, path: path || 'root' });
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      results.push(...extractStringValuesWithPaths(obj[i], itemPath));
    }
  } else if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const keyPath = path ? `${path}.${key}` : key;
      results.push(...extractStringValuesWithPaths(obj[key], keyPath));
    }
  }

  return results;
}

/**
 * Get non-printable characters from JSON string values only
 * Parses the JSON and only checks string values within it
 * Locations show the JSON path and character position (e.g., "[1] @ 5" or "name @ 3")
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

  const stringValuesWithPaths = extractStringValuesWithPaths(parsed);

  // Map to track: char -> array of { path, position } objects
  const charLocationMap = new Map();
  let totalCount = 0;

  for (const { value, path } of stringValuesWithPaths) {
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (NON_PRINTABLE_REGEX.test(char)) {
        NON_PRINTABLE_REGEX.lastIndex = 0;
        if (!charLocationMap.has(char)) {
          charLocationMap.set(char, []);
        }
        charLocationMap.get(char).push({ path, position: i });
        totalCount++;
      }
    }
  }

  const chars = [];
  for (const [char, locationsList] of charLocationMap) {
    const label =
      NON_PRINTABLE_CHARS[char] ||
      `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

    // Group positions by path and format as "path @ pos1, pos2, ..."
    const pathPositions = new Map();
    for (const { path, position } of locationsList) {
      if (!pathPositions.has(path)) {
        pathPositions.set(path, []);
      }
      pathPositions.get(path).push(position);
    }

    const locations = [];
    for (const [path, positions] of pathPositions) {
      locations.push(`${path} @ ${positions.join(', ')}`);
    }

    chars.push({
      char,
      label,
      code: `0x${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
      count: locationsList.length,
      locations,
    });
  }

  return { totalCount, chars };
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
                  {chars.map(({ label, code, count, positions, locations }, i) => (
                    <div key={i} className={styles.charItem}>
                      <span className={styles.charLabel}>{label}</span>
                      <span className={styles.charCode}>{code}</span>
                      {count > 1 && <span className={styles.charCount}>×{count}</span>}
                      {positions && (
                        <span className={styles.charPositions}>
                          @ {positions.length <= 5 ? positions.join(', ') : `${positions.slice(0, 5).join(', ')}...`}
                        </span>
                      )}
                      {locations && (
                        <span className={styles.charPositions}>
                          in {locations.length <= 3 ? locations.join(', ') : `${locations.slice(0, 3).join(', ')}...`}
                        </span>
                      )}
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
