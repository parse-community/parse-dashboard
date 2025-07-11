import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';

export default class DeleteViewDialog extends React.Component {
  constructor() {
    super();
    this.state = {
      confirmation: '',
    };
  }

  valid() {
    return this.state.confirmation === this.props.name;
  }

  render() {
    return (
      <Modal
        type={Modal.Types.DANGER}
        icon="warn-outline"
        title="Delete view?"
        subtitle="This action cannot be undone!"
        disabled={!this.valid()}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={this.props.onCancel}
        onConfirm={this.props.onConfirm}
      >
        <Field
          label={<Label text="Confirm this action" description="Enter the view name to continue." />}
          input={
            <TextInput
              placeholder="View name"
              value={this.state.confirmation}
              onChange={confirmation => this.setState({ confirmation })}
            />
          }
        />
      </Modal>
    );
  }
}
