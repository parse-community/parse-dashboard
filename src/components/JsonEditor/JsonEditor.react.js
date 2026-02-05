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
  }

  componentDidMount() {
    this.syncScroll();
  }

  componentDidUpdate() {
    this.syncScroll();
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

  render() {
    const { value, placeholder, wordWrap = false } = this.props;

    const wrapStyle = wordWrap
      ? { whiteSpace: 'pre-wrap', wordWrap: 'break-word' }
      : { whiteSpace: 'pre' };

    return (
      <div className={styles.container}>
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
