import Button from 'components/Button/Button.react';
import Checkbox from 'components/Checkbox/Checkbox.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import Field from 'components/Field/Field.react';
import JsonEditor from 'components/JsonEditor/JsonEditor.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import TextInput from 'components/TextInput/TextInput.react';
import Toggle from 'components/Toggle/Toggle.react';
import React from 'react';
import ServerConfigStorage from 'lib/ServerConfigStorage';
import { CurrentApp } from 'context/currentApp';

function isValidJSON(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

const FORMATTING_CONFIG_KEY = 'config.formatting.syntax';

export default class EditViewDialog extends React.Component {
  static contextType = CurrentApp;

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
      wordWrap: false,
      error: null,
      syntaxColors: null,
    };
  }

  componentDidMount() {
    this.loadSyntaxColors();
  }

  async loadSyntaxColors() {
    try {
      const serverStorage = new ServerConfigStorage(this.context);
      if (serverStorage.isServerConfigEnabled()) {
        const settings = await serverStorage.getConfig(
          FORMATTING_CONFIG_KEY,
          this.context.applicationId
        );
        if (settings?.colors) {
          this.setState({ syntaxColors: settings.colors });
        }
      }
    } catch {
      // Silently fail - use default colors from CSS
    }
  }

  formatValue() {
    try {
      const parsed = JSON.parse(this.state.query);
      this.setState({ query: JSON.stringify(parsed, null, 2), error: null });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.setState({ error: `Invalid JSON: ${message}` });
    }
  }

  compactValue() {
    try {
      const parsed = JSON.parse(this.state.query);
      this.setState({ query: JSON.stringify(parsed), error: null });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.setState({ error: `Invalid JSON: ${message}` });
    }
  }

  canFormatValue() {
    try {
      JSON.parse(this.state.query);
      return true;
    } catch {
      return false;
    }
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

  submit() {
    this.props.onConfirm({
      id: this.state.id, // Preserve the view ID
      name: this.state.name,
      className: this.state.dataSourceType === 'query' ? this.state.className : null,
      query: this.state.dataSourceType === 'query' ? JSON.parse(this.state.query) : null,
      cloudFunction: this.state.dataSourceType === 'cloudFunction' ? this.state.cloudFunction : null,
      showCounter: this.state.showCounter,
      requireTextInput: this.state.dataSourceType === 'cloudFunction' ? this.state.requireTextInput : false,
      requireFileUpload: this.state.dataSourceType === 'cloudFunction' ? this.state.requireFileUpload : false,
    });
  }

  render() {
    const { classes, onCancel } = this.props;
    const isQuery = this.state.dataSourceType === 'query';

    const customFooter = (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '17px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isQuery && (
            <>
              <Button
                value="Format"
                onClick={this.formatValue.bind(this)}
                disabled={!this.canFormatValue()}
              />
              <Button
                value="Compact"
                onClick={this.compactValue.bind(this)}
                disabled={!this.canFormatValue()}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Toggle
                  type={Toggle.Types.HIDE_LABELS}
                  value={this.state.wordWrap}
                  onChange={wordWrap => this.setState({ wordWrap })}
                  additionalStyles={{ margin: '0px' }}
                  colorLeft="#cbcbcb"
                  colorRight="#00db7c"
                />
                <span style={{ color: this.state.wordWrap ? '#333' : '#999' }}>Wrap</span>
              </label>
              {this.state.error && (
                <span style={{ color: '#d73a49', fontSize: '13px' }}>{this.state.error}</span>
              )}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button value="Cancel" onClick={onCancel} />
          <Button
            primary={true}
            color="blue"
            value="Save"
            onClick={this.submit.bind(this)}
            disabled={!this.valid()}
          />
        </div>
      </div>
    );

    return (
      <Modal
        type={Modal.Types.INFO}
        icon="edit-solid"
        iconSize={40}
        title="Edit view"
        subtitle="Update the data source configuration"
        customFooter={customFooter}
        disabled={!this.valid()}
        onCancel={onCancel}
        onConfirm={this.submit.bind(this)}
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
        {isQuery && (
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
              text={isQuery ? 'Query' : 'Cloud Function'}
              description={
                isQuery
                  ? 'An aggregation pipeline that returns an array of items.'
                  : 'A Parse Cloud Function that returns an array of items.'
              }
            />
          }
          input={
            isQuery ? (
              <JsonEditor
                value={this.state.query}
                onChange={query => this.setState({ query, error: null })}
                placeholder={'[\n  ...\n]'}
                wordWrap={this.state.wordWrap}
                syntaxColors={this.state.syntaxColors}
              />
            ) : (
              <TextInput
                value={this.state.cloudFunction}
                onChange={cloudFunction => this.setState({ cloudFunction })}
              />
            )
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
