/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimePicker                from 'components/DateTimePicker/DateTimePicker.react';
import { MONTHS, getDateMethod }     from 'lib/DateUtils';
import Popover                       from 'components/Popover/Popover.react';
import Position                      from 'lib/Position';
import React                         from 'react';
import ReactDOM                      from 'react-dom';
import styles                        from 'components/DateTimeInput/DateTimeInput.scss';

export default class DateTimeInput extends React.Component {
  constructor() {
    super();

    this.state = {
      open: false,
      position: null,
    }
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
  }

  toggle() {
    this.setState(() => {
      if (this.state.open) {
        return { open: false };
      }
      let pos = Position.inDocument(this.node);
      let height = 230 + this.node.clientWidth * 0.14;
      if (this.props.fixed) {
        pos = Position.inWindow(this.node);
        if (window.innerHeight - pos.y - height < 40) {
          pos.y = window.innerHeight - height - 40;
        }
      } else {
        if (document.body.clientHeight - pos.y - height < 60) {
          pos.y = document.body.clientHeight - height - 60;
        }
      }
      return {
        open: true,
        position: pos
      };
    });
  }

  close() {
    this.setState({
      open: false
    });
  }

  render() {
    let popover = null;
    if (this.state.open) {
      popover = (
        <Popover fixed={this.props.fixed} position={this.state.position} onExternalClick={this.close.bind(this)}>
          <DateTimePicker
            local={this.props.local}
            value={this.props.value}
            width={this.node.clientWidth}
            onChange={this.props.onChange}
            close={() => this.setState({ open: false })} />
        </Popover>
      );
    }

    let content = null;
    if (!this.props.value) {
      content = <div className={styles.placeholder}>Pick a date and time&hellip;</div>;
    } else {
      content = (
        <div className={styles.value}>
          <strong>{MONTHS[this.props.value[getDateMethod(this.props.local, 'getMonth')]()].substr(0, 3) + ' ' + this.props.value[getDateMethod(this.props.local, 'getDate')]()}</strong>
          <span> at </span>
          <strong>
            {this.props.value[getDateMethod(this.props.local, 'getHours')]()}:{(this.props.value[getDateMethod(this.props.local, 'getMinutes')]() < 10 ? '0' : '') + this.props.value[getDateMethod(this.props.local, 'getMinutes')]()}
          </strong>
          {!this.props.local ? <span> UTC</span> : null}
        </div>
      );
    }
    
    return (
      <div className={styles.input} onClick={this.props.disabled ? null : this.toggle.bind(this)}>
        {content}
        {popover}
      </div>
    );
  }
}
