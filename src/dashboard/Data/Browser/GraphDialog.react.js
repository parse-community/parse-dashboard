/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import Option from 'components/Dropdown/Option.react';
import Toggle from 'components/Toggle/Toggle.react';
import TextInput from 'components/TextInput/TextInput.react';

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

    this.state = {
      chartType: initialConfig.chartType || 'bar',
      xColumn: initialConfig.xColumn || '',
      yColumn: initialConfig.yColumn || '',
      valueColumn: initialConfig.valueColumn || '',
      groupByColumn: initialConfig.groupByColumn || '',
      aggregationType: initialConfig.aggregationType || 'count',
      title: initialConfig.title || '',
      showLegend: initialConfig.showLegend !== undefined ? initialConfig.showLegend : true,
      showGrid: initialConfig.showGrid !== undefined ? initialConfig.showGrid : true,
      isStacked: initialConfig.isStacked || false,
      maxDataPoints: initialConfig.maxDataPoints || 50,
    };
  }

  valid() {
    const { chartType, xColumn, yColumn, valueColumn } = this.state;

    // Basic validation
    if (!chartType || !xColumn) {
      return false;
    }

    // Chart type specific validation
    switch (chartType) {
      case 'pie':
      case 'doughnut':
        return !!valueColumn;
      case 'scatter':
        return !!xColumn && !!yColumn;
      default:
        return !!xColumn;
    }
  }

  handleConfirm = () => {
    if (this.valid()) {
      this.props.onConfirm({
        ...this.state,
        // Filter out empty string values
        xColumn: this.state.xColumn || null,
        yColumn: this.state.yColumn || null,
        valueColumn: this.state.valueColumn || null,
        groupByColumn: this.state.groupByColumn || null,
      });
    }
  };

  getNumericColumns() {
    return this.props.columns
      ? Object.entries(this.props.columns)
          .filter(([key, col]) => col.type === 'Number' && key !== 'objectId')
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
    const stringColumns = this.getStringColumns();

    return (
      <div>
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
          <Field label={<Label text="Value Column" />} input={
            <Dropdown
              value={this.state.valueColumn}
              onChange={valueColumn => this.setState({ valueColumn })}
              placeholder="Select value column (numeric)"
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

        {stringColumns.length > 0 && (
          <Field label={<Label text="Group By (Optional)" />} input={
            <Dropdown
              value={this.state.groupByColumn}
              onChange={groupByColumn => this.setState({ groupByColumn })}
              placeholder="Select grouping column"
            >
              <Option value="">None</Option>
              {stringColumns.map(col => (
                <Option key={col} value={col}>
                  {col}
                </Option>
              ))}
            </Dropdown>
          } />
        )}
      </div>
    );
  }

  renderOptionsSection() {
    return (
      <div>
        <Field label={<Label text="Chart Title" />} input={
          <TextInput
            value={this.state.title}
            onChange={title => this.setState({ title })}
            placeholder="Optional chart title"
          />
        } />

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
            placeholder="50"
          />
        } />
      </div>
    );
  }

  render() {
    const isEditing = this.props.initialConfig && Object.keys(this.props.initialConfig).length > 0;

    return (
      <Modal
        type={Modal.Types.INFO}
        icon="chart-line"
        iconSize={40}
        title={isEditing ? "Edit Graph" : "Create Graph"}
        subtitle={isEditing ? "Modify your data visualization settings" : "Configure your data visualization"}
        confirmText={isEditing ? "Update Graph" : "Create Graph"}
        cancelText="Cancel"
        disabled={!this.valid()}
        buttonsInCenter={true}
        onCancel={this.props.onCancel}
        onConfirm={this.handleConfirm}
      >
        <div style={{ padding: '20px 0' }}>
          {this.renderChartTypeSection()}
          <div style={{ margin: '20px 0' }} />
          {this.renderColumnSelectionSection()}
          <div style={{ margin: '20px 0' }} />
          {this.renderOptionsSection()}
        </div>
      </Modal>
    );
  }
}