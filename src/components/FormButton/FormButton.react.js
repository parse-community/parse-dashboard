/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button from 'components/Button/Button.react';
import React from 'react';
import styles from 'components/FormButton/FormButton.scss';

let FormButton = (props) => (
  <div className={styles.input}>
    <Button {...props} primary={true} width='80%' />
  </div>
);

let { ...otherPropTypes } = Button.propTypes;
FormButton.propTypes = otherPropTypes;

export default FormButton;
