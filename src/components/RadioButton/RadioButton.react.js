/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React        from 'react';
import styles       from 'components/RadioButton/RadioButton.scss';

let RadioButton = (props) => {

  return (
    <div className={[styles.radiobutton, props.parentClassName || ''].join(' ')}>
      <input {...props} type="radio"/>
      <span></span>
    </div>
  );
}

export default RadioButton;
