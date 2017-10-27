/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/Button/Button.react');

import React     from 'react';
import TestUtils from 'react-addons-test-utils';

const Button = require('../../components/Button/Button.react');

describe('Button', () => {
  it('has a default state', () => {
    const shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button value='A button' />);
    const component = shallowRenderer.getRenderOutput();
    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable');
    expect(component.props.children.type).toBe('span');
    expect(component.props.children.props.children).toBe('A button');
  });

  it('can be primary', () => {
    const shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button primary={true} value='A button' />);
    const component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable primary');
  });

  it('can be colored', () => {
    const shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button color='red' value='A button' />);
    const component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable red');
  });

  it('can be colored and primary', () => {
    const shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button color='red' primary={true} value='A button' />);
    const component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable primary red');
  });

  it('can be disabled', () => {
    const shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button color='red' disabled={true} value='A button' />);
    const component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable disabled');
  });

  it('special-cases white disabled buttons', () => {
    const shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button color='white' disabled={true} value='A button' />);
    const component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable disabled white');
  });

  it('can indidate progress', () => {
    const shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button progress={true} value='A button' />);
    const component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable progress');
  });

  it('can override width', () => {
    const shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button width='300px' value='A button' />);
    const component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.style.width).toBe('300px');
  });
});
