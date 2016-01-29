import Button   from 'components/Button/Button.react';
import ParseApp from 'lib/ParseApp';
import Parse    from 'parse';
import React    from 'react';

export default class RunNowButton extends React.Component {
  constructor() {
    super();

    this.state = {
      progress: null,
      result: null
    };

    this.timeout = null;
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  handleClick() {
    this.setState({ progress: true });
    this.context.currentApp.runJob(this.props.job).then(() => {
      this.setState({ progress: false, result: 'success' });
      this.timeout = setTimeout(() => this.setState({ result: null }), 3000);
    }, () => {
      this.setState({ progress: false, result: 'error' });
      this.timeout = setTimeout(() => this.setState({ result: null }), 3000);
    });
  }

  render() {
    let { job, ...other } = this.props;
    let value = 'Run now';
    if (this.state.result === 'error') {
      value = 'Failed.';
    } else if (this.state.result === 'success') {
      value = 'Success!';
    }
    return (
      <Button
        progress={this.state.progress}
        onClick={this.handleClick.bind(this)}
        color={this.state.result === 'error' ? 'red' : 'blue'}
        value={value}
        {...other} />
    );
  }
}

RunNowButton.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp),
};
