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

export default class ScriptResponseModal extends React.Component {
  constructor(props) {
    super(props);

    const formData = {};
    (props.form?.elements || []).forEach((element, index) => {
      const key = element.name || String(index);
      if (element.element === 'dropDown' && element.items?.length > 0) {
        formData[key] = element.items[0].value;
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
          label={<Label text={element.label || element.name || 'Select'} />}
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
