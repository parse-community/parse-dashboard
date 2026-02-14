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

const CONFIG_KEY = 'browser.panels.settings';
const DEFAULT_VALUE = 1;

export default class DataBrowserSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Data Browser';
    this.serverStorage = null;

    this.state = {
      reverseAutoScrollSpeedFactor: '',
      loading: true,
      message: undefined,
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
      const value = await this.serverStorage.getConfig(
        CONFIG_KEY,
        this.context.applicationId
      );
      if (value !== null && value !== undefined && typeof value === 'object' && typeof value.reverseAutoScrollSpeedFactor === 'number') {
        this.setState({ reverseAutoScrollSpeedFactor: String(value.reverseAutoScrollSpeedFactor) });
      }
    } catch {
      this.showNote('Failed to load Data Browser settings.', true);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleReverseAutoScrollSpeedFactorChange(value) {
    this.setState({ reverseAutoScrollSpeedFactor: value });
  }

  async saveReverseAutoScrollSpeedFactor() {
    const value = this.state.reverseAutoScrollSpeedFactor.trim();

    if (value === '') {
      try {
        await this.serverStorage.deleteConfig(
          CONFIG_KEY,
          this.context.applicationId
        );
        this.showNote('Reverse auto-scroll speed factor reset to default.');
      } catch {
        this.showNote('Failed to reset setting.', true);
      }
      return;
    }

    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) {
      this.showNote('Please enter a valid positive number.', true);
      return;
    }

    try {
      if (parsed === DEFAULT_VALUE) {
        await this.serverStorage.deleteConfig(
          CONFIG_KEY,
          this.context.applicationId
        );
      } else {
        await this.serverStorage.setConfig(
          CONFIG_KEY,
          { reverseAutoScrollSpeedFactor: parsed },
          this.context.applicationId
        );
      }
      this.setState({ reverseAutoScrollSpeedFactor: String(parsed) });
      this.showNote(`Reverse auto-scroll speed factor set to ${parsed}.`);
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
    const notAvailableMessage = !this.state.loading && !serverConfigEnabled
      ? 'Server configuration is not enabled for this app. Please add a \'config\' section to your app configuration.'
      : null;

    return (
      <div>
        <Toolbar section="Settings" subsection="Data Browser" />
        <Notification
          note={notAvailableMessage || (message && message.text)}
          isErrorNote={notAvailableMessage ? true : (message && message.isError)}
        />
        <div className={styles.settings_page}>
          <Fieldset legend="Info Panels">
            <Field
              labelWidth={62}
              label={
                <Label
                  text="Reverse Auto-Scroll Speed Factor"
                  description="Speed multiplier when reversing auto-scroll (Cmd+Option). Default is 1 (full speed). Use 0.5 for half speed."
                />
              }
              input={
                <TextInput
                  placeholder={this.state.loading ? 'Loading...' : '1'}
                  value={this.state.reverseAutoScrollSpeedFactor}
                  disabled={!serverConfigEnabled || this.state.loading}
                  onChange={this.handleReverseAutoScrollSpeedFactorChange.bind(this)}
                  onBlur={this.saveReverseAutoScrollSpeedFactor.bind(this)}
                />
              }
            />
          </Fieldset>
        </div>
      </div>
    );
  }
}
