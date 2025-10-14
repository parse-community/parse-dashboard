import Checkbox from 'components/Checkbox/Checkbox.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import TextInput from 'components/TextInput/TextInput.react';
import React from 'react';

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

    // Determine data source type based on existing view properties
    let dataSourceType = 'query'; // default
    if (view.cloudFunction) {
      dataSourceType = 'cloudFunction';
    } else if (view.query && Array.isArray(view.query) && view.query.length > 0) {
      dataSourceType = 'query';
    }

    this.state = {
      id: view.id, // Preserve the view ID
      name: view.name || '',
      className: view.className || '',
      dataSourceType,
      query: view.query ? JSON.stringify(view.query, null, 2) : '[]',
      cloudFunction: view.cloudFunction || '',
      showCounter: !!view.showCounter,
      requireTextInput: !!view.requireTextInput,
      requireFileUpload: !!view.requireFileUpload,
    };
  }

  valid() {
    if (this.state.dataSourceType === 'query') {
      return (
        this.state.name.length > 0 &&
        this.state.className.length > 0 &&
        this.state.query.trim() !== '' &&
        this.state.query !== '[]' &&
        isValidJSON(this.state.query)
      );
    } else {
      return (
        this.state.name.length > 0 &&
        this.state.cloudFunction.trim() !== ''
      );
    }
  }

  render() {
    const { classes, onConfirm, onCancel } = this.props;
    return (
      <Modal
        type={Modal.Types.INFO}
        icon="edit-solid"
        iconSize={40}
        title="Edit view?"
        subtitle="Update the data source configuration."
        confirmText="Save"
        cancelText="Cancel"
        disabled={!this.valid()}
        onCancel={onCancel}
        onConfirm={() =>
          onConfirm({
            id: this.state.id, // Preserve the view ID
            name: this.state.name,
            className: this.state.dataSourceType === 'query' ? this.state.className : null,
            query: this.state.dataSourceType === 'query' ? JSON.parse(this.state.query) : null,
            cloudFunction: this.state.dataSourceType === 'cloudFunction' ? this.state.cloudFunction : null,
            showCounter: this.state.showCounter,
            requireTextInput: this.state.dataSourceType === 'cloudFunction' ? this.state.requireTextInput : false,
            requireFileUpload: this.state.dataSourceType === 'cloudFunction' ? this.state.requireFileUpload : false,
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
          label={<Label text="Data Source" />}
          input={
            <Dropdown
              value={this.state.dataSourceType}
              onChange={dataSourceType => this.setState({ dataSourceType })}
            >
              <Option value="query">Aggregation Pipeline</Option>
              <Option value="cloudFunction">Cloud Function</Option>
            </Dropdown>
          }
        />
        {this.state.dataSourceType === 'query' && (
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
        )}
        <Field
          label={
            <Label
              text={this.state.dataSourceType === 'query' ? 'Query' : 'Cloud Function'}
              description={
                this.state.dataSourceType === 'query'
                  ? 'An aggregation pipeline that returns an array of items.'
                  : 'A Parse Cloud Function that returns an array of items.'
              }
            />
          }
          input={
            <TextInput
              multiline={this.state.dataSourceType === 'query'}
              value={this.state.dataSourceType === 'query' ? this.state.query : this.state.cloudFunction}
              onChange={value =>
                this.setState(
                  this.state.dataSourceType === 'query'
                    ? { query: value }
                    : { cloudFunction: value }
                )
              }
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
        {this.state.dataSourceType === 'cloudFunction' && (
          <>
            <Field
              label={<Label text="Require text input" description="When checked, users will be prompted to enter text when opening this view." />}
              input={
                <Checkbox
                  checked={this.state.requireTextInput}
                  onChange={requireTextInput => this.setState({ requireTextInput })}
                />
              }
            />
            <Field
              label={<Label text="Require file upload" description="When checked, users will be prompted to upload a file when opening this view." />}
              input={
                <Checkbox
                  checked={this.state.requireFileUpload}
                  onChange={requireFileUpload => this.setState({ requireFileUpload })}
                />
              }
            />
          </>
        )}
      </Modal>
    );
  }
}
