/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';
import styles from 'components/InlineSubmitInput/InlineSubmitInput.scss';

export default class InlineSubmitInput extends React.Component {
  constructor() {
    super();

    this.state = { value: '', showButton: false };
  }

  validate(value) {
    if (this.props.validate) {
      return this.props.validate(value);
    }
    return value.length > 0;
  }

  handleInputChange(value) {
    this.setState({ value: value, showButton: this.validate(value) });
  }

  handleSubmit() {
    this.props.onSubmit(this.state.value).then((shouldClearInput) => {
      if (shouldClearInput) {
        this.handleInputChange('');
      }
    });
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <div className={this.state.showButton ? styles.input_padded : null}>
          <TextInput
            placeholder={this.props.placeholder}
            value={this.state.value}
            onChange={this.handleInputChange.bind(this)} />
        </div>
        { this.state.showButton ?
          <button type='button' className={styles.button} onClick={this.handleSubmit.bind(this)}>
            <span>{this.props.submitButtonText}</span>
          </button>
          : null
        }
      </div>
    );
  }
}

InlineSubmitInput.propTypes = {
  onSubmit: PropTypes.func.isRequired.describe(
    'A function fired when the submit button is clicked. It receives the current input value as its only parameter, and must return a promise that is resolved with a boolean for whether to clear the input.'
  ),
  submitButtonText: PropTypes.string.isRequired.describe(
    'The text to show on the submit button, which is shown when validate() returns true.'
  ),
  validate: PropTypes.func.describe(
    'A function fired when the input is changed. It receives the new value as its only parameter, and must return a boolean for whether to show the submit button.'
  ),
  placeholder: PropTypes.string.describe(
    'A placeholder string, for when the input is empty'
  ),
};
