/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AccountManager from 'lib/AccountManager';
import { getToken }   from 'lib/CSRFManager';
import getSiteDomain  from 'lib/getSiteDomain';
import Icon           from 'components/Icon/Icon.react';
import { Link }       from 'react-router';
import React          from 'react';
import styles         from 'components/Sidebar/Sidebar.scss';
import FeedbackDialog from 'components/FeedbackDialog/FeedbackDialog.react';
// As long as we use refs, this can't be a stateless component
export default class SidebarHeader extends React.Component {
  constructor() {
    super();
    this.state = {
      showFeedbackDialog: false,
    };
  }

  render() {
    let devel = window.DEVELOPMENT && (location.search.indexOf('production') < 0);
    let versionStyles = [styles.version];
    if (devel) {
      versionStyles.push(styles.local);
    }

    let feedback = this.state.showFeedbackDialog ? 
      (
        <FeedbackDialog
          onClose={() => {
            this.setState({
              showFeedbackDialog: false
            });
          }}
          open={this.state.showFeedbackDialog} />
      ) : null;

    return (
      <div className={styles.header}>
        <Link className={styles.logo} to='/apps'>
          <Icon width={28} height={28} name='infinity' fill={devel ? '#ff395e' : '#ffffff'} />
        </Link>
        <form ref='switch' method='post' action={`${getSiteDomain()}/account/swap_dashboard`}>
          <input type='hidden' name='authenticity_token' value={getToken()} />
        </form>
        <div className={versionStyles.join(' ')}>
          <div>{devel ? 'Local' : 'Beta'}</div>
          <a onClick={() => {
            this.setState({
              showFeedbackDialog: true
            });
          }} >Send feedback</a>
          <a onClick={() => this.refs.switch.submit()}>Switch back</a>
        </div>
        <div className={styles.account}>
          <Link to='/account'>{AccountManager.currentUser().email}</Link>
        </div>
        {feedback}
      </div>
    );
  }
}
