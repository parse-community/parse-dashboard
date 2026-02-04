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

export default class CloudConfigSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Cloud Config';
    this.serverStorage = null;

    this.state = {
      cloudConfigHistoryLimit: '',
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
        </div>
      </div>
    );
  }
}
