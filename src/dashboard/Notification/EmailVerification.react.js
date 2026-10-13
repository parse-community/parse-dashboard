import React from 'react';
import { withRouter } from 'lib/withRouter';
import Toolbar from 'components/Toolbar/Toolbar.react';
import DashboardView from 'dashboard/DashboardView.react';
import B4aLoaderContainer from 'components/B4aLoaderContainer/B4aLoaderContainer.react';
import FlowView from 'components/FlowView/FlowView.react';
import Field from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import Label from 'components/Label/Label.react';
import TextInputSettings from 'components/TextInputSettings/TextInputSettings.react';
import B4aToggle from 'components/Toggle/B4aToggle.react';
import EmailLabelSettings from 'dashboard/Notification/EmailLabelSettings.react';
import styles from './EmailSettings.scss';
import EmptyGhostState from 'components/EmptyGhostState/EmptyGhostState.react';
import joinWithFinal from 'lib/joinWithFinal';
import B4aModal from 'components/B4aModal/B4aModal.react';
import Button from 'components/Button/Button.react';
import validateEmailFormat from 'lib/validateEmailFormat';
import { amplitudeLogEvent } from 'lib/amplitudeEvents';
import { UpgradeGate } from 'lib/upgradeEvents';
import { UpgradeGateButton } from 'components/UpgradeCheckout/UpgradeCheckout.react';

const DEFAULT_VERIFICATION_BODY =
  'Hi,\n\n' +
  'You are being asked to confirm the email address *|email|* with *|appname|*\n\n' +
  'Click here to confirm it:\n' +
  '*|link|*';

const DEFAULT_FIELDS = {
  verificationEmailEnaled: false,
  preventLoginWithUnverifiedEmail: false,
  replyTo: 'no-reply@b4a.app',
  displayName: '',
  verificationEmailSubject: 'Please verify your email for *|appname|*',
  verificationEmailBody: DEFAULT_VERIFICATION_BODY,
};

const getLoadErrorMessage = (err, fallbackMessage) => {
  if (typeof err === 'string' && err.trim()) {
    return err;
  }

  const responseData = err?.response?.data;
  if (typeof responseData?.error === 'string' && responseData.error.trim()) {
    return responseData.error;
  }
  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }
  if (typeof err?.message === 'string' && err.message.trim()) {
    return err.message;
  }
  if (err?.response?.status === 404) {
    return 'Email settings endpoint not found (404).';
  }

  return fallbackMessage;
};

const formatChangeValue = value => {
  if (typeof value === 'boolean') {
    return value ? 'enabled' : 'disabled';
  }

  if (value === null || value === undefined || value === '') {
    return '(empty)';
  }

  const serialized =
    typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);
  const normalized = serialized.replace(/\s+/g, ' ').trim();
  return normalized.length > 60 ? `${normalized.slice(0, 57)}...` : normalized;
};

const renderChangedValuesFooter = (changes, fieldOptions) => {
  const entries = Object.keys(changes)
    .filter(key => fieldOptions[key])
    .map(key => (
      <span key={key}>
        <strong>{fieldOptions[key].friendlyName}</strong> to <strong>{formatChangeValue(changes[key])}</strong>
      </span>
    ));

  if (entries.length === 0) {
    return null;
  }

  return (
    <span>
      You've changed {joinWithFinal(null, entries, ', ', ' and ')}.
    </span>
  );
};

@withRouter
class EmailVerification extends DashboardView {
  constructor() {
    super();
    this.section = 'Notifications';
    this.subsection = 'Verification';
    this.state = {
      isLoading: true,
      initialFields: { ...DEFAULT_FIELDS },
      canEditAllProperties: false,
      canChangeEmailTemplate: false,
      hasPermission: true,
      emailVerified: false,
      isUserVerified: false,
      isResendingVerificationEmail: false,
      resendVerificationMessage: null,
      alertValidationCreditCard: false,
      errorMessage: null,
      allEmailSettings: null,
      isDirty: false,
      modal: null,
    };

    this.unblock = null;
    this.onBeforeUnload = null;
    this.flowViewRef = React.createRef();
  }

