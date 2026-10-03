/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimePicker from 'components/DateTimePicker/DateTimePicker.react';
import { dateInputString, parseDateInput } from 'lib/DateUtils';
import hasAncestor from 'lib/hasAncestor';
import React from 'react';
import styles from 'components/DateTimeEditor/DateTimeEditor.scss';

export default class DateTimeEditor extends React.Component {
  constructor(props) {
    super();

    this.state = {
      open: false,
      position: null,
      value: props.value,
      text: dateInputString(props.value, props.local),
    };

    this.checkExternalClick = this.checkExternalClick.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.inputRef = React.createRef();
    this.editorRef = React.createRef();
  }

  componentDidMount() {
    document.body.addEventListener('click', this.checkExternalClick);
    document.body.addEventListener('touchend', this.checkExternalClick);
    this.inputRef.current.addEventListener('keydown', this.handleKey);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.checkExternalClick);
    document.body.removeEventListener('touchend', this.checkExternalClick);
    this.inputRef.current.removeEventListener('keydown', this.handleKey);
  }

  checkExternalClick(e) {
    if (!hasAncestor(e.target, this.editorRef.current)) {
      this.props.onCommit(this.state.value);
    }
  }

  handleKey(e) {
    if (e.keyCode === 13) {
      this.commitDate();
      this.props.onCommit(this.state.value);
      e.preventDefault();
    } else if (e.keyCode === 27) {
      // ESC key - cancel editing
      if (this.props.onCancel) {
        this.props.onCancel();
      } else {
        this.props.onCommit(this.props.value);
      }
      e.preventDefault();
      e.stopPropagation();
    }
  }

  toggle() {
    this.setState(state => ({ open: !state.open }));
  }

  inputDate(e) {
    this.setState({ text: e.target.value });
  }

  commitDate() {
    if (this.state.text === dateInputString(this.props.value, this.props.local)) {
      return;
    }
    const date = parseDateInput(this.state.text, this.props.local);
    if (date === null) {
      this.setState({
        value: this.props.value,
        text: dateInputString(this.props.value, this.props.local),
      });
    } else {
      this.setState({ value: date });
    }
  }

  render() {
    let popover = null;
    if (this.state.open) {
      popover = (
        <div style={{ position: 'absolute', top: 30, left: 0 }}>
          <DateTimePicker
            value={this.state.value}
            local={this.props.local}
            width={240}
            onChange={value =>
              this.setState({ value: value, text: dateInputString(value, this.props.local) })
            }
            close={() =>
              this.setState({ open: false }, () => this.props.onCommit(this.state.value))
            }
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
        />
        {popover}
      </div>
    );
  }
}
