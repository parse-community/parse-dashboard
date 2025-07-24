import Field from 'components/Field/Field.react';
import FileInput from 'components/FileInput/FileInput.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import TextInput from 'components/TextInput/TextInput.react';
import React from 'react';

export default class CloudFunctionInputDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textInput: '',
      uploadedFile: null,
    };
  }

  handleFileChange = (file) => {
    this.setState({ uploadedFile: file });
  };

  handleConfirm = () => {
    const { requireTextInput, requireFileUpload } = this.props;
    const params = {};

    if (requireTextInput) {
      params.text = this.state.textInput;
    }

    if (requireFileUpload && this.state.uploadedFile) {
      // For file uploads, we'll pass the raw file data
      // The cloud function will receive this as base64 encoded data
      const file = this.state.uploadedFile;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          params.fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result.split(',')[1], // Remove the data URL prefix
          };
        }
        this.props.onConfirm(params);
      };
      reader.readAsDataURL(file);
    } else {
      this.props.onConfirm(params);
    }
  };

  render() {
    const { requireTextInput, requireFileUpload, onCancel } = this.props;

    // Check if we have all required inputs
    const hasRequiredText = !requireTextInput || this.state.textInput.trim().length > 0;
    const hasRequiredFile = !requireFileUpload || this.state.uploadedFile !== null;
    const isValid = hasRequiredText && hasRequiredFile;

    return (
      <Modal
        type={Modal.Types.INFO}
        icon="gear"
        iconSize={40}
        title="Cloud Function Input"
        subtitle="Provide the required input for this view."
        confirmText="Send"
        cancelText="Cancel"
        disabled={!isValid}
        onCancel={onCancel}
        onConfirm={this.handleConfirm}
      >
        {requireTextInput && (
          <Field
            label={<Label text="Text" />}
            input={
              <TextInput
                multiline
                value={this.state.textInput}
                onChange={textInput => this.setState({ textInput })}
                placeholder="Enter text here..."
              />
            }
          />
        )}
        {requireFileUpload && (
          <Field
            label={<Label text="File Upload" />}
            input={
              <FileInput
                value={this.state.uploadedFile}
                onChange={this.handleFileChange}
              />
            }
          />
        )}
      </Modal>
    );
  }
}
