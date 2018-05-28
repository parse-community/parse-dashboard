/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse             from 'parse';
import React             from 'react';
import PermissionsCollaboratorDialog from 'components/PermissionsCollaboratorDialog/PermissionsCollaboratorDialog.react';
import Button            from 'components/Button/Button.react';

export const component = PermissionsCollaboratorDialog;

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

class DialogDemo extends React.Component {
  constructor() {
    super()
    this.state = {
      showSimple: false
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
        {this.state.showSimple ?
          <PermissionsCollaboratorDialog
            role='User'
            email='ramalho@email.com'
            description='Configure how this user can access the App features.'
            advanced={false}
            confirmText='Save'
            permissions={{
              "pushAndroidSettings" : "Write",
              "pushIOSSettings" : "Read",
              "oauth" : "None",
              "cloudCode" : "Write",
              "coreSettings" : "Read",
              "manageParseServer" : "None",
              "logs" : "Write",
              "jobs" : "Read",
              "webHostLiveQuery" : "None",
              "verificationEmails" : "Write",
              "twitterOauth" : "Read"
            }}
            features={{
              label: [
                'Core Settings',
                'Manage Parse Server',
                'Logs',
                'Cloud Code',
                'Background Jobs',
                'Web Hosting and Live Query',
                'Verification Emails',
                'Facebook Login',
                'Twitter Login',
                'Android Push notification',
                'iOS Push notification'
              ],
              description: [
                'Edit your keys, delete, transfer, clone and restart your app',
                'Change the Parse Server version',
                'See server, accesses and cloud code logs',
                'Deploy your own JavaScript functions',
                'Schedule and run background jobs',
                'Host your web-site without all the hassle\nBuild real time apps',
                'Send automatic emails',
                'Make your app social using Facebook',
                'Make your app social using Twitter',
                'Get your message across with Android push',
                'Get your message across with iOS push'
              ],
              collaboratorsCanWrite: [
                false,
                false,
                false,
                true,
                true,
                true,
                true,
                true,
                true,
                true
              ]
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
