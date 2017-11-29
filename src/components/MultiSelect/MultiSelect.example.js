/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Field             from 'components/Field/Field.react';
import Label             from 'components/Label/Label.react';
import MultiSelect       from 'components/MultiSelect/MultiSelect.react';
import MultiSelectOption from 'components/MultiSelect/MultiSelectOption.react';
import React             from 'react';

export const component = MultiSelect;

class MultiSelectDemo extends React.Component {
  constructor() {
    super();
    this.state = { value: [] };
  }

  handleChange(newValue) {
    this.setState({ value: newValue });
  }

  render() {
    return (
      <MultiSelect endDelineator={this.props.endDelineator} value={this.state.value} onChange={this.handleChange.bind(this)} placeHolder='Choose some fancy colors...'>
        <MultiSelectOption value='red'>Red</MultiSelectOption>
        <MultiSelectOption value='orange'>Orange</MultiSelectOption>
        <MultiSelectOption value='yellow'>Yellow</MultiSelectOption>
        <MultiSelectOption value='green'>Green</MultiSelectOption>
        <MultiSelectOption value='blue'>Blue</MultiSelectOption>
        <MultiSelectOption value='purple'>Purple</MultiSelectOption>
        <MultiSelectOption value='rainbow'>Rainbow</MultiSelectOption>
      </MultiSelect>
    );
  }
}

export const demos = [
  {
    render: () => (
      <div style={{width: 500, margin: '0 auto'}}>
        <Field
          label={<Label text='What are your favorite colors?' />}
          input={<MultiSelectDemo />} />
      </div>
    )
  },
  {
    render: () => (
      <div style={{width: 500, margin: '0 auto'}}>
        <Field
          label={<Label text='What are your favorite colors with new end delineator?' />}
          input={<MultiSelectDemo endDelineator='or'/>} />
      </div>
    )
  },
];
