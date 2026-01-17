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
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import TextInput from 'components/TextInput/TextInput.react';

const DataTableConfigDialog = ({
  initialConfig,
  availableFilters,
  classes,
  classSchemas,
  onClose,
  onSave,
}) => {
  const [className, setClassName] = useState(initialConfig?.className || '');
  const [filterId, setFilterId] = useState(initialConfig?.filterId || '');
  const [limit, setLimit] = useState(initialConfig?.limit?.toString() || '100');

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => a.localeCompare(b));
  }, [classes]);

  const filtersForClass = useMemo(() => {
    const filters = availableFilters[className] || [];
    return [...filters].sort((a, b) => {
      const nameA = a.name || `${a.field} ${a.constraint}`;
      const nameB = b.name || `${b.field} ${b.constraint}`;
      return nameA.localeCompare(nameB);
    });
  }, [className, availableFilters]);

  const columnsForClass = useMemo(() => {
    if (!className || !classSchemas[className]) {
      return [];
    }
    return Object.keys(classSchemas[className]).filter(col => col !== 'ACL');
  }, [className, classSchemas]);

  const handleClassChange = (newClass) => {
    setClassName(newClass);
    setFilterId('');
  };

  const handleSave = () => {
    if (!className) {
      return;
    }

    const selectedFilter = filtersForClass.find(f => f.id === filterId);

    onSave({
      className,
      filterId: filterId || null,
      filterConfig: selectedFilter ? [selectedFilter] : null,
      columns: columnsForClass,
      limit: parseInt(limit, 10) || 100,
    });
  };

  const isValid = className;

  return (
    <Modal
      type={Modal.Types.INFO}
      icon="table"
      title={initialConfig ? 'Edit Data Table' : 'Add Data Table'}
      subtitle="Configure the data table display"
      onCancel={onClose}
      onConfirm={handleSave}
      confirmText="Save"
      cancelText="Cancel"
      disabled={!isValid}
    >
      {classes.length === 0 ? (
        <Field
          label={<Label text="No Classes Available" />}
          input={
            <div style={{ padding: '20px', color: '#94a3b8' }}>
              No classes found. Create a class in the Data Browser first.
            </div>
          }
        />
      ) : (
        <>
          <Field
            label={<Label text="Class" description="Select the class to display" />}
            input={
              <Dropdown
                value={className}
                onChange={handleClassChange}
                placeHolder="Select a class..."
              >
                {sortedClasses.map(c => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Dropdown>
            }
          />
          {className && filtersForClass.length > 0 && (
            <Field
              label={<Label text="Filter (Optional)" description="Apply a saved filter" />}
              input={
                <Dropdown
                  value={filterId}
                  onChange={setFilterId}
                  placeHolder="No filter"
                >
                  <Option value="">No filter (show all)</Option>
                  {filtersForClass.map(f => (
                    <Option key={f.id} value={f.id}>
                      {f.name || `${f.field} ${f.constraint}`}
                    </Option>
                  ))}
                </Dropdown>
              }
            />
          )}
          {className && (
            <Field
              label={<Label text="Row Limit" description="Maximum number of rows to display" />}
              input={
                <TextInput
                  value={limit}
                  onChange={setLimit}
                  placeholder="100"
                />
              }
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default DataTableConfigDialog;
