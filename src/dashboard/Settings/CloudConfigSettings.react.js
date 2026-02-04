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
      if (settings && settings.historyLimit !== undefined) {
        this.setState({ cloudConfigHistoryLimit: String(settings.historyLimit) });
      }
    } catch (error) {
      this.showNote('Failed to load Cloud Config settings.', true);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleCloudConfigHistoryLimitChange(value) {
    this.setState({ cloudConfigHistoryLimit: value });
  }

  async saveCloudConfigHistoryLimit() {
    const value = this.state.cloudConfigHistoryLimit.trim();

    if (value === '') {
      try {
        await this.serverStorage.deleteConfig(
          CONFIG_KEY,
          this.context.applicationId
        );
        this.context.cloudConfigHistoryLimit = undefined;
        this.showNote('Cloud Config history limit reset to default.');
      } catch {
        this.showNote('Failed to reset setting.', true);
      }
      return;
    }

    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      this.showNote('Please enter a valid positive number.', true);
      return;
    }

    try {
      await this.serverStorage.setConfig(
        CONFIG_KEY,
        { historyLimit: parsed },
        this.context.applicationId
      );
      this.context.cloudConfigHistoryLimit = parsed;
      this.setState({ cloudConfigHistoryLimit: String(parsed) });
      this.showNote(`Cloud Config history limit set to ${parsed}.`);
    } catch {
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
    const notAvailableMessage = !serverConfigEnabled
      ? 'Server configuration is not enabled for this app. Please add a \'config\' section to your app configuration.'
      : null;

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
            description="Cloud Config parameter change history is stored in the browser."
          >
            <Field
              labelWidth={62}
              label={
                <Label
                  text="History Limit"
                  description="Maximum number of history entries stored per Cloud Config parameter. Leave empty to use the default (100)."
                />
              }
              input={
                <TextInput
                  placeholder="100"
                  value={this.state.cloudConfigHistoryLimit}
                  disabled={!serverConfigEnabled || this.state.loading}
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
