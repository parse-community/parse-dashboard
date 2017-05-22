/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import ReactDOM  from 'react-dom';
import styles    from 'components/CreditCardInput/CreditCardInput.scss';

const VALID_REGEX = /^[\d ]*$/;

class CreditCardInput extends React.Component {
  constructor() {
    super();
    this.state = {
      cursorPosition: 0,
    };
  }

  componentDidUpdate() {
    ReactDOM.findDOMNode(this).setSelectionRange(this.state.cursorPosition, this.state.cursorPosition);
  }

  render() {
    let { value, lastFour, onChange } = this.props
    let prefilled = false;
    if (value == null && lastFour) {
      prefilled = true;
      value = `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${lastFour}`;
    }
    return (
      <input
        type='text'
        className={styles.input}
        value={value}
        onFocus={ () => {
          if (prefilled) {
            onChange('');
          }
        }}
        onChange={e => {
          let newValue = e.target.value;
          if (VALID_REGEX.test(newValue)) {
            onChange(newValue.replace(/\s/g, ''));
            this.setState({cursorPosition: e.target.selectionStart});
          } else {
            //If they try to type a non-digit, don't move the cursor.
            this.setState({cursorPosition: e.target.selectionStart - 1});
          }
        }} />
    );
  }
}

export default CreditCardInput;

CreditCardInput.propTypes = {
  value: PropTypes.string.describe(
    'The current value of the controlled input.'
  ),
  lastFour: PropTypes.string.describe(
    'If provided, and the current value is falsy, the input will render as "•••• •••• •••• {lastFour}"'
  ),
  onChange: PropTypes.func.describe(
    'A function called when the input is changed.'
  )
};
