/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Calendar       from 'components/Calendar/Calendar.react';
import { Directions } from 'lib/Constants';
import { MONTHS }     from 'lib/DateUtils';
import Popover        from 'components/Popover/Popover.react';
import Position       from 'lib/Position';
import React          from 'react';
import ReactDOM       from 'react-dom';
import SliderWrap     from 'components/SliderWrap/SliderWrap.react';
import styles         from 'components/DatePicker/DatePicker.scss';

export default class DatePicker extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      position: null
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
      return {
        open: true,
        position: Position.inDocument(this.node)
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
      let width = this.node.clientWidth;
      popover = (
        <Popover position={this.state.position} onExternalClick={this.close.bind(this)}>
          <SliderWrap direction={Directions.DOWN} expanded={true}>
            <div style={{ width }} className={styles.picker}>
              <Calendar value={this.props.value} onChange={(newValue) => {
                this.setState({ open: false }, this.props.onChange.bind(null, newValue));
              }} />
            </div>
          </SliderWrap>
        </Popover>
      )
    }

    let content = null;
    if (!this.props.value) {
      content = <div className={styles.placeholder}>Pick a date&hellip;</div>;
    } else {
      content = (
        <div className={styles.value}>
          {`${MONTHS[this.props.value.getMonth()].substr(0, 3)} ${this.props.value.getDate()}, ${this.props.value.getFullYear()}`}
        </div>
      );
    }
    
    return (
      <div className={styles.input} onClick={this.toggle.bind(this)}>
        {content}
        {popover}
      </div>
    );
  }
}
