/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AccountManager from 'lib/AccountManager';
import React from 'react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import { withRouter } from 'lib/withRouter';
import DashboardView from 'dashboard/DashboardView.react';
import B4aLoaderContainer from 'components/B4aLoaderContainer/B4aLoaderContainer.react';
import styles from './DomainSettings.scss';
import EmptyGhostState from 'components/EmptyGhostState/EmptyGhostState.react';
import Button from 'components/Button/Button.react';
import B4aToggle from 'components/Toggle/B4aToggle.react';
import Icon from 'components/Icon/Icon.react';
import B4aModal from 'components/B4aModal/B4aModal.react';
import Label from 'components/Label/Label.react';
import Field from 'components/Field/Field.react';
import TextInput from 'components/TextInput/TextInput.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import { amplitudeLogEvent } from 'lib/amplitudeEvents';
import { UpgradeGate } from 'lib/upgradeEvents';
import { UpgradeGateButton } from 'components/UpgradeCheckout/UpgradeCheckout.react';
import B4aNotification from 'dashboard/Data/Browser/B4aNotification.react';
import browserStyles from 'dashboard/Data/Browser/Browser.scss';

@withRouter
class DomainSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Domains';
    this.state = {
      isLoading: true,
      domainSettings: {},
      domainSettingsError: null,

      isUserVerified: false,
      emailVerified: false,
      cardValidated: false,
      isResendingVerificationEmail: false,
      resendVerificationMessage: null,
      canChangeCustomDomain: false,
      canChangeSubdomain: false,

      subdomainName: '',
      currentSubdomain: '',
      customDomain: '',
      customDomainArray: [],

      activated: false,
      isActivated: false,
      hasPermission: false,
      availableDomains: ['b4a.app'],
      currentDomain: 'b4a.app',

      updating: false,
      isEditing: false,
      hasToggleChanged: false,
      canEdit: true,

      errorCustomDomain: null,
      successCustomDomain: null,
      errorUpdateWebHost: null,
      successUpdateWebHost: null,
    };
    this.onRefresh = this.onRefresh.bind(this);
    this.handleSubdomainChange = this.handleSubdomainChange.bind(this);
    this.handleAddCustomDomain = this.handleAddCustomDomain.bind(this);
    this.handleRemoveCustomDomain = this.handleRemoveCustomDomain.bind(this);
    this.handleToggleChange = this.handleToggleChange.bind(this);
  }

  componentWillMount() {
    this.loadData();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      // check if the changes are in currentApp serverInfo status
      // if not return without any request
      if (this.props.apps !== nextProps.apps) {
        const updatedCurrentApp = nextProps.apps.find(ap => ap.slug === this.props.match.params.appId);
        const prevCurrentApp = this.props.apps.find(ap => ap.slug === this.props.match.params.appId);
        const shouldUpdate = updatedCurrentApp.serverInfo.status !== prevCurrentApp.serverInfo.status;
        if (!shouldUpdate) {return;}
      }
      // nextProps.config.dispatch(ActionTypes.FETCH);
    }
  }

  onRefresh() {
    this.setState({ isLoading: true });
    this.loadData();
  }

  async loadData() {
    try {
      const response = await this.context.getCustomDomain();
      this.setState({ domainSettings: response });
      await this.loadHostSettings(response);
    } catch (error) {
      this.setState({ domainSettingsError: error });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async loadHostSettings(response) {
    const { hostSettings: appHostSettings, domains, canChangeCustomDomain, canChangeSubdomain, createdAt } = response;

    let customDomainArray = [];
    let subdomainName = '';
    let currentSubdomain = '';
    let activated = false;
    let isActivated = false;
    let hasPermission = false;
    let isUserVerified = false;
    const currentUser = AccountManager.currentUser();
    const verification = (currentUser && currentUser.verification) || {};
    const emailVerified = !!verification.emailVerified;
    const cardValidated = !!verification.cardValidation;

    if (domains && domains.length > 0) {
      customDomainArray = domains;
    }

    if (domains && domains.length > 0) {
      customDomainArray = domains;
    }

    if (appHostSettings && appHostSettings.webhost) {
      const subDomainName = appHostSettings.webhost
      currentSubdomain = subDomainName
      subdomainName = subDomainName.replace(/\.(b4a|back4app|b4a|b4app)\.(app|io)$/, '');
      this.listAvailableDomains(subDomainName)
      activated = true;
      isActivated = activated && subDomainName ? true : false;
    } else {
      subdomainName = appHostSettings.appName.replace(/[^A-Z0-9]+/ig, '').toLowerCase();
    }

    hasPermission = (!response.featuresPermission || response.featuresPermission.webHostLiveQuery === 'Write');

    if (response && ((appHostSettings.serverURL && appHostSettings.activated) || (createdAt && ((new Date() - new Date(createdAt)) > (6 * 30 * 24 * 60 * 60 * 1000))))) {
      isUserVerified = true;
    }

    if (!isUserVerified) {
      try {
        const plan = await this.context.getAppPlanData();
        if (plan && plan.planName && (plan.planName.indexOf('Free') < 0) && (plan.planName.indexOf('Public') < 0)) {
          isUserVerified = true;
        } else if (emailVerified && cardValidated) {
          isUserVerified = true;
        }
      } catch (planError) {
        if (emailVerified && cardValidated) {
          isUserVerified = true;
        }
      }
    }

    this.setState({
      isUserVerified,
      emailVerified,
      cardValidated,

      subdomainName,
      currentSubdomain,
      customDomainArray,

      activated,
      isActivated,
      isEditing: !isActivated,

      hasPermission,
      canChangeCustomDomain,
      canChangeSubdomain,
    });
  }

  listAvailableDomains(appDomain) {
    const domain = appDomain.substring(appDomain.lastIndexOf('.', appDomain.lastIndexOf('.') - 1) + 1)
    if (this.state.availableDomains.indexOf(domain) == -1) { this.state.availableDomains.push(domain) }
    this.setState({ currentDomain: domain });
  }

  renderToolbar() {
    return (
      <Toolbar section="App Settings" subsection="Domains">
        <a className={browserStyles.toolbarButton} style={{ margin: 0, border: 'none' }} onClick={this.onRefresh.bind(this)}>
          <Icon name="b4a-refresh-icon" width={18} height={18} />
        </a>
        {this.state.hasToggleChanged && (
          <Button
            value="Save Changes"
            primary={true}
            onClick={this.handleUpdateHostSettings.bind(this)}
            disabled={this.state.updating}
            width="auto"
            additionalStyles={{ marginLeft: '10px' }}
          />
        )}
      </Toolbar>
    );
  }

  handleSubdomainChange(e) {
    this.setState({ subdomainName: e.target.value });
  }

  handleToggleChange(value) {
    const originalActivated = this.state.isActivated;
    this.setState({
      activated: value,
      hasToggleChanged: originalActivated && !value // Only true when changing from true to false
    });
  }

  async handleAddCustomDomain() {
    try {
      this.setState({ updating: true });
      await this.context.addCustomDomain({ domain: this.state.customDomain });
      this.setState({ customDomainArray: [...this.state.customDomainArray, this.state.customDomain], customDomain: '' });

      // Send amplitude event for custom domain configuration
      amplitudeLogEvent('Custom Domain configured');

      this.setState({ successCustomDomain: 'Custom domain added successfully' });
      setTimeout(() => {
        this.setState({ successCustomDomain: null });
      }, 5000);
    } catch (error) {
      this.setState({ errorCustomDomain: error });
      setTimeout(() => {
        this.setState({ errorCustomDomain: null });
      }, 5000);
    } finally {
      this.setState({ updating: false });
    }
  }

  async handleRemoveCustomDomain(domain) {
    try {
      this.setState({ updating: true });
      await this.context.removeCustomDomain({ domain });
      this.setState({ customDomainArray: this.state.customDomainArray.filter(d => d !== domain) });
      this.setState({ successCustomDomain: 'Custom domain removed successfully' });
      setTimeout(() => {
        this.setState({ successCustomDomain: null });
      }, 5000);
    } catch (error) {
      this.setState({ errorCustomDomain: error.message || 'Something went wrong!' });
      setTimeout(() => {
        this.setState({ errorCustomDomain: null });
      }, 5000);
    } finally {
      this.setState({ updating: false });
    }
  }

  async handleUpdateHostSettings() {
    try {
      this.setState({ updating: true });
      await this.context.updateHostAddress({ currentSubdomain: this.state.currentSubdomain,
        subdomainName: this.state.subdomainName + '.' + this.state.currentDomain,
        activated: this.state.activated
      });

      // Send amplitude event for web hosting configuration
      amplitudeLogEvent('Webhosting configured');

      this.setState({
        successUpdateWebHost: 'Subdomain updated successfully',
        hasToggleChanged: false // Reset the toggle change flag
      }, () => {
        this.onRefresh();
        setTimeout(() => {
          this.setState({ successUpdateWebHost: null });
        }, 5000);
      });
    } catch (error) {
      console.error('error updating web host', error);
      
      this.setState({ errorUpdateWebHost: error || 'Something went wrong!' }, () => {
        setTimeout(() => {
          this.setState({ errorUpdateWebHost: null });
        }, 5000);
      });
    } finally {
      this.setState({ updating: false });
    }
  }

  async handleResendEmailVerification() {
    if (this.state.isResendingVerificationEmail) {
      return;
    }

    this.setState({
      isResendingVerificationEmail: true,
      resendVerificationMessage: null,
    });

    try {
      const result = await this.context.resendEmailVerification();
      this.setState({
        isResendingVerificationEmail: false,
        resendVerificationMessage: {
          type: 'success',
          text: typeof result === 'string' && result.trim()
            ? result
            : 'Verification email sent.',
        },
      });
    } catch (err) {
      this.setState({
        isResendingVerificationEmail: false,
        resendVerificationMessage: {
          type: 'error',
          text: typeof err === 'string' && err.trim()
            ? err
            : (err && err.message) || 'Failed to resend verification email',
        },
      });
    }
  }

  renderVerificationRequired() {
    const { emailVerified, cardValidated, isResendingVerificationEmail, resendVerificationMessage } = this.state;

    return (
      <>
        {!emailVerified && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', background: '#fff3cd', borderRadius: '6px', color: '#856404' }}>
            Please verify your email to enable this feature.{' '}
            <button
              type="button"
              onClick={() => this.handleResendEmailVerification()}
              disabled={isResendingVerificationEmail}
              style={{
                padding: 0,
                border: 'none',
                background: 'transparent',
                color: '#15A9FF',
                textDecoration: 'underline',
                cursor: isResendingVerificationEmail ? 'default' : 'pointer',
                font: 'inherit',
              }}
            >
              {isResendingVerificationEmail ? 'Sending...' : 'Resend email'}
            </button>
            {resendVerificationMessage && (
              <div
                style={{
                  marginTop: '8px',
                  color: resendVerificationMessage.type === 'error' ? '#b02a37' : '#0f5132',
                }}
              >
                {resendVerificationMessage.text}
              </div>
            )}
          </div>
        )}

        {!cardValidated && (
          <Fieldset>
            <Field
              label={
                <Label
                  text="Validate your card"
                  dark={true}
                  description="In order to enable this feature, you must validate your card."
                />
              }
              input={
                <div style={{ width: '100%', padding: '0 1rem', textAlign: 'right' }}>
                  <a
                    href="https://checkout.back4app.io/subscription/VU0VZpDrHh"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      value="Validate Card"
                      primary={true}
                    />
                  </a>
                </div>
              }
              theme={Field.Theme.BLUE}
            />
          </Fieldset>
        )}
      </>
    );
  }

  getDisplayContent() {
    let content = null;

    if (
      !this.state.canChangeSubdomain && !this.state.isActivated && this.state.currentSubdomain.trim().length === 0 && this.state.customDomainArray.length === 0) {
      content = <Fieldset>
        <Field
          label={<Label text="Upgrade your plan" dark={true} description="Upgrade your plan to enable web hosting for your pages and use your own domain." />}
          input={<div style={{ width: '100%', padding: '0 1rem', textAlign: 'right' }}>
            <UpgradeGateButton gate={UpgradeGate.WEB_HOSTING} logView />
          </div>}
          theme={Field.Theme.BLUE}
        />
      </Fieldset>
    } else if (this.state.isUserVerified) {
      content = <><Fieldset>
        <Field
          label={<Label text="Activate Web Hosting" dark={true} description="Toggle to enable or disable web hosting on your b4a.app subdomain." />}
          input={
            <div style={{ width: '100%', padding: '0 1rem', textAlign: 'right' }}>
              {this.state.canChangeSubdomain || this.state.currentSubdomain.trim().length > 0 ? (
                <B4aToggle
                  value={this.state.activated}
                  onChange={this.handleToggleChange}
                  type={B4aToggle.Types.YES_NO}
                  disabled={!this.state.canChangeSubdomain && this.state.currentSubdomain.trim().length === 0}
                />
              ) : (
                <UpgradeGateButton gate={UpgradeGate.WEB_HOSTING} logView />
              )}           
            </div>
          }
          theme={Field.Theme.BLUE}
        />
        {this.state.activated && <Field
          label={<Label text="Subdomain Name" dark={true} description="Enter your subdomain name" />}
          input={
            <div style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              padding: '0 1rem',
              justifyContent: 'space-between'
            }}>
              {this.state.isEditing ? <>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                  <TextInput
                    value={this.state.subdomainName}
                    onChange={(name) => this.setState({ subdomainName: name })}
                    placeholder={this.state.currentSubdomain || 'yourapp'}
                    disabled={this.state.updating}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                  <span style={{
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'normal'
                  }}>
                .
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {this.state.availableDomains.length > 1 ? (<select
                    value={this.state.currentDomain}
                    onChange={(e) => this.setState({ currentDomain: e.target.value })}
                    disabled={this.state.updating}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: '14px',
                      padding: '0.25rem',
                      outline: 'none',
                    }}
                  >
                    {this.state.availableDomains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>) : (<span style={{ display:'inline-block', marginLeft: '0.5rem' }}>{this.state.currentDomain}</span>)}
                  {this.state.canChangeSubdomain || this.state.currentSubdomain.trim().length > 0 ? (
                    <>
                      <Button
                        value={this.state.updating ? 'saving...' : 'save'}
                        onClick={this.handleUpdateHostSettings.bind(this)}
                        disabled={this.state.updating || !this.state.subdomainName}
                        primary={true}
                      />
                      {this.state.domainSettings.hostSettings.webhost && <Button
                        value={'cancel'}
                        onClick={() => this.setState({ isEditing: false })}
                        disabled={this.state.updating}
                        color="red"
                      />}
                    </>
                  ) : <></>}

                </div>
              </> : (
                <>
                  <span className={styles.subdomainContainer}><a className={styles.subdomain} href={`https://${this.state.domainSettings.hostSettings.webhost}`} target="_blank" rel="noopener noreferrer">{this.state.domainSettings.hostSettings.webhost}</a></span>
                  {this.state.canChangeSubdomain || this.state.currentSubdomain.trim().length > 0 ? (
                    <Button
                      value={'Edit'}
                      color="blue"
                      secondary={true}
                      onClick={() => this.setState({ isEditing: true })}
                      disabled={this.state.updating}
                    />
                  ) : <></>}
                </>
              )}

            </div>
          }
          theme={Field.Theme.BLUE}
        />}
        {this.state.successUpdateWebHost && <div className={styles.success}>{this.state.successUpdateWebHost}</div>}
        {this.state.errorUpdateWebHost && <div className={styles.error}>{this.state.errorUpdateWebHost}</div>}
      </Fieldset>

      <Fieldset legend="Custom Domain" description={this.state.canChangeCustomDomain ? 'Configure a custom address to your app.' : 'Upgrade to Pay as You Go Plan to add your custom domain.'}>

        <div style={{ marginTop: this.state.canChangeCustomDomain ? '0' : '1rem' }}>
          <Field
            label={<Label text="Custom domain" dark={true} description="Enter your custom domain" />}
            input={<div style={{ 
              width: '100%', 
              padding: '0 1rem', 
              textAlign: 'right', 
              display: 'flex', 
              gap: '0.5rem', 
              alignItems: 'center',
              justifyContent: this.state.canChangeCustomDomain ? 'space-between' : 'flex-end'
            }}>
              {this.state.canChangeCustomDomain ? (
                <>
                  <TextInput
                    value={this.state.customDomain}
                    onChange={(val) => this.setState({ customDomain: val })}
                    disabled={this.state.updating}
                    placeholder="example.com"
                  />
                  <Button
                    value="Add"
                    color="green"
                    onClick={this.handleAddCustomDomain}
                    disabled={this.state.updating}
                    additionalStyles={{ background: 'transparent', border: '1px solid #4CAF50', color: '#4CAF50', borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '14px', minWidth: '80px' }}
                  />
                </>
              ) : (
                <UpgradeGateButton gate={UpgradeGate.CUSTOM_DOMAIN} logView />
              )}
              
            </div>}
            theme={Field.Theme.BLUE}
          />
          <div className={styles.note}>
            Note: To set up a custom domain, you'll first need to create a
            b4a.app subdomain (e.g. myapp.b4a.app). After that, create a CNAME DNS entry in your DNS provider.
            (myapp.mydomain.com - myapp.b4a.app)
          </div>
        </div>
      </Fieldset>

      <Fieldset legend="Custom domains added">
        <Field label={<Label text="Available Custom domains" dark={true} />}
          theme={Field.Theme.BLUE}
          input={<div className={styles.customDomainList}>
            {this.state.customDomainArray.length === 0 ? (
              <div className={styles.noDomains}>NA</div>
            ) : (
              this.state.customDomainArray.map((domain, index) => (
                <div
                  key={domain}
                  className={`${styles.customDomainItem} ${index === this.state.customDomainArray.length - 1 ? styles.lastItem : ''}`}
                >
                  <div className={styles.subdomainContainer}> <a style={{ color: '#fff' }} className={styles.subdomain} href={`https://${domain}`} target="_blank" rel="noopener noreferrer">{domain}</a></div>
                  <Button
                    value="x"
                    color="red"
                    onClick={() => this.handleRemoveCustomDomain(domain)}
                    width="auto"
                    additionalStyles={{
                      padding: '0 0.5rem',
                    }}
                    disabled={this.state.updating || (!this.state.canChangeCustomDomain && this.state.customDomainArray.length === 0)}
                  />
                </div>
              ))
            )}
          </div>}
        />
        {this.state.successCustomDomain && <div className={styles.success}>{this.state.successCustomDomain}</div>}
        {this.state.errorCustomDomain && <div className={styles.error}>{this.state.errorCustomDomain}</div>}
      </Fieldset>
      </>
    } else {
      content = this.renderVerificationRequired();
    }

    return (
      <div className={styles.domainSettingsContainer}>
        <div className={styles.heading}>Domains</div>
        <div className={styles.subheading}>Host your pages on a b4a.app subdomain and connect your own domain.</div>
        <div className={styles.formContainer}>
          {content}
        </div>
      </div>
    );
  }

  renderContent() {
    const toolbar = this.renderToolbar();
    const loading = this.state.isLoading;

    let content = null;
    if (loading) {
      content = null;
    } else if (this.state.domainSettingsError) {
      content = <EmptyGhostState
        title="Error loading domain settings"
        description={this.state.domainSettingsError}
      />
    } else {
      content = <div className={styles.mainContent}>
        {this.getDisplayContent()}
      </div>
    }

    return (
      <div>
        <B4aLoaderContainer loading={loading}>
          <div className={styles.content}>
            {content}
          </div>
        </B4aLoaderContainer>
        {toolbar}

        {/* Notification Component */}
        {this.state.showNotification && (
          <B4aNotification
            message={this.state.notificationMessage}
            type={this.state.notificationType}
            onClose={this.hideNotification}
          />
        )}
      </div>
    );
  }
}

export default DomainSettings;

