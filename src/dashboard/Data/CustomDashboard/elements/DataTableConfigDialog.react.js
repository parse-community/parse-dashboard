/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useState, useMemo, useEffect } from 'react';
import Modal from 'components/Modal/Modal.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import TextInput from 'components/TextInput/TextInput.react';
import MultiSelect from 'components/MultiSelect/MultiSelect.react';
import MultiSelectOption from 'components/MultiSelect/MultiSelectOption.react';

const DataTableConfigDialog = ({
  initialConfig,
  availableFilters,
  classes,
  classSchemas,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialConfig?.title || '');
  const [className, setClassName] = useState(initialConfig?.className || '');
  const [filterId, setFilterId] = useState(initialConfig?.filterId || '');
  const [selectedColumns, setSelectedColumns] = useState(initialConfig?.columns || []);
  const [sortField, setSortField] = useState(initialConfig?.sortField || '');
  const [sortOrder, setSortOrder] = useState(initialConfig?.sortOrder || 'ascending');
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

  const availableColumns = useMemo(() => {
    if (!className || !classSchemas[className]) {
      return [];
    }
    return Object.keys(classSchemas[className])
      .filter(col => col !== 'ACL')
      .sort((a, b) => a.localeCompare(b));
  }, [className, classSchemas]);

  // Reset selected columns when class changes, default to no fields selected
  useEffect(() => {
    if (className && availableColumns.length > 0) {
      // If editing and columns were previously selected for this class, keep them
      if (initialConfig?.className === className && initialConfig?.columns?.length > 0) {
        // Filter to only keep columns that still exist
        const validColumns = initialConfig.columns.filter(col => availableColumns.includes(col));
        setSelectedColumns(validColumns);
      } else {
        setSelectedColumns([]);
      }
    } else {
      setSelectedColumns([]);
    }
  }, [className, availableColumns, initialConfig?.className, initialConfig?.columns]);

  const handleClassChange = (newClass) => {
    setClassName(newClass);
    setFilterId('');
    setSortField('');
  };

  const handleSave = () => {
    if (!className || selectedColumns.length === 0) {
      return;
    }

    const selectedFilter = filtersForClass.find(f => f.id === filterId);

    onSave({
      title: title.trim() || null,
      className,
      filterId: filterId || null,
      filterConfig: selectedFilter ? [selectedFilter] : null,
      columns: selectedColumns,
      sortField: sortField || null,
      sortOrder: sortField ? sortOrder : null,
      limit: parseInt(limit, 10) || 100,
    });
  };

  const isValid = className && selectedColumns.length > 0;

  return (
    <Modal
      type={Modal.Types.INFO}
      icon="files-solid"
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
            label={<Label text="Title (Optional)" description="Display title for the table" />}
            input={
              <TextInput
                value={title}
                onChange={setTitle}
                placeholder="Enter a title..."
              />
            }
          />
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
          {className && availableColumns.length > 0 && (
            <Field
              label={<Label text="Fields" description="Select fields to display" />}
              input={
                <MultiSelect
                  value={selectedColumns}
                  onChange={setSelectedColumns}
                  placeHolder="Select fields..."
                  formatSelection={(selection) => `${selection.length} field${selection.length !== 1 ? 's' : ''} selected`}
                >
                  {availableColumns.map(col => (
                    <MultiSelectOption key={col} value={col}>
                      {col}
                    </MultiSelectOption>
                  ))}
                </MultiSelect>
              }
            />
          )}
          {className && availableColumns.length > 0 && (
            <Field
              label={<Label text="Sort By (Optional)" description="Sort rows by a field" />}
              input={
                <Dropdown
                  value={sortField}
                  onChange={setSortField}
                  placeHolder="No sorting"
                >
                  <Option value="">No sorting</Option>
                  {availableColumns.map(col => (
                    <Option key={col} value={col}>{col}</Option>
                  ))}
                </Dropdown>
              }
            />
          )}
          {className && sortField && (
            <Field
              label={<Label text="Sort Order" description="Ascending or descending order" />}
              input={
                <Dropdown
                  value={sortOrder}
                  onChange={setSortOrder}
                >
                  <Option value="ascending">Ascending</Option>
                  <Option value="descending">Descending</Option>
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
