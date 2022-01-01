/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
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
    this.inputRef = React.createRef();
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
    if (!hasAncestor(e.target, this.inputRef.current)) {
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
      <div ref={this.inputRef} style={{ minWidth: this.props.width }} className={styles.editor}>
        <Toggle
          type={Toggle.Types.TRUE_FALSE}
          value={this.state.value}
          onChange={(value) => this.setState({ value })} />
      </div>
    );
  }
}
