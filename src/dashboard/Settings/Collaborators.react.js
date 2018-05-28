/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AccountManager      from 'lib/AccountManager';
import Field               from 'components/Field/Field.react';
import Fieldset            from 'components/Fieldset/Fieldset.react';
import FormTableCollab           from 'components/FormTableCollab/FormTableCollab.react';
import FormNote            from 'components/FormNote/FormNote.react';
import InlineSubmitInput   from 'components/InlineSubmitInput/InlineSubmitInput.react';
import Label               from 'components/Label/Label.react';
import ParseApp            from 'lib/ParseApp';
import PropTypes           from 'lib/PropTypes';
import React               from 'react';
import TextInput           from 'components/TextInput/TextInput.react';
import validateEmailFormat from 'lib/validateEmailFormat';
import PermissionsCollaboratorDialog from 'components/PermissionsCollaboratorDialog/PermissionsCollaboratorDialog.react';

// Component for displaying and modifying an app's collaborator emails.
// There is a single input field for new collaborator emails. As soon as the
// user types a valid email format (and not already existing collaborator), we
// will show an ADD button. When the user clicks the ADD button, we make a call
// to the server to check that the email is a valid Parse account. If so, then
// we'll invoke the onAdd handler of this component. Please note that this
// component does NOT actually add the collaborator to your app on the server;
// the parent component is responsible for doing that when onAdd is invoked.
// The parent also is responsible for passing onRemove, which is called when the
// users removes a collaborator.
export default class Collaborators extends React.Component {
  constructor() {
    super();

    this.state = {
      lastError: '',
      currentEmail: '',
      currentPermission: {},
      currentCollab: {},
      showDialog: false,
      toAdd: false,
      toEdit: false,
    };
  }

  handleAdd(newEmail) {
    console.log(1, newEmail);
    //TODO: Show some in-progress thing while the collaborator is being validated, or maybe have some sort of
    //async validator in the parent form. Currently if you mash the add button, they same collaborator gets added many times.
    return this.context.currentApp.validateCollaborator(newEmail).then((response) => {
      // lastError logic assumes we only have 1 input field
      console.log(2, response);
      if (response.success) {
        this.setState({
          currentEmail: newEmail,
          showDialog: true,
          toAdd: true
        });
        return true;
      } else if (response.error) {
        this.setState({ lastError: response.error });
        return false;
      }
    }).fail(({ error }) => {
      this.setState({ lastError: error });
    });
  }

  handleDelete(collaborator) {
    let newCollaborators = this.props.collaborators.filter(oldCollaborator => oldCollaborator.userEmail !== collaborator.userEmail);
    this.props.onRemove(collaborator, newCollaborators);
  }

  handleEdit(collaborator) {
    this.setState(
      {
        toEdit: true,
        currentPermission: collaborator.featuresPermission,
        currentEmail: collaborator.userEmail,
        currentCollab: collaborator,
        showDialog: true
      }
    )
  }

  validateEmail(email) {
    console.log('validateEmail', email, AccountManager.currentUser());
    // We allow mixed-case emails for Parse accounts
    let isExistingCollaborator = !!this.props.collaborators.find(collab => email.toLowerCase() === collab.userEmail.toLowerCase());
    return validateEmailFormat(email) &&
      !isExistingCollaborator &&
      AccountManager.currentUser().email.toLowerCase() !== email.toLowerCase();
  }

