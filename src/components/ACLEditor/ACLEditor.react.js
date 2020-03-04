/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse             from 'parse';
import PermissionsDialog from 'components/PermissionsDialog/PermissionsDialog.react';
import React             from 'react';

function validateEntry(text) {

  let userQuery;
  let roleQuery;

  if (text === '*') {
    return Promise.resolve({ entry: '*', type: 'public' });
  }

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

function toPerms(acl) {
  if (!acl) {
    return { read: { '*': true }, write: { '*': true } };
  }
  let json = acl.toJSON();
  let perms = { read: {}, write: {} };
  for (let key in json) {
    if (json[key].read) {
      perms.read[key] = true;
    }
    if (json[key].write) {
      perms.write[key] = true;
    }
  }
  return perms;
}

function toACL(perms) {
  let acl = {};
  for (let key in perms.read) {
    if (perms.read[key]) {
      acl[key] = { read: true };
    }
  }
  for (let key in perms.write) {
    if (perms.write[key]) {
      if (acl[key]) {
        acl[key].write = true;
      } else {
        acl[key] = { write: true };
      }
    }
  }
  return new Parse.ACL(acl);
}

let ACLEditor = ({ value, onCommit }) => (
  <PermissionsDialog
    title='Edit Access Control List (ACL)'
    advanced={false}
    confirmText='Save ACL'
    details={<a href='http://docs.parseplatform.org/ios/guide/#object-level-access-control'>Learn more about ACLs and app security</a>}
    permissions={toPerms(value)}
    validateEntry={validateEntry}
    onCancel={() => {
      onCommit(value);
    }}
    onConfirm={(perms) => {
      onCommit(toACL(perms));
    }} />
);

export default ACLEditor;
