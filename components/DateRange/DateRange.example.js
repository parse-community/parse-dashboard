import DateRange      from 'components/DateRange/DateRange.react';
import { Directions } from 'lib/Constants';
import Field          from 'components/Field/Field.react';
import Fieldset       from 'components/Fieldset/Fieldset.react';
import Label          from 'components/Label/Label.react';
import Option         from 'components/Dropdown/Option.react';
import React          from 'react';

export const component = DateRange;

class Demo extends React.Component {
  constructor() {
    super();
    this.state = { value: {} };
  }

  handleChange(newValue) {
    this.setState({ value: newValue });
  }

  render() {
    return (
      <DateRange value={this.state.value} onChange={this.handleChange.bind(this)} align={this.props.align} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div style={{ width: 500, margin: '0 auto' }}>
        <Demo />
      </div>
    )
  },
  {
    render: () => (
      <div style={{ width: 500, margin: '0 auto', textAlign: 'right' }}>
        <Demo align={Directions.RIGHT} />
      </div>
    )
  }
];
