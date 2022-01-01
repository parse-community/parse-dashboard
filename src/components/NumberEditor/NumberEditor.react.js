/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import validateNumeric from 'lib/validateNumeric';
import React from 'react';
import styles from 'components/NumberEditor/NumberEditor.scss';

export default class NumberEditor extends React.Component {
  constructor(props) {
    super();

    this.state = {
      value: props.value || 0
    };

    this.checkExternalClick = this.checkExternalClick.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.inputRef.current.setSelectionRange(0, String(this.state.value).length);
    document.body.addEventListener('click', this.checkExternalClick);
    document.body.addEventListener('keypress', this.handleKey);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.checkExternalClick);
    document.body.removeEventListener('keypress', this.handleKey);
  }

  checkExternalClick(e) {
    if (e.target !== this.inputRef.current) {
      this.commitValue()
    }
  }

  handleKey(e) {
    if (e.keyCode === 13) {
      this.commitValue();
    }
  }

  commitValue() {
    let value = this.state.value;
    if (typeof value === 'string') {
      if (value === '') {
        value = undefined;
      } else {
        value = parseFloat(value);
      }
    }
    this.props.onCommit(value);
  }

  render() {
    let onChange = (e) => {
      let value = e.target.value;
      this.setState({ value: validateNumeric(value) ? value : this.state.value });
    };
    return (
      <div style={{ width: this.props.width }} className={styles.editor}>
        <input
          ref={this.inputRef}
          value={this.state.value}
          onChange={onChange} />
      </div>
    );
  }
}
