import Button from 'components/Button/Button.react';
import DashboardView from 'dashboard/DashboardView.react';
import Field from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import Label from 'components/Label/Label.react';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';
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
      }

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
            }).map(([tokenType, label]) => (
              <Field
                key={tokenType}
                labelWidth={62}
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
