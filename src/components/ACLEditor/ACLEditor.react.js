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
