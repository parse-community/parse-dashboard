/**
 * @jest-environment jsdom
 */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../dashboard/Data/Browser/EditRowDialog.react');
jest.mock('../../dashboard/Data/Browser/ObjectPickerDialog.react', () => ({
  __esModule: true,
  default: () => null,
}));

import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
const EditRowDialog = require('../../dashboard/Data/Browser/EditRowDialog.react').default;

function findElements(node, predicate, found = []) {
  if (Array.isArray(node)) {
    node.forEach(child => findElements(child, predicate, found));
    return found;
  }
  if (!node || typeof node !== 'object' || !node.props) {
    return found;
  }
  if (predicate(node)) {
    found.push(node);
  }
  Object.keys(node.props).forEach(key => {
    findElements(node.props[key], predicate, found);
  });
  return found;
}

function render(selectedObject, updateRow = () => {}) {
  const renderer = new ShallowRenderer();
  renderer.render(
    <EditRowDialog
      className="TestClass"
      columns={[{ name: 'photo', type: 'File' }]}
      schema={{}}
      useMasterKey={false}
      selectedObject={selectedObject}
      updateRow={updateRow}
      onClose={() => {}}
    />
  );
  return renderer.getRenderOutput();
}

const fileStub = () => ({ url: () => undefined, name: () => 'photo.png' });

describe('EditRowDialog File field delete control (issue #1832)', () => {
  it('renders a "Delete file" control when a file is present', () => {
    const output = render({ row: 0, id: 'abc', photo: fileStub() });
    const pills = findElements(output, n => n.props.value === 'Delete file');
    expect(pills.length).toBe(1);
  });

  it('unsets the file via updateRow when the delete control is clicked', () => {
    const updateRow = jest.fn();
    const output = render({ row: 0, id: 'abc', photo: fileStub() }, updateRow);
    const pill = findElements(output, n => n.props.value === 'Delete file')[0];
    pill.props.onClick();
    expect(updateRow).toHaveBeenCalledWith(0, 'photo', undefined);
  });

  it('does not render a "Delete file" control when there is no file', () => {
    const output = render({ row: 0, id: 'abc' });
    const pills = findElements(output, n => n.props.value === 'Delete file');
    expect(pills.length).toBe(0);
  });
});
