/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React            from 'react';
import TrackVisibility  from 'components/TrackVisibility/TrackVisibility.react';

export const component = TrackVisibility;

class DemoTrackVisibility extends React.Component {
  constructor() {
    super();

    this.ref = React.createRef();

    ///[0.00...1.00]
    const thresholds = Array(101)
      .fill()
      .map((v, i) => Math.round(i) / 100);

    const callback = ([entry]) => {
      const ratio = entry.intersectionRatio;
      this.setState({ visibility: Math.round(ratio * 100) });
    };

    this.observer = new IntersectionObserver(callback, {
      root: this.ref.current,
      threshold: thresholds
    });

    this.state = {
        visibility: 0
    };
  }

  render() {
    
    return (
      <React.Fragment>
        <div>{'Yellow block is ' + this.state.visibility + '% visible'}</div>
        <div ref={this.ref} style={{ height: '420px', overflowY: 'scroll' }}>
          <div style={{ height: '420px', backgroundColor: '#00A34D' }}>
            {'Scroll down'}
          </div>
          <TrackVisibility observer={this.observer}>
            <div style={{ height: '140px', backgroundColor: '#F7EB00' }}/>
          </TrackVisibility>
          <div style={{ height: '420px', backgroundColor: '#EB2922' }}>
            {'Scroll up'}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export const demos = [
  {
    render: () => (
     <DemoTrackVisibility/>
    )
  }
];
