import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';

export default function ViewValueDialog({ value, onClose }) {
  let stringValue;
  if (typeof value === 'object' && value !== null) {
    stringValue = JSON.stringify(value, null, 2);
  } else {
    stringValue = String(value);
  }
  return (
    <Modal
      type={Modal.Types.INFO}
      icon="visibility"
      title="Value"
      confirmText="Close"
      showCancel={false}
      onConfirm={onClose}
    >
      <Field
        label={<Label text="Value" />}
        input={
          <TextInput
            value={stringValue}
            multiline
            monospace
            disabled
            onChange={() => {}}
          />
        }
      />
    </Modal>
  );
}
