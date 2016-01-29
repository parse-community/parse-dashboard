import Field           from 'components/Field/Field.react';
import Fieldset        from 'components/Fieldset/Fieldset.react';
import IntervalInput   from 'components/IntervalInput/IntervalInput.react';
import Label           from 'components/Label/Label.react';
import React           from 'react';

export const component = IntervalInput;

class IntervalDemo extends React.Component {
  constructor() {
    super();
    this.state = { count: 15, unit: 'minute' };
  }

  handleChange(count, unit) {
    this.setState({ count, unit });
  }

  render() {
    return (
      <IntervalInput
        count={this.state.count}
        unit={this.state.unit}
        onChange={this.handleChange.bind(this)} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div style={{width: 500, margin: '0 auto'}}>
        <Field
          label={<Label text='How often should it repeat?' />}
          input={<IntervalDemo />} />
      </div>
    )
  }
];
