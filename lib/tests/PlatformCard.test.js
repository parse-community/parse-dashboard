jest.dontMock('../../components/PlatformCard/PlatformCard.react');

import React     from 'react';
import ReactDOM  from 'react-dom';
import TestUtils from 'react-addons-test-utils';

const PlatformCard = require('../../components/PlatformCard/PlatformCard.react');

describe('PlatformCard', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/PlatformCard/PlatformCard.example');
    const example = require('../../components/PlatformCard/PlatformCard.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
});
