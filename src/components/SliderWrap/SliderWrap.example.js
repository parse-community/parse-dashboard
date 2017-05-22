/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Directions } from 'lib/Constants';
import React                   from 'react';
import SliderWrap              from 'components/SliderWrap/SliderWrap.react';

let contentStyle = {
  background: '#67c0ff',
  color: '#ffffff',
  width: '200px',
  height: '60px',
  lineHeight: '60px',
  fontSize: '16px',
  textAlign: 'center'
};

class Toggler extends React.Component {
  constructor(props) {
    super();
    this.state = { expanded: !!props.expanded };
  }

  toggle() {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  render() {
    let { children, ...otherProps } = this.props;

    return (
      <div style={{ padding: '10px 0', width: '400px' }}>
        <a onClick={this.toggle.bind(this)}>{this.state.expanded ? 'Close' : 'Open'}</a>
        <SliderWrap {...otherProps} expanded={this.state.expanded}>
          <div style={contentStyle}>
            {children}
          </div>
        </SliderWrap>
      </div>
    );
  }
}

export const component = SliderWrap;

export const demos = [
  {
    render: () => (
      <div>
        <Toggler expanded={true}>Open your mind</Toggler>
        <Toggler expanded={false}>Closed for renovations</Toggler>
        <Toggler expanded={true} direction={Directions.RIGHT}>To the right, to the right</Toggler>
        <Toggler expanded={true} direction={Directions.LEFT}>In the box to the left</Toggler>
        <Toggler expanded={false} direction={Directions.BOTTOM_RIGHT}>Zooooooom</Toggler>
      </div>
    )
  }
];
