import hasAncestor from 'lib/hasAncestor';
import React from 'react';
import styles from 'components/BooleanEditor/BooleanEditor.scss';
import Toggle from 'components/Toggle/Toggle.react';

export default class BooleanEditor extends React.Component {
  constructor(props) {
    super();

    this.state = {
      value: !!props.value
    };

    this.checkExternalClick = this.checkExternalClick.bind(this);
    this.handleKey = this.handleKey.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener('click', this.checkExternalClick);
    document.body.addEventListener('keypress', this.handleKey);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.checkExternalClick);
    document.body.removeEventListener('keypress', this.handleKey);
  }

  checkExternalClick(e) {
    if (!hasAncestor(e.target, this.refs.input)) {
      this.props.onCommit(this.state.value);
    }
  }

  handleKey(e) {
    if (e.keyCode === 13) {
      this.props.onCommit(this.state.value);
    }
  }

  render() {
    return (
      <div ref='input' style={{ minWidth: this.props.width }} className={styles.editor}>
        <Toggle
          type={Toggle.Types.TRUE_FALSE}
          value={this.state.value}
          onChange={(value) => this.setState({ value })} />
      </div>
    );
  }
}
