import DashboardView from 'dashboard/DashboardView.react';
import Field from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import FlowView from 'components/FlowView/FlowView.react';
import FormButton from 'components/FormButton/FormButton.react';
import Label from 'components/Label/Label.react';
import Button from 'components/Button/Button.react';
import React from 'react';
import styles from 'dashboard/Settings/DashboardSettings/DashboardSettings.scss';
import TextInput from 'components/TextInput/TextInput.react';
import Toggle from 'components/Toggle/Toggle.react';
import Icon from 'components/Icon/Icon.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import CodeSnippet from 'components/CodeSnippet/CodeSnippet.react';
import Notification from 'dashboard/Data/Browser/Notification.react';
import * as ColumnPreferences from 'lib/ColumnPreferences';
import * as ClassPreferences from 'lib/ClassPreferences';
import ViewPreferencesManager from 'lib/ViewPreferencesManager';
import ScriptManager from 'lib/ScriptManager';
import bcrypt from 'bcryptjs';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

export default class DashboardSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Dashboard Configuration';
    this.viewPreferencesManager = null;
    this.scriptManager = null;

    this.state = {
      createUserInput: false,
      username: '',
      password: '',
      encrypt: true,
      mfa: false,
      mfaDigits: 6,
      mfaPeriod: 30,
      mfaAlgorithm: 'SHA1',
      message: null,
      passwordInput: '',
      passwordHidden: true,
      migrationLoading: false,
      storagePreference: 'local', // Will be updated in componentDidMount
      copyData: {
        data: '',
        show: false,
        type: '',
      },
      newUser: {
        data: '',
        show: false,
        mfa: '',
      },
    };
  }

  componentDidMount() {
    this.initializeManagers();
  }

  initializeManagers() {
    if (this.context) {
      this.viewPreferencesManager = new ViewPreferencesManager(this.context);
      this.scriptManager = new ScriptManager(this.context);
      this.loadStoragePreference();
    }
  }

  loadStoragePreference() {
    if (this.viewPreferencesManager) {
      const preference = this.viewPreferencesManager.getStoragePreference(this.context.applicationId);
      this.setState({ storagePreference: preference });
    }
  }

  handleStoragePreferenceChange(preference) {
    if (this.viewPreferencesManager) {
      this.viewPreferencesManager.setStoragePreference(this.context.applicationId, preference);
      this.setState({ storagePreference: preference });

      // Show a notification about the change
      this.showNote(`Storage preference changed to ${preference === 'server' ? 'server' : 'browser'}`);
    }
  }

  async migrateToServer() {
    if (!this.viewPreferencesManager) {
      this.showNote('ViewPreferencesManager not initialized');
      return;
    }

    if (!this.viewPreferencesManager.isServerConfigEnabled()) {
      this.showNote('Server configuration is not enabled for this app. Please add a "config" section to your app configuration.');
      return;
    }

    this.setState({ migrationLoading: true });

    try {
      const result = await this.viewPreferencesManager.migrateToServer(this.context.applicationId);
      if (result.success) {
        if (result.viewCount > 0) {
          this.showNote(`Successfully migrated ${result.viewCount} view(s) to server storage.`);
        } else {
          this.showNote('No views found to migrate.');
        }
      }
    } catch (error) {
      this.showNote(`Failed to migrate views: ${error.message}`);
    } finally {
      this.setState({ migrationLoading: false });
    }
  }

  async deleteFromBrowser() {
    if (!window.confirm('Are you sure you want to delete all dashboard settings from browser storage? This action cannot be undone.')) {
      return;
    }

    if (!this.viewPreferencesManager) {
      this.showNote('ViewPreferencesManager not initialized');
      return;
    }

    if (!this.scriptManager) {
      this.showNote('ScriptManager not initialized');
      return;
    }

    const viewsSuccess = this.viewPreferencesManager.deleteFromBrowser(this.context.applicationId);
    const scriptsSuccess = this.scriptManager.deleteFromBrowser(this.context.applicationId);

    if (viewsSuccess && scriptsSuccess) {
      this.showNote('Successfully deleted dashboard settings from browser storage.');
    } else {
      this.showNote('Failed to delete all dashboard settings from browser storage.');
    }
  }

  getColumns() {
    const data = ColumnPreferences.getAllPreferences(this.context.applicationId);
    this.setState({
      copyData: {
        data: JSON.stringify(data, null, 2),
        show: true,
        type: 'Column Preferences',
      },
    });
  }

  getClasses() {
    const data = ClassPreferences.getAllPreferences(this.context.applicationId);
    this.setState({
      copyData: {
        data: JSON.stringify(data, null, 2),
        show: true,
        type: 'Class Preferences',
      },
    });
  }

  copy(data, label) {
    navigator.clipboard.writeText(data);
    this.showNote(`${label} copied to clipboard`);
  }

  createUser() {
    if (!this.state.username) {
      this.showNote('Please enter a username');
      return;
    }
    if (!this.state.password) {
      this.showNote('Please enter a password');
      return;
    }

    let pass = this.state.password;
    if (this.state.encrypt) {
      const salt = bcrypt.genSaltSync(10);
      pass = bcrypt.hashSync(pass, salt);
    }

    const user = {
      username: this.state.username,
      pass,
    };

    let mfa;
    if (this.state.mfa) {
      const secret = new OTPAuth.Secret();
      const totp = new OTPAuth.TOTP({
        issuer: this.context.name,
        label: user.username,
        algorithm: this.state.mfaAlgorithm || 'SHA1',
        digits: this.state.mfaDigits || 6,
        period: this.state.mfaPeriod || 30,
        secret,
      });
      mfa = totp.toString();
      user.mfa = secret.base32;
      if (totp.algorithm !== 'SHA1') {
        user.mfaAlgorithm = totp.algorithm;
      }
      if (totp.digits != 6) {
        user.mfaDigits = totp.digits;
      }
      if (totp.period != 30) {
        user.mfaPeriod = totp.period;
      }

      setTimeout(() => {
        const canvas = document.getElementById('canvas');
        QRCode.toCanvas(canvas, mfa);
      }, 10);
    }

    this.setState({
      newUser: {
        show: true,
        data: JSON.stringify(user, null, 2),
        mfa,
      },
    });
  }

  generatePassword() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const pwordLength = 20;
    let password = '';

    const array = new Uint32Array(chars.length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < pwordLength; i++) {
      password += chars[array[i] % chars.length];
    }
    this.setState({ password });
  }

  showNote(message) {
    if (!message) {
      return;
    }

    clearTimeout(this.noteTimeout);

    this.setState({ message });

    this.noteTimeout = setTimeout(() => {
      this.setState({ message: null });
    }, 3500);
  }

  renderForm() {
    const createUserInput = (
      <Fieldset legend="New User">
        <Field
          label={<Label text="Username" />}
          input={
            <TextInput
              value={this.state.username}
              placeholder="Username"
              onChange={username => this.setState({ username })}
            />
          }
        />
        <Field
          label={
            <Label
              text={
                <div className={styles.password}>
                  <span>Password</span>
                  <a
                    onClick={() =>
                      this.setState({
                        passwordHidden: !this.state.passwordHidden,
                      })
                    }
                  >
                    <Icon
                      name={this.state.passwordHidden ? 'visibility' : 'visibility_off'}
                      width={18}
                      height={18}
                      fill="rgba(0,0,0,0.4)"
                    />
                  </a>
                </div>
              }
              description={<a onClick={() => this.generatePassword()}>Generate strong password</a>}
            />
          }
          input={
            <TextInput
              hidden={this.state.passwordHidden}
              value={this.state.password}
              placeholder="Password"
              onChange={password => this.setState({ password })}
            />
          }
        />
        <Field
          label={<Label text="Encrypt Password" />}
          input={
            <Toggle
              value={this.state.encrypt}
              type={Toggle.Types.YES_NO}
              onChange={encrypt => this.setState({ encrypt })}
            />
          }
        />
        <Field
          label={<Label text="Enable MFA" />}
          input={
            <Toggle
              value={this.state.mfa}
              type={Toggle.Types.YES_NO}
              onChange={mfa => this.setState({ mfa })}
            />
          }
        />
        {this.state.mfa && (
          <Field
            label={<Label text="MFA Algorithm" />}
            input={
              <Dropdown
                value={this.state.mfaAlgorithm}
                onChange={mfaAlgorithm => this.setState({ mfaAlgorithm })}
              >
                {[
                  'SHA1',
                  'SHA224',
                  'SHA256',
                  'SHA384',
                  'SHA512',
                  'SHA3-224',
                  'SHA3-256',
                  'SHA3-384',
                  'SHA3-512',
                ].map(column => (
                  <Option key={column} value={column}>
                    {column}
                  </Option>
                ))}
              </Dropdown>
            }
          />
        )}
        {this.state.mfa && (
          <Field
            label={
              <Label text="MFA Digits" description="How many digits long should the MFA code be" />
            }
            input={
              <TextInput
                value={`${this.state.mfaDigits}`}
                placeholder="6"
                onChange={mfaDigits => this.setState({ mfaDigits })}
              />
            }
          />
        )}
        {this.state.mfa && (
          <Field
            label={<Label text="MFA Period" description="How many long should the MFA last for" />}
            input={
              <TextInput
                value={`${this.state.mfaPeriod}`}
                placeholder="30"
                onChange={mfaPeriod => this.setState({ mfaPeriod })}
              />
            }
          />
        )}
        <Field
          input={
            <Button color="blue" value="Create" width="120px" onClick={() => this.createUser()} />
          }
        />
      </Fieldset>
    );
    const copyData = (
      <div>
        <div className={styles.copyData}>
          <CodeSnippet source={this.state.copyData.data} language="json" />
        </div>
        <div className={styles.footer}>
          <Button
            color="blue"
            value="Copy"
            width="120px"
            onClick={() => this.copy(this.state.copyData.data, this.state.copyData.type)}
          />
          <Button
            primary={true}
            value="Done"
            width="120px"
            onClick={() => this.setState({ copyData: { data: '', show: false } })}
          />
        </div>
      </div>
    );
    const userData = (
      <div className={styles.userData}>
        Add the following data to your Parse Dashboard configuration &quot;users&quot;:
        {this.state.encrypt && (
          <div>Make sure the dashboard option useEncryptedPasswords is set to true.</div>
        )}
        <div className={styles.newUser}>
          <CodeSnippet source={this.state.newUser.data} language="json" />
        </div>
        {this.state.mfa && (
          <div className={styles.mfa}>
            <div>Share this MFA Data with your user:</div>
            <a onClick={() => this.copy(this.state.newUser.mfa, 'MFA Data')}>
              {this.state.newUser.mfa}
            </a>
            <canvas id="canvas" />
          </div>
        )}
        <div className={styles.footer}>
          <Button
            color="blue"
            value="Copy"
            width="120px"
            onClick={() => this.copy(this.state.newUser.data, 'New User')}
          />
          <Button
            primary={true}
            value="Done"
            width="120px"
            onClick={() =>
              this.setState({
                username: '',
                password: '',
                passwordHidden: true,
                mfaAlgorithm: 'SHA1',
                mfaDigits: 6,
                mfaPeriod: 30,
                encrypt: true,
                createUserInput: false,
                newUser: { data: '', show: false },
              })
            }
          />
        </div>
      </div>
    );
    return (
      <div className={styles.settings_page}>
        <Fieldset legend="Dashboard Configuration">
          <Field
            label={<Label text="Export Column Preferences" />}
            input={<FormButton color="blue" value="Export" onClick={() => this.getColumns()} />}
          />
          <Field
            label={<Label text="Export Class Preferences" />}
            input={<FormButton color="blue" value="Export" onClick={() => this.getClasses()} />}
          />
          <Field
            label={<Label text="Create New User" />}
            input={
              <FormButton
                color="blue"
                value="Create"
                onClick={() => this.setState({ createUserInput: true })}
              />
            }
          />
        </Fieldset>
        {this.viewPreferencesManager && this.scriptManager && this.viewPreferencesManager.isServerConfigEnabled() && (
          <Fieldset legend="Settings Storage">
            <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px', textAlign: 'center' }}>
              Storing dashboard settings on the server rather than locally in the browser storage makes the settings available across devices and browsers. It also prevents them from getting lost when resetting the browser website data. Settings that can be stored on the server are currently Views, Keyboard Shortcuts and JS Console scripts.
            </div>
            <Field
              label={
                <Label
                  text="Storage Location"
                  description="Choose where your dashboard settings are stored and loaded from."
                />
              }
              input={
                <Toggle
                  value={this.state.storagePreference}
                  type={Toggle.Types.CUSTOM}
                  optionLeft="local"
                  optionRight="server"
                  labelLeft="Browser"
                  labelRight="Server"
                  colored={true}
                  onChange={(preference) => this.handleStoragePreferenceChange(preference)}
                />
              }
            />
            <Field
              label={
                <Label
                  text="Migrate Settings to Server"
                  description="Migrates browser-stored settings to the server. ⚠️ This overwrites existing dashboard settings on the server."
                />
              }
              input={
                <FormButton
                  color="blue"
                  value={this.state.migrationLoading ? 'Migrating...' : 'Migrate to Server'}
                  disabled={this.state.migrationLoading}
                  onClick={() => this.migrateToServer()}
                />
              }
            />
            <Field
              label={
                <Label
                  text="Delete Settings from Browser"
                  description="Removes settings from browser storage. ⚠️ Migrate your settings to the server and test them first."
                />
              }
              input={
                <FormButton
                  color="red"
                  value="Delete from Browser"
                  onClick={() => this.deleteFromBrowser()}
                />
              }
            />
          </Fieldset>
        )}
        {this.state.copyData.show && copyData}
        {this.state.createUserInput && createUserInput}
        {this.state.newUser.show && userData}
        <Toolbar section="Settings" subsection="Dashboard Configuration" />
        <Notification note={this.state.message} isErrorNote={false} />
      </div>
    );
  }

  renderContent() {
    return (
      <FlowView
        initialFields={{}}
        initialChanges={{}}
        footerContents={() => {}}
        onSubmit={() => {}}
        renderForm={() => this.renderForm()}
      />
    );
  }
}
