/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React     from 'react';
import PropTypes from 'lib/PropTypes';
import Modal     from 'components/Modal/Modal.react';
import FormNote  from 'components/FormNote/FormNote.react';

export default class FormModal extends React.Component {
  constructor() {
    super();
    this.state = {
      errorMessage: '',
      inProgress: false,
    };
  }

  render() {
    let {
      children,
      open,
      submitText = 'Confirm',
      inProgressText = 'Confirming\u2026',
      enabled = true,
      onSubmit,
      onSuccess = () => {},
      onClose,
      clearFields = () => {},
      showErrors = true,
      ...modalProps
    } = this.props;
    let showModal = open || this.state.inProgress;
    if (!modalProps.type) {
      if (this.state.errorMessage.length > 0) {
        modalProps.type = Modal.Types.DANGER;
      } else if (enabled) {
        modalProps.type = Modal.Types.VALID;
      }
    }
    return (showModal ? <Modal
      {...modalProps}
      confirmText={this.state.inProgress ? inProgressText : submitText}
      onConfirm={() => {
        this.setState({
          errorMessage: '',
          inProgress: true,
        });
        onSubmit().then(result => {
          onClose();
          clearFields();
          onSuccess(result);
          this.setState({inProgress: false});
        }).catch(({ message, error, notice, errors = [] }) => {
          this.setState({
            errorMessage: errors.join(' ') || message || error || notice || 'An error occurred',
            inProgress: false,
          });
        });
      }}
      onCancel={() => {
        onClose();
        clearFields();
        this.setState({
          errorMessage: '',
        });
      }}
      disabled={!enabled}
      canCancel={!this.state.inProgress}
      progress={this.state.inProgress} >
      {children}
      {showErrors ? <FormNote
        show={this.state.errorMessage.length > 0}
        color='red' >
        {this.state.errorMessage}
      </FormNote> : null}
    </Modal> : null)
  }
}

let { ...forwardedModalProps} = Modal.propTypes;
FormModal.propTypes = {
  ...forwardedModalProps,
  children: PropTypes.node.describe('The form elements to be rendered in the modal.'),
  open: PropTypes.bool.isRequired.describe('Whether or not to show the modal.'),
  submitText: PropTypes.string.describe('The text to show on the CTA button. Defaults to "Confirm"'),
  inProgressText: PropTypes.string.describe('The text to show to the CTA button while the request is in flight. Defaults to "Confirming\u2026".'),
  onSubmit: PropTypes.func.isRequired.describe('A function that will be called when the user submits the form. This function must return a promise.'),
  onSuccess: PropTypes.func.describe('A function that will be called with the result of the promise created in onSubmit.'),
  onClose: PropTypes.func.isRequired.describe('A function that will be called when the modal is closing. After this function is called, the parent should not pass "true" to the "open" prop.'),
  clearFields: PropTypes.func.describe('A function that should clear the state of the form fields inside the modal.'),
  enabled: PropTypes.bool.describe('Set to false to disable the confirm button.'),
  showErrors: PropTypes.bool.describe('Set to false to hide errors if you are doing custom error handling (such as migration and new app modals).'),
};
