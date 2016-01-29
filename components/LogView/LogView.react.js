import PropTypes    from 'lib/PropTypes';
import React        from 'react';
import styles       from 'components/LogView/LogView.scss';

let LogView = (props) => {
  return (
    <ol className={styles.view}>
      {props.children}
    </ol>
  );
}

export default LogView;