  componentDidMount() {
    this.loadEmailSettings();

    if (this.props.navigator && typeof this.props.navigator.block === 'function') {
      this.unblock = this.props.navigator.block(tx => {
        if (this.state.isDirty) {
          const unblock = this.unblock && this.unblock.bind(this);
          const autoUnblockingTx = {
            ...tx,
            retry() {
              if (unblock) {
                unblock();
              }
              tx.retry();
            },
          };

          const modal = (
            <B4aModal
              type={B4aModal.Types.DEFAULT}
              showCancel={false}
              width={380}
              icon="b4a-warn-fill-icon"
              iconSize={44}
              iconFill="#cccccc"
              title="Leave this page?"
              subtitle="Changes you made may not be saved."
              customFooter={
                <div style={{ textAlign: 'center' }}>
                  <Button
                    color="white"
                    width="auto"
                    additionalStyles={{ border: '1px solid #ccc', color: '#303338', marginRight: 12 }}
                    value="Cancel"
                    onClick={() => this.setState({ modal: null })}
                  />
                  <Button
                    primary={true}
                    color="blue"
                    width="auto"
                    value="Leave"
                    onClick={() => {
                      this.setState({ modal: null, isDirty: false });
                      autoUnblockingTx.retry();
                    }}
                  />
                </div>
              }
            />
          );
          this.setState({ modal });
        } else {
          if (this.unblock) {
            this.unblock();
          }
          tx.retry();
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const wasDirty = !!prevState?.isDirty;
    const isDirty = !!this.state.isDirty;

    if (!wasDirty && isDirty) {
      if (!this.onBeforeUnload) {
        this.onBeforeUnload = (e) => {
          e.preventDefault();
          e.returnValue = '';
          return '';
        };
      }
      window.addEventListener('beforeunload', this.onBeforeUnload);
    } else if (wasDirty && !isDirty) {
      window.removeEventListener('beforeunload', this.onBeforeUnload);
    }
  }

  componentWillUnmount() {
    if (this.unblock) {
      this.unblock();
    }
    window.removeEventListener('beforeunload', this.onBeforeUnload);
  }

  async loadEmailSettings() {
    try {
      const data = await this.context.getEmailSettings();
      const {
        emailSettings,
        preventLoginWithUnverifiedEmail,
        canChangeEmailTemplate,
        featuresPermission,
        isPaidPlan,
        userVerification = {},
      } = data;

      const emailVerified = !!userVerification.emailVerified;
      const isUserVerified = isPaidPlan || (
        emailVerified &&
        !!userVerification.cardValidation
      );
      const alertValidationCreditCard = !userVerification.cardValidation;
      const hasPermission = !featuresPermission || featuresPermission.verificationEmails === 'Write';
      const canEditAllProperties = !!(emailSettings && emailSettings.canEditAllProperties);

      const initialFields = {
        verificationEmailEnaled: emailSettings?.verificationEmailEnaled || false,
        preventLoginWithUnverifiedEmail: preventLoginWithUnverifiedEmail || false,
        replyTo: emailSettings?.replyTo || 'no-reply@b4a.app',
        displayName: emailSettings?.displayName || '',
        verificationEmailSubject: emailSettings?.verificationEmailSubject || DEFAULT_FIELDS.verificationEmailSubject,
        verificationEmailBody: emailSettings?.verificationEmailBody || DEFAULT_FIELDS.verificationEmailBody,
      };

      this.setState({
        isLoading: false,
        initialFields,
        canEditAllProperties,
        canChangeEmailTemplate: !!canChangeEmailTemplate,
        hasPermission,
        emailVerified,
        isUserVerified,
        alertValidationCreditCard,
        errorMessage: null,
        allEmailSettings: emailSettings,
      });
    } catch (err) {
      this.setState({
        isLoading: false,
        errorMessage: getLoadErrorMessage(err, 'Failed to load email settings'),
      });
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
          text: getLoadErrorMessage(err, 'Failed to resend verification email'),
        },
      });
    }
  }

  renderForm({ fields, setField }) {
    const {
      canChangeEmailTemplate,
      emailVerified,
      isUserVerified,
      hasPermission,
      alertValidationCreditCard,
      isResendingVerificationEmail,
      resendVerificationMessage,
    } = this.state;
    const canEditVerificationSettings = emailVerified && !alertValidationCreditCard && hasPermission;
    const canAccessTemplateSection = isUserVerified && hasPermission;
    const canEditTemplateFields = canAccessTemplateSection && canChangeEmailTemplate;
    const replyToTrimmed = (fields.replyTo || '').trim();
    const replyToInvalid =
      canEditTemplateFields &&
      (!replyToTrimmed || !validateEmailFormat(replyToTrimmed));
    const showTemplateUpgradeCta = canAccessTemplateSection && !canEditTemplateFields;
    const showVerificationAlert = !emailVerified;

    const trackSetField = (key, value) => {
      setField(key, value);
      if (!this.state.isDirty) {
        this.setState({ isDirty: true });
      }
    };
    const getInputValue = valueOrEvent => (
      valueOrEvent && valueOrEvent.target ? valueOrEvent.target.value : valueOrEvent
    );

    return (
      <div className={styles.emailSettingsWrapper}>
        {!hasPermission && (
          <div
            style={{ padding: '12px 16px', marginBottom: '24px', background: '#f8d7da', borderRadius: '6px', color: '#721c24' }}
          >
            You do not have permission to edit email verification settings.
          </div>
        )}

        <div className={styles.formWrapper}>
          <div className={styles.emailSettingsContainer}>
            {showVerificationAlert && (
              <div style={{ padding: '12px 16px', marginBottom: '16px', background: '#fff3cd', borderRadius: '6px', color: '#856404' }}>
                Please verify your account to manage email settings.{' '}
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

            {alertValidationCreditCard && (
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
                        href="https://checkout.back4app.io/subscription/Ecti8S7JZh"
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

            <div style={!canEditVerificationSettings ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
              <Fieldset
                legend=" "
                description="Turn verification emails on and optionally block login until the user verifies."
              >
                <Field
                  label={
                    <EmailLabelSettings
                      text="Enable Verification"
                      description="Send verification emails to new users."
                      helpText="When enabled, Parse sends a verification email so users can confirm their address before using the app."
                    />
                  }
                  input={
                    <div className={styles.emailSwitchField}>
                      <B4aToggle
                        additionalStyles={{ margin: '6px 0px' }}
                        value={fields.verificationEmailEnaled}
                        onChange={value =>
                          canEditVerificationSettings && trackSetField('verificationEmailEnaled', value)
                        }
                        disabled={!canEditVerificationSettings}
                      />
                    </div>
                  }
                  textAlign="right"
                  theme={Field.Theme.BLUE}
                />
                <Field
                  label={
                    <EmailLabelSettings
                      text="Prevent login with unverified email"
                      description="Block login until email is verified."
                      helpText="Requires users to verify their email before they can log in. Only applies when verification emails are enabled."
                    />
                  }
                  input={
                    <div className={styles.emailSwitchField}>
                      <B4aToggle
                        additionalStyles={{ margin: '6px 0px' }}
                        value={fields.verificationEmailEnaled ? fields.preventLoginWithUnverifiedEmail : false}
                        onChange={value =>
                          canEditVerificationSettings && trackSetField('preventLoginWithUnverifiedEmail', value)
                        }
                        disabled={!canEditVerificationSettings || !fields.verificationEmailEnaled}
                      />
                    </div>
                  }
                  textAlign="right"
                  theme={Field.Theme.BLUE}
                />
              </Fieldset>
            </div>

            <hr className={styles.fieldHr} />

            <div style={!canAccessTemplateSection ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
              <div className={styles.heading}>Email templates and sender</div>
              <div className={styles.subheading}>
                Customize reply-to, display name, and verification email content. Requires a plan that includes
                customizable email templates.
              </div>

              {showTemplateUpgradeCta && (
                <Fieldset>
                  <Field
                    label={
                      <Label
                        text="Upgrade your plan"
                        dark={true}
                        description="Please upgrade your plan to customize email templates and sender details."
                      />
                    }
                    input={
                      <div style={{ width: '100%', padding: '0 1rem', textAlign: 'right' }}>
                        <UpgradeGateButton gate={UpgradeGate.EMAIL_TEMPLATES} logView />
                      </div>
                    }
                    theme={Field.Theme.BLUE}
                  />
                </Fieldset>
              )}

              <div style={!canEditTemplateFields ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                <Fieldset
                  legend="Templates and sender"
                  description="Reply-to, display name, and verification email subject and body."
                >
                  <Field
                    label={
                      <EmailLabelSettings
                        text="Reply to Address"
                        description="Reply-to for verification emails."
                        helpText="Address used when recipients reply to verification messages. Must be a valid sender your mail provider allows."
                      />
                    }
                    input={
                      <div className={`${styles.emailTextField} ${styles.emailTextFieldRight}`}>
                        <TextInputSettings
                          placeholder="no-reply@b4a.app"
                          value={fields.replyTo ?? ''}
                          onChange={valueOrEvent =>
                            canEditTemplateFields && trackSetField('replyTo', getInputValue(valueOrEvent))
                          }
                          disabled={!canEditTemplateFields}
                          error={replyToInvalid}
                        />
                      </div>
                    }
                    textAlign="right"
                    theme={Field.Theme.BLUE}
                  />
                  <Field
                    label={
                      <EmailLabelSettings
                        text="Display Name"
                        description="Sender name in verification emails."
                        helpText="The name shown as the sender of verification emails (for example your app name)."
                      />
                    }
                    input={
                      <div className={`${styles.emailTextField} ${styles.emailTextFieldRight}`}>
                        <TextInputSettings
                          placeholder="Enter display name"
                          value={fields.displayName ?? ''}
                          onChange={valueOrEvent =>
                            canEditTemplateFields && trackSetField('displayName', getInputValue(valueOrEvent))
                          }
                          disabled={!canEditTemplateFields}
                        />
                      </div>
                    }
                    textAlign="right"
                    theme={Field.Theme.BLUE}
                  />
                  <Field
                    label={
                      <EmailLabelSettings
                        text="Verification Email Subject"
                        description="Subject line for the verification email."
                        helpText="Subject users see in their inbox. You can use placeholders such as *|appname|* where supported."
                      />
                    }
                    input={
                      <div className={`${styles.emailTextField} ${styles.emailTextFieldRight}`}>
                        <TextInputSettings
                          placeholder="Please verify your email for *|appname|*"
                          value={fields.verificationEmailSubject ?? ''}
                          onChange={valueOrEvent =>
                            canEditTemplateFields && trackSetField('verificationEmailSubject', getInputValue(valueOrEvent))
                          }
                          disabled={!canEditTemplateFields}
                        />
                      </div>
                    }
                    textAlign="right"
                    theme={Field.Theme.BLUE}
                  />
                  <Field
                    label={
                      <EmailLabelSettings
                        text="Verification Email Body"
                        description="Body of the verification email."
                        helpText="Email body shown to users. Must include the *|link|* placeholder so users can complete verification."
                      />
                    }
                    input={
                      <div className={styles.emailTextField}>
                        <TextInputSettings
                          multiline={true}
                          rows={8}
                          placeholder="Enter verification email body"
                          value={fields.verificationEmailBody ?? ''}
                          onChange={valueOrEvent =>
                            canEditTemplateFields && trackSetField('verificationEmailBody', getInputValue(valueOrEvent))
                          }
                          disabled={!canEditTemplateFields}
                        />
                      </div>
                    }
                    textAlign="right"
                    theme={Field.Theme.BLUE}
                  />
                </Fieldset>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderContent() {
    const toolbar = (
      <Toolbar section="Notifications" subsection="Email Verification" />
    );
    const { isLoading, initialFields, errorMessage, hasPermission, emailVerified, isUserVerified, canChangeEmailTemplate } = this.state;

    const fieldsOptions = {
      verificationEmailEnaled: { friendlyName: 'enable verification emails', showTo: true },
      preventLoginWithUnverifiedEmail: { friendlyName: 'prevent login with unverified email', showTo: true },
      replyTo: { friendlyName: 'reply to address' },
      displayName: { friendlyName: 'display name' },
      verificationEmailSubject: { friendlyName: 'verification email subject' },
      verificationEmailBody: { friendlyName: 'verification email body' },
    };

    let content = null;
    if (errorMessage) {
      content = (
        <div style={{ paddingTop: '3rem' }}>
          <EmptyGhostState
            title="Error loading email verification settings"
            description={errorMessage}
            cta="Retry"
            action={() => {
              this.setState({ isLoading: true, errorMessage: null });
              this.loadEmailSettings();
            }}
          />
        </div>
      );
    } else if (!isLoading) {
      const validateForm = ({ fields }) => {
        const canEditTemplateFields =
          hasPermission && isUserVerified && canChangeEmailTemplate;
        if (canEditTemplateFields) {
          const replyTo = (fields.replyTo || '').trim();
          if (!replyTo) {
            return 'Reply to address is required.';
          }
          if (!validateEmailFormat(replyTo)) {
            return 'Please enter a valid reply-to email address.';
          }
          const verificationEmailBody = fields.verificationEmailBody || '';
          if (verificationEmailBody && !verificationEmailBody.includes('*|link|*')) {
            return 'Verification email body must include *|link|* placeholder.';
          }
        }
        return '';
      };

      content = (
        <div className={styles.mainContent}>
          <FlowView
            ref={this.flowViewRef}
            initialFields={initialFields}
            onSubmit={({ fields }) => {
              const { allEmailSettings } = this.state;
              const emailSettings = {
                replyTo: fields.replyTo,
                displayName: fields.displayName,
                verificationEmailEnaled: fields.verificationEmailEnaled,
                verificationEmailSubject: fields.verificationEmailSubject,
                verificationEmailBody: fields.verificationEmailBody,
                passwordResetEmailSubject: allEmailSettings?.passwordResetEmailSubject,
                passwordResetEmailBody: allEmailSettings?.passwordResetEmailBody,
              };
              const preventLoginWithUnverifiedEmail = fields.verificationEmailEnaled
                ? fields.preventLoginWithUnverifiedEmail
                : false;
              return this.context.updateEmailSettings(emailSettings, preventLoginWithUnverifiedEmail);
            }}
            afterSave={({ fields, resetFields }) => {
              amplitudeLogEvent('Verification email configured');
              this.setState({
                initialFields: { ...fields },
                isDirty: false,
                allEmailSettings: {
                  ...this.state.allEmailSettings,
                  replyTo: fields.replyTo,
                  displayName: fields.displayName,
                  verificationEmailEnaled: fields.verificationEmailEnaled,
                  verificationEmailSubject: fields.verificationEmailSubject,
                  verificationEmailBody: fields.verificationEmailBody,
                },
              });
              setTimeout(() => resetFields(), 1200);
            }}
            secondaryButton={() => (
              <Button
                onClick={() => {
                  this.setState({ isDirty: false });
                  if (this.flowViewRef.current) {
                    this.flowViewRef.current.resetFields();
                  }
                }}
                color="white"
                dark={true}
                value="Cancel"
              />
            )}
            footerContents={({ changes }) => {
              if (!hasPermission || !emailVerified) {
                return null;
              }
              return renderChangedValuesFooter(changes, fieldsOptions);
            }}
            validate={validateForm}
            renderForm={this.renderForm.bind(this)}
          />
        </div>
      );
    }

    return (
      <div>
        <B4aLoaderContainer loading={isLoading}>
          <div className={styles.content}>{content}</div>
        </B4aLoaderContainer>
        {toolbar}
        {this.state.modal}
      </div>
    );
  }
}

export default EmailVerification;
