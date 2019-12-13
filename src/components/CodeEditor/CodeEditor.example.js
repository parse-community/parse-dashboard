/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import CodeEditor from 'components/CodeEditor/CodeEditor.react';

export const component = CodeEditor;

export const demos = [
  {
    name: 'Simple code editor (only JS support)',
    render: () => (
      <CodeEditor placeHolder={'//I am editable, try change me!'} id='example1'/>
    )
  }
];
