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

const GraphConfigDialog = ({
  initialConfig,
  availableGraphs,
  availableFilters,
  classes,
  onClose,
  onSave,
}) => {
  const [className, setClassName] = useState(initialConfig?.className || '');
  const [graphId, setGraphId] = useState(initialConfig?.graphId || '');
  const [filterId, setFilterId] = useState(initialConfig?.filterId || '');
  const [limit, setLimit] = useState(initialConfig?.limit?.toString() || '1000');

  const classesWithGraphs = useMemo(() => {
    return classes
      .filter(c => availableGraphs[c] && availableGraphs[c].length > 0)
      .sort((a, b) => a.localeCompare(b));
  }, [classes, availableGraphs]);

  const graphsForClass = useMemo(() => {
    const graphs = availableGraphs[className] || [];
    return [...graphs].sort((a, b) => {
      const nameA = a.title || `${a.chartType} graph`;
      const nameB = b.title || `${b.chartType} graph`;
      return nameA.localeCompare(nameB);
    });
  }, [className, availableGraphs]);

  const filtersForClass = useMemo(() => {
    const filters = availableFilters[className] || [];
    return [...filters].sort((a, b) => {
      const nameA = a.name || `${a.field} ${a.constraint}`;
      const nameB = b.name || `${b.field} ${b.constraint}`;
      return nameA.localeCompare(nameB);
    });
  }, [className, availableFilters]);

  const selectedGraph = useMemo(() => {
    return graphsForClass.find(g => g.id === graphId);
  }, [graphsForClass, graphId]);

  const handleClassChange = (newClass) => {
    setClassName(newClass);
    setGraphId('');
    setFilterId('');
  };

  const handleSave = () => {
    if (!className || !graphId || !selectedGraph) {
      return;
    }

    const selectedFilter = filtersForClass.find(f => f.id === filterId);

    onSave({
      className,
      graphId,
      graphConfig: selectedGraph,
      filterId: filterId || null,
      filterConfig: selectedFilter ? [selectedFilter] : null,
      limit: parseInt(limit, 10) || 1000,
    });
  };

  const isValid = className && graphId && selectedGraph;

  return (
    <Modal
      type={Modal.Types.INFO}
      icon="analytics-solid"
      title={initialConfig ? 'Edit Graph' : 'Add Graph'}
      subtitle="Select a saved graph to display"
      onCancel={onClose}
      onConfirm={handleSave}
      confirmText="Save"
      cancelText="Cancel"
      disabled={!isValid}
    >
      {classesWithGraphs.length === 0 ? (
        <Field
          label={<Label text="No Graphs Available" />}
          input={
            <div style={{ padding: '20px', color: '#94a3b8' }}>
              No saved graphs found. Create a graph in the Data Browser first.
            </div>
          }
        />
      ) : (
        <>
          <Field
            label={<Label text="Class" description="Select the class containing the graph" />}
            input={
              <Dropdown
                value={className}
                onChange={handleClassChange}
                placeHolder="Select a class..."
              >
                {classesWithGraphs.map(c => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Dropdown>
            }
          />
          {className && (
            <Field
              label={<Label text="Graph" description="Select a saved graph" />}
              input={
                <Dropdown
                  value={graphId}
                  onChange={setGraphId}
                  placeHolder="Select a graph..."
                >
                  {graphsForClass.map(g => (
                    <Option key={g.id} value={g.id}>
                      {g.title || `${g.chartType} graph`}
                    </Option>
                  ))}
                </Dropdown>
              }
            />
          )}
          {className && filtersForClass.length > 0 && (
            <Field
              label={<Label text="Filter (Optional)" description="Apply a saved filter" />}
              input={
                <Dropdown
                  value={filterId}
                  onChange={setFilterId}
                  placeHolder="No filter"
                >
                  <Option value="">No filter</Option>
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
              label={<Label text="Record Limit" description="Maximum number of records to display" />}
              input={
                <TextInput
                  value={limit}
                  onChange={setLimit}
                  placeholder="1000"
                />
              }
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default GraphConfigDialog;
