/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Dropdown   from 'components/Dropdown/Dropdown.react';
import Field    from 'components/Field/Field.react';
import Label    from 'components/Label/Label.react';
import Option from 'components/Dropdown/Option.react';
import React    from 'react';

export const component = Dropdown;

class DropdownDemo extends React.Component {
  constructor() {
    super();
    this.state = { value: 'red' };
  }

  handleChange(newValue) {
    this.setState({ value: newValue });
  }

  render() {
    return (
      <Dropdown {...this.props} value={this.state.value} onChange={this.handleChange.bind(this)}>
        <Option value='red'>Red</Option>
        <Option value='orange'>Orange</Option>
        <Option value='yellow'>Yellow</Option>
        <Option value='green'>Green</Option>
        <Option value='blue'>Blue</Option>
        <Option value='purple'>Purple</Option>
        <Option value='rainbow'>Rainbow</Option>
        <Option value='other'>No preference. Instead, I like really long strings</Option>
      </Dropdown>
    );
  }
}

export const demos = [
  {
    render: () => (
      <div style={{width: 500, margin: '0 auto'}}>
        <Field
          label={<Label text='What is your favorite color?' />}
          input={<DropdownDemo />} />
        <Field
          label={<Label text='Disabled input' />}
          input={<DropdownDemo disabled={true} />} />
      </div>
    )
  }
];
