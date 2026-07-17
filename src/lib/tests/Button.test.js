/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/Button/Button.react');

import React from 'react';
import renderer, { act } from 'react-test-renderer';
const Button = require('../../components/Button/Button.react').default;

// React 19's react-test-renderer renders concurrently, so create() must run
// inside act() for toJSON() to return the flushed tree instead of null.
function renderToJSON(element) {
  let testRenderer;
  act(() => {
    testRenderer = renderer.create(element);
  });
  return testRenderer.toJSON();
}

describe('Button', () => {
  it('has a default state', () => {
    const component = renderToJSON(<Button value="A button" />);
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable');
    expect(component.children[0].type).toBe('span');
    expect(component.children[0].children[0]).toBe('A button');
  });

  it('can be primary', () => {
    const component = renderToJSON(<Button primary={true} value="A button" />);

    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable primary');
  });

  it('can be colored', () => {
    const component = renderToJSON(<Button color="red" value="A button" />);
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable red');
  });

  it('can be colored and primary', () => {
    const component = renderToJSON(<Button color="red" primary={true} value="A button" />);
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable primary red');
  });

  it('can be disabled', () => {
    const component = renderToJSON(<Button color="red" disabled={true} value="A button" />);
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable disabled');
  });

  it('special-cases white disabled buttons', () => {
    const component = renderToJSON(<Button color="white" disabled={true} value="A button" />);
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable disabled white');
  });

  it('can indidate progress', () => {
    const component = renderToJSON(<Button progress={true} value="A button" />);
    expect(component.type).toBe('button');
    expect(component.props.className).toBe('button unselectable progress');
  });

  it('can override width', () => {
    const component = renderToJSON(<Button width="300px" value="A button" />);
    expect(component.type).toBe('button');
    expect(component.props.style.width).toBe('300px');
  });
});
