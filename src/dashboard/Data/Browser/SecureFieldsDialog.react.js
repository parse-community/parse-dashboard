/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Parse                  from 'parse';
import React                  from 'react';
import styles                 from 'dashboard/Data/Browser/Browser.scss';
import ProtectedFieldsDialog  from 'components/ProtectedFieldsDialog/ProtectedFieldsDialog.react';
import { CurrentApp }         from 'context/currentApp';

const pointerPrefix = 'userField:';

function validateEntry(pointers, text, parseServerSupportsPointerPermissions) {
  if (parseServerSupportsPointerPermissions) {
    let fieldName = text.startsWith(pointerPrefix)
      ? text.substring(pointerPrefix.length)
      : text;
    if (pointers.includes(fieldName)) {
      return Promise.resolve({
        entry: pointerPrefix + fieldName,
        type: 'pointer'
      });
    }
  }

  let userQuery;
  let roleQuery;

  if (text === '*') {
    return Promise.resolve({ entry: '*', type: 'public' });
  }

  if (text.toLowerCase() === 'authenticated') {
    return Promise.resolve({ entry: 'authenticated', type: 'auth' });
  }
  // allow explicitly define whether it is a role or user
  // (e.g there might be both role 'admin' and user 'admin')
  // in such case you can type role:admin to query only roles

  if (text.startsWith('user:')) {
    // no need to query roles
    roleQuery = {
      find: () => Promise.resolve([])
    };

    let user = text.substring(5);
    userQuery = new Parse.Query.or(
      new Parse.Query(Parse.User).equalTo('username', user),
      new Parse.Query(Parse.User).equalTo('objectId', user)
    );
  } else if (text.startsWith('role:')) {
    // no need to query users
    userQuery = {
      find: () => Promise.resolve([])
    };
    let role = text.substring(5);
    roleQuery = new Parse.Query.or(
      new Parse.Query(Parse.Role).equalTo('name', role),
      new Parse.Query(Parse.Role).equalTo('objectId', role)
    );
  } else {
    // query both
    userQuery = Parse.Query.or(
      new Parse.Query(Parse.User).equalTo('username', text),
      new Parse.Query(Parse.User).equalTo('objectId', text)
    );

    roleQuery = Parse.Query.or(
      new Parse.Query(Parse.Role).equalTo('name', text),
      new Parse.Query(Parse.Role).equalTo('objectId', text)
    );
  }

  return Promise.all([
    userQuery.find({ useMasterKey: true }),
    roleQuery.find({ useMasterKey: true })
  ]).then(([user, role]) => {
    if (user.length > 0) {
      return { entry: user[0], type: 'user' };
    } else if (role.length > 0) {
      return { entry: role[0], type: 'role' };
    } else {
      return Promise.reject();
    }
  });
}

export default class SecureFieldsDialog extends React.Component {
  static contextType = CurrentApp;
  constructor(props) {
    super(props);
    this.state = { open: false };

    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.perms !== this.props.perms) {
      this.setState();
    }
  }

  handleOpen() {
    if (!this.props.disabled) {
      this.setState({ open: true }, () => this.props.onEditPermissions(true));
    }
  }

  handleClose() {
    this.setState({ open: false },() => this.props.onEditPermissions(false));
  }

  render() {
    let dialog = null;
    let parseServerSupportsPointerPermissions = this.context
      .serverInfo.features.schemas.editClassLevelPermissions;
    if (this.props.perms && this.state.open) {
      dialog = (
        <ProtectedFieldsDialog
          title="Edit Protected Fields"
          columns={this.props.columns}
          userPointers={this.props.userPointers}
          protectedFields={this.props.perms.protectedFields}
          enablePointerPermissions={parseServerSupportsPointerPermissions}
          advanced={true}
          confirmText="Save"
          details={
            <a
              target="_blank"
              href="http://docs.parseplatform.org/ios/guide/#security"
            >
              Learn more about CLPs and app security
            </a>
          }
          validateEntry={entry =>
            validateEntry(
              this.props.userPointers,
              entry,
              parseServerSupportsPointerPermissions
            )
          }
          onCancel={this.handleClose}
          onConfirm={protectedFields => {
            let newPerms = this.props.perms;
            newPerms.protectedFields = protectedFields;
            this.props
              .onChangeCLP(newPerms)
              .then(this.handleClose);
          }}
        />
      );
    }
    let classes = [styles.toolbarButton];
    if (this.props.disabled) {
      classes.push(styles.toolbarButtonDisabled);
    }

    return dialog;
  }
}
