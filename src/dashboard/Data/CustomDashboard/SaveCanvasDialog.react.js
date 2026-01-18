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

const SaveCanvasDialog = ({ currentName, onClose, onSave }) => {
  const [name, setName] = useState(currentName || '');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    onSave(trimmedName);
  };

  const isValid = name.trim().length > 0;

  return (
    <Modal
      type={Modal.Types.INFO}
      icon="canvas-outline"
      title="Save Canvas"
      subtitle="Save the current canvas configuration"
      onCancel={onClose}
      onConfirm={handleSave}
      confirmText="Save"
      cancelText="Cancel"
      disabled={!isValid}
    >
      <Field
        label={<Label text="Canvas Name" description="Enter a name for this canvas" />}
        input={
          <TextInput
            value={name}
            onChange={setName}
            placeholder="My Canvas"
          />
        }
      />
    </Modal>
  );
};

export default SaveCanvasDialog;
