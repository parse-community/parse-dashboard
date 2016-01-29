import { Link } from 'react-router';
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
        to={link}>
        {name}
      </Link>
    </div>
  );
};

export default SidebarSubItem;
