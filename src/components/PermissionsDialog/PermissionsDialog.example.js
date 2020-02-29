/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// import Parse             from 'parse';
import React             from 'react';
import PermissionsDialog from 'components/PermissionsDialog/PermissionsDialog.react';
import Button            from 'components/Button/Button.react';

export const component = PermissionsDialog;

function validateSimple(text) {

  if (text.startsWith('u')) {
    return Promise.resolve({ entry: { id: text, get:() => 'demouser' } , type:'user'});
  }
  if (text.startsWith('role:')) {
    const roleName = text.substring(5);
    return Promise.resolve({ entry: {id:`1d0f${roleName}`, getName:()=>roleName}, type:'role' });
  }
  if (text.startsWith('ptr')) {
    return Promise.resolve({ entry: text, type: 'pointer' });
  }
  return Promise.reject();
}

function validateAdvanced(text) {
  if (text==='*') {
    return Promise.resolve({ entry: '*' , type:'public'});
  }
  if (text.startsWith('u')) {
    return Promise.resolve({ entry: { id: text, get:() => 'demouser' } , type:'user'});
  }
  if (text.startsWith('role:')) {
    const roleName = text.substring(5);
    return Promise.resolve({ entry: {id:`1d0f${roleName}`, getName:()=>roleName}, type:'role' });
  }
  if (text.startsWith('ptr')) {
    return Promise.resolve({ entry: text, type: 'pointer' });
  }
  return Promise.reject();
}

const columns = {
  'email': { type: 'String',},
  'password':{ type: 'String', },
  'ptr_owner':{ type: 'Pointer', targetClass:'_User'},
  'nickname':{ type: 'String',},
  'ptr_followers':{ type: 'Array', },
  'ptr_friends':{ type: 'Array', }
};

const userPointers = [
  'ptr_followers',
  'ptr_owner',
  'ptr_friends'
]


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
              read: {'*': true, 'role:admin': true, 'role:user': true, 'us3r1d':true},
              write: {'*': true, 'role:admin':true },
            }}
            validateEntry={validateSimple}
            onCancel={() => {
              this.setState({
                showSimple: false,
              });
            }}
            coolumns={columns}
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
              get: {'*': false, 'us3r1d': true, 'role:admin': true,},
              find: {'*': true, 'us3r1d': true, 'role:admin': true, },
              create: {'*': true,  },
              update: {'*': true, pointerFields: ['user']},
              delete: {'*': true, },
              addField: {'*': true, 'requiresAuthentication': true},
              readUserFields: ['ptr_owner', 'ptr_followers', 'ptr_friends'],
              writeUserFields: ['ptr_owner'],
              protectedFields: {'*': ['password', 'email'], 'userField:ptr_owner': []}
            }}
            columns={columns}
            validateEntry={validateAdvanced}
            userPointers={userPointers}
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
