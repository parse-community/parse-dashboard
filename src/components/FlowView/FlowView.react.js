/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button     from 'components/Button/Button.react';
import FlowFooter from 'components/FlowFooter/FlowFooter.react';
import PropTypes  from 'lib/PropTypes';
import React      from 'react';
import SaveButton from 'components/SaveButton/SaveButton.react';

export default class FlowView extends React.Component {
  constructor(props) {
    super();

    this.state = {
      changes: props.initialChanges || {},
      saveState: SaveButton.States.WAITING,
      saveError: '',
    };
  }

  componentWillReceiveProps(props) {
    let newChanges = {...this.state.changes};
    for (let k in props.initialFields) {
      if (this.state.changes[k] === props.initialFields[k]) {
        delete newChanges[k];
      }
    }
    this.setState({changes: newChanges});
  }

  currentFields() {
    let fields = {};
    for (let k in this.props.initialFields) {
      fields[k] = this.props.initialFields[k];
    }
    for (let k in this.state.changes) {
      fields[k] = this.state.changes[k];
    }
    return fields;
  }

  setField(key, value, preserveSavingState = false) {
    if (this.state.saveState !== SaveButton.States.SAVING) {
      let newChanges = {...this.state.changes};
      newChanges[key] = value;
      if (newChanges[key] === this.props.initialFields[key]) {
        delete newChanges[key];
      }
      //Modify stored state in case component recieves new props,
      //as componentWillReceiveProps would otherwise clobber this change.
      this.state.changes[key] = value;
      this.setState({
        saveState: preserveSavingState ? this.state.saveState : SaveButton.States.WAITING,
        saveError: '',
        changes: newChanges,
      });
    }
  }

  resetFields() {
    if (this.state.saveState !== SaveButton.States.SAVING) {
      this.setState({
        saveState: SaveButton.States.WAITING,
        saveError: '',
        changes: this.props.initialChanges || {},
      });
    }
  }

  render() {
    let {
      inProgressText,
      submitText,
      showFooter = () => true,
      footerContents,
      defaultFooterMessage,
      renderForm,
      validate = () => '',
      onSubmit,
      afterSave = () => {},
      secondaryButton = () => <Button
        disabled={this.state.saveState === SaveButton.States.SAVING}
        onClick={this.resetFields.bind(this)}
        value='Cancel'
      />,
    } = this.props;
    let {
      changes,
      saveState,
      saveError,
    } = this.state;
    let setField = this.setField.bind(this);
    let resetFields = this.resetFields.bind(this);
    let fields = this.currentFields();
    let form = renderForm({ fields, changes, setField, resetFields });

    let invalidFormMessage = validate({ changes, fields });
    let hasFormValidationError = React.isValidElement(invalidFormMessage) || (invalidFormMessage && invalidFormMessage.length > 0);
    let errorMessage = '';
    let footerMessage = null;
    let shouldShowFooter = showFooter(changes);

    if (saveState === SaveButton.States.FAILED) {
      errorMessage = saveError;
      shouldShowFooter = true;
    } else if (saveState === SaveButton.States.SUCCEEDED) {
      shouldShowFooter = true;
    } else if (invalidFormMessage === 'use default') {
      footerMessage = defaultFooterMessage;
      shouldShowFooter = true;
    } else if (hasFormValidationError) {
      errorMessage = invalidFormMessage;
      shouldShowFooter = true;
    } else if (shouldShowFooter) {
      shouldShowFooter = Object.keys(changes).length > 0;
      footerMessage = shouldShowFooter ? footerContents({ changes, fields }) : '';
    }

    let saveButton = <SaveButton
      state={saveState}
      waitingText={submitText}
      savingText={inProgressText}
      disabled={!!hasFormValidationError}
      onClick={() => {
        this.setState({ saveState: SaveButton.States.SAVING });
        onSubmit({ changes, fields, setField, resetFields }).then(() => {
          this.setState({ saveState: SaveButton.States.SUCCEEDED });
          afterSave({ fields, setField, resetFields });
        }).fail(({ message, error, notice, errors = [] }) => {
          this.setState({
            saveState: SaveButton.States.FAILED,
            saveError: errors.join(' ') || message || error || notice || 'An error occurred',
          });
        });
      }}
    />;

    let footer = shouldShowFooter ? <FlowFooter
      primary={saveButton}
      secondary={secondaryButton({ setField })}
      errorMessage={errorMessage}>
      {footerMessage}
    </FlowFooter> : null;

    return <div>{form}{footer}</div>;
  }
}

FlowView.propTypes = {
  initialChanges: PropTypes.object.describe('A map of field names to their initial changed values (where applicable), used to seed the form'),
  initialFields: PropTypes.object.isRequired.describe('A map of field names to their starting values. For a creation form, this is probably an empty object.'),
  renderForm: PropTypes.func.isRequired.describe('A function used to render the body of the form. It receives an object with fields (the current form state), changes (an isolated set of changes), setField(name, value) (a method for updating a field), and resetFields().'),
  footerContents: PropTypes.func.isRequired.describe('A function that renders the message in the footer. It receives an object with fields (the current form state) and changes (an isolated set of changes). This will only be called if some changes have been made.'),
  inProgressText: PropTypes.string.describe('Text for commit button when request is in progress. Default is "Save changes".'),
  submitText: PropTypes.string.describe('Text for commit button when filling out form. Default is "Saving\u2026"'),
  onSubmit: PropTypes.func.describe('Function to call when submitting the FlowView. Must return a promise. It receives an object with fields (the current form state) and changes (an isolated set of changes).'),
  afterSave: PropTypes.func.describe('Function to call after saving succeeds. It receives the fields, setField(), and resetFields(). Use this if you require custom modification to fields after save succeeds (eg. in PushSettings we clear the GCM credentials fields after they are saved)'),
  validate: PropTypes.func.describe('Function that validates the form. If it returns a non-empty string, that string is display in the footer, and the submit button is disabled. You can return "use default" to disable the button and use the default message (not in red), but you really shouldn\'t.'),
  showFooter: PropTypes.func.describe('Recieves the changes, and returns false if the footer should be hidden. By default the footer shows if there are any changes.'),
  secondaryButton: PropTypes.func.describe('Overrride the cancel button by passing a function that returns your custom node. By default, the cancel button says "Cancel" and calls resetFields().'),
  defaultFooterMessage: PropTypes.node.describe('A message for the footer when the validate message is "use default"'),
};
