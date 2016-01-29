#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..', '..', 'app', 'webpack', 'components');
const pigDir = path.join(__dirname, '..', '..', '..', 'app', 'webpack', 'PIG');

function padding(length) {
  let space = [];
  for (let i = 0; i < length; i++) {
    space[i] = ' ';
  }
  return space.join('');
}

function generateReact(name) {
  return (
`import React  from 'react';
import styles from 'components/${name}/${name}.scss';

export default class ${name} extends React.Component {
  constructor() {
    super();
  }

  render() {

  }
}
`);
}

function generateExample(name) {
  return (
`import React${padding(name.length - 5)} from 'react';
import ${name}${padding(5 - name.length)} from 'components/${name}/${name}.react';

export const component = ${name};

export const demos = [
  {
    name: 'Demo name',
    render: () => (
      <div>Demo content</div>
    )
  }
];
`);
}

function generateTest(name) {
  return (
`jest.dontMock('./${name}.react');

import React     from 'react';
import ReactDOM  from 'react-dom';
import TestUtils from 'react-addons-test-utils';

const ${name} = require('./${name}.react');

describe('${name}', () => {
  it('can render examples', () => {
    jest.dontMock('./${name}.example');
    const example = require('./${name}.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
`);
}

function updateComponentMap(name) {
  let numSpace = 1;
  if (name.length < 26) {
    numSpace = 26 - name.length;
  }

  let spaces = '';
  for (let i = 0; i<numSpace; i++) {
    spaces += ' ';
  }

  return (
`export let ${name}${spaces}= require('components/${name}/${name}.example');`
  );
}

// Begin generation script

let name = process.argv[2];

if (!name) {
  console.log([
    'No component name specified!',
    '',
    'Usage: npm run generate <name>',
    '',
    '  name - The name of the component you wish to create a scaffold for'
  ].join('\n'));
  return;
}

if (name[0] < 'A' || name[0] > 'Z') {
  console.log('Error: Component names should begin with a letter, and should be capitalized.');
  process.exit(1);
}

try {
  fs.statSync(path.join(rootDir, name));
  // If we don't error, the file exists
  console.log('Error: A component with that name already exists!');
  process.exit(1);
} catch (e) {}

try {
  fs.mkdirSync(path.join(rootDir, name));
  fs.writeFileSync(path.join(rootDir, name, `${name}.react.js`), generateReact(name));
  fs.writeFileSync(path.join(rootDir, name, `${name}.scss`), '');
  fs.writeFileSync(path.join(rootDir, name, `${name}.example.js`), generateExample(name));
  fs.writeFileSync(path.join(rootDir, name, `${name}.test.js`), generateTest(name));
  fs.appendFileSync(path.join(pigDir, 'ComponentsMap.js'), updateComponentMap(name));

  console.log(`Component ${name} created at ${path.join(rootDir, name)}.`);
} catch (e) {
  console.log('Error: Failed to create files.');
  process.exit(1);
}
