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
import * as KeyboardShortcutsPreferences from 'lib/KeyboardShortcutsPreferences';

export default class KeyboardShortcutsSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Keyboard Shortcuts';

    this.state = {
      reloadData: '',
      togglePanels: '',
      hasChanges: false,
      message: null,
    };
  }

  componentDidMount() {
    this.loadShortcuts();
  }

  loadShortcuts() {
    if (this.context) {
      const shortcuts = KeyboardShortcutsPreferences.getKeyboardShortcuts(
        this.context.applicationId
      );
      this.setState({
        reloadData: shortcuts.reloadData || '',
        togglePanels: shortcuts.togglePanels || '',
        hasChanges: false,
      });
    }
  }

  handleFieldChange(field, value) {
    // Restrict to single character
    const restrictedValue = value.slice(0, 1);
    this.setState({
      [field]: restrictedValue,
      hasChanges: true,
    });
  }

  handleSave() {
    if (!this.context) {
      return;
    }

    const shortcuts = {
      reloadData: this.state.reloadData || null,
      togglePanels: this.state.togglePanels || null,
    };

    // Validate shortcuts (only if they are set)
    if (shortcuts.reloadData && !KeyboardShortcutsPreferences.isValidKey(shortcuts.reloadData)) {
      this.showNote('Invalid key for "Reload Data". Please enter a valid key.', true);
      return;
    }

    if (shortcuts.togglePanels && !KeyboardShortcutsPreferences.isValidKey(shortcuts.togglePanels)) {
      this.showNote('Invalid key for "Toggle Panels". Please enter a valid key.', true);
      return;
    }

    // Check for duplicates (only if both are set)
    if (shortcuts.reloadData && shortcuts.togglePanels &&
        shortcuts.reloadData.toLowerCase() === shortcuts.togglePanels.toLowerCase()) {
      this.showNote('Keyboard shortcuts must be unique. Please use different keys.', true);
      return;
    }

    KeyboardShortcutsPreferences.setKeyboardShortcuts(
      this.context.applicationId,
      shortcuts
    );

    this.setState({ hasChanges: false });
    this.showNote('Keyboard shortcuts saved successfully!', false);
  }

  handleReset() {
    if (!this.context) {
      return;
    }

    KeyboardShortcutsPreferences.resetKeyboardShortcuts(this.context.applicationId);
    this.loadShortcuts();
    this.showNote('Keyboard shortcuts reset to defaults', false);
  }

  showNote(message, isError = false) {
    if (!message) {
      return;
    }

    clearTimeout(this.noteTimeout);

    this.setState({ message: { text: message, isError } });

    this.noteTimeout = setTimeout(() => {
      this.setState({ message: null });
    }, 3500);
  }

  renderContent() {
    const shortcuts = KeyboardShortcutsPreferences.DEFAULT_SHORTCUTS;

    return (
      <div>
        <Toolbar section="Settings" subsection="Keyboard Shortcuts" />
        <Notification note={this.state.message?.text} isErrorNote={this.state.message?.isError} />
        <div className={styles.settings_page}>
          <Fieldset
            legend="Data Browser Shortcuts"
            description="Configure keyboard shortcuts for common actions in the Data Browser. Shortcuts are case-insensitive and only work when not editing a field. Leave empty to disable a shortcut."
          >
            <Field
              labelWidth={62}
              label={<Label
                text="Reload Data"
                description={`Reloads the data browser table data. (Default: ${shortcuts.reloadData})`}
              />
              }
              input={
                <TextInput
                  placeholder={shortcuts.reloadData}
                  value={this.state.reloadData}
                  onChange={this.handleFieldChange.bind(this, 'reloadData')}
                  maxLength={1}
                />
              }
            />
            <Field
              labelWidth={62}
              label={
                <Label
                  text="Toggle Info Panels"
                  description={`Shows/hides the info panels. (Default: ${shortcuts.togglePanels})`}
                />
              }
              input={
                <TextInput
                  placeholder={shortcuts.togglePanels}
                  value={this.state.togglePanels}
                  onChange={this.handleFieldChange.bind(this, 'togglePanels')}
                  maxLength={1}
                />
              }
            />
          </Fieldset>

          <Fieldset legend="Actions">
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
          </Fieldset>
        </div>
        <Toolbar section="Settings" subsection="Keyboard Shortcuts" />
      </div>
    );
  }
}
