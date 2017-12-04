import React from 'react';
import Icon  from 'components/Icon/Icon.react';
import styles from 'components/back4App/Logo/Logo.scss';

export default props => (
  <div className={styles.logo}>
    {
      props.symbol &&
      <div className={styles.face}>
        <Icon width={props.width} height={props.height} name='back4app-logo-face-blue' fill='#208AEC' />
      </div>
    }
    {
      props.text &&
      <div className={styles.text}>
        <Icon width={props.width} height={props.height} name='back4app-logo-text-blue' fill='#208AEC' />
      </div>
    }
  </div>
);
