/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Modal from 'components/Modal/Modal.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import Checkbox from 'components/Checkbox/Checkbox.react';
import Toggle from 'components/Toggle/Toggle.react';
import TextInput from 'components/TextInput/TextInput.react';

export default class ScriptResponseModal extends React.Component {
  constructor(props) {
    super(props);

    const formData = {};
    (props.form?.elements || []).forEach((element, index) => {
      const key = element.name || String(index);
      if (element.element === 'dropDown' && element.items?.length > 0) {
        formData[key] = element.items[0].value;
      } else if (element.element === 'checkbox') {
        formData[key] = element.default ?? false;
      } else if (element.element === 'toggle') {
        formData[key] = element.default ?? false;
      } else if (element.element === 'textInput') {
        formData[key] = element.default ?? '';
      }
    });

    this.state = { formData };
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm() {
    this.props.onConfirm(this.state.formData);
  }

  renderElement(element, index) {
    const key = element.name || String(index);

    if (element.element === 'dropDown') {
      return (
        <Field
          key={key}
          label={<Label text={element.label || element.name || 'Select'} description={element.description} />}
          input={
            <Dropdown
              fixed={true}
              value={this.state.formData[key]}
              onChange={value =>
                this.setState(prev => ({
                  formData: { ...prev.formData, [key]: value },
                }))
              }
            >
              {(element.items || []).map(item => (
                <Option key={item.value} value={item.value}>
                  {item.title}
                </Option>
              ))}
            </Dropdown>
          }
        />
      );
    }

    if (element.element === 'checkbox') {
      return (
        <Field
          key={key}
          label={<Label text={element.label || element.name || 'Checkbox'} description={element.description} />}
          input={
            <Checkbox
              label=""
              checked={this.state.formData[key]}
              onChange={value =>
                this.setState(prev => ({
                  formData: { ...prev.formData, [key]: value },
                }))
              }
            />
          }
        />
      );
    }

    if (element.element === 'toggle') {
      const hasCustomLabels = element.labelTrue || element.labelFalse;
      const toggleProps = hasCustomLabels
        ? {
          type: Toggle.Types.TWO_WAY,
          optionLeft: element.labelFalse || 'No',
          optionRight: element.labelTrue || 'Yes',
          value: this.state.formData[key]
            ? (element.labelTrue || 'Yes')
            : (element.labelFalse || 'No'),
          onChange: value =>
            this.setState(prev => ({
              formData: { ...prev.formData, [key]: value === (element.labelTrue || 'Yes') },
            })),
        }
        : {
          type: Toggle.Types.YES_NO,
          value: this.state.formData[key],
          onChange: value =>
            this.setState(prev => ({
              formData: { ...prev.formData, [key]: value },
            })),
        };

      return (
        <Field
          key={key}
          label={<Label text={element.label || element.name || 'Toggle'} description={element.description} />}
          input={<Toggle {...toggleProps} />}
        />
      );
    }

    if (element.element === 'textInput') {
      return (
        <Field
          key={key}
          label={<Label text={element.label || element.name || 'Text'} description={element.description} />}
          input={
            <TextInput
              placeholder={element.placeholder || ''}
              value={this.state.formData[key]}
              onChange={value =>
                this.setState(prev => ({
                  formData: { ...prev.formData, [key]: value },
                }))
              }
            />
          }
        />
      );
    }

    return null;
  }

  render() {
    const { form, objectIds, onCancel } = this.props;
    const subtitle = objectIds.length === 1
      ? `Running on object ${objectIds[0]}`
      : `Running on ${objectIds.length} objects`;

    return (
      <Modal
        type={Modal.Types.VALID}
        icon={form.icon || 'gears'}
        iconSize={40}
        title={form.title || 'Script'}
        subtitle={subtitle}
        confirmText="Submit"
        onConfirm={this.handleConfirm}
        onCancel={onCancel}
      >
        {(form.elements || []).map((element, index) => this.renderElement(element, index))}
      </Modal>
    );
  }
}
