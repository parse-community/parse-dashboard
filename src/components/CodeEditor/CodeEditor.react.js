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

    this.state = {code: ''}
  }

  render() {
    return (
      <pre style={{margin: 0}} className={`${this.props.className} line-numbers language-javascript`}>
        <Editor
          placeholder={this.props.placeHolder || ''}
          value={this.state.code}
          onValueChange={code => this.setState({code})}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
        />
      </pre>
    )
  }
}

CodeEditor.propTypes = {
  className: PropTypes.string.describe('CSS classes'),
  placeHolder: PropTypes.string.describe('Code place holder')
};
