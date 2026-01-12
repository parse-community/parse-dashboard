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
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'radar', label: 'Radar Chart' },
];

const AGGREGATION_TYPES = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
];

export default class GraphDialog extends React.Component {
  constructor(props) {
    super();

    // Pre-fill with existing configuration if editing
    const initialConfig = props.initialConfig || {};

    // Ensure valueColumn is always an array
    let valueColumn = [];
    if (initialConfig.valueColumn) {
      valueColumn = Array.isArray(initialConfig.valueColumn)
        ? initialConfig.valueColumn
        : [initialConfig.valueColumn];
    }

    this.state = {
      chartType: initialConfig.chartType || 'bar',
      xColumn: initialConfig.xColumn || '',
      yColumn: initialConfig.yColumn || '',
      valueColumn: valueColumn,
      groupByColumn: initialConfig.groupByColumn || '',
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

    // Basic validation
    if (!chartType) {
      return false;
    }

    // Chart type specific validation
    switch (chartType) {
      case 'pie':
      case 'doughnut':
        return Array.isArray(valueColumn) && valueColumn.length > 0;
      case 'scatter':
        return !!xColumn && !!yColumn;
      case 'bar':
      case 'line':
      case 'radar':
        return !!xColumn && Array.isArray(valueColumn) && valueColumn.length > 0;
      default:
        return false;
    }
  }

  handleConfirm = () => {
    if (this.valid()) {
      this.props.onConfirm({
        ...this.state,
        // Filter out empty string values
        xColumn: this.state.xColumn || null,
        yColumn: this.state.yColumn || null,
        valueColumn: Array.isArray(this.state.valueColumn) && this.state.valueColumn.length > 0
          ? this.state.valueColumn
          : null,
        groupByColumn: this.state.groupByColumn || null,
      });
    }
  };

  handleReset = () => {
    this.setState({
      chartType: 'bar',
      xColumn: '',
      yColumn: '',
      valueColumn: [],
      groupByColumn: '',
      aggregationType: 'count',
      title: '',
      showLegend: true,
      showGrid: true,
      isStacked: false,
      maxDataPoints: 1000,
    });
  };

  getNumericColumns() {
    return this.props.columns
      ? Object.entries(this.props.columns)
        .filter(([key, col]) => col.type === 'Number' && key !== 'objectId')
        .map(([key]) => key)
      : [];
  }

  getNumericAndPointerColumns() {
    return this.props.columns
      ? Object.entries(this.props.columns)
        .filter(([key, col]) => (col.type === 'Number' || col.type === 'Pointer') && key !== 'objectId')
        .map(([key]) => key)
      : [];
  }

  getAllColumns() {
    return this.props.columns
      ? Object.keys(this.props.columns).filter(key => key !== 'objectId')
      : [];
  }

  getStringColumns() {
    return this.props.columns
      ? Object.entries(this.props.columns)
        .filter(([key, col]) => col.type === 'String' && key !== 'objectId')
        .map(([key]) => key)
      : [];
  }

  getStringAndPointerColumns() {
    return this.props.columns
      ? Object.entries(this.props.columns)
        .filter(([key, col]) => (col.type === 'String' || col.type === 'Pointer') && key !== 'objectId')
        .map(([key]) => key)
      : [];
  }

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
        <Field label={<Label text="X-Axis Column" />} input={
          <Dropdown
            value={this.state.xColumn}
            onChange={xColumn => this.setState({ xColumn })}
            placeholder="Select X-axis column"
          >
            {allColumns.map(col => (
              <Option key={col} value={col}>
                {col}
              </Option>
            ))}
          </Dropdown>
        } />

        {(chartType === 'scatter' || chartType === 'line') && (
          <Field label={<Label text="Y-Axis Column" />} input={
            <Dropdown
              value={this.state.yColumn}
              onChange={yColumn => this.setState({ yColumn })}
              placeholder="Select Y-axis column (numeric)"
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
          <Field label={<Label text="Value Columns" />} input={
            <MultiSelect
              value={this.state.valueColumn}
              onChange={valueColumn => this.setState({ valueColumn })}
              placeHolder="Select value fields"
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

        {stringAndPointerColumns.length > 0 && (
          <Field label={<Label text="Group By (Optional)" />} input={
            <Dropdown
              value={this.state.groupByColumn}
              onChange={groupByColumn => this.setState({ groupByColumn })}
              placeholder="Select grouping column"
            >
              <Option value="">None</Option>
              {stringAndPointerColumns.map(col => (
                <Option key={col} value={col}>
                  {col}
                </Option>
              ))}
            </Dropdown>
          } />
        )}
      </>
    );
  }

  renderTitleSection() {
    return (
      <Field label={<Label text="Chart Title" />} input={
        <TextInput
          value={this.state.title}
          onChange={title => this.setState({ title })}
          placeholder="Optional chart title"
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
