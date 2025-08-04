/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Editor from 'react-ace';
import PropTypes from '../../lib/PropTypes';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/snippets/javascript';
import 'ace-builds/src-noconflict/ext-language_tools';

// Disable web workers to prevent MIME type errors
import ace from 'ace-builds/src-noconflict/ace';

// Configure ACE to disable workers globally
ace.config.set('useWorker', false);
ace.config.set('loadWorkerFromBlob', false);
ace.config.set('workerPath', false);

// Also set the base path to prevent worker loading attempts
ace.config.set('basePath', '/bundles');
ace.config.set('modePath', '/bundles');
ace.config.set('themePath', '/bundles');

export default class CodeEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      code: this.props.defaultValue || '',
    };
  }

  get value() {
    return this.state.code;
  }

  set value(code) {
    this.setState({ code });
  }

  render() {
    const { fontSize = 18, theme = 'monokai' } = this.props;
    const { code } = this.state;

    return (
      <Editor
        mode="javascript"
        theme={theme}
        onChange={value => this.setState({ code: value })}
        fontSize={fontSize}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        width="100%"
        value={code}
        enableBasicAutocompletion={true}
        enableLiveAutocompletion={true}
        enableSnippets={false}
        tabSize={2}
        style={{
          backgroundColor: '#202020'
        }}
        setOptions={{
          useWorker: false, // Disable web workers to prevent MIME type errors
          wrap: true,
          foldStyle: 'markbegin',
          enableMultiselect: true,
          // Additional worker-related options
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: false,
        }}
        editorProps={{
          $blockScrolling: Infinity, // Disable annoying warning
          $useWorker: false, // Additional worker disable
        }}
        commands={[]} // Disable any commands that might trigger worker loading
      />
    );
  }
}

CodeEditor.propTypes = {
  fontSize: PropTypes.number.describe('Font size of the editor'),
  defaultValue: PropTypes.string.describe('Default Code'),
  theme: PropTypes.string.describe('Theme for the editor'),
};
