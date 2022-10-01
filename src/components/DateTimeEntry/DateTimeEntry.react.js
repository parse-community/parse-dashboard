/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimePicker from 'components/DateTimePicker/DateTimePicker.react';
import Popover        from 'components/Popover/Popover.react';
import Position       from 'lib/Position';
import React          from 'react';

export default class DateTimeEntry extends React.Component {
  constructor(props) {
    super();

    this.state = {
      open: false,
      position: null,
      value: props.value.toISOString ? props.value.toISOString() : props.value
    }

    this.rootRef = React.createRef();
    this.inputRef = React.createRef();
  }

  componentWillReceiveProps(props) {
    this.setState({
      value: props.value.toISOString ? props.value.toISOString() : props.value
    });
  }

  toggle() {
    if (this.state.open) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    let node = this.rootRef.current;
    let pos = Position.inDocument(node);
    pos.y += node.clientHeight;
    let height = 230 + node.clientWidth * 0.14;
    if (window.innerHeight - pos.y - height < 40) {
      pos.y = window.innerHeight - height - 40;
    }

    this.setState({
      open: true,
      position: pos
    });
  }

  close() {
    this.setState({
      open: false
    });
  }

  inputDate(e) {
    this.setState({ value: e.target.value, open: false });
  }

  commitDate() {
    if (this.state.value === this.props.value.toISOString()) {
      return;
    }
    let date = new Date(this.state.value);
    if (isNaN(date.getTime())) {
      this.setState({ value: this.props.value.toISOString() });
    } else if (!this.state.value.toLowerCase().endsWith('z')) {
      let utc = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      ));
      this.props.onChange(utc);
    } else {
      this.props.onChange(date);
    }
  }

  focus() {
    this.open();
  }

  render() {
    let popover = null;
    if (this.state.open) {
      popover = (
        <Popover fixed={true} position={this.state.position} onExternalClick={this.close.bind(this)}  parentContentId={this.props.parentContentId}>
          <DateTimePicker
            value={this.props.value}
            width={Math.max(this.rootRef.current.clientWidth, 240)}
            onChange={this.props.onChange}
            close={() => this.setState({ open: false })} />
        </Popover>
      );
    }
    
    return (
      <div className={this.props.className} onClick={this.toggle.bind(this)} ref={this.rootRef}>
        <input
          type='text'
          value={this.state.value}
          onChange={this.inputDate.bind(this)}
          onBlur={this.commitDate.bind(this)}
          ref={this.inputRef} />
        {popover}
      </div>
    );
  }
}
