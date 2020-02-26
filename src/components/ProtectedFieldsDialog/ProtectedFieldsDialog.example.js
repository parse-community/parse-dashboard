/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse             from 'parse';
import React             from 'react';
import ProtectedFieldsDialog 
                         from 'components/ProtectedFieldsDialog/ProtectedFieldsDialog.react';
import Button            from 'components/Button/Button.react';

export const component = ProtectedFieldsDialog;

function validateDemo(text) {
  if (text.startsWith('i')) {
    return Promise.resolve({ user: { id: text } });
  }
  if (text.startsWith('r')) {
    return Promise.resolve({ role: new Parse.Role(text, new Parse.ACL()) });
  }
  if (text.startsWith('u')) {
    return Promise.resolve({ user: { id: 'i' + ((Math.random() * 10000) | 0)}});
  }
  if (text.startsWith('f')) {
    return Promise.resolve({ userField: { id: 'i' + ((Math.random() * 10000) | 0)}});
  }
  if (text.startsWith('p')) {
    return Promise.resolve({ pointer: text });
  }
  return Promise.reject();
}

class ProtectedFieldsDemo extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false
    };
  }

  render() {

    let columns = [
        {col: 'email', type: 'String', targetClass:''},
        {col: 'password', type: 'String', targetClass:''},
        {col: 'owner', type: 'Pointer', targetClass:'_User'},
        {col: 'nickname', type: 'String', targetClass:''},
        {col: 'followers', type: 'Array', targetClass:''},
        {col: 'friends', type: 'Array', targetClass:''},
      ];
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
              'userField:owner': [],
              '0bj3ct1d': ['password']
            }}
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
