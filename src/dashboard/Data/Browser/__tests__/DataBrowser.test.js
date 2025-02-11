import React from 'react';
import { mount } from 'enzyme';
import DataBrowser from '../DataBrowser.react';

describe('DataBrowser', () => {
  let wrapper;
  const mockProps = {
    data: [
      { id: '1', attributes: { name: 'Test 1' } },
      { id: '2', attributes: { name: 'Test 2' } }
    ],
    columns: {
      name: { type: 'String' }
    },
    selection: {},
    selectRow: jest.fn(),
    app: {
      applicationId: 'test-app',
      serverInfo: {
        features: {
          schemas: {
            clearAllDataFromClass: true,
            exportClass: true,
            editClassLevelPermissions: true
          }
        }
      }
    },
    schema: {
      data: {
        get: () => ({
          get: () => ({}),
          toObject: () => ({})
        })
      }
    }
  };

  beforeEach(() => {
    wrapper = mount(<DataBrowser {...mockProps} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('keyboard controls', () => {
    it('should select/unselect row when space key is pressed', () => {
      // Set current row
      wrapper.setState({ 
        current: { row: 0, col: 0 },
        editing: false 
      });

      // Simulate space key press
      const event = new KeyboardEvent('keydown', { keyCode: 32 });
      document.body.dispatchEvent(event);

      expect(mockProps.selectRow).toHaveBeenCalledWith('1', true);

      // Test unselecting
      wrapper.setProps({ selection: { '1': true } });
      document.body.dispatchEvent(event);

      expect(mockProps.selectRow).toHaveBeenCalledWith('1', false);
    });

    it('should not select row when editing', () => {
      wrapper.setState({ 
        current: { row: 0, col: 0 },
        editing: true 
      });

      const event = new KeyboardEvent('keydown', { keyCode: 32 });
      document.body.dispatchEvent(event);

      expect(mockProps.selectRow).not.toHaveBeenCalled();
    });

    it('should not select row when no current row', () => {
      wrapper.setState({ 
        current: null,
        editing: false 
      });

      const event = new KeyboardEvent('keydown', { keyCode: 32 });
      document.body.dispatchEvent(event);

      expect(mockProps.selectRow).not.toHaveBeenCalled();
    });
  });
}); 