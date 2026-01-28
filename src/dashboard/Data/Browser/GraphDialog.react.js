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
import { validateFormula } from 'lib/FormulaEvaluator';

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
  { value: 'formula', label: 'Formula' },
];

const LINE_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const STROKE_WIDTHS = [
  { value: 1, label: 'Thin (1px)' },
  { value: 2, label: 'Normal (2px)' },
  { value: 4, label: 'Medium (4px)' },
  { value: 8, label: 'Thick (8px)' },
];

const BAR_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'outlined', label: 'Outlined' },
  { value: 'striped', label: 'Striped' },
];

const SERIES_CHART_TYPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
];

// Colors sorted by hue (color wheel order)
const PREDEFINED_COLORS = [
  // Reds
  { value: '#FF6384', label: 'Red' },
  { value: '#E53935', label: 'Crimson' },
  { value: '#FF5733', label: 'Coral' },
  // Oranges
  { value: '#FF9F40', label: 'Orange' },
  { value: '#FFB347', label: 'Peach' },
  // Yellows
  { value: '#FFCD56', label: 'Yellow' },
  { value: '#FDD835', label: 'Gold' },
  // Greens
  { value: '#8BC34A', label: 'Lime' },
  { value: '#4CAF50', label: 'Green' },
  { value: '#2E7D32', label: 'Forest' },
  // Cyan/Teal
  { value: '#4BC0C0', label: 'Teal' },
  { value: '#00BCD4', label: 'Cyan' },
  // Blues
  { value: '#36A2EB', label: 'Blue' },
  { value: '#1E88E5', label: 'Azure' },
  { value: '#1565C0', label: 'Navy' },
  // Indigo/Purple
  { value: '#5733FF', label: 'Indigo' },
  { value: '#9966FF', label: 'Purple' },
  { value: '#7B1FA2', label: 'Violet' },
  // Pinks
  { value: '#E91E63', label: 'Pink' },
  { value: '#F48FB1', label: 'Rose' },
  // Neutrals
  { value: '#795548', label: 'Brown' },
  { value: '#C9CBCF', label: 'Grey' },
  { value: '#455A64', label: 'Slate' },
  { value: '#000000', label: 'Black' },
];

