/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Directions } from 'lib/Constants';
import Popover        from 'components/Popover/Popover.react';
import Position       from 'lib/Position';
import PropTypes      from 'lib/PropTypes';
import React          from 'react';
import SliderWrap     from 'components/SliderWrap/SliderWrap.react';
import styles         from 'components/Dropdown/Dropdown.scss';

export default class Dropdown extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      position: null
    }

    this.dropdownRef = React.createRef();
  }

  toggle() {
    this.setState(() => {
      if (this.state.open) {
        return { open: false };
      }
      let pos = Position.inDocument(this.dropdownRef.current);
      if (this.props.fixed) {
        pos = Position.inWindow(this.dropdownRef.current);
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

  select(value) {
    if (value === this.props.value) {
      return this.setState({ open: false });
    }
    this.setState({
      open: false
    }, () => {
      this.props.onChange(value);
    });
  }

  render() {
    let popover = null;
    if (this.state.open && !this.props.disabled) {
      let width = this.dropdownRef.current.clientWidth;
      let popoverChildren = (
        <SliderWrap direction={Directions.DOWN} expanded={true}>
          <div style={{ width }} className={styles.menu}>
            {React.Children.map(this.props.children, c => (
              <button type='button' onClick={this.select.bind(this, c.props.value)}>{c}</button>
            ))}
          </div>
        </SliderWrap>
      );
      popover =
        <Popover fixed={this.props.fixed} position={this.state.position} onExternalClick={this.close.bind(this)}>
          {popoverChildren}
        </Popover>;
    }
    let content = null;
    React.Children.forEach(this.props.children, c => {
      if (!content && c.props.value === this.props.value) {
        content = c;
      }
    });
    if (!content) {
      content = (
        <div className={styles.placeHolder}>
          {this.props.placeHolder}
        </div>
      );
    }
    let dropdownStyle = {};
    if (this.props.width) {
      dropdownStyle = {
        width: this.props.width,
        float: 'left'
      };
    }
    let dropdownClasses = [styles.dropdown];
    if (this.props.disabled) {
      dropdownClasses.push(styles.disabled);
    }
    return (
      <div style={dropdownStyle} className={dropdownClasses.join(' ')} ref={this.dropdownRef}>
        <div className={[styles.current, this.props.hideArrow ? styles.hideArrow : ''].join(' ')} onClick={this.toggle.bind(this)}>
          {content}
        </div>
        {popover}
      </div>
    );
  }
}

Dropdown.propTypes = {
  onChange: PropTypes.func.isRequired.describe(
    'A function called when the dropdown is changed. It receives the new value as the only parameter.'
  ),
  value: PropTypes.string.describe(
    'The currently-selected value of this controlled input.'
  ),
  disabled: PropTypes.bool.describe('Set to true to disable the dropdown.'),
  children: PropTypes.node.isRequired.describe(
    'The children of Dropdown should only be <Option> components.'
  ),
  fixed: PropTypes.bool.describe(
    'Fixes the dropdown in place. Set to true in modals or other places where you don\u2019t want the dropdown to move when you scroll.'
  ),
  placeHolder: PropTypes.string.describe(
    'Placeholder text used in place of default selection.'
  ),
  hideArrow: PropTypes.bool.describe(
    'Flag to hide the dropdown arrow.'
  ),
}
