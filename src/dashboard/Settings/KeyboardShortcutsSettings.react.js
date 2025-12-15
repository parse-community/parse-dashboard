/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DashboardView from 'dashboard/DashboardView.react';
import Field from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import FormButton from 'components/FormButton/FormButton.react';
import Label from 'components/Label/Label.react';
import React from 'react';
import TextInput from 'components/TextInput/TextInput.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import Notification from 'dashboard/Data/Browser/Notification.react';
import styles from 'dashboard/Settings/Settings.scss';
import KeyboardShortcutsManager, { DEFAULT_SHORTCUTS, isValidShortcut, createShortcut } from 'lib/KeyboardShortcutsPreferences';

export default class KeyboardShortcutsSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Keyboard Shortcuts';

    this.state = {
      dataBrowserReloadData: '',
      dataBrowserToggleInfoPanels: '',
      hasChanges: false,
      message: undefined,
    };

    this.manager = null;
  }

  componentDidMount() {
    if (this.context) {
      this.manager = new KeyboardShortcutsManager(this.context);
      this.loadShortcuts();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.noteTimeout);
  }

  async loadShortcuts() {
    if (!this.context || !this.manager) {
      return;
    }

    try {
      const shortcuts = await this.manager.getKeyboardShortcuts(this.context.applicationId);
      this.setState({
        dataBrowserReloadData: shortcuts.dataBrowserReloadData?.key || '',
        dataBrowserToggleInfoPanels: shortcuts.dataBrowserToggleInfoPanels?.key || '',
        hasChanges: false,
      });
    } catch (error) {
      console.error('Failed to load keyboard shortcuts:', error);
      this.showNote('Failed to load keyboard shortcuts', true);
    }
  }

  handleFieldChange(field, value) {
    this.setState({
      [field]: value,
      hasChanges: true,
    });
  }

  handleInputFocus(event) {
    // Auto-select the text when focusing on the input
    if (event.target.value) {
      event.target.select();
    }
  }

  async handleSave() {
    if (!this.context || !this.manager) {
      return;
    }

    // Create shortcut objects from the key strings
    const shortcuts = {
      dataBrowserReloadData: this.state.dataBrowserReloadData ? createShortcut(this.state.dataBrowserReloadData) : null,
      dataBrowserToggleInfoPanels: this.state.dataBrowserToggleInfoPanels ? createShortcut(this.state.dataBrowserToggleInfoPanels) : null,
    };

    // Validate shortcuts (only if they are set)
    if (shortcuts.dataBrowserReloadData && !isValidShortcut(shortcuts.dataBrowserReloadData)) {
      this.showNote('Invalid key for "Reload Data". Please enter a valid key.', true);
      return;
    }

    if (shortcuts.dataBrowserToggleInfoPanels && !isValidShortcut(shortcuts.dataBrowserToggleInfoPanels)) {
      this.showNote('Invalid key for "Toggle Panels". Please enter a valid key.', true);
      return;
    }

    // Check for duplicates (only if both are set)
    if (shortcuts.dataBrowserReloadData && shortcuts.dataBrowserToggleInfoPanels &&
        shortcuts.dataBrowserReloadData.key.toLowerCase() === shortcuts.dataBrowserToggleInfoPanels.key.toLowerCase()) {
      this.showNote('Keyboard shortcuts must be unique. Please use different keys.', true);
      return;
    }

    try {
      await this.manager.saveKeyboardShortcuts(this.context.applicationId, shortcuts);
      this.setState({ hasChanges: false });
      this.showNote('Keyboard shortcuts saved successfully!', false);
    } catch (error) {
      console.error('Failed to save keyboard shortcuts:', error);
      this.showNote('Failed to save keyboard shortcuts. Please try again.', true);
    }
  }

  async handleReset() {
    if (!this.context || !this.manager) {
      return;
    }

    try {
      await this.manager.resetKeyboardShortcuts(this.context.applicationId);
      await this.loadShortcuts();
      this.showNote('Keyboard shortcuts reset to defaults', false);
    } catch (error) {
      console.error('Failed to reset keyboard shortcuts:', error);
      this.showNote('Failed to reset keyboard shortcuts. Please try again.', true);
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
    // Show error if server config is not enabled
    const serverConfigError = this.manager && !this.manager.isServerConfigEnabled()
      ? 'Server configuration is not enabled for this app. Please add a \'config\' section to your app configuration to use keyboard shortcuts.'
      : null;

    // Show either server config error or user message
    const message = this.state.message;
    const notificationMessage = serverConfigError || (message && message.text);
    const isError = serverConfigError ? true : (message && message.isError);

    return (
      <div>
        <Toolbar section="Settings" subsection="Keyboard Shortcuts" />
        <Notification note={notificationMessage} isErrorNote={isError} />
        <div className={styles.settings_page}>
          <Fieldset
            legend="Data Browser"
            description="Leave empty to disable a shortcut."
          >
            <Field
              labelWidth={62}
              label={<Label
                text="Reload Data"
                description={'Reloads the data browser table data.'}
              />
              }
              input={
                <TextInput
                  placeholder={DEFAULT_SHORTCUTS.dataBrowserReloadData.key}
                  value={this.state.dataBrowserReloadData}
                  onChange={this.handleFieldChange.bind(this, 'dataBrowserReloadData')}
                  onFocus={this.handleInputFocus.bind(this)}
                  maxLength={1}
                />
              }
            />
            <Field
              labelWidth={62}
              label={
                <Label
                  text="Toggle Info Panels"
                  description={'Shows/hides the info panels.'}
                />
              }
              input={
                <TextInput
                  placeholder={DEFAULT_SHORTCUTS.dataBrowserToggleInfoPanels.key}
                  value={this.state.dataBrowserToggleInfoPanels}
                  onChange={this.handleFieldChange.bind(this, 'dataBrowserToggleInfoPanels')}
                  onFocus={this.handleInputFocus.bind(this)}
                  maxLength={1}
                />
              }
            />
          </Fieldset>

          <div className={styles.form_buttons}>
            <FormButton
              value="Save Shortcuts"
              disabled={!this.state.hasChanges}
              onClick={this.handleSave.bind(this)}
            />
            <FormButton
              value="Reset to Defaults"
              onClick={this.handleReset.bind(this)}
              color="white"
            />
          </div>
        </div>
      </div>
    );
  }
}
