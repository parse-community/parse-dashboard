/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';

let Icon = ({ name, fill, width, height }) => {
  let props = {
    width: width,
    height: height
  };
  if (fill) {
    props.fill = fill;
  }
  return (
    <svg {...props} >
      <use xlinkHref={`bundles/sprites.svg#${name}`} />
    </svg>
  );
};

export default Icon;

Icon.propTypes = {
  name: PropTypes.string.isRequired.describe(
    'The icon name. This will be the name found in the '
  ),
  width: PropTypes.number.isRequired.describe(
    'The icon width, in pixels.'
  ),
  height: PropTypes.number.isRequired.describe(
    'The icon height, in pixels.'
  ),
  fill: PropTypes.string.describe(
    'A valid color, used as the fill property for the SVG.'
  )
};
