import React                  from 'react';
import PushExperimentDropdown from 'components/PushExperimentDropdown/PushExperimentDropdown.react';

export const component = PushExperimentDropdown;

class PushExperimentDropdownDemo extends React.Component {
  constructor() {
    super();
    this.state = { color: 'blue' };
  }

  render() {
    return (
      <PushExperimentDropdown
        width={155}
        placeholder='Choose a group'
        value={this.state.color}
        color={this.state.color.toLowerCase()}
        onChange={(color) => this.setState({ color })}
        options={[{key: 'Group A (winner)', style: {color: 'green'} }, {key: 'Group B (loser)', style: {color: 'red'}}]} />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div>
        <PushExperimentDropdownDemo />
      </div>
    )
  },
];
