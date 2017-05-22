/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimePicker from 'components/DateTimePicker/DateTimePicker.react';
import hasAncestor    from 'lib/hasAncestor';
import React          from 'react';
import styles         from 'components/DateTimeEditor/DateTimeEditor.scss';

export default class DateTimeEditor extends React.Component {
  constructor(props) {
    super();

    this.state = {
      open: false,
      position: null,
      value: props.value,
      text: props.value.toISOString()
    };

    this.checkExternalClick = this.checkExternalClick.bind(this);
    this.handleKey = this.handleKey.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({ value: props.value, text: props.value.toISOString() });
  }

  componentDidMount() {
    document.body.addEventListener('click', this.checkExternalClick);
    this.refs.input.addEventListener('keypress', this.handleKey);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.checkExternalClick);
    this.refs.input.removeEventListener('keypress', this.handleKey);
  }

  checkExternalClick(e) {
    if (!hasAncestor(e.target, this.refs.editor)) {
      this.props.onCommit(this.state.value);
    }
  }

  handleKey(e) {
    if (e.keyCode === 13) {
      this.commitDate();
      this.props.onCommit(this.state.value);
    }
  }

  toggle() {
    this.setState((state) => ({ open: !state.open }));
  }

  inputDate(e) {
    this.setState({ text: e.target.value });
  }

  commitDate() {
    if (this.state.text === this.props.value.toISOString()) {
      return;
    }
    let date = new Date(this.state.text);
    if (isNaN(date.getTime())) {
      this.setState({ value: this.props.value, text: this.props.value.toISOString() });
    } else {
      if (this.state.text.endsWith('Z')) {
        this.setState({ value: date });
      } else {
        let utc = new Date(Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds()
        ));
        this.setState({ value: utc });
      }
    }
  }

  render() {
    let popover = null;
    if (this.state.open) {
      popover = (
        <div style={{ position: 'absolute', top: 30, left: 0 }}>
          <DateTimePicker
            value={this.state.value}
            width={240}
            onChange={(value) => this.setState({ value: value, text: value.toISOString() })}
            close={() => this.setState({ open: false }, () => this.props.onCommit(this.state.value))} />
        </div>
      );
    }
    
    return (
      <div ref='editor' style={{ width: this.props.width }} className={styles.editor}>
        <input
          type='text'
          ref='input'
          value={this.state.text}
          onClick={this.toggle.bind(this)}
          onChange={this.inputDate.bind(this)}
          onBlur={this.commitDate.bind(this)} />
        {popover}
      </div>
    );
  }
}
