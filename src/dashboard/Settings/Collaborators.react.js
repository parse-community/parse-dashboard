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
import FormTable           from 'components/FormTable/FormTable.react';
import FormNote            from 'components/FormNote/FormNote.react';
import InlineSubmitInput   from 'components/InlineSubmitInput/InlineSubmitInput.react';
import Label               from 'components/Label/Label.react';
import PropTypes           from 'lib/PropTypes';
import React               from 'react';
import TextInput           from 'components/TextInput/TextInput.react';
import validateEmailFormat from 'lib/validateEmailFormat';
import { CurrentApp }      from 'context/currentApp';

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
  static contextType = CurrentApp;
  constructor() {
    super();

    this.state = { lastError: '' };
  }

  handleAdd(newEmail) {
    //TODO: Show some in-progress thing while the collaborator is being validated, or maybe have some sort of
    //async validator in the parent form. Currently if you mash the add button, they same collaborator gets added many times.
    return this.context.validateCollaborator(newEmail).then((response) => {
      // lastError logic assumes we only have 1 input field
      if (response.success) {
        let newCollaborators = this.props.collaborators.concat({ userEmail: newEmail })
        this.setState({ lastError: '' });
        this.props.onAdd(newEmail, newCollaborators);
        return true;
      } else if (response.error) {
        this.setState({ lastError: response.error });
        return false;
      }
    }).catch(({ error }) => {
      this.setState({ lastError: error });
    });
  }

  handleDelete(collaborator) {
    let newCollaborators = this.props.collaborators.filter(oldCollaborator => oldCollaborator.userEmail !== collaborator.userEmail);
    this.props.onRemove(collaborator, newCollaborators);
  }

  validateEmail(email) {
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
          labelWidth={62}
          label={<Label
            text='Add new collaborator'
            description={<span>Collaborators will have read/write access but cannot <br/> delete the app or add more collaborators.</span>}/>}
          input={<InlineSubmitInput
            validate={(email) => this.validateEmail(email)}
            placeholder='What&#39;s their email?'
            onSubmit={this.handleAdd.bind(this)}
            submitButtonText='ADD' />} /> : <Field
          labelWidth={62}
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
            labelWidth={62}
            input={<FormTable
              items={
                this.props.collaborators.map(collaborator => {
                  let canDelete = this.props.viewer_email === this.props.owner_email || collaborator.userEmail === this.props.viewer_email;
                  //TODO(drewgross): add a warning modal for when you are removing yourself as a collaborator, as that is irreversable
                  return {
                    title: collaborator.userName || collaborator.userEmail,
                    color: 'green',
                    onDelete: canDelete ? this.handleDelete.bind(this, collaborator) : undefined,
                    notes: [
                      {
                        key: 'Email',
                        value: collaborator.userEmail,
                      }
                    ],
                  };
                })
              }/>} />

          : null}
      </Fieldset>
    )
  }
}

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
