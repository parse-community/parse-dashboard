/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React    from 'react';
import CodeTree from 'components/CodeTree/CodeTree.react';

class Demo extends React.Component {
  constructor() {
    super();
    this.state = { value: null };
  }

  render() {
    return <CodeTree />
  }
}

export const component = CodeTree;

export const demos = [
  {
    name: 'Code Tree',
    render: () => ( <Demo /> )
  }
];
