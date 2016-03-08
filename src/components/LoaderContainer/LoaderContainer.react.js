/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { center }   from 'stylesheets/base.scss';
import Loader       from 'components/Loader/Loader.react';
import PropTypes    from 'lib/PropTypes';
import React        from 'react';
import styles       from 'components/LoaderContainer/LoaderContainer.scss';

//Loader wrapper component
//Wraps child component with a layer and <Loader/> centered
const LoaderContainer = ({ loading, hideAnimation, children, solid = true }) => (
  <div className={styles.loaderContainer}>
    <div className={styles.children}>
      {children}
    </div>
    <div className={[styles.loaderParent, loading ? styles.visible : '', solid ? styles.solid : ''].join(' ')}>
      {(hideAnimation || !loading) ? null : <Loader className={center}/>}
    </div>
  </div>
);

export default LoaderContainer;

LoaderContainer.propTypes = {
  loading: PropTypes.bool.describe(
    'State of the loader (true displays loader, false hides loader).'
  ),
  hideAnimation: PropTypes.bool.describe(
    'Whether to hide the animation within the container.'
  ),
  solid: PropTypes.bool.describe(
    'Optional flag to have an solid background. Defaults to true. If false an opacity of 70% is used.'
  ),
};
