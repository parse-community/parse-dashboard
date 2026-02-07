/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Checkbox from 'components/Checkbox/Checkbox.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import NonPrintableHighlighter from 'components/NonPrintableHighlighter/NonPrintableHighlighter.react';
import Option from 'components/Dropdown/Option.react';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';

export default class RemoveArrayEntryDialog extends React.Component {
  constructor() {
    super();
    this.state = {
      value: '',
      useKeyFilter: false,
      selectedKeyPath: '',
    };
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  /**
   * Extracts all unique key paths from an array of objects.
   * Supports nested objects with dot notation (e.g., "a.b.c").
   * @param {Array} arr - The array to extract key paths from
   * @returns {string[]} - Sorted array of unique key paths
   */
  extractKeyPaths(arr) {
    const keyPaths = new Set();

    const extractFromObject = (obj, prefix = '') => {
      if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return;
      }
      for (const key of Object.keys(obj)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        keyPaths.add(fullPath);
        if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          extractFromObject(obj[key], fullPath);
        }
      }
    };

    for (const item of arr) {
      extractFromObject(item);
    }

    return Array.from(keyPaths).sort();
  }

  /**
   * Gets a nested value from an object using a dot-notation path.
   * @param {Object} obj - The object to extract from
   * @param {string} path - The dot-notation path (e.g., "a.b.c")
   * @returns {*} - The value at the path, or undefined if not found
   */
  getValueAtPath(obj, path) {
    if (obj === null || typeof obj !== 'object') {
      return undefined;
    }
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  getValue() {
    try {
      return JSON.parse(this.state.value);
    } catch {
      return this.state.value;
    }
  }

  handleConfirm() {
    const value = this.getValue();
    const { useKeyFilter, selectedKeyPath } = this.state;

    if (useKeyFilter && selectedKeyPath) {
      this.props.onConfirm({
        filterByKey: true,
        keyPath: selectedKeyPath,
        value: value,
      });
    } else {
      this.props.onConfirm({
        filterByKey: false,
        value: value,
      });
    }

    this.setState({
      value: '',
      useKeyFilter: false,
      selectedKeyPath: '',
    });
  }

  render() {
    const { param, arrayValue } = this.props;
    const { value, useKeyFilter, selectedKeyPath } = this.state;

    // Check if the array contains objects
    const containsObjects = arrayValue?.some(
      item => item !== null && typeof item === 'object' && !Array.isArray(item)
    );

    // Extract available key paths if array contains objects
    const keyPaths = containsObjects ? this.extractKeyPaths(arrayValue) : [];

    const confirmDisabled =
      value === '' || (useKeyFilter && !selectedKeyPath);

    return (
      <Modal
        type={Modal.Types.DANGER}
        icon="minus-solid"
        title={'Remove entry'}
        subtitle={param}
        confirmText="Remove"
        cancelText="Cancel"
        onCancel={this.props.onCancel}
        onConfirm={this.handleConfirm.bind(this)}
        disabled={confirmDisabled}
      >
        {containsObjects && keyPaths.length > 0 && (
          <Field
            label={
              <Label
                text="Filter by key"
                description="Enable to remove objects that have a specific key matching a value."
              />
            }
            input={
              <Checkbox
                checked={useKeyFilter}
                onChange={checked =>
                  this.setState({
                    useKeyFilter: checked,
                    selectedKeyPath: checked ? selectedKeyPath : '',
                  })
                }
              />
            }
          />
        )}
        {useKeyFilter && keyPaths.length > 0 && (
          <Field
            label={
              <Label
                text="Key path"
                description="Select the key path to filter objects by."
              />
            }
            input={
              <Dropdown
                fixed={true}
                value={selectedKeyPath}
                onChange={path => this.setState({ selectedKeyPath: path })}
                placeHolder="Select key path..."
              >
                {keyPaths.map(path => (
                  <Option key={path} value={path}>
                    {path}
                  </Option>
                ))}
              </Dropdown>
            }
          />
        )}
        <Field
          label={
            <Label
              text={useKeyFilter ? 'Value to match' : 'Value'}
              description={
                useKeyFilter
                  ? 'Objects where the selected key equals this value will be removed.'
                  : 'The exact value to remove from the array. Use quotation marks to enforce string type.'
              }
            />
          }
          input={
            <NonPrintableHighlighter value={value}>
              <TextInput
                placeholder={useKeyFilter ? 'Enter value to match' : 'Enter value'}
                ref={this.inputRef}
                value={value}
                onChange={val => this.setState({ value: val })}
              />
            </NonPrintableHighlighter>
          }
        />
      </Modal>
    );
  }
}
