/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { center } from 'stylesheets/base.scss'
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/CascadingView/CascadingView.scss';

export default class CascadingView extends React.Component {
  constructor() {
    super();
    this.state = {
      expanded: false
    };
  }

  render() {
    let { content, className, children, style } = this.props;
    let expander = <a
      href='javascript:;'
      role='button'
      className={styles.right}>
      <div className={[center, this.state.expanded ? styles.expanded : styles.collapsed].join(' ') } />
    </a>;
    let childrenContainer = this.state.expanded ? (<div className={styles.childrenContainer}>
      <div className={styles.children}>{children}</div>
    </div>) : null;
    let classes = [styles.contentContainer];
    if (className) {
      classes.push(className);
    }

    return (
      <div className={styles.cascadingView}>
        <div
          className={classes.join(' ')}
          style={style}
          onClick={() => this.setState({ expanded: !this.state.expanded })}>
          <span className={styles.left}>{content}</span>
          {expander}
        </div>
        {childrenContainer}
      </div>
    );
  }
}

CascadingView.propTypes = {
  content: PropTypes.node.isRequired.describe(
    'The content of the CascadingView itself. ' +
    'It can be any renderable content.'
  ),
  className: PropTypes.string.describe(
    'A CSS class name to be applied to the collapsed CascadingView.'
  ),
  children: PropTypes.node.isRequired.describe(
    'The children of CascadingView.'
  )
};
