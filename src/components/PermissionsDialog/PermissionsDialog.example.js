/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse             from 'parse';
import React             from 'react';
import PermissionsDialog from 'components/PermissionsDialog/PermissionsDialog.react';
import Button            from 'components/Button/Button.react';

export const component = PermissionsDialog;

function validateSimple(text) {
  if (text.startsWith('i')) {
    return Promise.resolve({ user: { id: text } });
  }
  if (text.startsWith('r')) {
    return Promise.resolve({ role: new Parse.Role(text, new Parse.ACL()) });
  }
  if (text.startsWith('u')) {
    return Promise.resolve({ user: { id: 'i' + ((Math.random() * 10000) | 0)}});
  }
  return Promise.reject();
}

function validateAdvanced(text) {
  if (text.startsWith('i')) {
    return Promise.resolve({ user: { id: text } });
  }
  if (text.startsWith('r')) {
    return Promise.resolve({ role: new Parse.Role(text, new Parse.ACL()) });
  }
  if (text.startsWith('u')) {
    return Promise.resolve({ user: { id: 'i' + ((Math.random() * 10000) | 0)}});
  }
  if (text.startsWith('p')) {
    return Promise.resolve({ pointer: text });
  }
  return Promise.reject();
}

class DialogDemo extends React.Component {
  constructor() {
    super()
    this.state = {
      showSimple: false,
      showAdvanced: false,
    };
  }

  render() {
    return (
      <div>
        <Button
          value='Show simple dialog'
          onClick={() => {
            this.setState({
              showSimple: true
            });
          }}/>
        <Button
          value='Show advanced dialog'
          onClick={() => {
            this.setState({
              showAdvanced: true
            });
          }}/>
        {this.state.showSimple ?
          <PermissionsDialog
            title='Edit Access Control List (ACL)'
            advanced={false}
            confirmText='Save ACL'
            details={<a href='#'>Learn more about ACLs and app security</a>}
            permissions={{
              read: {'*': true, 'role:admin': true, 'role:user': true, 's0meU5er1d':true},
              write: {'*': true, 'role:admin':true },
            }}
            validateEntry={validateSimple}
            onCancel={() => {
              this.setState({
                showSimple: false,
              });
            }}
            onConfirm={(perms) => {
              console.log(perms);
            }} /> : null}
        {this.state.showAdvanced ?
          <PermissionsDialog
            title='Edit Class Level Permissions'
            advanced={true}
            confirmText='Save CLP'
            details={<a href='#'>Learn more about CLPs and app security</a>}
            permissions={{
              get: {'*': false, '1234asdf': true, 'role:admin': true,},
              find: {'*': true, '1234asdf': true, 'role:admin': true, },
              create: {'*': true,  },
              update: {'*': true, pointerFields: ['user']},
              delete: {'*': true, },
              addField: {'*': true, 'requiresAuthentication': true},
              readUserFields: ['owner', 'user'],
              writeUserFields: ['owner'],
              protectedFields: {'*': ['password', 'email'], 'userField:owner': []}
            }}
            validateEntry={validateAdvanced}
            onCancel={() => {
              this.setState({
                showAdvanced: false,
              });
            }}
            onConfirm={(perms) => {
              console.log(perms);
            }} /> : null}
      </div>
    );
  }
}

export const demos = [
  {
    render() {
      return (<DialogDemo />);
    }
  }
];