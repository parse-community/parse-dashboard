/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import Button from 'components/Button/Button.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import MultiSelect from 'components/MultiSelect/MultiSelect.react';
import MultiSelectOption from 'components/MultiSelect/MultiSelectOption.react';
import Option from 'components/Dropdown/Option.react';
import Toggle from 'components/Toggle/Toggle.react';
import TextInput from 'components/TextInput/TextInput.react';
import styles from 'components/Modal/Modal.scss';

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'radar', label: 'Radar Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
];

const AGGREGATION_TYPES = [
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'max', label: 'Maximum' },
  { value: 'min', label: 'Minimum' },
  { value: 'sum', label: 'Sum' },
];

const CALCULATED_VALUE_OPERATORS = [
  { value: 'sum', label: 'Sum' },
  { value: 'percent', label: 'Percent' },
  { value: 'average', label: 'Average' },
  { value: 'difference', label: 'Difference' },
  { value: 'ratio', label: 'Ratio' },
];

export default class GraphDialog extends React.Component {
  constructor(props) {
    super();

    const initialConfig = props.initialConfig || {};

    // Ensure valueColumn is always an array
    const valueColumn = initialConfig.valueColumn
      ? (Array.isArray(initialConfig.valueColumn) ? initialConfig.valueColumn : [initialConfig.valueColumn])
      : [];

    // Ensure groupByColumn is always an array
    const groupByColumn = initialConfig.groupByColumn
      ? (Array.isArray(initialConfig.groupByColumn) ? initialConfig.groupByColumn : [initialConfig.groupByColumn])
      : [];

    // Ensure calculatedValues is always an array
    const calculatedValues = initialConfig.calculatedValues || [];

    this.state = {
      chartType: initialConfig.chartType || 'bar',
      xColumn: initialConfig.xColumn || '',
      yColumn: initialConfig.yColumn || '',
      valueColumn,
      groupByColumn,
      calculatedValues,
      aggregationType: initialConfig.aggregationType || 'count',
      title: initialConfig.title || '',
      showLegend: initialConfig.showLegend !== undefined ? initialConfig.showLegend : true,
      showGrid: initialConfig.showGrid !== undefined ? initialConfig.showGrid : true,
      showAxisLabels: initialConfig.showAxisLabels !== undefined ? initialConfig.showAxisLabels : true,
      isStacked: initialConfig.isStacked || false,
      maxDataPoints: initialConfig.maxDataPoints || 1000,
      maxDataPointsInput: null,
    };
  }

  valid() {
    const { chartType, xColumn, yColumn, valueColumn } = this.state;
    const hasValueColumn = Array.isArray(valueColumn) && valueColumn.length > 0;

    switch (chartType) {
      case 'pie':
      case 'doughnut':
        return hasValueColumn;
      case 'scatter':
        return !!xColumn && !!yColumn;
      case 'bar':
      case 'line':
      case 'radar':
        return !!xColumn && hasValueColumn;
      default:
        return false;
    }
  }

  handleConfirm = () => {
    if (this.valid()) {
      this.props.onConfirm({
        ...this.state,
        xColumn: this.state.xColumn || null,
        yColumn: this.state.yColumn || null,
        valueColumn: this.state.valueColumn.length > 0 ? this.state.valueColumn : null,
        groupByColumn: this.state.groupByColumn.length > 0 ? this.state.groupByColumn : null,
        calculatedValues: this.state.calculatedValues.length > 0 ? this.state.calculatedValues : null,
      });
    }
  };

  handleReset = () => {
    this.setState({
      chartType: 'bar',
      xColumn: '',
      yColumn: '',
      valueColumn: [],
      groupByColumn: [],
      calculatedValues: [],
      aggregationType: 'count',
      title: '',
      showLegend: true,
      showGrid: true,
      showAxisLabels: true,
      isStacked: false,
      maxDataPoints: 1000,
      maxDataPointsInput: null,
    });
  };

  getColumnsByType(types) {
    if (!this.props.columns) {
      return [];
    }
    return Object.entries(this.props.columns)
      .filter(([key, col]) => key !== 'objectId' && (!types || types.includes(col.type)))
      .map(([key]) => key)
      .sort((a, b) => a.localeCompare(b));
  }

  getAllColumns() {
    return this.getColumnsByType();
  }

  getNumericColumns() {
    return this.getColumnsByType(['Number']);
  }

  getNumericAndPointerColumns() {
    return this.getColumnsByType(['Number', 'Pointer']);
  }

  getStringColumns() {
    return this.getColumnsByType(['String']);
  }

  getStringAndPointerColumns() {
    return this.getColumnsByType(['String', 'Pointer']);
  }

