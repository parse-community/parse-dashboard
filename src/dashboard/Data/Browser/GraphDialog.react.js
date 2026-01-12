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
      isStacked: initialConfig.isStacked || false,
      maxDataPoints: initialConfig.maxDataPoints || 1000,
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
      isStacked: false,
      maxDataPoints: 1000,
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
    const stringColumns = this.getStringColumns();
    const stringAndPointerColumns = this.getStringAndPointerColumns();

    return (
      <>
        <Field label={<Label text="X-Axis" />} input={
          <Dropdown
            value={this.state.xColumn}
            onChange={xColumn => this.setState({ xColumn })}
            placeHolder="Select field"
          >
            {allColumns.map(col => (
              <Option key={col} value={col}>
                {col}
              </Option>
            ))}
          </Dropdown>
        } />

        {(chartType === 'scatter' || chartType === 'line') && (
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

        {(chartType === 'bar' || chartType === 'line' || chartType === 'pie' || chartType === 'doughnut') && (
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

        {(chartType === 'bar' || chartType === 'line' || chartType === 'pie' || chartType === 'doughnut') && (
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

        {(chartType === 'bar' || chartType === 'line' || chartType === 'pie' || chartType === 'doughnut') && (
          <>
            {this.state.calculatedValues.map((calc, index) => {
              const isExpanded = calc.expanded !== false;
              const displayName = calc.name || `Calculated Value ${index + 1}`;

              return (
                <div key={index} style={{ padding: '10px', border: '1px solid #e3e3e3', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '8px' : '0', cursor: 'pointer' }} onClick={() => this.toggleCalculatedValue(index)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
                      <Label text={displayName} />
                    </div>
                    <Button value="Remove" onClick={(e) => { e.stopPropagation(); this.removeCalculatedValue(index); }} />
                  </div>
                  {isExpanded && (
                    <>
                      <Field label={<Label text="Fields" />} input={
                        <MultiSelect
                          value={calc.fields}
                          onChange={fields => this.updateCalculatedValue(index, 'fields', fields)}
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
                      <Field label={<Label text="Operator" />} input={
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
                      } />
                      <Field label={<Label text="Name" />} input={
                        <TextInput
                          value={calc.name}
                          onChange={name => this.updateCalculatedValue(index, 'name', name)}
                          placeholder="Enter name"
                        />
                      } />
                    </>
                  )}
                </div>
              );
            })}
            <Field label={<div style={{ visibility: 'hidden' }}><Label text="&nbsp;" /></div>} input={
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button value="+ Add Calculated Value" onClick={this.addCalculatedValue} />
              </div>
            } />
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
            value={this.state.maxDataPoints.toString()}
            onChange={value => {
              const num = parseInt(value, 10);
              if (!isNaN(num) && num > 0) {
                this.setState({ maxDataPoints: num });
              }
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
        <Button value="Reset" onClick={this.handleReset} />
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