// Validate hex color format: #RRGGBB only
const isValidHexColor = (color) => {
  if (!color) {
    return true;
  }
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

export default class GraphDialog extends React.Component {
  constructor(props) {
    super(props);

    const initialConfig = props.initialConfig || {};

    // Ensure groupByColumn is always an array
    const groupByColumn = initialConfig.groupByColumn
      ? (Array.isArray(initialConfig.groupByColumn) ? initialConfig.groupByColumn : [initialConfig.groupByColumn])
      : [];

    // Series configuration
    const series = (initialConfig.series || []).map(s => ({
      ...s,
      title: s.title || '',
      fields: s.fields || [],
    }));

    // Ensure calculatedValues is always an array
    const calculatedValues = initialConfig.calculatedValues || [];

    this.state = {
      id: initialConfig.id || null,
      chartType: initialConfig.chartType || 'bar',
      xColumn: initialConfig.xColumn || '',
      yColumn: initialConfig.yColumn || '',
      series,
      groupByColumn,
      calculatedValues,
      title: initialConfig.title || '',
      yAxisTitlePrimary: initialConfig.yAxisTitlePrimary || '',
      yAxisTitleSecondary: initialConfig.yAxisTitleSecondary || '',
      showLegend: initialConfig.showLegend !== undefined ? initialConfig.showLegend : true,
      showGrid: initialConfig.showGrid !== undefined ? initialConfig.showGrid : true,
      showAxisLabels: initialConfig.showAxisLabels !== undefined ? initialConfig.showAxisLabels : true,
      isStacked: initialConfig.isStacked || false,
      maxDataPoints: initialConfig.maxDataPoints || 1000,
      maxDataPointsInput: null,
      showDeleteConfirmation: false,
    };
  }

  valid() {
    const { chartType, xColumn, yColumn, series, calculatedValues } = this.state;
    const hasSeries = Array.isArray(series) && series.length > 0 && series.some(s => s.fields && s.fields.length > 0);
    const hasCalculatedValues = Array.isArray(calculatedValues) && calculatedValues.length > 0;
    const hasValuesToDisplay = hasSeries || hasCalculatedValues;

    // Check for any name errors in calculated values
    if (hasCalculatedValues) {
      for (let i = 0; i < calculatedValues.length; i++) {
        if (this.getNameError(i)) {
          return false;
        }
      }
    }

    // Check for invalid hex colors in series
    if (hasSeries) {
      for (const s of series) {
        if (s.color && !isValidHexColor(s.color)) {
          return false;
        }
      }
    }

    // Check for invalid hex colors in calculated values
    if (hasCalculatedValues) {
      for (const calc of calculatedValues) {
        if (calc.color && !isValidHexColor(calc.color)) {
          return false;
        }
      }
    }

    switch (chartType) {
      case 'pie':
      case 'doughnut':
        return hasValuesToDisplay;
      case 'scatter':
        return !!xColumn && !!yColumn;
      case 'bar':
      case 'line':
      case 'radar':
        return !!xColumn && hasValuesToDisplay;
      default:
        return false;
    }
  }

  handleConfirm = () => {
    if (this.valid()) {
      this.props.onConfirm({
        ...this.state,
        className: this.props.className,
        xColumn: this.state.xColumn || null,
        yColumn: this.state.yColumn || null,
        series: this.state.series.length > 0 ? this.state.series : null,
        groupByColumn: this.state.groupByColumn.length > 0 ? this.state.groupByColumn : null,
        calculatedValues: this.state.calculatedValues.length > 0 ? this.state.calculatedValues : null,
      });
    }
  };

  handleDelete = () => {
    this.setState({ showDeleteConfirmation: true });
  };

  confirmDelete = () => {
    if (this.state.id && this.props.onDelete) {
      this.props.onDelete(this.state.id);
    }
  };

  cancelDelete = () => {
    this.setState({ showDeleteConfirmation: false });
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
    // Include series fields and titles
    const seriesFields = [];
    this.state.series.forEach(s => {
      // Add individual fields
      if (s.fields && s.fields.length > 0) {
        seriesFields.push(...s.fields);
      }
      // Add series title if it has one (to allow referencing the aggregated series)
      if (s.title && s.title.trim() !== '') {
        seriesFields.push(s.title);
      }
    });
    // Only include calculated values that come BEFORE the current one
    const calculatedFields = this.state.calculatedValues
      .slice(0, currentIndex >= 0 ? currentIndex : this.state.calculatedValues.length)
      .filter(calc => calc.name && calc.name.trim() !== '')
      .map(calc => calc.name);
    return [...new Set([...numericColumns, ...seriesFields, ...calculatedFields])];
  }

  // Series management methods
  addSeries = () => {
    this.setState({
      series: [
        ...this.state.series,
        { title: '', fields: [], aggregationType: 'count', chartType: '', color: '', lineStyle: '', barStyle: '', expanded: true }
      ]
    });
  };

  removeSeries = (index) => {
    const newSeries = [...this.state.series];
    newSeries.splice(index, 1);
    this.setState({ series: newSeries });
  };

  updateSeries = (index, key, value) => {
    const newSeries = [...this.state.series];
    newSeries[index] = {
      ...newSeries[index],
      [key]: value
    };
    this.setState({ series: newSeries });
  };

  toggleSeries = (index) => {
    const newSeries = [...this.state.series];
    newSeries[index] = {
      ...newSeries[index],
      expanded: !newSeries[index].expanded
    };
    this.setState({ series: newSeries });
  };

  // Calculated value methods
  hasCircularReference(calcIndex, visited = new Set()) {
    const calc = this.state.calculatedValues[calcIndex];
    if (!calc || !calc.fields || !Array.isArray(calc.fields)) {
      return false;
    }

    visited.add(calcIndex);

    for (const field of calc.fields) {
      const referencedCalcIndex = this.state.calculatedValues.findIndex(
        (c, idx) => idx < calcIndex && c.name === field
      );

      if (referencedCalcIndex >= 0) {
        if (visited.has(referencedCalcIndex)) {
          return true;
        }
        if (this.hasCircularReference(referencedCalcIndex, new Set(visited))) {
          return true;
        }
      }
    }

    return false;
  }

  getFormulaError(calcIndex) {
    const calc = this.state.calculatedValues[calcIndex];
    if (!calc || calc.operator !== 'formula' || !calc.formula || calc.formula.trim() === '') {
      return null;
    }

    const numericColumns = this.getNumericColumns();
    const seriesFields = [];
    this.state.series.forEach(s => {
      if (s.fields && s.fields.length > 0) {
        seriesFields.push(...s.fields);
      }
      if (s.title && s.title.trim() !== '') {
        seriesFields.push(s.title);
      }
    });
    const previousCalcNames = this.state.calculatedValues
      .slice(0, calcIndex)
      .filter(c => c.name && c.name.trim() !== '')
      .map(c => c.name);

    const availableVariables = [...new Set([...numericColumns, ...seriesFields, ...previousCalcNames])];

    const validation = validateFormula(calc.formula, availableVariables);
    return validation.isValid ? null : validation.error;
  }

  getNameError(calcIndex) {
    const calc = this.state.calculatedValues[calcIndex];
    if (!calc || !calc.name || calc.name.trim() === '') {
      return null;
    }

    const name = calc.name;
    const trimmedName = name.trim();

    if (name !== trimmedName) {
      return 'Name cannot start or end with spaces';
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      if (/^\d/.test(name)) {
        return 'Name cannot start with a number';
      }
      if (/\s/.test(name)) {
        return 'Name cannot contain spaces';
      }
      return 'Name can only contain letters, numbers, and underscores';
    }

    const duplicateIndex = this.state.calculatedValues.findIndex(
      (c, idx) => idx !== calcIndex && c.name && c.name.trim() === name
    );
    if (duplicateIndex >= 0) {
      return 'Name is already used by another calculated value';
    }

    return null;
  }

  addCalculatedValue = () => {
    this.setState({
      calculatedValues: [
        ...this.state.calculatedValues,
        { fields: [], operator: 'sum', name: '', chartType: '', expanded: true }
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

  renderSeriesBox(s, index) {
    const { chartType } = this.state;
    const isExpanded = s.expanded !== false;
    // Display name: title if set, otherwise first field, otherwise "Series N"
    const displayName = s.title || (s.fields && s.fields.length > 0 ? (s.fields.length === 1 ? s.fields[0] : `${s.fields.length} fields`) : `Series ${index + 1}`);
    const numericAndPointerColumns = this.getNumericAndPointerColumns();
    // Use series-specific chart type, or fall back to global chart type
    const effectiveType = s.chartType || chartType;

    return (
      <div key={index} style={{ paddingTop: '10px', paddingLeft: '10px', paddingRight: '10px', paddingBottom: isExpanded ? '0' : '10px', borderTop: '1px solid #e3e3e3', borderLeft: '1px solid #e3e3e3', borderRight: '1px solid #e3e3e3', borderBottom: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '8px' : '0', cursor: 'pointer' }} onClick={() => this.toggleSeries(index)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
            <Label text={displayName} />
          </div>
          <Button value="Remove" onClick={(e) => { e.stopPropagation(); this.removeSeries(index); }} />
        </div>
        {isExpanded && (
          <div style={{ paddingBottom: '8px' }}>
            <div style={{ borderTop: '1px solid #e3e3e3', borderLeft: '1px solid #e3e3e3', borderRight: '1px solid #e3e3e3', borderBottom: '1px solid #e3e3e3' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Label text="Title" description="Optional custom name" />
                </div>
                <div>
                  <TextInput
                    value={s.title || ''}
                    onChange={title => this.updateSeries(index, 'title', title.replace(/[()]/g, ''))}
                    placeholder="Auto-generated from fields"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Label text="Fields" />
                </div>
                <div>
                  <MultiSelect
                    value={s.fields || []}
                    onChange={fields => this.updateSeries(index, 'fields', fields)}
                    placeHolder="Select field(s)"
                    formatSelection={selection => selection.length === 1 ? selection[0] : `${selection.length} fields`}
                  >
                    {numericAndPointerColumns.map(col => (
                      <MultiSelectOption key={col} value={col}>
                        {col}
                      </MultiSelectOption>
                    ))}
                  </MultiSelect>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Label text="Aggregation" />
                </div>
                <div>
                  <Dropdown
                    value={s.aggregationType || 'count'}
                    onChange={aggregationType => this.updateSeries(index, 'aggregationType', aggregationType)}
                  >
                    {AGGREGATION_TYPES.map(type => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Dropdown>
                </div>
              </div>
              {(chartType === 'bar' || chartType === 'line') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Label text="Chart Type" />
                  </div>
                  <div>
                    <Dropdown
                      value={s.chartType || ''}
                      onChange={seriesChartType => this.updateSeries(index, 'chartType', seriesChartType)}
                      placeHolder={`Default (${chartType === 'bar' ? 'Bar' : 'Line'})`}
                    >
                      <Option value="">Default ({chartType === 'bar' ? 'Bar' : 'Line'})</Option>
                      {SERIES_CHART_TYPES.map(type => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
              )}
              {(chartType === 'bar' || chartType === 'line') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Label text="Secondary Y Axis" description="Display on right axis" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6fafb', minHeight: '80px' }}>
                    <Toggle
                      type={Toggle.Types.YES_NO}
                      value={s.useSecondaryYAxis || false}
                      onChange={useSecondaryYAxis => this.updateSeries(index, 'useSecondaryYAxis', useSecondaryYAxis)}
                    />
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Label text="Color" description="Preset or custom HEX" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f6fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>#</span>
                    <div style={{ width: '70px' }}>
                      <TextInput
                        value={s.color ? s.color.replace(/^#/, '') : ''}
                        onChange={hex => {
                          const cleaned = hex.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                          this.updateSeries(index, 'color', cleaned ? '#' + cleaned : '');
                        }}
                        placeholder="RRGGBB"
                        style={{ textAlign: 'left', paddingLeft: 0 }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Dropdown
                      value={PREDEFINED_COLORS.find(c => c.value === s.color) ? s.color : (s.color ? (isValidHexColor(s.color) ? 'custom' : 'invalid') : '')}
                      onChange={color => { if (color !== 'custom' && color !== 'invalid') { this.updateSeries(index, 'color', color); } }}
                      placeHolder="Preset"
                    >
                      <Option value=""><span style={{ display: 'flex' }}>Auto</span></Option>
                      {s.color && !PREDEFINED_COLORS.find(c => c.value === s.color) && !isValidHexColor(s.color) && (
                        <Option value="invalid">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c62828' }}>
                            <span style={{ width: '14px', height: '14px', backgroundColor: '#ffebee', borderRadius: '2px', border: '1px solid #c62828', flexShrink: 0 }} />
                            Invalid
                          </span>
                        </Option>
                      )}
                      {s.color && !PREDEFINED_COLORS.find(c => c.value === s.color) && isValidHexColor(s.color) && (
                        <Option value="custom">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '14px', height: '14px', backgroundColor: s.color, borderRadius: '2px', border: '1px solid #ccc', flexShrink: 0 }} />
                            Custom
                          </span>
                        </Option>
                      )}
                      {PREDEFINED_COLORS.map(c => (
                        <Option key={c.value} value={c.value}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '14px', height: '14px', backgroundColor: c.value, borderRadius: '2px', border: '1px solid #ccc', flexShrink: 0 }} />
                            {c.label}
                          </span>
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
              </div>
              {effectiveType === 'line' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Label text="Line Style" />
                    </div>
                    <div>
                      <Dropdown
                        value={s.lineStyle || 'solid'}
                        onChange={lineStyle => this.updateSeries(index, 'lineStyle', lineStyle)}
                      >
                        {LINE_STYLES.map(style => (
                          <Option key={style.value} value={style.value}>
                            {style.label}
                          </Option>
                        ))}
                      </Dropdown>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Label text="Stroke Width" />
                    </div>
                    <div>
                      <Dropdown
                        value={s.strokeWidth || 2}
                        onChange={strokeWidth => this.updateSeries(index, 'strokeWidth', strokeWidth)}
                      >
                        {STROKE_WIDTHS.map(sw => (
                          <Option key={sw.value} value={sw.value}>
                            {sw.label}
                          </Option>
                        ))}
                      </Dropdown>
                    </div>
                  </div>
                </>
              )}
              {effectiveType === 'bar' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Label text="Bar Style" />
                  </div>
                  <div>
                    <Dropdown
                      value={s.barStyle || 'solid'}
                      onChange={barStyle => this.updateSeries(index, 'barStyle', barStyle)}
                    >
                      {BAR_STYLES.map(style => (
                        <Option key={style.value} value={style.value}>
                          {style.label}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  renderCalculatedValueBox(calc, index) {
    const { chartType } = this.state;
    const isExpanded = calc.expanded !== false;
    const displayName = calc.name || `Calculated Value ${index + 1}`;
    const numericAndCalculatedFields = this.getNumericAndCalculatedFields(index);
    const hasCircular = this.hasCircularReference(index);
    const formulaError = this.getFormulaError(index);
    // Use calculated value-specific chart type, or fall back to global chart type
    const effectiveType = calc.chartType || chartType;

    return (
      <div key={`calc-${index}`} style={{ paddingTop: '10px', paddingLeft: '10px', paddingRight: '10px', paddingBottom: isExpanded ? '0' : '10px', borderTop: '1px solid #e3e3e3', borderLeft: '1px solid #e3e3e3', borderRight: '1px solid #e3e3e3', borderBottom: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '8px' : '0', cursor: 'pointer' }} onClick={() => this.toggleCalculatedValue(index)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
            <Label text={displayName} />
          </div>
          <Button value="Remove" onClick={(e) => { e.stopPropagation(); this.removeCalculatedValue(index); }} />
        </div>
        {isExpanded && (
          <div style={{ paddingBottom: '8px' }}>
            <div style={{ borderTop: '1px solid #e3e3e3', borderLeft: '1px solid #e3e3e3', borderRight: '1px solid #e3e3e3', borderBottom: '1px solid #e3e3e3' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Label text="Name" />
                </div>
                <div>
                  <TextInput
                    value={calc.name}
                    onChange={name => this.updateCalculatedValue(index, 'name', name.replace(/[()]/g, ''))}
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
              {calc.operator === 'formula' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Label text="Formula" description="e.g., price * quantity" />
                    </div>
                    <div>
                      <TextInput
                        value={calc.formula || ''}
                        onChange={formula => this.updateCalculatedValue(index, 'formula', formula)}
                        placeholder="e.g., round(price * quantity, 2)"
                      />
                    </div>
                  </div>
                  {formulaError && (
                    <div style={{ borderTop: '1px solid #e3e3e3', padding: '12px', background: '#ffebee', color: '#c62828' }}>
                      <strong>Formula Error</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                        {formulaError}
                      </p>
                    </div>
                  )}
                </>
              ) : calc.operator === 'percent' ? (
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
              {(chartType === 'bar' || chartType === 'line') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Label text="Chart Type" />
                  </div>
                  <div>
                    <Dropdown
                      value={calc.chartType || ''}
                      onChange={calcChartType => this.updateCalculatedValue(index, 'chartType', calcChartType)}
                      placeHolder={`Default (${chartType === 'bar' ? 'Bar' : 'Line'})`}
                    >
                      <Option value="">Default ({chartType === 'bar' ? 'Bar' : 'Line'})</Option>
                      {SERIES_CHART_TYPES.map(type => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
              )}
              {(chartType === 'bar' || chartType === 'line') && (
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Label text="Color" description="Preset or custom HEX" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f6fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>#</span>
                    <div style={{ width: '70px' }}>
                      <TextInput
                        value={calc.color ? calc.color.replace(/^#/, '') : ''}
                        onChange={hex => {
                          const cleaned = hex.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                          this.updateCalculatedValue(index, 'color', cleaned ? '#' + cleaned : '');
                        }}
                        placeholder="RRGGBB"
                        style={{ textAlign: 'left', paddingLeft: 0 }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Dropdown
                      value={PREDEFINED_COLORS.find(c => c.value === calc.color) ? calc.color : (calc.color ? (isValidHexColor(calc.color) ? 'custom' : 'invalid') : '')}
                      onChange={color => { if (color !== 'custom' && color !== 'invalid') { this.updateCalculatedValue(index, 'color', color); } }}
                      placeHolder="Preset"
                    >
                      <Option value=""><span style={{ display: 'flex' }}>Auto</span></Option>
                      {calc.color && !PREDEFINED_COLORS.find(c => c.value === calc.color) && !isValidHexColor(calc.color) && (
                        <Option value="invalid">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c62828' }}>
                            <span style={{ width: '14px', height: '14px', backgroundColor: '#ffebee', borderRadius: '2px', border: '1px solid #c62828', flexShrink: 0 }} />
                            Invalid
                          </span>
                        </Option>
                      )}
                      {calc.color && !PREDEFINED_COLORS.find(c => c.value === calc.color) && isValidHexColor(calc.color) && (
                        <Option value="custom">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '14px', height: '14px', backgroundColor: calc.color, borderRadius: '2px', border: '1px solid #ccc', flexShrink: 0 }} />
                            Custom
                          </span>
                        </Option>
                      )}
                      {PREDEFINED_COLORS.map(c => (
                        <Option key={c.value} value={c.value}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '14px', height: '14px', backgroundColor: c.value, borderRadius: '2px', border: '1px solid #ccc', flexShrink: 0 }} />
                            {c.label}
                          </span>
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
              </div>
              {effectiveType === 'line' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Label text="Line Style" />
                    </div>
                    <div>
                      <Dropdown
                        value={calc.lineStyle || 'solid'}
                        onChange={lineStyle => this.updateCalculatedValue(index, 'lineStyle', lineStyle)}
                      >
                        {LINE_STYLES.map(style => (
                          <Option key={style.value} value={style.value}>
                            {style.label}
                          </Option>
                        ))}
                      </Dropdown>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Label text="Stroke Width" />
                    </div>
                    <div>
                      <Dropdown
                        value={calc.strokeWidth || 2}
                        onChange={strokeWidth => this.updateCalculatedValue(index, 'strokeWidth', strokeWidth)}
                      >
                        {STROKE_WIDTHS.map(sw => (
                          <Option key={sw.value} value={sw.value}>
                            {sw.label}
                          </Option>
                        ))}
                      </Dropdown>
                    </div>
                  </div>
                </>
              )}
              {effectiveType === 'bar' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e3e3e3' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Label text="Bar Style" />
                  </div>
                  <div>
                    <Dropdown
                      value={calc.barStyle || 'solid'}
                      onChange={barStyle => this.updateCalculatedValue(index, 'barStyle', barStyle)}
                    >
                      {BAR_STYLES.map(style => (
                        <Option key={style.value} value={style.value}>
                          {style.label}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
              )}
              {hasCircular && (
                <div style={{ borderTop: '1px solid #e3e3e3', padding: '12px', background: '#fff3cd', color: '#856404' }}>
                  <strong>Circular Reference Detected</strong>
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
  }

  renderColumnSelectionSection() {
    const { chartType } = this.state;
    const allColumns = this.getAllColumns();
    const numericColumns = this.getNumericColumns();
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
          <>
            {/* Render series boxes */}
            {this.state.series.map((s, index) => this.renderSeriesBox(s, index))}

            {/* Render calculated value boxes */}
            {this.state.calculatedValues.map((calc, index) => this.renderCalculatedValueBox(calc, index))}

            {/* Add buttons */}
            <div style={{ borderTop: (this.state.series.length === 0 && this.state.calculatedValues.length === 0) ? '1px solid #e3e3e3' : 'none', borderLeft: '1px solid #e3e3e3', borderRight: '1px solid #e3e3e3', borderBottom: '1px solid #e3e3e3', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#f6fafb' }}>
              <Button value="+ Add Series" onClick={this.addSeries} />
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
        } input={
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
        } input={
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
        } input={
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
          } input={
            <Toggle
              type={Toggle.Types.YES_NO}
              value={this.state.isStacked}
              onChange={isStacked => this.setState({ isStacked })}
            />
          } />
        )}

        {(this.state.chartType === 'bar' || this.state.chartType === 'line' || this.state.chartType === 'scatter' || this.state.chartType === 'radar') && (
          <Field label={
            <Label
              text="Y-Axis Title (Primary)"
              description="Optional label for left axis"
            />
          } input={
            <TextInput
              value={this.state.yAxisTitlePrimary}
              onChange={yAxisTitlePrimary => this.setState({ yAxisTitlePrimary })}
              placeholder="Primary Y-axis title"
            />
          } />
        )}

        {(this.state.chartType === 'bar' || this.state.chartType === 'line') && (
          <Field label={
            <Label
              text="Y-Axis Title (Secondary)"
              description="Optional label for right axis"
            />
          } input={
            <TextInput
              value={this.state.yAxisTitleSecondary}
              onChange={yAxisTitleSecondary => this.setState({ yAxisTitleSecondary })}
              placeholder="Secondary Y-axis title"
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

    const customFooter = this.state.showDeleteConfirmation ? (
      <div style={{ textAlign: 'center' }} className={styles.footer}>
        <Button value="Cancel" onClick={this.cancelDelete} />
        <Button
          primary={true}
          value="Confirm Delete"
          color="red"
          onClick={this.confirmDelete}
        />
      </div>
    ) : (
      <div style={{ textAlign: 'center' }} className={styles.footer}>
        {isEditing && this.state.id && (
          <Button value="Delete" onClick={this.handleDelete} color="red" />
        )}
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
