jest.dontMock('../../dashboard/Data/Config/ConfigConflictDiff.react');

import React from 'react';
import renderer from 'react-test-renderer';
const ConfigConflictDiff = require('../../dashboard/Data/Config/ConfigConflictDiff.react').default;

// Mock the diff library
jest.mock('diff', () => ({
  diffLines: jest.fn((oldStr, newStr) => {
    // Simple mock: if strings differ, return removed + added
    if (oldStr === newStr) {
      return [{ value: oldStr }];
    }
    return [
      { value: oldStr, removed: true },
      { value: newStr, added: true },
    ];
  }),
  diffChars: jest.fn((oldStr, newStr) => {
    if (oldStr === newStr) {
      return [{ value: oldStr }];
    }
    return [
      { value: oldStr, removed: true },
      { value: newStr, added: true },
    ];
  }),
}));

describe('ConfigConflictDiff', () => {
  it('renders a diff for changed string values', () => {
    const component = renderer.create(
      <ConfigConflictDiff
        serverValue="hello"
        userValue="world"
        type="String"
      />
    );
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
    // Should have table child
    expect(tree.children.length).toBe(1);
  });

  it('renders a diff for changed object values', () => {
    const component = renderer.create(
      <ConfigConflictDiff
        serverValue={{ key: 'old' }}
        userValue='{"key": "new"}'
        type="Object"
      />
    );
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders empty state when values are identical', () => {
    const component = renderer.create(
      <ConfigConflictDiff
        serverValue=""
        userValue=""
        type="String"
      />
    );
    const tree = component.toJSON();
    expect(tree.type).toBe('div');
    expect(tree.children[0]).toContain('identical');
  });

  it('renders a diff for boolean values', () => {
    const component = renderer.create(
      <ConfigConflictDiff
        serverValue={true}
        userValue={false}
        type="Boolean"
      />
    );
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders a diff for number values', () => {
    const component = renderer.create(
      <ConfigConflictDiff
        serverValue={42}
        userValue={99}
        type="Number"
      />
    );
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });
});
