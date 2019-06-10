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
    return Promise.resolve({ user: { id: text } });
  }
  if (text.startsWith('r')) {
    return Promise.resolve({ role: new Parse.Role(text, new Parse.ACL()) });
  }
  if (text.startsWith('u')) {
    return Promise.resolve({ user: { id: 'i' + ((Math.random() * 10000) | 0)}});
  }
  return Promise.reject()
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
            customFeaturesPermissions={{
              "pushAndroidSettings" : "None",
              "pushIOSSettings" : "None",
              "oauth" : "None",
              "cloudCode" : "None",
              "coreSettings" : "None",
              "manageParseServer" : "None",
              "logs" : "None",
              "jobs" : "None",
              "webHostLiveQuery" : "None",
              "verificationEmails" : "None",
              "twitterOauth" : "None",
              "classes" : "None"
            }}
            defaultFeaturesPermissions={{
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
              "twitterOauth" : "Read",
              "classes" : "Write"
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
                'iOS Push notification',
                'Data Browser'
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
                'Get your message across with iOS push',
                'Create, edit, read and delete data from your classes'
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
                true,
                true,
                true
              ]
            }}
            classesPermissions={{
              'User': 'Read',
              'Book': 'Read',
              'Score': 'None',
              'Misc': 'Read'
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
