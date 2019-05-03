import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/B4aBadge/B4aBadge.scss';

let B4aBadge = ({ label, color, additionalStyles = {} }) => (
  <span className={[styles.badge, styles[color || 'blue']].join(' ')} style={additionalStyles}>
    {label}
  </span>
);

export default B4aBadge;

B4aBadge.propTypes = {
  label: PropTypes.string.isRequired.describe(
    'The badge label.'
  ),
  color: PropTypes.oneOf(['blue', 'green', 'red', 'ios', 'android']).describe(
    'The color of the badge.'
  ),
  additionalStyles: PropTypes.object.describe(
    'Additional styles for <span> tag.'
  )
};
