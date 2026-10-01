/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/Button/Button.react');

import React from 'react';
import { renderComponent } from './renderWithAct';
const Button = require('../../components/Button/Button.react').default;

describe('Button', () => {
  it('has a default state', () => {
    const component = renderComponent(<Button value="A button" />).toJSON();
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable');
    expect(component.children[0].type).toBe('span');
    expect(component.children[0].children[0]).toBe('A button');
  });

  it('can be primary', () => {
    const component = renderComponent(<Button primary={true} value="A button" />).toJSON();

    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable primary');
  });

  it('can be colored', () => {
    const component = renderComponent(<Button color="red" value="A button" />).toJSON();
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable red');
  });

  it('can be colored and primary', () => {
    const component = renderComponent(<Button color="red" primary={true} value="A button" />).toJSON();
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable primary red');
  });

  it('can be disabled', () => {
    const component = renderComponent(<Button color="red" disabled={true} value="A button" />).toJSON();
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable disabled');
  });

  it('special-cases white disabled buttons', () => {
    const component = renderComponent(<Button color="white" disabled={true} value="A button" />).toJSON();
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable disabled white');
  });

  it('can indidate progress', () => {
    const component = renderComponent(<Button progress={true} value="A button" />).toJSON();
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable progress');
  });

  it('can override width', () => {
    const component = renderComponent(<Button width="300px" value="A button" />).toJSON();
    expect(component.type).toBe('button');
    expect(component.props.style.width).toBe('300px');
  });
});
