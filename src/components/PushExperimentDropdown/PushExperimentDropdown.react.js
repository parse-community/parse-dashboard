/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Popover   from 'components/Popover/Popover.react';
import PropTypes from 'lib/PropTypes';
import Position  from 'lib/Position';
import React     from 'react';
import styles    from 'components/PushExperimentDropdown/PushExperimentDropdown.scss';

export default class PushExperimentDropdown extends React.Component {
  constructor() {
    super();

    this.state = { 
      open: false,
      selected: false,
    };

    this.dropdownRef = React.createRef();
  }

  componentWillMount() {
    this.styles = this.props.styles || styles;
  }

  select(value, e) {
    e.stopPropagation();
    this.setState({ 
      open: false,
      selected: true,
    }, () => {
      this.props.onChange(value);
    });
  }

  render() {
    let widthStyle = { width: this.props.width || 140 };
    let styles = this.styles;
    let color = this.props.color;
    let content = (
      <div className={[styles.current, styles[color]].join(' ')} onClick={() => this.setState({ open: true })}>
        <div>{!this.state.selected && this.props.placeholder && this.props.value === undefined ? this.props.placeholder : this.props.value}</div>
      </div>
    );
    if (this.state.open) {
      let position = Position.inWindow(this.dropdownRef.current);
      content = (
        <Popover fixed={true} position={position} onExternalClick={() => this.setState({ open: false })}>
          <div style={widthStyle} className={[styles.menu, styles[color]].join(' ')}>
            {this.props.options.map(({key, style}) => <div key={key} style={style} onClick={this.select.bind(this, key)}>{key}</div>)}
          </div>
        </Popover>
      );
    }
    return (
      <div style={widthStyle} className={styles.dropdown} ref={this.dropdownRef}>
        {content}
      </div>
    );
  }
}

PushExperimentDropdown.propTypes = {
  color: PropTypes.string.describe(
    'Determines the color of the dropdown.'
  ),
  value: PropTypes.string.isRequired.describe(
    'The current value of the dropdown.'
  ),
  options: PropTypes.arrayOf(PropTypes.object).isRequired.describe(
    'An array of options available in the dropdown.'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'A function called when the dropdown is changed.'
  ),
  width: PropTypes.string.describe(
    'An optional width override.'
  ),
  placeHolder: PropTypes.string.describe(
    'Placeholder text used in place of default selection.'
  ),
  styles: PropTypes.object.describe(
    'Styles override used to provide dropdown with differnt skin.'
  ),
};
