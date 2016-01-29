import React      from 'react';
import PropTypes  from 'lib/PropTypes';
import styles     from 'components/FlowFooter/FlowFooter.scss';

let FlowFooter = ({ primary, secondary, errorMessage, borderTop, children }) => (
  <div className={styles.footer} style={borderTop ? { borderTop } : null}>
    <div className={styles.right}>
      {secondary}
      {primary}
    </div>
    <div role='alert' className={[styles.content, errorMessage ? styles.error : ''].join(' ')}>
      {errorMessage || children}
    </div>
  </div>
);
export default FlowFooter;

FlowFooter.propTypes = {
  primary: PropTypes.node.describe(
    'A primary action Button.'
  ),
  secondary: PropTypes.node.describe(
    'A secondary action Button.'
  ),
  errorMessage: PropTypes.node.describe(
    'The error message of the flow.'
  ),
  borderTop: PropTypes.string.describe(
    'Style override for footer border-top.'
  ),
  children: PropTypes.node.describe(
    'The text of the footer. <strong> tags will be rendered in blue.'
  ),
}