  getNumericAndCalculatedFields(currentIndex = -1) {
    const numericColumns = this.getNumericColumns();
    // Only include calculated values that come BEFORE the current one
    // to prevent forward references and simplify circular reference detection
    const calculatedFields = this.state.calculatedValues
      .slice(0, currentIndex >= 0 ? currentIndex : this.state.calculatedValues.length)
      .filter(calc => calc.name && calc.name.trim() !== '')
      .map(calc => calc.name);
    return [...numericColumns, ...calculatedFields];
  }

  // Detect if a calculated value has a circular reference
  hasCircularReference(calcIndex, visited = new Set()) {
    const calc = this.state.calculatedValues[calcIndex];
    if (!calc || !calc.fields || !Array.isArray(calc.fields)) {
      return false;
    }

    // Mark this calc as being visited
    visited.add(calcIndex);

    // Check each field to see if it references another calculated value
    for (const field of calc.fields) {
      // Find if this field is a calculated value
      const referencedCalcIndex = this.state.calculatedValues.findIndex(
        (c, idx) => idx < calcIndex && c.name === field
      );

      if (referencedCalcIndex >= 0) {
        // If we've already visited this calc, we have a circular reference
        if (visited.has(referencedCalcIndex)) {
          return true;
        }
        // Recursively check the referenced calc
        if (this.hasCircularReference(referencedCalcIndex, new Set(visited))) {
          return true;
        }
      }
    }

    return false;
  }

  addCalculatedValue = () => {
    this.setState({
      calculatedValues: [
        ...this.state.calculatedValues,
        { fields: [], operator: 'sum', name: '', expanded: true }
      ]
    });
  };

  removeCalculatedValue = (index) => {
    const newCalculatedValues = [...this.state.calculatedValues];
    newCalculatedValues.splice(index, 1);
    this.setState({ calculatedValues: newCalculatedValues });
  };

  updateCalculatedValue = (index, field, value) => {
    const newCalculatedValues = [...this.state.calculatedValues];
    newCalculatedValues[index] = {
      ...newCalculatedValues[index],
      [field]: value
    };
    this.setState({ calculatedValues: newCalculatedValues });
  };

  toggleCalculatedValue = (index) => {
    const newCalculatedValues = [...this.state.calculatedValues];
    newCalculatedValues[index] = {
      ...newCalculatedValues[index],
      expanded: !newCalculatedValues[index].expanded
    };
    this.setState({ calculatedValues: newCalculatedValues });
  };

