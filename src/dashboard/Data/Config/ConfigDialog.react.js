/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimeInput from 'components/DateTimeInput/DateTimeInput.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Field from 'components/Field/Field.react';
import FileInput from 'components/FileInput/FileInput.react';
import GeoPointInput from 'components/GeoPointInput/GeoPointInput.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import NonPrintableHighlighter from 'components/NonPrintableHighlighter/NonPrintableHighlighter.react';
import Option from 'components/Dropdown/Option.react';
import Parse from 'parse';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';
import Toggle from 'components/Toggle/Toggle.react';
import Button from 'components/Button/Button.react';
import JsonEditor from 'components/JsonEditor/JsonEditor.react';
import validateNumeric from 'lib/validateNumeric';
import styles from 'dashboard/Data/Browser/Browser.scss';
import semver from 'semver/preload.js';
import { dateStringUTC } from 'lib/DateUtils';
import LoaderContainer from 'components/LoaderContainer/LoaderContainer.react';
import ServerConfigStorage from 'lib/ServerConfigStorage';
import { CurrentApp } from 'context/currentApp';

const FORMATTING_CONFIG_KEY = 'config.formatting.syntax';

const PARAM_TYPES = ['Boolean', 'String', 'Number', 'Date', 'Object', 'Array', 'GeoPoint', 'File'];

function numberValidator(onChange) {
  return function (next) {
    if (validateNumeric(next)) {
      onChange(next);
    }
  };
}

function saveFile(onChange, file) {
  const value = new Parse.File(file.name, file);
  value.save({ useMasterKey: true }).then(() => onChange(value));
}

const EDITORS = {
  Boolean: (value, onChange) => (
    <Toggle type={Toggle.Types.TRUE_FALSE} value={!!value} onChange={onChange} />
  ),
  String: (value, onChange) => (
    <NonPrintableHighlighter value={value} detectNonAlphanumeric={true}>
      <TextInput multiline={true} value={value || ''} onChange={onChange} />
    </NonPrintableHighlighter>
  ),
  Number: (value, onChange) => (
    <TextInput value={value || ''} onChange={numberValidator(onChange)} />
  ),
  Date: (value, onChange) => <DateTimeInput fixed={true} value={value} onChange={onChange} />,
  Object: (value, onChange, wordWrap, syntaxColors) => (
    <JsonEditor
      value={value || ''}
      onChange={onChange}
      placeholder={'{\n  ...\n}'}
      wordWrap={wordWrap}
      syntaxColors={syntaxColors}
    />
  ),
  Array: (value, onChange, wordWrap, syntaxColors) => (
    <JsonEditor
      value={value || ''}
      onChange={onChange}
      placeholder={'[\n  ...\n]'}
      wordWrap={wordWrap}
      syntaxColors={syntaxColors}
    />
  ),
  GeoPoint: (value, onChange) => <GeoPointInput value={value} onChange={onChange} />,
  File: (value, onChange) => (
    <FileInput
      value={value ? { name: value.name(), url: value.url() } : null}
      onChange={saveFile.bind(null, onChange)}
    />
  ),
};

const GET_VALUE = {
  Boolean: value => !!value,
  String: value => value,
  Number: value => parseFloat(value),
  Date: value => value,
  Object: value => JSON.parse(value),
  Array: value => JSON.parse(value),
  GeoPoint: value =>
    new Parse.GeoPoint({
      latitude: value.latitude,
      longitude: value.longitude,
    }),
  File: value => value,
};

