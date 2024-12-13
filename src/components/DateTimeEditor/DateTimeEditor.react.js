/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimePicker from 'components/DateTimePicker/DateTimePicker.react';
import hasAncestor from 'lib/hasAncestor';
import React from 'react';
import styles from 'components/DateTimeEditor/DateTimeEditor.scss';
import { yearMonthDayTimeFormatter } from 'lib/DateUtils';

export default class DateTimeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      text: props.value.toISOString(),
      open: false
    };
    this.editorRef = React.createRef();
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.inputRef.current.focus();
    this.inputRef.current.select();
  }

  handleKey(e) {
    if (e.keyCode === 13) {
      this.commitDate();
      this.props.onCommit(this.state.value);
    }
  }

  toggle() {
    this.setState(state => ({ open: !state.open }));
  }

  inputDate(e) {
    this.setState({ text: e.target.value });
  }

  commitDate() {
    if (this.state.text === this.props.value.toISOString()) {
      return;
    }
    const date = new Date(this.state.text);
    if (isNaN(date.getTime())) {
      this.setState({
        value: this.props.value,
        text: this.props.value.toISOString()
      });
    } else {
      const utc = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds()
        )
      );
      this.setState({ value: utc });
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
            local={false}
            onChange={value => this.setState({ value, text: value.toISOString() })}
            close={() => {
              this.setState({ open: false }, () => this.props.onCommit(this.state.value));
            }}
          />
        </div>
      );
    }

    return (
      <div ref={this.editorRef} style={{ width: this.props.width }} className={styles.editor}>
        <input
          autoFocus
          type="text"
          ref={this.inputRef}
          value={this.state.text}
          onFocus={e => e.target.select()}
          onClick={this.toggle.bind(this)}
          onChange={this.inputDate.bind(this)}
          onBlur={this.commitDate.bind(this)}
          onKeyDown={this.handleKey.bind(this)}
        />
        {popover}
      </div>
    );
  }
}
