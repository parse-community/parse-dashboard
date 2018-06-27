#!/usr/bin/env node
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'src','components');
const pigDir = path.join(__dirname, '..', 'src','parse-interface-guide');
const testDir = path.join(__dirname, '..', 'src','lib', 'tests');

function padding(length) {
  let space = [];
  for (let i = 0; i < length; i++) {
    space[i] = ' ';
  }
  return space.join('');
}

function generateReact(name) {
  return (
`/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes                        from 'lib/PropTypes';
import React                            from 'react';
import styles                           from 'components/${name}/${name}.scss';

let ${name} = ({prop1}) => {
  return <div />;
}

${name}.propTypes = {
  prop1: PropTypes.string.isRequired.describe('Replace me with the actual props'),
}
`);
}

function generateExample(name) {
  return (
`/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React${padding(name.length - 5)} from 'react';
import ${name}${padding(5 - name.length)} f`+ 'rom' +` 'components/${name}/${name}.react';

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
`/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/${name}/${name}.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';

const ${name} = require('../../components/${name}/${name}.react');

describe('${name}', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/${name}/${name}.example');
    const example = require('../../components/${name}/${name}.example');
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
`export let ${name}${spaces}= require('components/${name}/${name}.example');\n`
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
  process.exit(1);
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
} catch (e) {/**/}

try {
  fs.mkdirSync(path.join(rootDir, name));
  fs.writeFileSync(path.join(rootDir, name, `${name}.react.js`), generateReact(name));
  fs.writeFileSync(path.join(rootDir, name, `${name}.scss`), '');
  fs.writeFileSync(path.join(rootDir, name, `${name}.example.js`), generateExample(name));
  fs.writeFileSync(path.join(testDir, `${name}.test.js`), generateTest(name));
  fs.appendFileSync(path.join(pigDir, 'ComponentsMap.js'), updateComponentMap(name));

  console.log(`Component ${name} created at ${path.join(rootDir, name)}.`);
} catch (e) {
  console.log('Error: Failed to create files.');
  process.exit(1);
}