export default class ConfigDialog extends React.Component {
  static contextType = CurrentApp;
  constructor(props) {
    super();
    this.state = {
      value: null,
      type: 'String',
      name: '',
      masterKeyOnly: false,
      selectedIndex: null,
      wordWrap: false,
      error: null,
      syntaxColors: null,
    };
    if (props.param.length > 0) {
      // Auto-format JSON values on initial open
      let initialValue = props.value;
      if ((props.type === 'Object' || props.type === 'Array') && initialValue) {
        try {
          const parsed = JSON.parse(initialValue);
          initialValue = JSON.stringify(parsed, null, 2);
        } catch {
          // Value is not valid JSON, keep original
        }
      }
      this.state = {
        name: props.param,
        type: props.type,
        value: initialValue,
        masterKeyOnly: props.masterKeyOnly,
        selectedIndex: 0,
        wordWrap: false,
        error: null,
        syntaxColors: null,
      };
    }
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

  valid() {
    if (!this.state.name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      return false;
    }
    switch (this.state.type) {
      case 'String':
        return !!this.state.value;
      case 'Number':
        return !isNaN(parseFloat(this.state.value));
      case 'Date':
        return !isNaN(new Date(this.state.value));
      case 'Object':
        try {
          const obj = JSON.parse(this.state.value);
          if (obj && typeof obj === 'object') {
            return true;
          }
          return false;
        } catch {
          return false;
        }
      case 'Array':
        try {
          const obj = JSON.parse(this.state.value);
          if (obj && Array.isArray(obj)) {
            return true;
          }
          return false;
        } catch {
          return false;
        }
      case 'GeoPoint':
        const val = this.state.value;
        if (!val || typeof val !== 'object') {
          return false;
        }
        if (isNaN(parseFloat(val.latitude)) || isNaN(parseFloat(val.longitude))) {
          return false;
        }
        if (
          parseFloat(val.latitude) > 90.0 ||
          parseFloat(val.latitude) < -90.0 ||
          parseFloat(val.longitude) > 180.0 ||
          parseFloat(val.longitude) < -180.0
        ) {
          return false;
        }
        return true;
      case 'File':
        const fileVal = this.state.value;
        if (fileVal && fileVal.url()) {
          return true;
        }
        return false;
    }
    return true;
  }

  submit() {
    this.props.onConfirm({
      name: this.state.name,
      type: this.state.type,
      value: GET_VALUE[this.state.type](this.state.value),
      masterKeyOnly: this.state.masterKeyOnly,
    });
  }

  formatValue() {
    try {
      const parsed = JSON.parse(this.state.value);
      const formatted = JSON.stringify(parsed, null, 2);
      this.setState({ value: formatted, error: null });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.setState({ error: `Invalid JSON: ${message}` });
    }
  }

  compactValue() {
    try {
      const parsed = JSON.parse(this.state.value);
      const compacted = JSON.stringify(parsed);
      this.setState({ value: compacted, error: null });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.setState({ error: `Invalid JSON: ${message}` });
    }
  }

  canFormatValue() {
    if (this.state.type !== 'Object' && this.state.type !== 'Array') {
      return false;
    }
    try {
      JSON.parse(this.state.value);
      return true;
    } catch {
      return false;
    }
  }

  componentDidUpdate(prevProps) {
    // Update parameter value or masterKeyOnly if they have changed
    if (this.props.value !== prevProps.value || this.props.masterKeyOnly !== prevProps.masterKeyOnly) {
      this.setState({
        value: this.props.value,
        masterKeyOnly: this.props.masterKeyOnly,
      });
    }
  }

  render() {
    const newParam = !this.props.param;
    const typeDropdown = (
      <Dropdown
        fixed={true}
        value={this.state.type}
        disabled={this.props.param.length > 0}
        onChange={type => this.setState({ type: type, value: null })}
      >
        {PARAM_TYPES.map(t => (
          <Option key={t} value={t}>
            {t}
          </Option>
        ))}
      </Dropdown>
    );
    const configHistory = this.props.configHistory;
    const handleIndexChange = index => {
      if (this.state.type === 'Date') {
        return;
      }
      let value = configHistory[index].value;
      if (this.state.type === 'File') {
        const fileJSON = {
          __type: 'File',
          name: value.name,
          url: value.url,
        };
        const file = Parse.File.fromJSON(fileJSON);
        this.setState({ selectedIndex: index, value: file });
        return;
      }
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      this.setState({ selectedIndex: index, value });
    };

    const dialogContent = (
      <div>
        <Field
          label={<Label text="Parameter Name" description="A unique identifier for this value" />}
          input={
            <TextInput
              placeholder={'New parameter'}
              value={this.state.name}
              disabled={this.props.param.length > 0}
              onChange={name => this.setState({ name })}
            />
          }
        />
        <Field label={<Label text="Type" />} input={typeDropdown} />
        <Field
          label={
            <Label
              text="Value"
              description="Use this to configure your app. You can change it at any time."
            />
          }
          input={EDITORS[this.state.type](
            this.state.value,
            value => this.setState({ value, error: null }),
            this.state.wordWrap,
            this.state.syntaxColors
          )}
        />

        {
          /*
            Add `Requires master key` field if parse-server version >= 3.9.0,
            that is the minimum version that supports this feature.
          */
          semver.valid(this.props.parseServerVersion) &&
          semver.gte(this.props.parseServerVersion, '3.9.0') ? (
              <Field
                label={
                  <Label
                    text="Requires master key?"
                    description="When set to yes the parameter is returned only when requested with the master key. You can change it at any time."
                  />
                }
                input={
                  <Toggle
                    type={Toggle.Types.YES_NO}
                    value={this.state.masterKeyOnly}
                    onChange={masterKeyOnly => this.setState({ masterKeyOnly })}
                    additionalStyles={{ margin: '0px' }}
                  />
                }
                className={styles.addColumnToggleWrapper}
              />
            ) : null
        }
        {configHistory?.length > 0 && (
          <Field
            label={
              <Label
                text="Change History"
                description="Select a timestamp in the change history to preview the value in the 'Value' field before saving."
              />
            }
            input={
              <Dropdown value={String(this.state.selectedIndex)} onChange={index => handleIndexChange(Number(index))}>
                {configHistory.map((value, i) => (
                  <Option key={i} value={String(i)}>
                    {dateStringUTC(new Date(value.time))}
                  </Option>
                ))}
              </Dropdown>
            }
            className={styles.addColumnToggleWrapper}
          />
        )}
      </div>
    );

    const isJsonType = this.state.type === 'Object' || this.state.type === 'Array';
    const customFooter = (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '17px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isJsonType && (
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
          <Button value="Cancel" onClick={this.props.onCancel} />
          <Button
            primary={true}
            color="blue"
            value={newParam ? 'Create' : 'Save'}
            onClick={this.submit.bind(this)}
            disabled={!this.valid() || this.props.loading}
          />
        </div>
      </div>
    );

    return (
      <Modal
        type={Modal.Types.INFO}
        title={newParam ? 'New parameter' : 'Edit parameter'}
        icon="gear-solid"
        iconSize={30}
        subtitle={'Dynamically configure parts of your app'}
        customFooter={customFooter}
        onCancel={this.props.onCancel}
        onConfirm={this.submit.bind(this)}
      >
        <LoaderContainer loading={this.props.loading}>
          {dialogContent}
        </LoaderContainer>
      </Modal>
    );
  }
}
