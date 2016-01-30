jest.dontMock('../../components/Button/Button.react');

import React     from 'react';
import ReactDOM  from 'react-dom';
import TestUtils from 'react-addons-test-utils';

var Button = require('../../components/Button/Button.react');

describe('Button', () => {
  it('has a default state', () => {
    var shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button value='A button' />);
    var component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable');
    expect(component.props.children.type).toBe('span');
    expect(component.props.children.props.children).toBe('A button');
  });

  it('can be primary', () => {
    var shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button primary={true} value='A button' />);
    var component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable primary');
  });

  it('can be colored', () => {
    var shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button color='red' value='A button' />);
    var component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable red');
  });

  it('can be colored and primary', () => {
    var shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button color='red' primary={true} value='A button' />);
    var component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable primary red');
  });

  it('can be disabled', () => {
    var shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button color='red' disabled={true} value='A button' />);
    var component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable disabled');
  });

  it('special-cases white disabled buttons', () => {
    var shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button color='white' disabled={true} value='A button' />);
    var component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable disabled white');
  });

  it('can indidate progress', () => {
    var shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button progress={true} value='A button' />);
    var component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.className).toBe('button unselectable progress');
  });

  it('can override width', () => {
    var shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(<Button width='300px' value='A button' />);
    var component = shallowRenderer.getRenderOutput();

    expect(component.type).toBe('a');
    expect(component.props.style.width).toBe('300px');
  });
});
