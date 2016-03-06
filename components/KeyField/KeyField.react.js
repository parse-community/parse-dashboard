/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import FormButton from 'components/FormButton/FormButton.react';
import PropTypes  from 'lib/PropTypes';
import React      from 'react';
import styles     from 'components/KeyField/KeyField.scss';

export default class KeyField extends React.Component {
  constructor(props) {
    super();

    this.state = {
      hidden: props.hidden
    };
  }

  show() {
    this.setState({ hidden: false });
  }

  render() {
    let key = this.props.name || '';
    if (key.length) {
      key += ' ';
    }
    if (this.state.hidden) {
      return (
        <FormButton
          value={this.props.whenHiddenText || `Show ${key}Key`}
          onClick={this.show.bind(this)} />
      );
    }
    return <div className={styles.key}>{this.props.children}</div>;
  }
}

KeyField.propTypes = {
  children: PropTypes.node.describe('The contents of the field. Ideally, this is an app key.'),
  hidden: PropTypes.bool.describe('Determines whether the field is initially hidden'),
  name: PropTypes.string.describe('If the field is initially hidden, this name will be used in the button used to show it. If the value is NAME, the button will contain the text "Show NAME Key"'),
  whenHiddenText: PropTypes.string.describe('Use this instead of "name" if you aren\'t showing a key.'),
};
