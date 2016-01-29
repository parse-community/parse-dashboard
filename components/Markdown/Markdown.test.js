jest.dontMock('./Markdown.react');

import React     from 'react';
import ReactDOM  from 'react-dom';
import TestUtils from 'react-addons-test-utils';

const Markdown = require('./Markdown.react');

describe('Markdown', () => {
  it('can render examples', () => {
    jest.dontMock('./Markdown.example');
    const example = require('./Markdown.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
