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

function validateEntry(pointers, text, parseServerSupportsPointerPermissions) {
  if (parseServerSupportsPointerPermissions) {
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
    let parseServerSupportsPointerPermissions = this.context.currentApp.serverInfo.features.schemas.editClassLevelPermissions;
    if (this.props.perms && this.state.open) {
      dialog = (
        <PermissionsDialog
          title='Edit Class Level Permissions'
          enablePointerPermissions={parseServerSupportsPointerPermissions}
          advanced={true}
          confirmText='Save CLP'
          details={<a target="_blank" href='http://docs.parseplatform.org/ios/guide/#security'>Learn more about CLPs and app security</a>}
          permissions={this.props.perms}
          validateEntry={entry => validateEntry(this.props.userPointers, entry, parseServerSupportsPointerPermissions)}
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
