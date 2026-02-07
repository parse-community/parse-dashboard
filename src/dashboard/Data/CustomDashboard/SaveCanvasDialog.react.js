/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useState, useMemo } from 'react';
import Modal from 'components/Modal/Modal.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import TextInput from 'components/TextInput/TextInput.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';

const SaveCanvasDialog = ({ currentName, currentGroup, existingGroups = [], onClose, onSave }) => {
  const [name, setName] = useState(currentName || '');
  const [groupSelection, setGroupSelection] = useState(currentGroup || '');
  const [newGroup, setNewGroup] = useState('');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);

  const sortedGroups = useMemo(() => {
    return [...existingGroups].sort((a, b) => a.localeCompare(b));
  }, [existingGroups]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    const group = isCreatingNewGroup ? newGroup.trim() : groupSelection;
    onSave(trimmedName, group || null);
  };

  const handleGroupChange = (value) => {
    if (value === '__new__') {
      setIsCreatingNewGroup(true);
      setGroupSelection('');
    } else {
      setIsCreatingNewGroup(false);
      setGroupSelection(value);
      setNewGroup('');
    }
  };

  const isValid = name.trim().length > 0 && (!isCreatingNewGroup || newGroup.trim().length > 0);

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
      <Field
        label={<Label text="Group" description="Optionally organize this canvas into a group" />}
        input={
          <Dropdown
            value={isCreatingNewGroup ? '__new__' : groupSelection}
            onChange={handleGroupChange}
            placeholder="No group"
          >
            <Option value="">No group</Option>
            {sortedGroups.map(group => (
              <Option key={group} value={group}>{group}</Option>
            ))}
            <Option value="__new__">+ Create new group...</Option>
          </Dropdown>
        }
      />
      {isCreatingNewGroup && (
        <Field
          label={<Label text="New Group Name" description="Enter a name for the new group" />}
          input={
            <TextInput
              value={newGroup}
              onChange={setNewGroup}
              placeholder="My Group"
            />
          }
        />
      )}
    </Modal>
  );
};

export default SaveCanvasDialog;
