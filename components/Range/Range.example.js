/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Range    from 'components/Range/Range.react';
import React    from 'react';

class RangeWrapper extends React.Component {
  constructor() {
    super();
    this.state = { value: 50 };
  }

  render() {
    return <Range {...this.props} value={this.state.value} onChange={(value) => this.setState({ value })} />;
  }
}

export const component = Range;

export const demos = [
  {
    name: 'Basic Range',
    render: () => (
      <RangeWrapper min={0} max={100} width={200} />
    )
  }, {
    name: 'Range with tracker',
    render: () => (
      <RangeWrapper track={true} min={0} max={100} width={200} />
    ),
  }, {
    name: 'Step by 10',
    render: () => (
      <RangeWrapper track={true} min={0} max={100} width={200} step={10} />
    ),
  }, {
    name: 'Different colors',
    render: () => (
      <RangeWrapper color='#DB37EC' track={true} min={0} max={100} width={200} />
    ),
  }, {
    name: 'Tracker units',
    render: () => (
      <RangeWrapper track={true} units={'req/s'} min={0} max={100} width={200} />
    ),
  }, {
    name: 'Complex tracker units',
    render: () => (
      <RangeWrapper track={true} units={(value) => {
        return value + 'req/s & ' + Math.floor((value-10)/20) + ' jobs';
      }} min={0} max={100} width={200} step={10} />
    ),
  },
];
