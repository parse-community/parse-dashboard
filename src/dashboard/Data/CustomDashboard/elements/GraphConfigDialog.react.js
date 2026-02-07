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
import Toggle from 'components/Toggle/Toggle.react';

const STROKE_WIDTHS = [
  { value: 1, label: 'Thin (1px)' },
  { value: 2, label: 'Normal (2px)' },
  { value: 4, label: 'Medium (4px)' },
  { value: 8, label: 'Thick (8px)' },
];

const GraphConfigDialog = ({
  initialConfig,
  availableGraphs,
  availableFilters,
  classes,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialConfig?.title || '');
  const [className, setClassName] = useState(initialConfig?.className || '');
  const [graphId, setGraphId] = useState(initialConfig?.graphId || '');
  const [filterId, setFilterId] = useState(initialConfig?.filterId || '');
  const [limit, setLimit] = useState(initialConfig?.limit?.toString() || '1000');
  const [showLegend, setShowLegend] = useState(initialConfig?.showLegend ?? true);
  const [showAxisLabels, setShowAxisLabels] = useState(initialConfig?.showAxisLabels ?? true);
  const [strokeWidthOverride, setStrokeWidthOverride] = useState(initialConfig?.strokeWidthOverride || '');

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

  const isLineChart = useMemo(() => {
    if (!selectedGraph) {
      return false;
    }
    // Check if main chart type is line, or if any series/calculated value has line type
    if (selectedGraph.chartType === 'line') {
      return true;
    }
    const hasMixedLine = (selectedGraph.series || []).some(s => s.chartType === 'line') ||
      (selectedGraph.calculatedValues || []).some(c => c.chartType === 'line');
    return hasMixedLine;
  }, [selectedGraph]);

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
      title: title || selectedGraph?.title || 'Graph',
      className,
      graphId,
      graphConfig: selectedGraph,
      filterId: filterId || null,
      filterConfig: selectedFilter ? [selectedFilter] : null,
      limit: parseInt(limit, 10) || 1000,
      showLegend,
      showAxisLabels,
      strokeWidthOverride: strokeWidthOverride || null,
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
            label={<Label text="Title" description="Custom title for the graph element" />}
            input={
              <TextInput
                value={title}
                onChange={setTitle}
                placeholder={selectedGraph?.title || 'Graph'}
              />
            }
          />
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
          {className && graphId && (
            <>
              <Field
                label={<Label text="Show Legend" description="Display the graph legend" />}
                input={
                  <Toggle
                    value={showLegend}
                    onChange={setShowLegend}
                    type={Toggle.Types.YES_NO}
                  />
                }
              />
              <Field
                label={<Label text="Show Axis Labels" description="Display the Y-axis labels" />}
                input={
                  <Toggle
                    value={showAxisLabels}
                    onChange={setShowAxisLabels}
                    type={Toggle.Types.YES_NO}
                  />
                }
              />
              {isLineChart && (
                <Field
                  label={<Label text="Line Stroke Width (Optional)" description="Override stroke width for all lines" />}
                  input={
                    <Dropdown
                      value={strokeWidthOverride}
                      onChange={setStrokeWidthOverride}
                      placeHolder="Use graph settings"
                    >
                      <Option value="">Use graph settings</Option>
                      {STROKE_WIDTHS.map(sw => (
                        <Option key={sw.value} value={sw.value}>
                          {sw.label}
                        </Option>
                      ))}
                    </Dropdown>
                  }
                />
              )}
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default GraphConfigDialog;
