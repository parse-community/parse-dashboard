/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useState } from 'react';
import Modal from 'components/Modal/Modal.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import TextInput from 'components/TextInput/TextInput.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import Toggle from 'components/Toggle/Toggle.react';

const defaultConfig = {
  text: '',
  textSize: 'body',
  isBold: false,
  isItalic: false,
};

const StaticTextConfigDialog = ({ initialConfig, onClose, onSave }) => {
  const [config, setConfig] = useState(initialConfig || defaultConfig);

  const handleSave = () => {
    if (!config.text.trim()) {
      return;
    }
    onSave(config);
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      type={Modal.Types.INFO}
      icon="edit-solid"
      title={initialConfig ? 'Edit Static Text' : 'Add Static Text'}
      subtitle="Configure your text element"
      onCancel={onClose}
      onConfirm={handleSave}
      confirmText="Save"
      cancelText="Cancel"
      disabled={!config.text.trim()}
    >
      <Field
        label={<Label text="Text" description="The text content to display" />}
        input={
          <TextInput
            value={config.text}
            onChange={(value) => updateConfig('text', value)}
            placeholder="Enter your text..."
            multiline={true}
            height={100}
          />
        }
      />
      <Field
        label={<Label text="Text Size" description="Choose the size of the text" />}
        input={
          <Dropdown
            value={config.textSize}
            onChange={(value) => updateConfig('textSize', value)}
          >
            <Option value="body">Body (14px)</Option>
            <Option value="h3">Heading 3 (18px)</Option>
            <Option value="h2">Heading 2 (24px)</Option>
            <Option value="h1">Heading 1 (32px)</Option>
          </Dropdown>
        }
      />
      <Field
        label={<Label text="Bold" description="Make the text bold" />}
        input={
          <Toggle
            value={config.isBold}
            type={Toggle.Types.YES_NO}
            onChange={(value) => updateConfig('isBold', value)}
          />
        }
      />
      <Field
        label={<Label text="Italic" description="Make the text italic" />}
        input={
          <Toggle
            value={config.isItalic}
            type={Toggle.Types.YES_NO}
            onChange={(value) => updateConfig('isItalic', value)}
          />
        }
      />
    </Modal>
  );
};

export default StaticTextConfigDialog;
