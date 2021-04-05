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
import styles    from 'components/ChromeDropdown/ChromeDropdown.scss';

export default class ChromeDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      selected: false,
      labels: {}
    };
    this.styles = this.props.styles || styles;
    this.nodeRef = React.createRef();
  }

  static getDerivedStateFromProps(props, prevState) {
    const state = { labels: prevState.labels }
    props.options.forEach(value => {
      if (value instanceof Object) {
        state.labels[value.key] = value.value;
      }
    });
    return state
  }

  get node() {
    return this.nodeRef.current;
  }

  open = () => {
    this.setState({ open: true })
  }

  close = () => {
    this.setState({ open: false })
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
    let widthStyle = { width: parseFloat(this.props.width || 140) };
    let styles = this.styles;
    let color = this.props.color || 'purple';

    let label = this.props.value;
    if (this.state.labels[label]) {
      label = this.state.labels[label];
    }
    if (!this.state.selected && this.props.placeholder) {
      // If it's time to show placeholder, show placeholder.
      label = this.props.placeholder;
    }
    let content = (
      <div className={[styles.current, styles[color]].join(' ')} onClick={this.open}>
        <div>{label}</div>
      </div>
    );

    if (this.state.open) {
      const position = Position.inWindow(this.node);
      const measuredWidth = parseFloat(this.node.offsetWidth);
      widthStyle = { width: measuredWidth };
      content = (
        <Popover fixed={true} position={position} onExternalClick={this.close}>
          <div style={widthStyle} className={[styles.menu, styles[color], 'chromeDropdown'].join(' ')}>
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
      <div ref={this.nodeRef} style={widthStyle} className={styles.dropdown}>
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
