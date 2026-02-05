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

    // Generate CSS custom properties for syntax colors
    const colorVars = Object.entries(syntaxColors)
      .filter(([, color]) => color)
      .map(([token, color]) => `--syntax-${token}: ${color};`)
      .join(' ');

    if (!colorVars) {
      return null;
    }

    // Return a style tag with scoped CSS overrides
    return (
      <style>{`
        .${styles.highlightLayer} .token.property { color: ${syntaxColors.property || '#005cc5'} !important; }
        .${styles.highlightLayer} .token.string { color: ${syntaxColors.string || '#000000'} !important; }
        .${styles.highlightLayer} .token.number { color: ${syntaxColors.number || '#098658'} !important; }
        .${styles.highlightLayer} .token.boolean { color: ${syntaxColors.boolean || '#d73a49'} !important; }
        .${styles.highlightLayer} .token.null { color: ${syntaxColors.null || '#d73a49'} !important; }
        .${styles.highlightLayer} .token.punctuation { color: ${syntaxColors.punctuation || '#24292e'} !important; }
        .${styles.highlightLayer} .token.operator { color: ${syntaxColors.operator || '#24292e'} !important; }
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
