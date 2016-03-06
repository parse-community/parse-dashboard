/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import Prism     from 'prismjs';

import './CodeSnippet.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';

export default class CodeSnippet extends React.Component {
  componentDidMount() {
    this._highlight();
  }

  componentDidUpdate() {
    this._highlight();
  }

  _highlight() {
    Prism.highlightElement(this.refs.code);
  }

  render() {
    let { fullPage = true, lineNumbers = true } = this.props;
    let classes = ['language-' + this.props.language];
    if (lineNumbers) {
      classes.push('line-numbers');
    }
    let pageStyle = fullPage ? { minHeight: 'calc(100vh - 96px)'} : {};
    return (
      <pre style={{ margin: 0, ...pageStyle}} className={classes.join(' ')}>
        <code style={pageStyle} ref='code'>{this.props.source}</code>
      </pre>
    );
  }
}

CodeSnippet.propTypes = {
  source: PropTypes.string.isRequired.describe(
    'The source code to be rendered with syntax-highlighting.'
  ),
  language: PropTypes.string.describe(
    'The programming language of the snippet.'
  ),
  fullPage: PropTypes.bool.describe(
    'Pass false if this component doesn\'t need to fill the whole page.'
  ),
  lineNumbers: PropTypes.bool.describe(
    'Pass false if this component doesn\'t need to print line numbers.'
  )
};
