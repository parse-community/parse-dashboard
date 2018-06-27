/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Link } from 'react-router-dom';
import React    from 'react';
import styles   from 'components/Sidebar/Sidebar.scss';

let SidebarSubItem = ({ active, name, action, link, children }) => {
  if (active) {
    return (
      <div>
        <div className={styles.subitem}>
          {name}
          {action ? action.renderButton() : null}
        </div>
        <div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        className={styles.subitem}
        to={{ pathname: link }}>
        {name}
      </Link>
    </div>
  );
};

export default SidebarSubItem;
