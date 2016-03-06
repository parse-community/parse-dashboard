/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React         from 'react';
import SegmentSelect from 'components/SegmentSelect/SegmentSelect.react';

export const component = SegmentSelect;

class Demo extends React.Component {
  constructor() {
    super();
    this.state = {
      current: null
    };
  }

  render() {
    return (
      <SegmentSelect
        values={['iOS', 'Android', 'OS X', 'Windows']}
        current={this.state.current}
        onChange={(current) => this.setState({ current })} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <Demo />
    )
  }
];
