/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React from 'react';
import styles from 'components/TextInput/TextInput.scss';
import { withForwardedRef } from 'lib/withForwardedRef';

class TextInput extends React.Component {
  componentDidUpdate(props) {
    if (props.multiline !== this.props.multiline) {
      const node = props.forwardedRef.current;
      node.focus();
    }
  }

  changeValue(e) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(e.nativeEvent.target.value);
    }
  }
  updateValue(e) {
    const { onBlur } = this.props;
    if (onBlur) {
      onBlur(e.nativeEvent.target.value);
    }
  }

  render() {
    let classes = [styles.text_input];
    if (this.props.monospace) {
      classes.push(styles.monospace);
    }
    if (this.props.multiline) {
      return (
        <textarea
          ref={this.props.forwardedRef}
          id={this.props.id}
          disabled={!!this.props.disabled}
          className={classes.join(' ')}
          rows={this.props.rows && this.props.rows > 3 ? this.props.rows : null}
          style={this.props.rows && this.props.rows > 3 ? null : {height: this.props.height || 80}}
          placeholder={this.props.placeholder}
          value={this.props.value}
          onChange={this.changeValue.bind(this)}
          onBlur={this.updateValue.bind(this)} />
      );
    }
    return (
      <input
        ref={this.props.forwardedRef}
        id={this.props.id}
        type={this.props.hidden ? 'password' : 'text'}
        disabled={!!this.props.disabled}
        className={classes.join(' ')}
        style={{height: this.props.height || 80}}
        placeholder={this.props.placeholder}
        value={this.props.value}
        onChange={this.changeValue.bind(this)}
        onBlur={this.updateValue.bind(this)} />
    );
  }
}

TextInput.propTypes = {
  monospace: PropTypes.bool.describe(
    'Determines whether the input is formatted with a monospace font'
  ),
  disabled: PropTypes.bool.describe(
    'Determines whether the input is disabled'
  ),
  hidden: PropTypes.bool.describe(
    'Determines whether the contents are hidden (password field)'
  ),
  multiline: PropTypes.bool.describe(
    'Determines whether the input is a multiline input (<textarea>), or has a single input line.'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'A function fired when the input is changed. It receives the new value as its only parameter.'
  ),
  onBlur: PropTypes.func.describe(
    'A function fired when the input is blurred.'
  ),
  placeholder: PropTypes.string.describe(
    'A placeholder string, for when the input is empty'
  ),
  value: PropTypes.string.describe(
    'The current value of the controlled input'
  ),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).describe(
    'The height of the field. Can be a string containing any CSS unit, or a number of pixels. Default is 80px.'
  ),
};

export default withForwardedRef(TextInput);