  render() {
    return (
      <Fieldset legend={this.props.legend} description={this.props.description}>
        {this.props.viewer_email === this.props.owner_email ? <Field
          labelWidth={55}
          label={<Label
            text='Add new collaborator'
            description={<span>Collaborators will have read/write access but cannot <br/> delete the app or add more collaborators.</span>}/>}
          input={<InlineSubmitInput
            validate={(email) => this.validateEmail(email)}
            placeholder='What&#39;s their email?'
            onSubmit={this.handleAdd.bind(this)}
            submitButtonText='ADD' />} /> : <Field
          labelWidth={55}
          label={<Label text='App Owner' />}
          input={<TextInput
            value={this.props.owner_email}
            onChange={() => {}}
            disabled={true}
          />}
        />}
        {this.state.lastError !== '' ?
          (<FormNote
            show={true}
            color={'red'}>
            <div>{this.state.lastError}</div>
          </FormNote>) : null}
        {this.props.collaborators.length > 0 ?
          <Field
            label={<Label text='Existing collaborators' />}
            minHeight={40}
            labelWidth={55}
            input={<FormTableCollab
              items={
                this.props.collaborators.map(collaborator => {
                  let canDelete = this.props.viewer_email === this.props.owner_email || collaborator.userEmail === this.props.viewer_email;
                  let canEdit = this.props.viewer_email === this.props.owner_email;
                  //TODO(drewgross): add a warning modal for when you are removing yourself as a collaborator, as that is irreversable
                  return ({
                    title: collaborator.userName || collaborator.userEmail,
                    color: 'green',
                    onDelete: canDelete ? this.handleDelete.bind(this, collaborator) : undefined,
                    onEdit: canEdit ? this.handleEdit.bind(this, collaborator) : undefined,
                  });
                })
              }/>} />

          : null}
        {this.state.showDialog ?
          <PermissionsCollaboratorDialog
            role='User'
            email={this.state.currentEmail}
            description='Configure how this user can access the App features.'
            advanced={false}
            confirmText='Save'
            permissions={
              (
                (this.state.toEdit && this.state.currentPermission) ?
                this.state.currentPermission :
                {
                  "coreSettings" : "Read",
                  "manageParseServer" : "Read",
                  "logs" : "Read",
                  "cloudCode" : "Write",
                  "jobs" : "Write",
                  "webHostLiveQuery" : "Write",
                  "verificationEmails" : "Write",
                  "oauth" : "Write",
                  "twitterOauth" : "Write",
                  "pushAndroidSettings" : "Write",
                  "pushIOSSettings" : "Write",
                }
              )
            }
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
                true,
                true
              ]
            }}
            onCancel={() => {
              this.setState({
                showDialog: false,
              });
            }}
            onConfirm={(featuresPermission) => {
              if (this.state.toAdd) {
                let newCollaborators = this.props.collaborators.concat(
                  {userEmail: this.state.currentEmail, featuresPermission})
                this.props.onAdd(this.state.currentEmail, newCollaborators);
                this.setState(
                  {
                    lastError: '',
                    showDialog: false,
                    toAdd: false,
                    currentEmail: ''
                  }
                );
              }
              else if (this.state.toEdit) {
                let editedCollab = Object.assign({}, this.state.currentCollab);
                editedCollab.featuresPermission = featuresPermission;
                let newCollabs = this.props.collaborators.map(c => {
                  if (c.userEmail === editedCollab.userEmail) c = editedCollab
                  return c
                })
                this.props.onEdit(editedCollab, newCollabs);
                this.setState(
                  {
                    lastError: '',
                    showDialog: false,
                    toEdit: false,
                    currentCollab: {}
                  }
                );
              }
            }} /> : null}
      </Fieldset>

    )
  }
}

Collaborators.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};

Collaborators.propTypes = {
  legend: PropTypes.string.isRequired.describe(
    'Title of this section'
  ),
  description: PropTypes.string.isRequired.describe(
    'Description fo this section (shows below title)'
  ),
  collaborators: PropTypes.arrayOf(PropTypes.any).isRequired.describe('An array of current collaborators of this app'),
  owner_email: PropTypes.string.describe('The email of the owner, to be displayed if the viewer is a collaborator.'),
  viewer_email: PropTypes.string.describe('The email of the viewer, if the viewer is a collaborator, they will not be able to remove collaborators except themselves.'),
  onAdd: PropTypes.func.isRequired.describe(
    'A function that will be called whenever a user adds a valid collaborator email. It receives the new email and an updated array of all collaborators for this app.'
  ),
  onRemove: PropTypes.func.isRequired.describe(
    'A function that will be called whenever a user removes a valid collaborator email. It receives the removed email and an updated array of all collaborators for this app.'
  ),
};
