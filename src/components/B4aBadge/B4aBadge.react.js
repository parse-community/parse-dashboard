import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/B4aBadge/B4aBadge.scss';

let B4aBadge = ({ label, color }) => (
  <span className={[styles.badge, styles[color || 'blue']].join(' ')}>
    {label.toUpperCase()}
  </span>
);

export default B4aBadge;

B4aBadge.propTypes = {
  label: PropTypes.string.isRequired.describe(
    'The badge label.'
  ),
  color: PropTypes.oneOf(['blue', 'green', 'red']).describe(
    'The color of the badge.'
  )
};
