import Button from 'components/Button/Button.react';
import DashboardView from 'dashboard/DashboardView.react';
import Field from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import Label from 'components/Label/Label.react';
import MultiSelect from 'components/MultiSelect/MultiSelect.react';
import MultiSelectOption from 'components/MultiSelect/MultiSelectOption.react';
import Parse from 'parse';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';
import Toggle from 'components/Toggle/Toggle.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import Notification from 'dashboard/Data/Browser/Notification.react';
import ServerConfigStorage from 'lib/ServerConfigStorage';
import styles from 'dashboard/Settings/Settings.scss';

const CONFIG_KEY = 'config.settings';
const FORMATTING_CONFIG_KEY = 'config.formatting.syntax';

const DEFAULT_SYNTAX_COLORS = {
  property: '#005cc5',
  string: '#000000',
  number: '#098658',
  boolean: '#d73a49',
  null: '#d73a49',
  punctuation: '#24292e',
  operator: '#24292e',
};

export default class CloudConfigSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Cloud Config';
    this.serverStorage = null;
    // Queue to serialize syntax color saves and prevent race conditions
    this.pendingSyntaxColorSave = Promise.resolve();

    this.state = {
      cloudConfigHistoryLimit: '',
      syntaxColors: { ...DEFAULT_SYNTAX_COLORS },
      detectNonPrintable: true,
      detectRegex: true,
      configParamNames: [],
      nonPrintableBlockSave: [],
      nonPrintableShowOnlyFor: [],
      detectNonAlphanumeric: true,
      nonAlphanumericBlockSave: [],
      nonAlphanumericShowOnlyFor: [],
      regexBlockSave: [],
      regexShowOnlyFor: [],
      message: undefined,
      loading: true,
    };
  }

  componentDidMount() {
    if (this.context) {
      this.serverStorage = new ServerConfigStorage(this.context);
      this.loadSettings();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.noteTimeout);
  }

  async loadSettings() {
    try {
      const settings = await this.serverStorage.getConfig(
        CONFIG_KEY,
        this.context.applicationId
      );
      if (settings) {
        if (settings.historyLimit !== undefined) {
          this.setState({ cloudConfigHistoryLimit: String(settings.historyLimit) });
        }
        if (settings.detectNonPrintable !== undefined) {
          this.setState({ detectNonPrintable: !!settings.detectNonPrintable });
        }
        if (settings.detectRegex !== undefined) {
          this.setState({ detectRegex: !!settings.detectRegex });
        }
        if (Array.isArray(settings.nonPrintableBlockSave)) {
          this.setState({ nonPrintableBlockSave: settings.nonPrintableBlockSave });
        }
        if (Array.isArray(settings.nonPrintableShowOnlyFor)) {
          this.setState({ nonPrintableShowOnlyFor: settings.nonPrintableShowOnlyFor });
        }
        if (settings.detectNonAlphanumeric !== undefined) {
          this.setState({ detectNonAlphanumeric: !!settings.detectNonAlphanumeric });
        }
        if (Array.isArray(settings.nonAlphanumericBlockSave)) {
          this.setState({ nonAlphanumericBlockSave: settings.nonAlphanumericBlockSave });
        }
        if (Array.isArray(settings.nonAlphanumericShowOnlyFor)) {
          this.setState({ nonAlphanumericShowOnlyFor: settings.nonAlphanumericShowOnlyFor });
        }
        if (Array.isArray(settings.regexBlockSave)) {
          this.setState({ regexBlockSave: settings.regexBlockSave });
        }
        if (Array.isArray(settings.regexShowOnlyFor)) {
          this.setState({ regexShowOnlyFor: settings.regexShowOnlyFor });
        }
      }

      // Fetch Cloud Config parameter names for multi-select dropdowns
      await this.loadConfigParamNames();

      // Load formatting settings
      const formattingSettings = await this.serverStorage.getConfig(
        FORMATTING_CONFIG_KEY,
        this.context.applicationId
      );
      if (formattingSettings && formattingSettings.colors) {
        this.setState({
          syntaxColors: { ...DEFAULT_SYNTAX_COLORS, ...formattingSettings.colors }
        });
      }
    } catch {
      this.showNote('Failed to load Cloud Config settings.', true);
    } finally {
      this.setState({ loading: false });
    }
  }

  async loadConfigParamNames() {
    try {
      this.context.setParseKeys();
      const result = await Parse._request('GET', 'config', {}, { useMasterKey: true });
      if (result && result.params) {
        // Only include params of types that support value analysis (String, Object, Array)
        const names = Object.entries(result.params)
          .filter(([, value]) => {
            if (typeof value === 'string') {
              return true;
            }
            if (typeof value === 'object' && value !== null) {
              // Exclude Date, GeoPoint, File
              if (value.__type === 'Date' || value.__type === 'GeoPoint' || value.__type === 'File') {
                return false;
              }
              return true; // Object or Array
            }
            return false;
          })
          .map(([name]) => name)
          .sort();
        this.setState({ configParamNames: names });
      }
    } catch {
      // Silently fail - dropdowns will be empty
    }
  }

  async saveSettings(updates) {
    try {
      const current = await this.serverStorage.getConfig(
        CONFIG_KEY,
        this.context.applicationId
      );
      const settings = { ...(current || {}), ...updates };
      await this.serverStorage.setConfig(
        CONFIG_KEY,
        settings,
        this.context.applicationId
      );
      return true;
    } catch {
      return false;
    }
  }

  handleCloudConfigHistoryLimitChange(value) {
    this.setState({ cloudConfigHistoryLimit: value });
  }

  async handleDetectNonPrintableChange(value) {
    this.setState({ detectNonPrintable: value });
    // Don't store default value (true) on server
    if (await this.saveSettings({ detectNonPrintable: value === true ? undefined : value })) {
      this.showNote(`Non-printable character detection ${value ? 'enabled' : 'disabled'}.`);
    } else {
      this.setState({ detectNonPrintable: !value });
      this.showNote('Failed to save setting.', true);
    }
  }

  async handleDetectRegexChange(value) {
    this.setState({ detectRegex: value });
    // Don't store default value (true) on server
    if (await this.saveSettings({ detectRegex: value === true ? undefined : value })) {
      this.showNote(`Regex validation display ${value ? 'enabled' : 'disabled'}.`);
    } else {
      this.setState({ detectRegex: !value });
      this.showNote('Failed to save setting.', true);
    }
  }

  async handleNonPrintableBlockSaveChange(value) {
    const previous = this.state.nonPrintableBlockSave;
    this.setState({ nonPrintableBlockSave: value });
    if (await this.saveSettings({ nonPrintableBlockSave: value.length > 0 ? value : undefined })) {
      this.showNote('Non-printable block-save parameters updated.');
    } else {
      this.setState({ nonPrintableBlockSave: previous });
      this.showNote('Failed to save setting.', true);
    }
  }

  async handleNonPrintableShowOnlyForChange(value) {
    const previousShowOnlyFor = this.state.nonPrintableShowOnlyFor;
    const previousBlockSave = this.state.nonPrintableBlockSave;
    this.setState({ nonPrintableShowOnlyFor: value });
    // Remove block-save entries that are no longer in the show-info-box list
    const blockSaveUpdates = {};
    if (value.length > 0) {
      const filtered = previousBlockSave.filter(name => value.includes(name));
      if (filtered.length !== previousBlockSave.length) {
        this.setState({ nonPrintableBlockSave: filtered });
        blockSaveUpdates.nonPrintableBlockSave = filtered.length > 0 ? filtered : undefined;
      }
    }
    if (await this.saveSettings({ nonPrintableShowOnlyFor: value.length > 0 ? value : undefined, ...blockSaveUpdates })) {
      this.showNote('Non-printable show-only parameters updated.');
    } else {
      this.setState({ nonPrintableShowOnlyFor: previousShowOnlyFor, nonPrintableBlockSave: previousBlockSave });
      this.showNote('Failed to save setting.', true);
    }
  }

  async handleDetectNonAlphanumericChange(value) {
    this.setState({ detectNonAlphanumeric: value });
    if (await this.saveSettings({ detectNonAlphanumeric: value === true ? undefined : value })) {
      this.showNote(`Non-alphanumeric character detection ${value ? 'enabled' : 'disabled'}.`);
    } else {
      this.setState({ detectNonAlphanumeric: !value });
      this.showNote('Failed to save setting.', true);
    }
  }

  async handleNonAlphanumericBlockSaveChange(value) {
    const previous = this.state.nonAlphanumericBlockSave;
    this.setState({ nonAlphanumericBlockSave: value });
    if (await this.saveSettings({ nonAlphanumericBlockSave: value.length > 0 ? value : undefined })) {
      this.showNote('Non-alphanumeric block-save parameters updated.');
    } else {
      this.setState({ nonAlphanumericBlockSave: previous });
      this.showNote('Failed to save setting.', true);
    }
  }

  async handleNonAlphanumericShowOnlyForChange(value) {
    const previousShowOnlyFor = this.state.nonAlphanumericShowOnlyFor;
    const previousBlockSave = this.state.nonAlphanumericBlockSave;
    this.setState({ nonAlphanumericShowOnlyFor: value });
    // Remove block-save entries that are no longer in the show-info-box list
    const blockSaveUpdates = {};
    if (value.length > 0) {
      const filtered = previousBlockSave.filter(name => value.includes(name));
      if (filtered.length !== previousBlockSave.length) {
        this.setState({ nonAlphanumericBlockSave: filtered });
        blockSaveUpdates.nonAlphanumericBlockSave = filtered.length > 0 ? filtered : undefined;
      }
    }
    if (await this.saveSettings({ nonAlphanumericShowOnlyFor: value.length > 0 ? value : undefined, ...blockSaveUpdates })) {
      this.showNote('Non-alphanumeric show-only parameters updated.');
    } else {
      this.setState({ nonAlphanumericShowOnlyFor: previousShowOnlyFor, nonAlphanumericBlockSave: previousBlockSave });
      this.showNote('Failed to save setting.', true);
    }
  }

  async handleRegexBlockSaveChange(value) {
    const previous = this.state.regexBlockSave;
    this.setState({ regexBlockSave: value });
    if (await this.saveSettings({ regexBlockSave: value.length > 0 ? value : undefined })) {
      this.showNote('Regex block-save parameters updated.');
    } else {
      this.setState({ regexBlockSave: previous });
      this.showNote('Failed to save setting.', true);
    }
  }

  async handleRegexShowOnlyForChange(value) {
    const previousShowOnlyFor = this.state.regexShowOnlyFor;
    const previousBlockSave = this.state.regexBlockSave;
    this.setState({ regexShowOnlyFor: value });
    // Remove block-save entries that are no longer in the show-info-box list
    const blockSaveUpdates = {};
    if (value.length > 0) {
      const filtered = previousBlockSave.filter(name => value.includes(name));
      if (filtered.length !== previousBlockSave.length) {
        this.setState({ regexBlockSave: filtered });
        blockSaveUpdates.regexBlockSave = filtered.length > 0 ? filtered : undefined;
      }
    }
    if (await this.saveSettings({ regexShowOnlyFor: value.length > 0 ? value : undefined, ...blockSaveUpdates })) {
      this.showNote('Regex show-only parameters updated.');
    } else {
      this.setState({ regexShowOnlyFor: previousShowOnlyFor, regexBlockSave: previousBlockSave });
      this.showNote('Failed to save setting.', true);
    }
  }

  async saveCloudConfigHistoryLimit() {
    const value = this.state.cloudConfigHistoryLimit.trim();

    if (value === '') {
      if (await this.saveSettings({ historyLimit: undefined })) {
        this.showNote('Cloud Config history limit reset to default.');
      } else {
        this.showNote('Failed to reset setting.', true);
      }
      return;
    }

    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      this.showNote('Please enter a valid positive number.', true);
      return;
    }

    if (await this.saveSettings({ historyLimit: parsed })) {
      this.setState({ cloudConfigHistoryLimit: String(parsed) });
      this.showNote(`Cloud Config history limit set to ${parsed}.`);
    } else {
      this.showNote('Failed to save setting.', true);
    }
  }

  handleSyntaxColorChange(tokenType, color) {
    this.setState(prevState => ({
      syntaxColors: { ...prevState.syntaxColors, [tokenType]: color }
    }));
  }

  async saveSyntaxColor(tokenType) {
    const color = this.state.syntaxColors[tokenType];

    // Validate hex color synchronously before queuing
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      this.showNote(`Invalid color format for ${tokenType}. Use hex format like #ff0000.`, true);
      return;
    }

    // Chain onto the pending save to serialize read-modify-write operations
    const saveOperation = this.pendingSyntaxColorSave.then(async () => {
      try {
        const current = await this.serverStorage.getConfig(
          FORMATTING_CONFIG_KEY,
          this.context.applicationId
        );
        const storedColor = current?.colors?.[tokenType];
        const defaultColor = DEFAULT_SYNTAX_COLORS[tokenType];

        // Skip if color hasn't changed from stored value (or default if not stored)
        const previousColor = storedColor || defaultColor;
        if (color.toLowerCase() === previousColor.toLowerCase()) {
          return;
        }

        // Build the new colors object, only including non-default values
        const colors = { ...(current?.colors || {}) };
        if (color.toLowerCase() === defaultColor.toLowerCase()) {
          // Remove from storage if it matches the default
          delete colors[tokenType];
        } else {
          colors[tokenType] = color;
        }

        // If no custom colors remain, delete the config entry
        if (Object.keys(colors).length === 0) {
          await this.serverStorage.deleteConfig(
            FORMATTING_CONFIG_KEY,
            this.context.applicationId
          );
        } else {
          await this.serverStorage.setConfig(
            FORMATTING_CONFIG_KEY,
            { colors },
            this.context.applicationId
          );
        }
        this.showNote(`${tokenType} color saved.`);
      } catch {
        this.showNote(`Failed to save ${tokenType} color.`, true);
      }
    });

    // Update the queue with the new operation (catch to prevent queue breakage)
    this.pendingSyntaxColorSave = saveOperation.catch(() => {});

    // Await the operation for this call
    await saveOperation;
  }

  async resetSyntaxColors() {
    try {
      // Wait for any in-flight saves to complete before deleting
      await (this.pendingSyntaxColorSave || Promise.resolve());

      await this.serverStorage.deleteConfig(
        FORMATTING_CONFIG_KEY,
        this.context.applicationId
      );

      // Reset the queue so future saves start fresh
      this.pendingSyntaxColorSave = Promise.resolve();

      this.setState({ syntaxColors: { ...DEFAULT_SYNTAX_COLORS } });
      this.showNote('Syntax colors reset to defaults.');
    } catch {
      this.showNote('Failed to reset syntax colors.', true);
    }
  }

  showNote(message, isError = false) {
    if (!message) {
      return;
    }

    clearTimeout(this.noteTimeout);

    this.setState({ message: { text: message, isError } });

    this.noteTimeout = setTimeout(() => {
      this.setState({ message: undefined });
    }, 3500);
  }

  renderParamMultiSelectWithButtons(value, onChange, placeholder, disabled, paramNames) {
    const allNames = paramNames || this.state.configParamNames;
    return (
      <div style={{ width: '100%', background: '#f6fafb' }}>
        {this.renderParamMultiSelect(value, onChange, placeholder, disabled, allNames)}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px', paddingBottom: '8px' }}>
          <Button
            value="Select all"
            disabled={disabled || value.length === allNames.length}
            onClick={() => onChange([...allNames])}
          />
          <Button
            value="Unselect all"
            disabled={disabled || value.length === 0}
            onClick={() => onChange([])}
          />
        </div>
      </div>
    );
  }

  renderParamMultiSelect(value, onChange, placeholder, disabled, paramNames) {
    const names = paramNames || this.state.configParamNames;
    return (
      <MultiSelect
        fixed={true}
        value={value}
        onChange={onChange}
        placeHolder={placeholder}
        disabled={disabled}
        formatSelection={sel => `${sel.length} parameter${sel.length !== 1 ? 's' : ''} selected`}
      >
        {names.map(name => (
          <MultiSelectOption key={name} value={name} disabled={disabled}>
            {name}
          </MultiSelectOption>
        ))}
      </MultiSelect>
    );
  }

  renderContent() {
    const message = this.state.message;
    const serverConfigEnabled = this.serverStorage && this.serverStorage.isServerConfigEnabled();
    const notAvailableMessage = !this.state.loading && !serverConfigEnabled
      ? 'Server configuration is not enabled for this app. Please add a \'config\' section to your app configuration.'
      : null;

    const configFileLimit = this.context.cloudConfigHistoryLimit;
    const isOverriddenByConfigFile = configFileLimit !== undefined && configFileLimit !== null;

    let limitDescription = 'Maximum number of history entries stored per Cloud Config parameter. Leave empty to use the default (100).';
    if (isOverriddenByConfigFile) {
      limitDescription = `This value is overridden by the dashboard config file (${configFileLimit}). Remove the "cloudConfigHistoryLimit" option from the config file to use this setting.`;
    }

    return (
      <div>
        <Toolbar section="Settings" subsection="Cloud Config" />
        <Notification
          note={notAvailableMessage || (message && message.text)}
          isErrorNote={notAvailableMessage ? true : (message && message.isError)}
        />
        <div className={styles.settings_page}>
          <Fieldset
            legend="History"
            description="Cloud Config parameter change history tracks value changes over time."
          >
            <Field
              labelWidth={62}
              label={
                <Label
                  text="History Limit"
                  description={limitDescription}
                />
              }
              input={
                <TextInput
                  placeholder={this.state.loading ? 'Loading...' : '100'}
                  value={isOverriddenByConfigFile ? String(configFileLimit) : this.state.cloudConfigHistoryLimit}
                  disabled={!serverConfigEnabled || this.state.loading || isOverriddenByConfigFile}
                  onChange={this.handleCloudConfigHistoryLimitChange.bind(this)}
                  onBlur={this.saveCloudConfigHistoryLimit.bind(this)}
                />
              }
            />
          </Fieldset>
          <Fieldset
            legend="Value Analysis"
            description="Configure value analysis options for the Cloud Config editor."
          >
            <Field
              labelWidth={62}
              label={
                <Label
                  text="Non-Printable Characters"
                  description="When enabled, the parameter editor highlights non-printable characters such as zero-width spaces and control characters."
                />
              }
              input={
                <Toggle
                  type={Toggle.Types.YES_NO}
                  value={this.state.detectNonPrintable}
                  onChange={this.handleDetectNonPrintableChange.bind(this)}
                  disabled={!serverConfigEnabled || this.state.loading}
                  additionalStyles={{ margin: '0px' }}
                />
              }
            />
            {this.state.detectNonPrintable && (
              <>
                <Field
                  labelWidth={62}
                  label={
                    <Label
                      text="Show Info Box"
                      description="Show the info box for selected parameters, or for all if none are selected."
                    />
                  }
                  input={this.renderParamMultiSelectWithButtons(
                    this.state.nonPrintableShowOnlyFor,
                    this.handleNonPrintableShowOnlyForChange.bind(this),
                    'All parameters',
                    !serverConfigEnabled || this.state.loading
                  )}
                />
                <Field
                  labelWidth={62}
                  className={styles.sectionSeparator}
                  label={
                    <Label
                      text="Block Save"
                      description="Select parameters for which the Save button should be disabled if validation fails."
                    />
                  }
                  input={this.renderParamMultiSelectWithButtons(
                    this.state.nonPrintableBlockSave,
                    this.handleNonPrintableBlockSaveChange.bind(this),
                    'No parameter',
                    !serverConfigEnabled || this.state.loading,
                    this.state.nonPrintableShowOnlyFor.length > 0 ? this.state.nonPrintableShowOnlyFor : undefined
                  )}
                />
              </>
            )}
            <Field
              labelWidth={62}
              label={
                <Label
                  text="Non-Alphanumeric Characters"
                  description="When enabled, the parameter editor highlights non-alphanumeric characters such as special symbols, punctuation, and whitespace."
                />
              }
              input={
                <Toggle
                  type={Toggle.Types.YES_NO}
                  value={this.state.detectNonAlphanumeric}
                  onChange={this.handleDetectNonAlphanumericChange.bind(this)}
                  disabled={!serverConfigEnabled || this.state.loading}
                  additionalStyles={{ margin: '0px' }}
                />
              }
            />
            {this.state.detectNonAlphanumeric && (
              <>
                <Field
                  labelWidth={62}
                  label={
                    <Label
                      text="Show Info Box"
                      description="Show the info box for selected parameters, or for all if none are selected."
                    />
                  }
                  input={this.renderParamMultiSelectWithButtons(
                    this.state.nonAlphanumericShowOnlyFor,
                    this.handleNonAlphanumericShowOnlyForChange.bind(this),
                    'All parameters',
                    !serverConfigEnabled || this.state.loading
                  )}
                />
                <Field
                  labelWidth={62}
                  className={styles.sectionSeparator}
                  label={
                    <Label
                      text="Block Save"
                      description="Select parameters for which the Save button should be disabled if validation fails."
                    />
                  }
                  input={this.renderParamMultiSelectWithButtons(
                    this.state.nonAlphanumericBlockSave,
                    this.handleNonAlphanumericBlockSaveChange.bind(this),
                    'No parameter',
                    !serverConfigEnabled || this.state.loading,
                    this.state.nonAlphanumericShowOnlyFor.length > 0 ? this.state.nonAlphanumericShowOnlyFor : undefined
                  )}
                />
              </>
            )}
            <Field
              labelWidth={62}
              label={
                <Label
                  text="Regex Validation"
                  description="When enabled, the parameter editor shows whether string values are valid regular expression patterns. Patterns are tested with default, /u (unicode), and /v (unicodeSets) flags."
                />
              }
              input={
                <Toggle
                  type={Toggle.Types.YES_NO}
                  value={this.state.detectRegex}
                  onChange={this.handleDetectRegexChange.bind(this)}
                  disabled={!serverConfigEnabled || this.state.loading}
                  additionalStyles={{ margin: '0px' }}
                />
              }
            />
            {this.state.detectRegex && (
              <>
                <Field
                  labelWidth={62}
                  label={
                    <Label
                      text="Show Info Box"
                      description="Show the info box for selected parameters, or for all if none are selected."
                    />
                  }
                  input={this.renderParamMultiSelectWithButtons(
                    this.state.regexShowOnlyFor,
                    this.handleRegexShowOnlyForChange.bind(this),
                    'All parameters',
                    !serverConfigEnabled || this.state.loading
                  )}
                />
                <Field
                  labelWidth={62}
                  className={styles.sectionSeparator}
                  label={
                    <Label
                      text="Block Save"
                      description="Select parameters for which the Save button should be disabled if validation fails."
                    />
                  }
                  input={this.renderParamMultiSelectWithButtons(
                    this.state.regexBlockSave,
                    this.handleRegexBlockSaveChange.bind(this),
                    'No parameter',
                    !serverConfigEnabled || this.state.loading,
                    this.state.regexShowOnlyFor.length > 0 ? this.state.regexShowOnlyFor : undefined
                  )}
                />
              </>
            )}
          </Fieldset>
          <Fieldset
            legend="Formatting"
            description="Customize JSON syntax highlighting colors for the Cloud Config editor."
          >
            {Object.entries({
              property: 'Property (keys)',
              string: 'String',
              number: 'Number',
              boolean: 'Boolean',
              null: 'Null',
              punctuation: 'Punctuation (brackets, commas)',
              operator: 'Operator (colons)',
            }).map(([tokenType, label], index, array) => (
              <Field
                key={tokenType}
                labelWidth={62}
                className={index === array.length - 1 ? styles.lastField : undefined}
                label={
                  <Label
                    text={label}
                    description={`Default: ${DEFAULT_SYNTAX_COLORS[tokenType]}`}
                  />
                }
                input={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={this.state.syntaxColors[tokenType]}
                      disabled={!serverConfigEnabled || this.state.loading}
                      onChange={(e) => this.handleSyntaxColorChange(tokenType, e.target.value)}
                      onBlur={() => this.saveSyntaxColor(tokenType)}
                      style={{ width: '40px', height: '30px', cursor: 'pointer', border: 'none' }}
                    />
                    <TextInput
                      placeholder={DEFAULT_SYNTAX_COLORS[tokenType]}
                      value={this.state.syntaxColors[tokenType]}
                      disabled={!serverConfigEnabled || this.state.loading}
                      onChange={(value) => this.handleSyntaxColorChange(tokenType, value)}
                      onBlur={() => this.saveSyntaxColor(tokenType)}
                      style={{ width: '100px' }}
                    />
                  </div>
                }
              />
            ))}
            <div style={{ marginTop: '15px', paddingLeft: '62%' }}>
              <Button
                value="Reset to Defaults"
                onClick={this.resetSyntaxColors.bind(this)}
                disabled={!serverConfigEnabled || this.state.loading}
              />
            </div>
          </Fieldset>
        </div>
      </div>
    );
  }
}
