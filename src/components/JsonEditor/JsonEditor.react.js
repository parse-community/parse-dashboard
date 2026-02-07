/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import styles from './JsonEditor.scss';

/**
 * JsonEditor - An editable JSON editor with syntax highlighting using Prism.js
 *
 * Uses overlay technique: a transparent textarea for input layered over
 * a syntax-highlighted code display.
 */
export default class JsonEditor extends React.Component {
  constructor(props) {
    super(props);
    this.textareaRef = React.createRef();
    this.preRef = React.createRef();
    this.pendingCursorPosition = null;
  }

  componentDidMount() {
    this.syncScroll();
    // Use native event listener for keydown to handle Enter auto-indent
    if (this.textareaRef.current) {
      this.textareaRef.current.addEventListener('keydown', this.handleKeyDown);
    }
  }

  componentDidUpdate() {
    this.syncScroll();
    // Restore cursor position after key insertion
    if (this.pendingCursorPosition !== null && this.textareaRef.current) {
      this.textareaRef.current.selectionStart = this.pendingCursorPosition;
      this.textareaRef.current.selectionEnd = this.pendingCursorPosition;
      this.pendingCursorPosition = null;
    }
  }

  componentWillUnmount() {
    if (this.textareaRef.current) {
      this.textareaRef.current.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  syncScroll = () => {
    // Sync scroll position between textarea and highlighted code
    if (this.textareaRef.current && this.preRef.current) {
      const textarea = this.textareaRef.current;
      const pre = this.preRef.current;
      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
    }
  };

  handleScroll = () => {
    this.syncScroll();
  };

  handleChange = (e) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(e.target.value);
    }
  };

  handleKeyDown = (e) => {
    // Enter key - auto-indent to match current line
    // Skip if Cmd/Ctrl is pressed (let it bubble up for modal confirm)
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();

      const textarea = this.textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = this.props.value || '';

      // Find the start of the current line
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const line = value.substring(lineStart, start);
      // Get leading whitespace from current line
      const indent = line.match(/^[\t ]*/)[0];

      const newValue = value.substring(0, start) + '\n' + indent + value.substring(end);
      this.pendingCursorPosition = start + 1 + indent.length;

      if (this.props.onChange) {
        this.props.onChange(newValue);
      }
    }
  };

  getHighlightedCode() {
    const { value } = this.props;
    if (!value) {
      return '';
    }
    try {
      return Prism.highlight(value, Prism.languages.json, 'json');
    } catch {
      // If highlighting fails, return escaped HTML
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  getSyntaxColorStyles() {
    const { syntaxColors } = this.props;
    if (!syntaxColors) {
      return null;
    }

    // Safe default colors for each token type
    const defaults = {
      property: '#005cc5',
      string: '#000000',
      number: '#098658',
      boolean: '#d73a49',
      null: '#d73a49',
      punctuation: '#24292e',
      operator: '#24292e',
    };

    // Validate hex color: only accept #RGB or #RRGGBB (case-insensitive)
    const isValidHexColor = (color) => {
      if (typeof color !== 'string') {
        return false;
      }
      return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
    };

    // Get sanitized color for a token, falling back to default if invalid
    const getSafeColor = (token) => {
      const color = syntaxColors[token];
      return isValidHexColor(color) ? color : defaults[token];
    };

    // Check if any custom colors are provided and valid
    const hasCustomColors = Object.keys(defaults).some(
      token => syntaxColors[token] && isValidHexColor(syntaxColors[token])
    );

    if (!hasCustomColors) {
      return null;
    }

    // Return a style tag with sanitized CSS overrides
    return (
      <style>{`
        .${styles.highlightLayer} .token.property { color: ${getSafeColor('property')} !important; }
        .${styles.highlightLayer} .token.string { color: ${getSafeColor('string')} !important; }
        .${styles.highlightLayer} .token.number { color: ${getSafeColor('number')} !important; }
        .${styles.highlightLayer} .token.boolean { color: ${getSafeColor('boolean')} !important; }
        .${styles.highlightLayer} .token.null { color: ${getSafeColor('null')} !important; }
        .${styles.highlightLayer} .token.punctuation { color: ${getSafeColor('punctuation')} !important; }
        .${styles.highlightLayer} .token.operator { color: ${getSafeColor('operator')} !important; }
      `}</style>
    );
  }

  render() {
    const { value, placeholder, wordWrap = false } = this.props;

    const wrapStyle = wordWrap
      ? { whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word' }
      : { whiteSpace: 'pre' };

    return (
      <div className={styles.container}>
        {this.getSyntaxColorStyles()}
        <pre
          ref={this.preRef}
          className={styles.highlightLayer}
          style={wrapStyle}
          aria-hidden="true"
        >
          <code
            className="language-json"
            dangerouslySetInnerHTML={{ __html: this.getHighlightedCode() + '\n' }}
          />
        </pre>
        <textarea
          ref={this.textareaRef}
          className={styles.inputLayer}
          style={wrapStyle}
          value={value || ''}
          onChange={this.handleChange}
          onScroll={this.handleScroll}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
    );
  }
}
