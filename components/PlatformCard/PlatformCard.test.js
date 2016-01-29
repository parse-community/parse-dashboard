jest.dontMock('./PlatformCard.react');

import React     from 'react';
import ReactDOM  from 'react-dom';
import TestUtils from 'react-addons-test-utils';

const PlatformCard = require('./PlatformCard.react');

describe('PlatformCard', () => {
  it('can render examples', () => {
    jest.dontMock('./PlatformCard.example');
    const example = require('./PlatformCard.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
});
