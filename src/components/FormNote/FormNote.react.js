/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Directions } from 'lib/Constants';
import PropTypes from 'lib/PropTypes';
import React from 'react';
import SliderWrap from 'components/SliderWrap/SliderWrap.react';
import styles from 'components/FormNote/FormNote.scss';

let FormNote = ({ show, children, color, ...other }) => (
  <SliderWrap {...other} direction={Directions.DOWN} expanded={show} block={true}>
    <div className={[styles.note, styles[color]].join(' ')}>{children}</div>
  </SliderWrap>
);

FormNote.propTypes = {
  show: PropTypes.bool,
  color: PropTypes.oneOf(['blue', 'green', 'orange', 'red'])
};

export default FormNote;
