import PropTypes    from 'lib/PropTypes';
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
