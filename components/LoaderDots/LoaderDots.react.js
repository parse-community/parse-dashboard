import React  from 'react';
import styles from 'components/LoaderDots/LoaderDots.scss';

export default class LoaderDots extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className={styles.loaderDots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }
}
