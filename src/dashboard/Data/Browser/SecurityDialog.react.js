/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon              from 'components/Icon/Icon.react';
import Parse             from 'parse'
import ParseApp          from 'lib/ParseApp';
import PermissionsDialog from 'components/PermissionsDialog/PermissionsDialog.react';
import React             from 'react';
import styles            from 'dashboard/Data/Browser/Browser.scss';

const PARSE_SERVER_SUPPORTS_POINTER_PERMISSIONS = false;

function validateEntry(pointers, text) {
  if (PARSE_SERVER_SUPPORTS_POINTER_PERMISSIONS) { //Eventually we will branch on whether or not the server supports pointer permissions
    if (pointers.indexOf(text) > -1) {
      return Parse.Promise.as({ pointer: text });
    }
  }

  let userQuery = Parse.Query.or(
    new Parse.Query(Parse.User).equalTo('username', text),
    new Parse.Query(Parse.User).equalTo('objectId', text)
  );
  let roleQuery = new Parse.Query(Parse.Role).equalTo('name', text);
  let promise = new Parse.Promise();
  Parse.Promise.when(userQuery.find({ useMasterKey: true }), roleQuery.find({ useMasterKey: true })).then((user, role) => {
    if (user.length > 0) {
      promise.resolve({ user: user[0] });
    } else if (role.length > 0) {
      promise.resolve({ role: role[0] });
    } else {
      promise.reject();
    }
  });

  return promise;
}

export default class SecurityDialog extends React.Component {
  constructor() {
    super();

    this.state = { open: false };
  }

  render() {
    let dialog = null;
    if (this.props.perms && this.state.open) {
      dialog = (
        <PermissionsDialog
          title='Edit Class Level Permissions'
          enablePointerPermissions={PARSE_SERVER_SUPPORTS_POINTER_PERMISSIONS /* not supported by Parse Server yet */}
          advanced={true}
          confirmText='Save CLP'
          details={<a href='https://parse.com/docs/ios/guide#security-class-level-permissions'>Learn more about CLPs and app security</a>}
          permissions={this.props.perms}
          validateEntry={validateEntry.bind(null, this.props.userPointers)}
          onCancel={() => {
            this.setState({ open: false });
          }}
          onConfirm={perms => this.props.onChangeCLP(perms).then(() => this.setState({ open: false }))}
        />
      );
    }
    let classes = [styles.toolbarButton];
    if (this.props.disabled) {
      classes.push(styles.toolbarButtonDisabled);
    }
    let onClick = null;
    if (!this.props.disabled) {
      onClick = () => {
        this.setState({ open: true });
        this.props.setCurrent(null);
      };
    }
    return (
      <div className={classes.join(' ')} onClick={onClick}>
        <Icon width={14} height={14} name='locked-solid' />
        <span>Security</span>
        {dialog}
      </div>
    );
  }
}

SecurityDialog.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
