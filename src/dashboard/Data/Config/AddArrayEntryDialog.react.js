/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';
import Checkbox from 'components/Checkbox/Checkbox.react';

export default class AddArrayEntryDialog extends React.Component {
  constructor() {
    super();
    this.state = {
      value: '',
      showMismatchRow: false,
      mismatchConfirmed: false,
      parsedType: '',
    };
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }


  getValue() {
    try {
      return JSON.parse(this.state.value);
    } catch {
      return this.state.value;
    }
  }

  getType(value) {
    if (Array.isArray(value)) {
      return 'array';
    }
    if (value === null) {
      return 'null';
    }
    return typeof value;
  }

  handleConfirm() {
    const parsed = this.getValue();
    const entryType = this.getType(parsed);
    const lastType = this.props.lastType;

    if (lastType && entryType !== lastType) {
      if (!this.state.showMismatchRow) {
        this.setState(
          {
            showMismatchRow: true,
            mismatchConfirmed: false,
            parsedType: entryType,
          },
          () => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }
        );
        return;
      }
      if (!this.state.mismatchConfirmed) {
        return;
      }
    }

    this.props.onConfirm(parsed);
    this.setState({
      value: '',
      showMismatchRow: false,
      mismatchConfirmed: false,
      parsedType: '',
    });
  }

  render() {
    const param = this.props.param;
    const confirmDisabled =
      this.state.value === '' ||
      (this.state.showMismatchRow && !this.state.mismatchConfirmed);

    const addEntryModal = (
      <Modal
        type={Modal.Types.INFO}
        icon="plus-solid"
        title={'Add entry'}
        subtitle={param}
        confirmText="Add Unique"
        cancelText="Cancel"
        onCancel={this.props.onCancel}
        onConfirm={this.handleConfirm.bind(this)}
        disabled={confirmDisabled}
      >
        <Field
          label={
            <Label
              text="Value"
              description="The type is determined based on the entered value. Use quotation marks to enforce string type."
            />
          }
          input={
            <TextInput
              placeholder={'Enter value'}
              ref={this.inputRef}
              value={this.state.value}
              onChange={value =>
                this.setState({
                  value,
                  showMismatchRow: false,
                  mismatchConfirmed: false,
                })
              }
            />
          }
        />
        {this.state.showMismatchRow && (
          <Field
            label={
              <Label
                text="⚠️ Ignore type mismatch"
                description={
                  <>
                    Previous item type is <strong>{this.props.lastType}</strong>, new entry type is <strong>{this.state.parsedType}</strong>.
                  </>
                }
              />
            }
            input={
              <Checkbox
                checked={this.state.mismatchConfirmed}
                onChange={checked => this.setState({ mismatchConfirmed: checked })}
              />
            }
          />
        )}
      </Modal>
    );

    return addEntryModal;
  }
}
