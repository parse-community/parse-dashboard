/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Editor from 'react-simple-code-editor';
import PropTypes from 'lib/PropTypes';
import {highlight, languages} from 'prismjs/components/prism-core';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import './CodeEditor.scss';

export default class CodeEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {code: ''};
    this.id = `EDITOR-${Math.floor(Math.random() * 1000)}`
  }

  get value() {
    return document.querySelector(`#${this.id}`).value;
  }

  set value(code) {
    this.setState({code});
  }

  render() {
    const {className, placeHolder, id = this.id} = this.props;

    return (
      <pre style={{margin: 0}} className={`${className} line-numbers language-javascript`}>
        <Editor
          placeholder={placeHolder || ''}
          value={this.state.code}
          onValueChange={code => this.setState({code})}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          textareaId={id}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            minHeight: 550,
            height: '100%'
          }}
        />
      </pre>
    )
  }
}

CodeEditor.propTypes = {
  id: PropTypes.string.describe('Text area element id to be queried afterwards'),
  className: PropTypes.string.describe('CSS classes'),
  placeHolder: PropTypes.string.describe('Code place holder')
};
