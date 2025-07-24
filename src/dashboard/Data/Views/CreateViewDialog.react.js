import Checkbox from 'components/Checkbox/Checkbox.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import TextInput from 'components/TextInput/TextInput.react';
import React from 'react';

/**
 * The data source types available for views.
 *
 * @param {string} query An aggregation pipeline query data source.
 * @param {string} cloudFunction A Cloud Function data source.
 */
const DataSourceTypes = {
  query: 'query',
  cloudFunction: 'cloudFunction'
};

function isValidJSON(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export default class CreateViewDialog extends React.Component {
  constructor() {
    super();
    this.state = {
      name: '',
      className: '',
      dataSourceType: DataSourceTypes.query,
      query: '[]',
      cloudFunction: '',
      showCounter: false,
      requireTextInput: false,
      requireFileUpload: false,
    };
  }

  valid() {
    if (this.state.dataSourceType === DataSourceTypes.query) {
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
        icon="plus"
        iconSize={40}
        title="Create a new view?"
        subtitle="Define a data source to display data."
        confirmText="Create"
        cancelText="Cancel"
        disabled={!this.valid()}
        onCancel={onCancel}
        onConfirm={() =>
          onConfirm({
            name: this.state.name,
            className: this.state.dataSourceType === DataSourceTypes.query ? this.state.className : null,
            query: this.state.dataSourceType === DataSourceTypes.query ? JSON.parse(this.state.query) : null,
            cloudFunction: this.state.dataSourceType === DataSourceTypes.cloudFunction ? this.state.cloudFunction : null,
            showCounter: this.state.showCounter,
            requireTextInput: this.state.dataSourceType === DataSourceTypes.cloudFunction ? this.state.requireTextInput : false,
            requireFileUpload: this.state.dataSourceType === DataSourceTypes.cloudFunction ? this.state.requireFileUpload : false,
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
              <Option value={DataSourceTypes.query}>Aggregation Pipeline</Option>
              <Option value={DataSourceTypes.cloudFunction}>Cloud Function</Option>
            </Dropdown>
          }
        />
        {this.state.dataSourceType === DataSourceTypes.query && (
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
              text={this.state.dataSourceType === DataSourceTypes.query ? 'Query' : 'Cloud Function'}
              description={
                this.state.dataSourceType === DataSourceTypes.query
                  ? 'An aggregation pipeline that returns an array of items.'
                  : 'A Parse Cloud Function that returns an array of items.'
              }
            />
          }
          input={
            <TextInput
              multiline={this.state.dataSourceType === DataSourceTypes.query}
              value={this.state.dataSourceType === DataSourceTypes.query ? this.state.query : this.state.cloudFunction}
              onChange={value =>
                this.setState(
                  this.state.dataSourceType === DataSourceTypes.query
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
        {this.state.dataSourceType === DataSourceTypes.cloudFunction && (
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
