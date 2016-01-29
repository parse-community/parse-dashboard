import Button from 'components/Button/Button.react';
import PropTypes from 'lib/PropTypes';
import React from 'react';
import styles from 'components/FormButton/FormButton.scss';

let FormButton = (props) => (
  <div className={styles.input}>
    <Button {...props} primary={true} width='80%' />
  </div>
);

let { primary, width, ...otherPropTypes } = Button.propTypes;
FormButton.propTypes = otherPropTypes;

export default FormButton;
