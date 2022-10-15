/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import styles from 'components/StringEditor/StringEditor.scss';

export default class StringEditor extends React.Component {
  constructor(props) {
    super();

    this.state = {
      value: props.value || ''
    };

    this.checkExternalClick = this.checkExternalClick.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.inputRef.current.setSelectionRange(0, this.state.value.length);
    document.body.addEventListener('click', this.checkExternalClick);
    document.body.addEventListener('keypress', this.handleKey);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.checkExternalClick);
    document.body.removeEventListener('keypress', this.handleKey);
  }

  checkExternalClick(e) {
    if (e.target !== this.inputRef.current) {
      this.props.onCommit(this.state.value);
    }
  }

  handleKey(e) {
    if (e.keyCode === 13) {
      // if it's a multiline input, we allow Shift+Enter to create a newline
      // Otherwise, we submit
      if (!this.props.multiline || !e.shiftKey) {
        this.props.onCommit(this.state.value);
      }
    }
  }

  render() {
    let classes = [styles.editor];
    let onChange = this.props.readonly ? () => {} : (e) => this.setState({ value: e.target.value });
    if (this.props.readonly) {
      classes.push(styles.readonly)
    }

    if (this.props.multiline) {
      var style = { minWidth: this.props.minWidth };
      if (this.props.resizable) {
        style.resize = 'both';
      }
      return (
        <div className={styles.editor}>
          <textarea
            ref={this.inputRef}
            value={this.state.value}
            onChange={onChange}
            style={style} />
        </div>
      );
    }
    return (
      <div style={{ width: this.props.width }} className={classes.join(' ')}>
        <input
          ref={this.inputRef}
          value={this.state.value}
          onChange={onChange}
          disabled={this.props.readonly} />
      </div>
    );
  }
}
