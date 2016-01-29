import React  from 'react';
import styles from 'components/LoginRow/LoginRow.scss';

let LoginRow = ({ label, input, extra }) => (
  <label className={styles.row}>
    <div className={styles.label}>{label}</div>
    {extra ? <div className={styles.extra}>{extra}</div> : null}
    <div className={styles.input}>{input}</div>
  </label>
);

export default LoginRow;