  renderChartTypeSection() {
    return (
      <Field label={<Label text="Chart Type" />} input={
        <Dropdown
          value={this.state.chartType}
          onChange={chartType => this.setState({ chartType })}
        >
          {CHART_TYPES.map(type => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Dropdown>
      } />
    );
  }

  renderColumnSelectionSection() {
    const { chartType } = this.state;
    const allColumns = this.getAllColumns();
    const numericColumns = this.getNumericColumns();
    const numericAndPointerColumns = this.getNumericAndPointerColumns();
    const stringAndPointerColumns = this.getStringAndPointerColumns();

    return (
      <>
        <Field label={<Label text="X-Axis" />} input={
          <Dropdown
            value={this.state.xColumn}
            onChange={xColumn => this.setState({ xColumn })}
            placeHolder="Select field"
          >
            {(chartType === 'scatter' ? numericColumns : allColumns).map(col => (
              <Option key={col} value={col}>
                {col}
              </Option>
            ))}
          </Dropdown>
        } />

        {chartType === 'scatter' && (
          <Field label={<Label text="Y-Axis" />} input={
            <Dropdown
              value={this.state.yColumn}
              onChange={yColumn => this.setState({ yColumn })}
              placeHolder="Select field"
            >
              {numericColumns.map(col => (
                <Option key={col} value={col}>
                  {col}
                </Option>
              ))}
            </Dropdown>
          } />
        )}

        {(chartType === 'bar' || chartType === 'line' || chartType === 'pie' || chartType === 'doughnut' || chartType === 'radar') && (
          <Field label={<Label text="Values" />} input={
            <MultiSelect
              value={this.state.valueColumn}
              onChange={valueColumn => this.setState({ valueColumn })}
              placeHolder="Select field(s)"
              formatSelection={selection => selection.length === 1 ? selection[0] : `${selection.length} fields`}
            >
              {numericAndPointerColumns.map(col => (
                <MultiSelectOption key={col} value={col}>
                  {col}
                </MultiSelectOption>
              ))}
            </MultiSelect>
          } />
        )}

        {(chartType === 'bar' || chartType === 'line' || chartType === 'pie' || chartType === 'doughnut' || chartType === 'radar') && (
          <Field label={<Label text="Aggregation Type" />} input={
            <Dropdown
              value={this.state.aggregationType}
              onChange={aggregationType => this.setState({ aggregationType })}
            >
              {AGGREGATION_TYPES.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Dropdown>
          } />
        )}

        {(chartType === 'bar' || chartType === 'line' || chartType === 'pie' || chartType === 'doughnut' || chartType === 'radar') && (
          <>
            {this.state.calculatedValues.map((calc, index) => {
              const isExpanded = calc.expanded !== false;
              const displayName = calc.name || `Calculated Value ${index + 1}`;
              // Get available fields for this calculated value (only previous ones)
              const numericAndCalculatedFields = this.getNumericAndCalculatedFields(index);
              // Check for circular reference
              const hasCircular = this.hasCircularReference(index);

              return (
                <div key={index} style={{ paddingTop: '10px', paddingLeft: '10px', paddingRight: '10px', paddingBottom: isExpanded ? '0' : '10px', borderTop: '1px solid #e3e3e3', borderLeft: '1px solid #e3e3e3', borderRight: '1px solid #e3e3e3', borderBottom: index === this.state.calculatedValues.length - 1 ? '1px solid #e3e3e3' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '8px' : '0', cursor: 'pointer' }} onClick={() => this.toggleCalculatedValue(index)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
                      <Label text={displayName} />
                    </div>
                    <Button value="Remove" onClick={(e) => { e.stopPropagation(); this.removeCalculatedValue(index); }} />
                  </div>
                  {isExpanded && (
                    <div style={{ border: 'none', paddingBottom: '8px' }}>
                      <div style={{ border: '1px solid #e3e3e3' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Label text="Name" />
                          </div>
                          <div>
                            <TextInput
                              value={calc.name}
                              onChange={name => this.updateCalculatedValue(index, 'name', name)}
                              placeholder="Enter name"
                            />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Label text="Operator" />
                          </div>
                          <div>
                            <Dropdown
                              value={calc.operator}
                              onChange={operator => this.updateCalculatedValue(index, 'operator', operator)}
                            >
                              {CALCULATED_VALUE_OPERATORS.map(op => (
                                <Option key={op.value} value={op.value}>
                                  {op.label}
                                </Option>
                              ))}
                            </Dropdown>
                          </div>
                        </div>
                        {calc.operator === 'percent' ? (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Label text="Numerator" />
                              </div>
                              <div>
                                <Dropdown
                                  value={calc.fields && calc.fields[0] ? calc.fields[0] : ''}
                                  onChange={numerator => {
                                    const newFields = [numerator, calc.fields && calc.fields[1] ? calc.fields[1] : ''];
                                    this.updateCalculatedValue(index, 'fields', newFields);
                                  }}
                                  placeHolder="Select field"
                                >
                                  {numericAndCalculatedFields.map(col => (
                                    <Option key={col} value={col}>
                                      {col}
                                    </Option>
                                  ))}
                                </Dropdown>
                              </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Label text="Denominator" />
                              </div>
                              <div>
                                <Dropdown
                                  value={calc.fields && calc.fields[1] ? calc.fields[1] : ''}
                                  onChange={denominator => {
                                    const newFields = [calc.fields && calc.fields[0] ? calc.fields[0] : '', denominator];
                                    this.updateCalculatedValue(index, 'fields', newFields);
                                  }}
                                  placeHolder="Select field"
                                >
                                  {numericAndCalculatedFields.map(col => (
                                    <Option key={col} value={col}>
                                      {col}
                                    </Option>
                                  ))}
                                </Dropdown>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Label text="Fields" />
                            </div>
                            <div>
                              <MultiSelect
                                value={calc.fields}
                                onChange={fields => this.updateCalculatedValue(index, 'fields', fields)}
                                placeHolder="Select field(s)"
                                formatSelection={selection => selection.length === 1 ? selection[0] : `${selection.length} fields`}
                              >
                                {numericAndCalculatedFields.map(col => (
                                  <MultiSelectOption key={col} value={col}>
                                    {col}
                                  </MultiSelectOption>
                                ))}
                              </MultiSelect>
                            </div>
                          </div>
                        )}
                        {(this.state.chartType === 'bar' || this.state.chartType === 'line') && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Label text="Secondary Y Axis" description="Display on right axis" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6fafb', minHeight: '80px' }}>
                              <Toggle
                                type={Toggle.Types.YES_NO}
                                value={calc.useSecondaryYAxis || false}
                                onChange={useSecondaryYAxis => this.updateCalculatedValue(index, 'useSecondaryYAxis', useSecondaryYAxis)}
                              />
                            </div>
                          </div>
                        )}
                        {hasCircular && (
                          <div style={{ borderTop: '1px solid #e3e3e3', padding: '12px', background: '#fff3cd', color: '#856404' }}>
                            <strong>⚠ Circular Reference Detected</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                              This calculated value references another calculated value that references it back, creating a circular dependency. This will result in null values.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ borderTop: this.state.calculatedValues.length === 0 ? '1px solid #e3e3e3' : 'none', borderLeft: '1px solid #e3e3e3', borderRight: '1px solid #e3e3e3', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6fafb' }}>
              <Button value="+ Add Calculated Value" onClick={this.addCalculatedValue} />
            </div>
          </>
        )}

        {stringAndPointerColumns.length > 0 && (
          <Field label={<Label text="Group By" description="Optional"/>} input={
            <MultiSelect
              value={this.state.groupByColumn}
              onChange={groupByColumn => this.setState({ groupByColumn })}
              placeHolder="Select field(s)"
              formatSelection={selection => selection.length === 1 ? selection[0] : `${selection.length} fields`}
            >
              {stringAndPointerColumns.map(col => (
                <MultiSelectOption key={col} value={col}>
                  {col}
                </MultiSelectOption>
              ))}
            </MultiSelect>
          } />
        )}
      </>
    );
  }

  renderTitleSection() {
    return (
      <Field label={<Label text="Chart Title" description="Optional"/>} input={
        <TextInput
          value={this.state.title}
          onChange={title => this.setState({ title })}
          placeholder="Chart title"
        />
      } />
    );
  }

  renderOptionsSection() {
    return (
      <>
        <Field label={
          <Label
            text="Show Legend"
            description="Display chart legend"
          />
        }         input={
          <Toggle
            type={Toggle.Types.YES_NO}
            value={this.state.showLegend}
            onChange={showLegend => this.setState({ showLegend })}
          />
        } />

        <Field label={
          <Label
            text="Show Grid"
            description="Display grid lines"
          />
        }         input={
          <Toggle
            type={Toggle.Types.YES_NO}
            value={this.state.showGrid}
            onChange={showGrid => this.setState({ showGrid })}
          />
        } />

        <Field label={
          <Label
            text="Show Axis Labels"
            description="Display axis labels"
          />
        }         input={
          <Toggle
            type={Toggle.Types.YES_NO}
            value={this.state.showAxisLabels !== false}
            onChange={showAxisLabels => this.setState({ showAxisLabels })}
          />
        } />

        {(this.state.chartType === 'bar' || this.state.chartType === 'line') && (
          <Field label={
            <Label
              text="Stacked"
              description="Stack multiple series"
            />
          }           input={
            <Toggle
              type={Toggle.Types.YES_NO}
              value={this.state.isStacked}
              onChange={isStacked => this.setState({ isStacked })}
            />
          } />
        )}

        <Field label={
          <Label
            text="Max Data Points"
            description="Limit data points for performance"
          />
        } input={
          <TextInput
            value={this.state.maxDataPointsInput ?? this.state.maxDataPoints.toString()}
            onChange={value => {
              this.setState({ maxDataPointsInput: value });
              const num = parseInt(value, 10);
              if (!isNaN(num) && num > 0) {
                this.setState({ maxDataPoints: num, maxDataPointsInput: null });
              }
            }}
            onBlur={() => {
              // Reset display to valid value on blur
              this.setState({ maxDataPointsInput: null });
            }}
            placeholder="1000"
          />
        } />
      </>
    );
  }

  render() {
    const isEditing = this.props.initialConfig && Object.keys(this.props.initialConfig).length > 0;

    const customFooter = (
      <div style={{ textAlign: 'center' }} className={styles.footer}>
        <Button value="Reset" onClick={this.handleReset} color="red" />
        <Button value="Cancel" onClick={this.props.onCancel} />
        <Button
          primary={true}
          value={isEditing ? 'Update Graph' : 'Create Graph'}
          color="blue"
          disabled={!this.valid()}
          onClick={this.handleConfirm}
        />
      </div>
    );

    return (
      <Modal
        type={Modal.Types.INFO}
        icon="analytics-outline"
        iconSize={40}
        title={isEditing ? 'Edit Graph' : 'Create Graph'}
        subtitle={isEditing ? 'Modify your data visualization settings' : 'Configure your data visualization'}
        customFooter={customFooter}
      >
        <div style={{
          maxHeight: 'calc(100vh - 260px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          border: 'none'
        }}>
          {this.renderTitleSection()}
          {this.renderChartTypeSection()}
          {this.renderColumnSelectionSection()}
          {this.renderOptionsSection()}
        </div>
      </Modal>
    );
  }
}
