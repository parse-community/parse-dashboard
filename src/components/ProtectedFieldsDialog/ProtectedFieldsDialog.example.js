/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React             from 'react';
import ProtectedFieldsDialog 
                         from 'components/ProtectedFieldsDialog/ProtectedFieldsDialog.react';
import Button            from 'components/Button/Button.react';

export const component = ProtectedFieldsDialog;


function validateDemo(text) {
  if (text===('*')) {
    return Promise.resolve({ entry: '*' , type:'public'});
  }
  if (text===('authenticated')) {
    return Promise.resolve({ entry: 'authenticated' , type:'auth'});
  }
  if (text.startsWith('u')) {
    return Promise.resolve({ entry: { id: text, get:() => 'demouser' } , type:'user'});
  }
  if (text.startsWith('role:')) {
    const roleName = text.substring(5)
    return Promise.resolve({ entry: {id:`1d0f${roleName}`, getName:()=>roleName}, type:'role' });
  }

  // if (text.startsWith('f')) {
  //   return Promise.resolve({ userField: { id: 'i' + ((Math.random() * 10000) | 0)}});
  // }
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


class ProtectedFieldsDemo extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false
    };
  }

  render() {

    return (
      <div>
        <Button
          value='Show protected fields dialog'
          onClick={() => {
            this.setState({
              show: true
            });
          }}/>

          <ProtectedFieldsDialog
            title='Edit Protected Fields'
            advanced={true}
            confirmText='Save'
            details={<a href='#'>Learn more about CLPs and app security</a>}
            protectedFields={{
              '*': ['password', 'email'],
              'userField:ptr_owner': [],
              'us3r1d': ['password']
            }}
            userPointers={userPointers}
            columns={columns}
            validateEntry={validateDemo}
            onCancel={() => {
              this.setState({
                show: false,
              });
            }}
            onClose={()=>{}}
            onConfirm={(perms) => {
              console.log(perms);
            }} />
      </div>
    );
  }
}

export const demos = [
  {
    render() {
      return (<ProtectedFieldsDemo />);
    }
  }
];
