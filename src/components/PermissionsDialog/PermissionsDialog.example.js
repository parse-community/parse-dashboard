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
    return Parse.Promise.as({ user: { id: text } });
  }
  if (text.startsWith('r')) {
    return Parse.Promise.as({ role: new Parse.Role(text, new Parse.ACL()) });
  }
  if (text.startsWith('u')) {
    return Parse.Promise.as({ user: { id: 'i' + ((Math.random() * 10000) | 0)}});
  }
  return Parse.Promise.error();
}

function validateAdvanced(text) {
  if (text.startsWith('i')) {
    return Parse.Promise.as({ user: { id: text } });
  }
  if (text.startsWith('r')) {
    return Parse.Promise.as({ role: new Parse.Role(text, new Parse.ACL()) });
  }
  if (text.startsWith('u')) {
    return Parse.Promise.as({ user: { id: 'i' + ((Math.random() * 10000) | 0)}});
  }
  if (text.startsWith('p')) {
    return Parse.Promise.as({ pointer: text });
  }
  return Parse.Promise.error();
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
              read: {'*': true},
              write: {'*': true},
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
              get: {'*': false, '1234asdf': true, 'role:admin': true},
              find: {'*': true, '1234asdf': true, 'role:admin': true},
              create: {'*': true},
              update: {'*': true},
              delete: {'*': true},
              addField: {'*': true},
              readUserFields: ['owner'],
              writeUserFields: ['owner']
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
