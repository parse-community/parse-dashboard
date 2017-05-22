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
import ReactDOM  from 'react-dom';
import styles    from 'components/ChromeDropdown/ChromeDropdown.scss';

export default class ChromeDropdown extends React.Component {
  constructor() {
    super();

    this.state = { 
      open: false,
      selected: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.keyValueMap = {};
    nextProps.options.forEach((value) => {
      if (value instanceof Object) {
        this.keyValueMap[value.key] = value.value;
      }
    });
    if (Object.keys(this.keyValueMap).length === 0) {
      this.keyValueMap = null;
    }
  }

  componentWillMount() {
    this.styles = this.props.styles || styles;
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
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
    let color = this.props.color || 'purple';

    let label = this.props.value;
    if (this.keyValueMap) {
      label = this.keyValueMap[label];
    }
    if (!this.state.selected && this.props.placeholder) {
      // If it's time to show placeholder, show placeholder.
      label = this.props.placeholder;
    }
    let content = (
      <div className={[styles.current, styles[color]].join(' ')} onClick={() => this.setState({ open: true })}>
        <div>{label}</div>
      </div>
    );

    if (this.state.open) {
      let position = Position.inWindow(this.node);
      let measuredWidth = this.node.offsetWidth;
      widthStyle = { width: measuredWidth };
      content = (
        <Popover fixed={true} position={position} onExternalClick={() => this.setState({ open: false })}>
          <div style={widthStyle} className={[styles.menu, styles[color]].join(' ')}>
            {this.props.options.map((o) => {
              let key = o;
              let value = o;
              if (o instanceof Object) {
                key = o.key;
                value = o.value;
              }
              return <div key={key} onClick={this.select.bind(this, key)}>{value}</div>
            })}
          </div>
        </Popover>
      );
    }

    return (
      <div style={widthStyle} className={styles.dropdown}>
        {content}
      </div>
    );
  }
}

ChromeDropdown.propTypes = {
  color: PropTypes.oneOf(['blue', 'purple']).describe(
    'Determines the color of the dropdown.'
  ),
  value: PropTypes.string.isRequired.describe(
    'The current value of the dropdown.'
  ),
  options: PropTypes.array.isRequired.describe(
    'An array of options available in the dropdown. Can be an array of string or array of { key, value }'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'A function called when the dropdown is changed.'
  ),
  width: PropTypes.string.describe(
    'An optional width override.'
  ),
  placeholder: PropTypes.string.describe(
    'Placeholder text used in place of default selection.'
  ),
  styles: PropTypes.object.describe(
    'Styles override used to provide dropdown with differnt skin.'
  ),
};
