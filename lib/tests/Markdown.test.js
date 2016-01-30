jest.dontMock('../../components/Markdown/Markdown.react');

import React     from 'react';
import ReactDOM  from 'react-dom';
import TestUtils from 'react-addons-test-utils';

const Markdown = require('../../components/Markdown/Markdown.react');

describe('Markdown', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/Markdown/Markdown.example');
    const example = require('../../components/Markdown/Markdown.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
