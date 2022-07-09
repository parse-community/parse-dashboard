import React from 'react';
import FormModal from 'components/FormModal/FormModal.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import TextInput from 'components/TextInput/TextInput.react';

export default class AttachRowsDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      objectIds: '',
    };

    this.handleObjectIdsChange = this.handleObjectIdsChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleObjectIdsChange(objectIds) {
    this.setState({ objectIds });
  }

  handleConfirm() {
    const objectIds = this.state.objectIds.split(',').reduce((resourceIds, targetResourceId) => {
      const objectId = targetResourceId && targetResourceId.trim();
      if (!objectId) return;
      return [...resourceIds, objectId];
    }, []);
    return this.props.onConfirm(objectIds);
  }

  render() {
    const {
      relation
    } = this.props;
    return (
      <FormModal
        open
        icon="plus"
        iconSize={40}
        title="Attach Rows To Relation"
        subtitle={`Attach existing rows from ${relation.targetClassName}`}
        onClose={this.props.onCancel}
        onSubmit={this.handleConfirm}
        submitText="Attach"
        inProgressText={'Attaching\u2026'}
      >
        <Field
          label={
            <Label
              text="objectIds"
              description={`IDs of ${relation.targetClassName} rows to attach`}
            />
          }
          input={
            <TextInput
              placeholder="ox0QZFl7eg, qs81Q72lTL, etc..."
              value={this.state.objectIds}
              onChange={this.handleObjectIdsChange}
            />
          }
        />
      </FormModal>
    );
  }
}
