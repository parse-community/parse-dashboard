/**
 * @jest-environment jsdom
 */
jest.dontMock('../../dashboard/Data/Browser/ScriptResponseModal.react');
jest.dontMock('../../components/Field/Field.react');
jest.dontMock('../../components/Label/Label.react');
jest.dontMock('../../components/Checkbox/Checkbox.react');
jest.dontMock('../../components/Toggle/Toggle.react');
jest.dontMock('../../components/TextInput/TextInput.react');
jest.dontMock('../../components/Dropdown/Dropdown.react');
jest.dontMock('../../components/Dropdown/Option.react');
jest.dontMock('../../components/Modal/Modal.react');
jest.dontMock('../../components/Button/Button.react');
jest.dontMock('../../components/Icon/Icon.react');
jest.dontMock('../Position');

// Mock Popover to avoid createPortal issues with react-test-renderer
jest.mock('../../components/Popover/Popover.react', () => {
  const React = require('react');
  return class Popover extends React.Component {
    render() {
      return <div>{this.props.children}</div>;
    }
  };
});

import React from 'react';
import renderer from 'react-test-renderer';
const ScriptResponseModal = require('../../dashboard/Data/Browser/ScriptResponseModal.react').default;

const defaultProps = {
  objectIds: ['obj1'],
  onCancel: jest.fn(),
  onConfirm: jest.fn(),
};

describe('ScriptResponseModal', () => {
  describe('checkbox element', () => {
    it('initializes with default false', () => {
      const form = {
        elements: [{ element: 'checkbox', name: 'confirmed', label: 'Confirm' }],
      };
      const component = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />);
      const instance = component.getInstance();
      expect(instance.state.formData.confirmed).toBe(false);
    });

    it('initializes with custom default', () => {
      const form = {
        elements: [{ element: 'checkbox', name: 'confirmed', label: 'Confirm', default: true }],
      };
      const component = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />);
      const instance = component.getInstance();
      expect(instance.state.formData.confirmed).toBe(true);
    });

    it('renders with description', () => {
      const form = {
        elements: [{
          element: 'checkbox',
          name: 'confirmed',
          label: 'Confirm',
          description: 'Please confirm',
        }],
      };
      const tree = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />).toJSON();
      expect(JSON.stringify(tree)).toContain('Please confirm');
    });
  });

  describe('toggle element', () => {
    it('initializes with default false', () => {
      const form = {
        elements: [{ element: 'toggle', name: 'enabled', label: 'Enable' }],
      };
      const component = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />);
      const instance = component.getInstance();
      expect(instance.state.formData.enabled).toBe(false);
    });

    it('initializes with custom default true', () => {
      const form = {
        elements: [{ element: 'toggle', name: 'enabled', label: 'Enable', default: true }],
      };
      const component = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />);
      const instance = component.getInstance();
      expect(instance.state.formData.enabled).toBe(true);
    });

    it('renders with description', () => {
      const form = {
        elements: [{
          element: 'toggle',
          name: 'enabled',
          label: 'Enable',
          description: 'Toggle this feature',
        }],
      };
      const tree = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />).toJSON();
      expect(JSON.stringify(tree)).toContain('Toggle this feature');
    });

    it('renders with custom labels', () => {
      const form = {
        elements: [{
          element: 'toggle',
          name: 'enabled',
          label: 'Enable',
          labelTrue: 'Enabled',
          labelFalse: 'Disabled',
        }],
      };
      const tree = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />).toJSON();
      const json = JSON.stringify(tree);
      expect(json).toContain('Enabled');
      expect(json).toContain('Disabled');
    });
  });

  describe('textInput element', () => {
    it('initializes with default empty string', () => {
      const form = {
        elements: [{ element: 'textInput', name: 'reason', label: 'Reason' }],
      };
      const component = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />);
      const instance = component.getInstance();
      expect(instance.state.formData.reason).toBe('');
    });

    it('initializes with custom default', () => {
      const form = {
        elements: [{ element: 'textInput', name: 'reason', label: 'Reason', default: 'N/A' }],
      };
      const component = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />);
      const instance = component.getInstance();
      expect(instance.state.formData.reason).toBe('N/A');
    });

    it('renders with placeholder', () => {
      const form = {
        elements: [{
          element: 'textInput',
          name: 'reason',
          label: 'Reason',
          placeholder: 'Enter reason...',
        }],
      };
      const tree = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />).toJSON();
      expect(JSON.stringify(tree)).toContain('Enter reason...');
    });

    it('renders with description', () => {
      const form = {
        elements: [{
          element: 'textInput',
          name: 'reason',
          label: 'Reason',
          description: 'Provide a reason',
        }],
      };
      const tree = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />).toJSON();
      expect(JSON.stringify(tree)).toContain('Provide a reason');
    });
  });

  describe('dropDown element (existing)', () => {
    it('initializes with first item value', () => {
      const form = {
        elements: [{
          element: 'dropDown',
          name: 'role',
          label: 'Role',
          items: [{ title: 'Admin', value: 'admin' }, { title: 'User', value: 'user' }],
        }],
      };
      const component = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />);
      const instance = component.getInstance();
      expect(instance.state.formData.role).toBe('admin');
    });
  });

  describe('mixed elements', () => {
    it('initializes all element types correctly', () => {
      const form = {
        elements: [
          { element: 'dropDown', name: 'role', items: [{ title: 'Admin', value: 'admin' }] },
          { element: 'checkbox', name: 'confirmed', default: true },
          { element: 'toggle', name: 'enabled' },
          { element: 'textInput', name: 'reason', default: 'test' },
        ],
      };
      const component = renderer.create(<ScriptResponseModal form={form} {...defaultProps} />);
      const instance = component.getInstance();
      expect(instance.state.formData).toEqual({
        role: 'admin',
        confirmed: true,
        enabled: false,
        reason: 'test',
      });
    });
  });

  describe('form submission', () => {
    it('calls onConfirm with formData', () => {
      const onConfirm = jest.fn();
      const form = {
        elements: [
          { element: 'checkbox', name: 'confirmed', default: true },
          { element: 'textInput', name: 'reason', default: 'hello' },
        ],
      };
      const component = renderer.create(
        <ScriptResponseModal form={form} objectIds={['obj1']} onCancel={jest.fn()} onConfirm={onConfirm} />
      );
      const instance = component.getInstance();
      instance.handleConfirm();
      expect(onConfirm).toHaveBeenCalledWith({ confirmed: true, reason: 'hello' });
    });
  });
});
