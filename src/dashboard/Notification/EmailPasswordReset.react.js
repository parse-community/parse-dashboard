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
import EmailLabelSettings from 'dashboard/Notification/EmailLabelSettings.react';
import styles from './EmailSettings.scss';
import EmptyGhostState from 'components/EmptyGhostState/EmptyGhostState.react';
import joinWithFinal from 'lib/joinWithFinal';
import B4aModal from 'components/B4aModal/B4aModal.react';
import Button from 'components/Button/Button.react';
import { UpgradeGate } from 'lib/upgradeEvents';
import { UpgradeGateButton } from 'components/UpgradeCheckout/UpgradeCheckout.react';

const DEFAULT_FIELDS = {
  passwordResetEmailSubject: 'Password Reset Request for *|appname|*',
  passwordResetEmailBody:
    'Hi,\n\n' +
    'You requested a password reset for *|appname|*.\n\n' +
    'Click here to reset it:\n' +
    '*|link|*',
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
class EmailPasswordReset extends DashboardView {
  constructor() {
    super();
    this.section = 'Notifications';
    this.subsection = 'Password Reset';
    this.state = {
      isLoading: true,
      initialFields: { ...DEFAULT_FIELDS },
      canEditAllProperties: false,
      canChangeEmailTemplate: false,
      hasPermission: true,
      isUserVerified: false,
      errorMessage: null,
      allEmailSettings: null,
      preventLoginWithUnverifiedEmail: false,
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
      const { emailSettings, preventLoginWithUnverifiedEmail, canChangeEmailTemplate, featuresPermission, isPaidPlan, userVerification } = data;

      const isUserVerified = isPaidPlan || (
        userVerification.emailVerified &&
        userVerification.cardValidation
      );
      const hasPermission = !featuresPermission || featuresPermission.verificationEmails === 'Write';
      const canEditAllProperties = !!(emailSettings && emailSettings.canEditAllProperties);

      const initialFields = {
        passwordResetEmailSubject: emailSettings?.passwordResetEmailSubject || DEFAULT_FIELDS.passwordResetEmailSubject,
        passwordResetEmailBody: emailSettings?.passwordResetEmailBody || DEFAULT_FIELDS.passwordResetEmailBody,
      };

      this.setState({
        isLoading: false,
        initialFields,
        canEditAllProperties,
        canChangeEmailTemplate: !!canChangeEmailTemplate,
        hasPermission,
        isUserVerified,
        errorMessage: null,
        allEmailSettings: emailSettings,
        preventLoginWithUnverifiedEmail: preventLoginWithUnverifiedEmail || false,
      });
    } catch (err) {
      this.setState({
        isLoading: false,
        errorMessage: getLoadErrorMessage(err, 'Failed to load email settings'),
      });
    }
  }

  renderForm({ fields, setField }) {
    const { canChangeEmailTemplate, isUserVerified, hasPermission } = this.state;
    const canEditFields = isUserVerified && hasPermission && canChangeEmailTemplate;
    const showTemplateUpgradeCta = isUserVerified && hasPermission && !canEditFields;

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
        {!isUserVerified && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', background: '#fff3cd', borderRadius: '6px', color: '#856404' }}>
            Please verify your account to manage email settings.
          </div>
        )}

        {!hasPermission && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', background: '#f8d7da', borderRadius: '6px', color: '#721c24' }}>
            You do not have permission to edit email settings.
          </div>
        )}

        <Fieldset
          legend="Password Reset Email"
          description="Configure the subject and body of the password reset email."
        >
          {showTemplateUpgradeCta && (
            <Field
              label={
                <Label
                  text="Upgrade your plan"
                  dark={true}
                  description="Please upgrade your plan to customize email templates."
                />
              }
              input={
                <div style={{ width: '100%', padding: '0 1rem', textAlign: 'right' }}>
                  <UpgradeGateButton gate={UpgradeGate.EMAIL_TEMPLATES} logView />
                </div>
              }
              theme={Field.Theme.BLUE}
            />
          )}
          <div style={!canEditFields ? { opacity: 0.7 } : undefined}>
            <Field
              label={
                <EmailLabelSettings
                  text="Email Subject"
                  description="Subject line for the password reset email."
                  helpText="Subject shown in the user's inbox. You can use *|appname|* and other supported placeholders."
                />
              }
              input={
                <div className={`${styles.emailTextField} ${styles.emailTextFieldRight}`}>
                  <TextInputSettings
                    placeholder="Password Reset Request for *|appname|*"
                    value={fields.passwordResetEmailSubject ?? ''}
                    onChange={valueOrEvent => trackSetField('passwordResetEmailSubject', getInputValue(valueOrEvent))}
                    disabled={!canEditFields}
                  />
                </div>
              }
              textAlign="right"
              theme={Field.Theme.BLUE}
            />
          </div>
          <div style={!canEditFields ? { opacity: 0.7 } : undefined}>
            <Field
              label={
                <EmailLabelSettings
                  text="Email Body"
                  description="Body of the password reset email."
                  helpText="Email body must include the *|link|* placeholder so users can open the reset link."
                />
              }
              input={
                <div className={styles.emailTextField}>
                  <TextInputSettings
                    multiline={true}
                    rows={8}
                    placeholder="Enter password reset email body"
                    value={fields.passwordResetEmailBody ?? ''}
                    onChange={valueOrEvent => trackSetField('passwordResetEmailBody', getInputValue(valueOrEvent))}
                    disabled={!canEditFields}
                  />
                </div>
              }
              textAlign="right"
              theme={Field.Theme.BLUE}
            />
          </div>
        </Fieldset>
      </div>
    );
  }

  renderContent() {
    const toolbar = (
      <Toolbar section="Notifications" subsection="Reset Password Email" />
    );
    const { isLoading, initialFields, errorMessage, hasPermission, isUserVerified } = this.state;

    const fieldsOptions = {
      passwordResetEmailSubject: { friendlyName: 'password reset email subject' },
      passwordResetEmailBody: { friendlyName: 'password reset email body' },
    };

    let content = null;
    if (errorMessage) {
      content = (
        <div style={{ paddingTop: '3rem' }}>
          <EmptyGhostState
            title="Error loading password reset email settings"
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
        const passwordResetEmailBody = fields.passwordResetEmailBody || '';
        if (passwordResetEmailBody && !passwordResetEmailBody.includes('*|link|*')) {
          return 'Password reset email body must include *|link|* placeholder.';
        }
        return '';
      };

      content = (
        <div className={styles.mainContent}>
          <FlowView
            ref={this.flowViewRef}
            initialFields={initialFields}
            onSubmit={({ fields }) => {
              const { allEmailSettings, preventLoginWithUnverifiedEmail } = this.state;
              const emailSettings = {
                replyTo: allEmailSettings?.replyTo,
                displayName: allEmailSettings?.displayName,
                verificationEmailEnaled: allEmailSettings?.verificationEmailEnaled,
                verificationEmailSubject: allEmailSettings?.verificationEmailSubject,
                verificationEmailBody: allEmailSettings?.verificationEmailBody,
                passwordResetEmailSubject: fields.passwordResetEmailSubject,
                passwordResetEmailBody: fields.passwordResetEmailBody,
              };
              return this.context.updateEmailSettings(emailSettings, preventLoginWithUnverifiedEmail);
            }}
            afterSave={({ fields, resetFields }) => {
              this.setState({
                initialFields: { ...fields },
                isDirty: false,
                allEmailSettings: {
                  ...this.state.allEmailSettings,
                  passwordResetEmailSubject: fields.passwordResetEmailSubject,
                  passwordResetEmailBody: fields.passwordResetEmailBody,
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
              if (!hasPermission || !isUserVerified) {
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

export default EmailPasswordReset;
