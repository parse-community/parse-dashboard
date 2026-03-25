jest.dontMock('../../components/BrowserRow/BrowserRow.react');
jest.mock('idb-keyval');

import React from 'react';
import renderer from 'react-test-renderer';
const BrowserRow = require('../../components/BrowserRow/BrowserRow.react').default;

const defaultProps = {
  className: 'TestClass',
  columns: {
    objectId: { type: 'String' },
    name: { type: 'String' },
  },
  currentCol: undefined,
  isUnique: false,
  obj: {
    id: 'abc123',
    className: 'TestClass',
    attributes: { objectId: 'abc123', name: 'Test' },
    get: function(key) { return this.attributes[key]; },
  },
  order: [
    { name: 'objectId', width: 150, visible: true },
    { name: 'name', width: 150, visible: true },
  ],
  readOnlyFields: ['objectId'],
  row: 0,
  rowWidth: 330,
  showRowNumber: true,
  rowNumberWidth: 30,
  skip: 0,
  selection: {},
  selectRow: () => {},
  setCopyableValue: () => {},
  selectedObjectId: undefined,
  setSelectedObjectId: () => {},
  callCloudFunction: () => {},
  isPanelVisible: false,
  setCurrent: () => {},
  setEditing: () => {},
  setRelation: () => {},
  onEditSelectedRow: () => {},
  setContextMenu: () => {},
  onFilterChange: () => {},
  markRequiredFieldRow: undefined,
  onMouseDownRowCheckBox: () => {},
  onMouseUpRowCheckBox: () => {},
  onMouseOverRowCheckBox: () => {},
  onMouseOverRow: () => {},
  onPointerClick: () => {},
  onPointerCmdClick: () => {},
  rowValue: undefined,
  stickyLefts: [],
  freezeIndex: -1,
};

describe('BrowserRow', () => {
  describe('Row highlight', () => {
    it('should not apply highlight styles when isHighlighted is false', () => {
      const component = renderer
        .create(<BrowserRow {...defaultProps} isHighlighted={false} />)
        .toJSON();
      // Row div should not have highlight background
      expect(component.props.style.background).toBeUndefined();
    });

    it('should not apply highlight styles when isHighlighted is undefined', () => {
      const component = renderer
        .create(<BrowserRow {...defaultProps} />)
        .toJSON();
      expect(component.props.style.background).toBeUndefined();
    });

    it('should apply subtle blue tint to row div when isHighlighted is true', () => {
      const component = renderer
        .create(<BrowserRow {...defaultProps} isHighlighted={true} />)
        .toJSON();
      expect(component.props.style.background).toBe('#eef4fb');
    });

    it('should apply stronger blue to checkbox cell when isHighlighted is true', () => {
      const component = renderer
        .create(<BrowserRow {...defaultProps} isHighlighted={true} />)
        .toJSON();
      // First child is the checkbox span
      const checkboxCell = component.children[0];
      expect(checkboxCell.props.style.background).toBe('#d6e4f0');
    });

    it('should apply stronger blue to row number cell when isHighlighted is true', () => {
      const component = renderer
        .create(<BrowserRow {...defaultProps} isHighlighted={true} showRowNumber={true} />)
        .toJSON();
      // Second child is the row number span (when showRowNumber is true)
      const rowNumberCell = component.children[1];
      expect(rowNumberCell.props.style.background).toBe('#d6e4f0');
    });

    it('should use default background on checkbox cell when not highlighted', () => {
      const component = renderer
        .create(<BrowserRow {...defaultProps} row={1} isHighlighted={false} />)
        .toJSON();
      const checkboxCell = component.children[0];
      expect(checkboxCell.props.style.background).toBe('#ffffff');
    });
  });
});
