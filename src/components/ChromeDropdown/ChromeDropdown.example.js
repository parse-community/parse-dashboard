/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ChromeDropdown from 'components/ChromeDropdown/ChromeDropdown.react';
import React          from 'react';

export const component = ChromeDropdown;

class DropdownDemo extends React.Component {
  constructor() {
    super();

    this.state = { color: 'Purple' };
  }

  render() {
    return (
      <ChromeDropdown
        value={this.state.color}
        color={this.state.color.toLowerCase()}
        onChange={(color) => this.setState({ color })}
        options={['Blue', 'Purple']} />
    );
  }
}

class DropdownDemo2 extends React.Component {
  constructor() {
    super();

    this.state = { color: 'Purple' };
  }

  render() {
    return (
      <ChromeDropdown
        placeholder={'Choose a color'}
        value={this.state.color}
        color={this.state.color.toLowerCase()}
        onChange={(color) => this.setState({ color })}
        options={['Blue', 'Purple']} />
    );
  }
}

class DropdownDemo3 extends React.Component {
  constructor() {
    super();

    this.state = { color: 'purple' };
  }

  render() {
    return (
      <ChromeDropdown
        placeholder={'Choose a color'}
        value={this.state.color}
        color={this.state.color}
        onChange={(color) => this.setState({ color })}
        options={[
          {
            key: 'blue',
            value: 'Blue'
          },
          {
            key: 'purple',
            value: 'Purple'
          }
        ]} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div>
        <DropdownDemo />
      </div>
    )
  },
  {
    name: 'ChromeDropdown with placeholder',
    render: () => (
      <div>
        <DropdownDemo2 />
      </div>
    )
  },
  {
    name: 'ChromeDropdown with object',
    render: () => (
      <div>
        <DropdownDemo3 />
      </div>
    )
  }
];
