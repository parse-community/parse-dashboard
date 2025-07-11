import Dropdown from 'components/Dropdown/Dropdown.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import Option from 'components/Dropdown/Option.react';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';
import Checkbox from 'components/Checkbox/Checkbox.react';

function isValidJSON(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export default class EditViewDialog extends React.Component {
  constructor(props) {
    super();
    const view = props.view || {};
    this.state = {
      name: view.name || '',
      className: view.className || '',
      query: JSON.stringify(view.query || [], null, 2),
      showCounter: !!view.showCounter,
    };
  }

  valid() {
    return (
      this.state.name.length > 0 &&
      this.state.className.length > 0 &&
      isValidJSON(this.state.query)
    );
  }

  render() {
    const { classes, onConfirm, onCancel } = this.props;
    return (
      <Modal
        type={Modal.Types.INFO}
        icon="edit-solid"
        iconSize={40}
        title="Edit view?"
        subtitle="Update the custom query."
        confirmText="Save"
        cancelText="Cancel"
        disabled={!this.valid()}
        onCancel={onCancel}
        onConfirm={() =>
          onConfirm({
            name: this.state.name,
            className: this.state.className,
            query: JSON.parse(this.state.query),
            showCounter: this.state.showCounter,
          })
        }
      >
        <Field
          label={<Label text="Name" />}
          input={
            <TextInput
              value={this.state.name}
              onChange={name => this.setState({ name })}
            />
          }
        />
        <Field
          label={<Label text="Class" />}
          input={
            <Dropdown
              value={this.state.className}
              onChange={className => this.setState({ className })}
            >
              {classes.map(c => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Dropdown>
          }
        />
        <Field
          label={
            <Label
              text="Query"
              description="An aggregation pipeline that returns an array of items."
            />
          }
          input={
            <TextInput
              multiline={true}
              value={this.state.query}
              onChange={query => this.setState({ query })}
            />
          }
        />
        <Field
          label={<Label text="Show object counter" />}
          input={
            <Checkbox
              checked={this.state.showCounter}
              onChange={showCounter => this.setState({ showCounter })}
            />
          }
        />
      </Modal>
    );
  }
}
