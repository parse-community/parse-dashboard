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
import NonPrintableHighlighter, { hasNonPrintableChars, getNonPrintableCharsFromJson, hasNonAlphanumericChars, getNonAlphanumericCharsFromJson, getRegexValidation, getRegexValidationFromJson } from 'components/NonPrintableHighlighter/NonPrintableHighlighter.react';
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
  String: (value, onChange, wordWrap, syntaxColors, options = {}) => (
    <NonPrintableHighlighter value={value} detectNonPrintable={!!options.detectNonPrintable} detectNonAlphanumeric={!!options.detectNonAlphanumeric} detectRegex={!!options.detectRegex}>
      <TextInput multiline={true} value={value || ''} onChange={onChange} />
    </NonPrintableHighlighter>
  ),
  Number: (value, onChange) => (
    <TextInput value={value || ''} onChange={numberValidator(onChange)} />
  ),
  Date: (value, onChange) => <DateTimeInput fixed={true} value={value} onChange={onChange} />,
  Object: (value, onChange, wordWrap, syntaxColors, options = {}) => (
    <NonPrintableHighlighter value={value} isJson={true} detectNonPrintable={!!options.detectNonPrintable} detectNonAlphanumeric={!!options.detectNonAlphanumeric} detectRegex={!!options.detectRegex}>
      <JsonEditor
        value={value || ''}
        onChange={onChange}
        placeholder={'{\n  ...\n}'}
        wordWrap={wordWrap}
        syntaxColors={syntaxColors}
      />
    </NonPrintableHighlighter>
  ),
  Array: (value, onChange, wordWrap, syntaxColors, options = {}) => (
    <NonPrintableHighlighter value={value} isJson={true} detectNonPrintable={!!options.detectNonPrintable} detectNonAlphanumeric={!!options.detectNonAlphanumeric} detectRegex={!!options.detectRegex}>
      <JsonEditor
        value={value || ''}
        onChange={onChange}
        placeholder={'[\n  ...\n]'}
        wordWrap={wordWrap}
        syntaxColors={syntaxColors}
      />
    </NonPrintableHighlighter>
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

  static formatJSON(value) {
    try {
      const parsed = JSON.parse(value);
      return { value: JSON.stringify(parsed, null, 2), error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { value, error: `Invalid JSON: ${message}` };
    }
  }

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
      let initialValue = props.value;
      let initialError = null;
      if ((props.type === 'Object' || props.type === 'Array') && initialValue) {
        ({ value: initialValue, error: initialError } = ConfigDialog.formatJSON(initialValue));
      }
      this.state = {
        name: props.param,
        type: props.type,
        value: initialValue,
        masterKeyOnly: props.masterKeyOnly,
        selectedIndex: 0,
        wordWrap: false,
        error: initialError,
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

  getEffectiveDetectionFlags() {
    const isExistingParam = this.props.param && this.props.param.length > 0;
    let detectNonPrintable = this.props.detectNonPrintable;
    if (detectNonPrintable && isExistingParam && this.props.nonPrintableShowOnlyFor.length > 0) {
      detectNonPrintable = this.props.nonPrintableShowOnlyFor.includes(this.props.param);
    }
    let detectNonAlphanumeric = this.props.detectNonAlphanumeric;
    if (detectNonAlphanumeric && isExistingParam && this.props.nonAlphanumericShowOnlyFor.length > 0) {
      detectNonAlphanumeric = this.props.nonAlphanumericShowOnlyFor.includes(this.props.param);
    }
    let detectRegex = this.props.detectRegex;
    if (detectRegex && isExistingParam && this.props.regexShowOnlyFor.length > 0) {
      detectRegex = this.props.regexShowOnlyFor.includes(this.props.param);
    }
    return { detectNonPrintable, detectNonAlphanumeric, detectRegex };
  }

  valid() {
    if (!this.state.name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      return false;
    }
    switch (this.state.type) {
      case 'String':
        if (!this.state.value) {
          return false;
        }
        break;
      case 'Number':
        if (isNaN(parseFloat(this.state.value))) {
          return false;
        }
        break;
      case 'Date':
        if (isNaN(new Date(this.state.value))) {
          return false;
        }
        break;
      case 'Object':
        try {
          const obj = JSON.parse(this.state.value);
          if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            return false;
          }
        } catch {
          return false;
        }
        break;
      case 'Array':
        try {
          const obj = JSON.parse(this.state.value);
          if (!obj || !Array.isArray(obj)) {
            return false;
          }
        } catch {
          return false;
        }
        break;
      case 'GeoPoint': {
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
        break;
      }
      case 'File': {
        const fileVal = this.state.value;
        if (!fileVal || !fileVal.url()) {
          return false;
        }
        break;
      }
    }

    // Compute effective detection flags (respecting show-only-for settings)
    const { detectNonPrintable, detectNonAlphanumeric, detectRegex } = this.getEffectiveDetectionFlags();

    // Block save if non-printable characters detected for this param
    if (
      detectNonPrintable &&
      this.props.param.length > 0 &&
      this.props.nonPrintableBlockSave.includes(this.props.param)
    ) {
      const value = this.state.value;
      if (value && typeof value === 'string') {
        if (this.state.type === 'Object' || this.state.type === 'Array') {
          if (getNonPrintableCharsFromJson(value).totalCount > 0) {
            return false;
          }
        } else if (this.state.type === 'String') {
          if (hasNonPrintableChars(value)) {
            return false;
          }
        }
      }
    }

    // Block save if non-alphanumeric characters detected for this param
    if (
      detectNonAlphanumeric &&
      this.props.param.length > 0 &&
      this.props.nonAlphanumericBlockSave.includes(this.props.param)
    ) {
      const value = this.state.value;
      if (value && typeof value === 'string') {
        if (this.state.type === 'Object' || this.state.type === 'Array') {
          if (getNonAlphanumericCharsFromJson(value).totalCount > 0) {
            return false;
          }
        } else if (this.state.type === 'String') {
          if (hasNonAlphanumericChars(value)) {
            return false;
          }
        }
      }
    }

    // Block save if regex validation fails for this param
    if (
      detectRegex &&
      this.props.param.length > 0 &&
      this.props.regexBlockSave.includes(this.props.param)
    ) {
      const value = this.state.value;
      if (value && typeof value === 'string') {
        if (this.state.type === 'Object' || this.state.type === 'Array') {
          const result = getRegexValidationFromJson(value);
          if (result.results.some(r => !r.isValid)) {
            return false;
          }
        } else if (this.state.type === 'String') {
          if (!getRegexValidation(value).isValid) {
            return false;
          }
        }
      }
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
    const { value, error } = ConfigDialog.formatJSON(this.state.value);
    this.setState({ value, error });
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
      let updatedValue = this.props.value;
      let error = null;

      if ((this.props.type === 'Object' || this.props.type === 'Array') && updatedValue) {
        ({ value: updatedValue, error } = ConfigDialog.formatJSON(updatedValue));
      }

      this.setState({
        value: updatedValue,
        error,
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

    // Determine effective detection flags based on show-only-for settings
    const {
      detectNonPrintable: effectiveDetectNonPrintable,
      detectNonAlphanumeric: effectiveDetectNonAlphanumeric,
      detectRegex: effectiveDetectRegex,
    } = this.getEffectiveDetectionFlags();

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
            this.state.syntaxColors,
            { detectNonPrintable: effectiveDetectNonPrintable, detectNonAlphanumeric: effectiveDetectNonAlphanumeric, detectRegex: effectiveDetectRegex }
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
        disabled={!this.valid() || this.props.loading}
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
