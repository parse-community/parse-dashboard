import React from 'react';

import styles from 'components/back4App/Button/Button.scss';

let _renderButton = (props, classes) => (
  <button
    className={classes}
    type={`${props.type || 'button'}`}
    {...props.attrs}>{props.children}
  </button>
);

let _renderLink = (props, classes) => (
  <a
    className={classes}
    href={props.url || '#'}
    {...props.attrs}>{props.children}
  </a>
);

let Button = props => {
  let {
    type = 'button',
    color = 'default',
    weight = '400'
  } = props;

  let colorClass = `color-${color}`;
  let weightClass = `weight-${weight}`;
  let classes = `${styles.button} ${styles[colorClass]} ${styles[weightClass]}`;
  let _render = !!props.url || type === 'link' ? _renderLink : _renderButton;
  
  return _render(props, classes);
}

export default Button;
