/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Directions } from 'lib/Constants';
import Popover from 'components/Popover/Popover.react';
import Position from 'lib/Position';
import PropTypes from 'lib/PropTypes';
import React from 'react';
import SliderWrap from 'components/SliderWrap/SliderWrap.react';
import styles from 'components/Dropdown/Dropdown.scss';

export default class Dropdown extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      position: null,
      highlightedIndex: -1,
    };

    this.dropdownRef = React.createRef();
    this.menuRef = React.createRef();
    this.triggerRef = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  getOptions() {
    const options = [];
    React.Children.forEach(this.props.children, c => {
      if (c) {
        options.push(c.props.value);
      }
    });
    return options;
  }

  componentDidUpdate(prevProps, prevState) {
    // When dropdown opens, scroll to the selected item and set highlight
    if (this.state.open && !prevState.open) {
      const options = this.getOptions();
      const selectedIndex = options.indexOf(this.props.value);
      this.setState({ highlightedIndex: selectedIndex >= 0 ? selectedIndex : 0 });

      if (this.menuRef.current) {
        const menu = this.menuRef.current;
        const selectedButton = menu.querySelector('button[data-selected="true"]');
        if (selectedButton) {
          menu.scrollTop = selectedButton.offsetTop;
        }
      }
    }

    // Scroll highlighted item into view
    if (this.state.open && this.state.highlightedIndex !== prevState.highlightedIndex && this.menuRef.current) {
      const buttons = this.menuRef.current.querySelectorAll('button');
      const highlightedButton = buttons[this.state.highlightedIndex];
      if (highlightedButton) {
        highlightedButton.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  handleKeyDown(e) {
    const options = this.getOptions();

    // Don't handle Enter with Command key - let it bubble up for modal submit
    const isEnterWithMeta = e.key === 'Enter' && e.metaKey;

    if (!this.state.open) {
      // Dropdown is closed
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || ((e.key === 'Enter' || e.key === ' ') && !isEnterWithMeta)) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from reaching other handlers
        this.open();
      }
    } else {
      // Dropdown is open
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from reaching other handlers
        this.setState(state => ({
          highlightedIndex: Math.min(state.highlightedIndex + 1, options.length - 1)
        }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from reaching other handlers
        this.setState(state => ({
          highlightedIndex: Math.max(state.highlightedIndex - 1, 0)
        }));
      } else if ((e.key === 'Enter' || e.key === ' ') && !isEnterWithMeta) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from reaching other handlers
        if (this.state.highlightedIndex >= 0 && this.state.highlightedIndex < options.length) {
          this.select(options[this.state.highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation(); // Prevent modal from closing
        this.close();
        // Return focus to trigger
        if (this.triggerRef.current) {
          this.triggerRef.current.focus();
        }
      }
    }
  }

  open() {
    if (this.state.open || this.props.disabled) {
      return;
    }
    let pos = Position.inDocument(this.dropdownRef.current);
    if (this.props.fixed) {
      pos = Position.inWindow(this.dropdownRef.current);
    }
    this.setState({
      open: true,
      position: pos,
    });
  }

  toggle() {
    if (this.state.open) {
      this.close();
    } else {
      this.open();
    }
  }

  close() {
    this.setState({
      open: false,
      highlightedIndex: -1,
    });
  }

  select(value) {
    if (value === this.props.value) {
      return this.setState({ open: false, highlightedIndex: -1 });
    }
    this.setState(
      {
        open: false,
        highlightedIndex: -1,
      },
      () => {
        this.props.onChange(value);
        // Return focus to trigger after selection
        if (this.triggerRef.current) {
          this.triggerRef.current.focus();
        }
      }
    );
  }

  render() {
    let popover = null;
    if (this.state.open && !this.props.disabled) {
      const width = this.dropdownRef.current.clientWidth;
      let optionIndex = 0;
      const popoverChildren = (
        <SliderWrap direction={Directions.DOWN} expanded={true}>
          <div style={{ width }} className={styles.menu} ref={this.menuRef} role="listbox">
            {React.Children.map(this.props.children, c => {
              if (!c) {
                return null;
              }
              const index = optionIndex++;
              const isHighlighted = index === this.state.highlightedIndex;
              const isSelected = c.props.value === this.props.value;
              return (
                <button
                  type="button"
                  onClick={this.select.bind(this, c.props.value)}
                  onMouseEnter={() => this.setState({ highlightedIndex: index })}
                  data-selected={isSelected ? 'true' : undefined}
                  data-highlighted={isHighlighted ? 'true' : undefined}
                  role="option"
                  aria-selected={isSelected}
                  style={isHighlighted ? { backgroundColor: 'rgba(0, 0, 0, 0.1)' } : undefined}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </SliderWrap>
      );
      popover = (
        <Popover
          fixed={this.props.fixed}
          position={this.state.position}
          onExternalClick={this.close.bind(this)}
        >
          {popoverChildren}
        </Popover>
      );
    }
    let content = null;
    React.Children.forEach(this.props.children, c => {
      if (!content && c && c.props.value === this.props.value) {
        content = c;
      }
    });
    if (!content) {
      content = <div className={styles.placeHolder}>{this.props.placeHolder}</div>;
    }
    let dropdownStyle = {};
    if (this.props.width) {
      dropdownStyle = {
        width: this.props.width,
        float: 'left',
      };
    }
    const dropdownClasses = [styles.dropdown];
    if (this.props.disabled) {
      dropdownClasses.push(styles.disabled);
    }
    return (
      <div style={dropdownStyle} className={dropdownClasses.join(' ')} ref={this.dropdownRef}>
        <div
          ref={this.triggerRef}
          className={[styles.current, this.props.hideArrow ? styles.hideArrow : ''].join(' ')}
          onClick={this.toggle.bind(this)}
          onKeyDown={this.handleKeyDown}
          tabIndex={this.props.disabled ? -1 : 0}
          role="combobox"
          aria-expanded={this.state.open}
          aria-haspopup="listbox"
        >
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
  value: PropTypes.string.describe('The currently-selected value of this controlled input.'),
  disabled: PropTypes.bool.describe('Set to true to disable the dropdown.'),
  children: PropTypes.node.isRequired.describe(
    'The children of Dropdown should only be <Option> components.'
  ),
  fixed: PropTypes.bool.describe(
    'Fixes the dropdown in place. Set to true in modals or other places where you don\u2019t want the dropdown to move when you scroll.'
  ),
  placeHolder: PropTypes.string.describe('Placeholder text used in place of default selection.'),
  hideArrow: PropTypes.bool.describe('Flag to hide the dropdown arrow.'),
};
