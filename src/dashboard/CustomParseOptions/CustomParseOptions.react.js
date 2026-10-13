/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* eslint-disable indent, react/jsx-indent */
import React from 'react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import { withRouter } from 'lib/withRouter';
import DashboardView from 'dashboard/DashboardView.react';
import B4aLoaderContainer from 'components/B4aLoaderContainer/B4aLoaderContainer.react';
import FlowView from 'components/FlowView/FlowView.react';
import styles from './CustomParseOptions.scss';
import EmptyGhostState from 'components/EmptyGhostState/EmptyGhostState.react';
import B4aToggle from 'components/Toggle/B4aToggle.react';

import Label from 'components/Label/Label.react';
import Field from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import FieldSettings from 'components/FieldSettings/FieldSettings.react';
import BaseLabelSettings from 'components/LabelSettings/LabelSettings.react';
import NumericInputSettings from 'components/NumericInputSettings/NumericInputSettings.react';
import TextInputSettings from 'components/TextInputSettings/TextInputSettings.react';
import Button from 'components/Button/Button.react';
import B4aTooltip from 'components/Tooltip/B4aTooltip.react';
import Icon from 'components/Icon/Icon.react';
import B4aModal from 'components/B4aModal/B4aModal.react';
import B4aCodeEditor from 'components/CodeEditor/B4aCodeEditor.react';
import { UpgradeGate } from 'lib/upgradeEvents';
import { UpgradeGateButton } from 'components/UpgradeCheckout/UpgradeCheckout.react';

import deepmerge from 'deepmerge';
import renderFlowFooterChanges from 'lib/renderFlowFooterChanges';
import CustomParseOptionsValidations from './CustomParseOptionsValidations';
import getError from 'dashboard/Settings/Util/getError';
import semver from 'semver';

const CUSTOM_PAGES_KEYS = [
  'choosePassword',
  'verifyEmailSuccess',
  'parseFrameURL',
  'passwordResetSuccess',
  'invalidLink',
  'invalidVerificationLink',
  'linkSendSuccess',
  'linkSendFail',
];

// Recursively sort object keys so the JSON editor shows properties in a
// deterministic, alphabetical order whenever we rebuild the text ourselves
// (modal open, reset, etc.). User-driven edits bypass this, preserving caret
// position while they're typing.
const sortKeysDeep = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeysDeep(value[key]);
    }
    return sorted;
  }
  return value;
};

const stringifyAlpha = (value) => JSON.stringify(sortKeysDeep(value), null, 2);

const getActualChanges = (changes, initial) => {
  const result = {};
  for (const key of Object.keys(changes)) {
    const val = changes[key];
    const ref = initial ? initial[key] : undefined;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const nested = getActualChanges(val, ref || {});
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    } else if (val !== ref) {
      result[key] = val;
    }
  }
  return result;
};

const transformCustomOptionsForPayload = (customOptionsInput) => {
  if (!customOptionsInput) {
    return undefined;
  }
  const payload = JSON.parse(JSON.stringify(customOptionsInput));
  delete payload.databaseURI;
  if (payload.maxUploadSize != null && payload.maxUploadSize !== '') {
    payload.maxUploadSize = `${payload.maxUploadSize}mb`;
  }
  const customPages = { ...(payload.customPages || {}) };
  CUSTOM_PAGES_KEYS.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      customPages[key] = payload[key] === '' ? undefined : payload[key];
      delete payload[key];
    }
  });
  if (Object.keys(customPages).length > 0) {
    payload.customPages = customPages;
  }
  for (const key of Object.keys(payload)) {
    if (typeof payload[key] === 'string' && payload[key].trim() === '') {
      payload[key] = undefined;
    }
  }
  return payload;
};

const buildSaveParseOptionsPayload = (fields, initialFields) => {
  const changes = getActualChanges(fields, initialFields);
  return {
    customOptions: transformCustomOptionsForPayload(changes.customOptions),
    clientPush: Object.prototype.hasOwnProperty.call(changes, 'clientPush')
      ? changes.clientPush
      : undefined,
    clientClassCreation: Object.prototype.hasOwnProperty.call(changes, 'clientClassCreation')
      ? changes.clientClassCreation
      : undefined,
  };
};

// Keys that live alongside `customOptions` at the top of the saveParseOptionsAndSettings
// payload. Everything else in the flat JSON editor gets grouped under `customOptions`.
const TOP_LEVEL_PAYLOAD_KEYS = ['clientPush', 'clientClassCreation'];

// Builds the flat shape shown in the JSON editor: all customOptions keys are
// merged into the root next to clientPush/clientClassCreation so the user
// doesn't need to know which keys belong under `customOptions`.
// The `?? default` guards ensure these two always render (JSON.stringify
// drops properties whose value is `undefined`).
const buildFlatEditorPayload = (fields) => {
  const transformed = transformCustomOptionsForPayload(fields.customOptions) || {};
  return {
    ...transformed,
    clientPush: fields.clientPush ?? false,
    clientClassCreation: fields.clientClassCreation ?? true,
  };
};

// Inverse of `buildFlatEditorPayload` — groups every non top-level key back
// under `customOptions` so we can send the correct saveParseOptionsAndSettings
// shape.
const unflattenEditorPayload = (flatParsed) => {
  const result = {
    customOptions: {},
    clientPush: undefined,
    clientClassCreation: undefined,
  };
  if (!flatParsed || typeof flatParsed !== 'object' || Array.isArray(flatParsed)) {
    return result;
  }
  for (const key of Object.keys(flatParsed)) {
    if (TOP_LEVEL_PAYLOAD_KEYS.indexOf(key) !== -1) {
      result[key] = flatParsed[key];
    } else {
      result.customOptions[key] = flatParsed[key];
    }
  }
  return result;
};

// Reverse of `transformCustomOptionsForPayload` so JSON edits from the modal
// can be mapped back onto the form fields (which use raw shapes like a numeric
// maxUploadSize and flat custom-page keys).
const reverseTransformCustomOptions = (payloadCustomOptions) => {
  if (!payloadCustomOptions || typeof payloadCustomOptions !== 'object') {
    return {};
  }
  const result = JSON.parse(JSON.stringify(payloadCustomOptions));

  if (typeof result.maxUploadSize === 'string') {
    const parsed = parseInt(result.maxUploadSize, 10);
    if (!Number.isNaN(parsed)) {
      result.maxUploadSize = parsed;
    }
  }

  if (result.customPages && typeof result.customPages === 'object') {
    CUSTOM_PAGES_KEYS.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(result.customPages, key)) {
        result[key] = result.customPages[key];
      }
    });
    delete result.customPages;
  }

  return result;
};

const LabelInfoTooltip = ({ description, children }) => {
  const [visible, setVisible] = React.useState(false);
  const [placement, setPlacement] = React.useState('top');

  if (!description) {
    return children;
  }

  const showTooltip = event => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPlacement(rect.top < 140 ? 'bottom' : 'top');
    setVisible(true);
  };

  return (
    <span
      onMouseEnter={showTooltip}
      onMouseLeave={() => setVisible(false)}
      onFocus={showTooltip}
      onBlur={() => setVisible(false)}
    >
      <B4aTooltip
        value={<div style={{ minWidth: '320px', maxWidth: '360px', whiteSpace: 'normal', textAlign: 'center' }}>{description}</div>}
        visible={visible}
        placement={placement}
        theme='dark'
        arrowAlign='right'
        horizontalOffset={12}
      >
        {children}
      </B4aTooltip>
    </span>
  );
};

const LabelSettings = ({ description, helpText, help, ...props }) => {
  const tooltipText = helpText || description;

  return (
    <BaseLabelSettings
      {...props}
      description={description}
      help={help || (
        tooltipText ? (
          <LabelInfoTooltip description={tooltipText}>
            <span className={styles.infoHelp}>
              <Icon
                className={styles.infoIcon}
                name='info-outline'
                width={14}
                height={14}
                fill='#95B8DA'
              />
            </span>
          </LabelInfoTooltip>
        ) : null
      )}
    />
  );
};

@withRouter
class CustomParseOptions extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Advanced Options';
    this.state = {
      isLoading: true,
      initialFields: {
        customOptions: {},
        clientPush: false,
        clientClassCreation: true,
      },
      loadingError: null,
      canChangeCustomParseOptions: false,
      hasOtherConfigsPermission: true,
      isOwner: false,
      showPayloadModal: false,
      copyStatus: '',
      payloadJson: '',
      isSavingPayload: false,
      payloadSaveError: '',
    };
    this.onRefresh = this.onRefresh.bind(this);
  }

  componentWillMount() {
    this.loadData();
  }

  getVersionSupport() {
    const parseVersion = (
      this.context &&
      this.context.settings &&
      this.context.settings.fields &&
      this.context.settings.fields.fields &&
      this.context.settings.fields.fields.parseVersion
    ) || (this.context && this.context.serverInfo && this.context.serverInfo.parseServerVersion) || '';

    const parsed = semver.coerce(parseVersion);
    const normalized = parsed ? parsed.version : null;
    const atLeast = (version) => normalized ? semver.gte(normalized, version) : false;

    // Support matrix based only on provided back4app parse-server Config.js versions:
    // 7.5.2, 6.2.0, 5.2.3, 4.10.4, 3.10.0, 2.8.4.1
    return {
      preserveFileName: true,
      passwordPolicy: true,
      accountLockout: true,
      customPages: true,
      sessionLength: true,
      emailVerifyTokenValidityDuration: true,
      expireInactiveSessions: true,
      enforcePrivateUsers: atLeast('5.2.3'),
      // allowClientClassCreation: atLeast('7.5.2'),
      enableAnonymousUsers: true,
      enableSingleSchemaCache: true,
      allowCustomObjectId: true,
      objectIdSize: true,
    };
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
      const customPagesKeys = [
        'choosePassword',
        'verifyEmailSuccess',
        'parseFrameURL',
        'passwordResetSuccess',
        'invalidLink',
        'invalidVerificationLink',
        'linkSendSuccess',
        'linkSendFail',
      ];
      const response = await this.context.getParseOptions();
      const { permissions = {} } = response;
      const featuresPermission = response.featuresPermission || null;
      const otherConfigs = response.otherConfigs || {};
      const parseOptions = response.parseOptions || {};
      const isOwner = this.context && this.context.custom && this.context.custom.isOwner === true;
      const hasOtherConfigsPermission = isOwner || !featuresPermission || featuresPermission.otherConfigs === 'Write';

      // parseOptions is the source of truth for all overlapping keys.
      // Use deep merge so nested objects are merged too, with parseOptions taking precedence.
      const mergedOptions = deepmerge(
        JSON.parse(JSON.stringify(otherConfigs)),
        JSON.parse(JSON.stringify(parseOptions))
      );

      // Parse maxUploadSize for UI: strip 'mb' suffix if present.
      const rawMaxUploadSize = mergedOptions.maxUploadSize;
      const parsedMaxUploadSize = typeof rawMaxUploadSize === 'string'
        ? parseInt(rawMaxUploadSize, 10)
        : rawMaxUploadSize;

      const customOptions = {
        ...mergedOptions,
        ...(parsedMaxUploadSize != null && !isNaN(parsedMaxUploadSize) ? { maxUploadSize: parsedMaxUploadSize } : {}),
      };
      const customPages = customOptions.customPages || {};
      customPagesKeys.forEach(key => {
        if ((customOptions[key] === undefined || customOptions[key] === null) && customPages[key] != null) {
          customOptions[key] = customPages[key];
        }
      });

      this.setState({
        canChangeCustomParseOptions: permissions.canChangeCustomParseOptions !== false,
        hasOtherConfigsPermission,
        isOwner,
        initialFields: {
          customOptions,
          clientPush: response.clientPush ?? false,
          clientClassCreation: response.clientClassCreation ?? true,
        },
      });
    } catch (error) {
      this.setState({ loadingError: error });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  renderToolbar() {
    return (
      <Toolbar section="App Settings" subsection="Advanced Options">
      </Toolbar>
    );
  }

  renderParseOptionsForm({ fields, setField, setFieldJson, resetFields, errors }) {
    const customOptions = fields.customOptions || {};
    const clientPush = fields.clientPush === true;
    const clientClassCreation = fields.clientClassCreation;
    const passwordPolicy = customOptions?.passwordPolicy || {};
    const accountLockout = customOptions?.accountLockout || {};
    const versionSupport = this.getVersionSupport();

    const parseIntegerValue = (value) => {
      if (value === '' || value === null || value === undefined) {
        return '';
      }
      const parsed = parseInt(value, 10);
      if (Number.isNaN(parsed)) {
        return '';
      }
      return parsed;
    };
    const setNestedCustomOption = (parentKey, key, value) =>
      setFieldJson('customOptions', {
        [parentKey]: {
          [key]: value,
        },
      });
    const setCustomOption = (key, value) =>
      setFieldJson('customOptions', { [key]: value });

    const isOwner = this.state.isOwner;

    return (
      <>
      <div className={styles.formWrapper}>
        <div className={styles.domainSettingsContainer}>
          <div className={styles.heading}>Parse Server Options</div>
          <div className={styles.subheading}>
            Configure advanced settings of your Parse Server instance, including server behavior, authentication, and security rules.
            Check available option in {' '}
            <a
              target="_blank"
              href="https://www.back4app.com/docs/platform/custom-parse-options"
              rel='noopener noreferrer'
              className={styles.docsLink}
            >
              Documentation
            </a>.
            </div>
          <div className={styles.warning}><strong>Warning:</strong> Changes apply immediately and may affect your app’s availability or client connections.</div>

          {!this.state.canChangeCustomParseOptions && (
            <Fieldset>
              <Field
                label={
                  <Label
                    text='Upgrade your plan'
                    description='Please upgrade your plan to change custom parse options.'
                    dark={true}
                  />
                }
                input={
                  <div style={{ width: '100%', padding: '0 1rem', textAlign: 'right' }}>
                    <UpgradeGateButton gate={UpgradeGate.PARSE_OPTIONS} logView />
                  </div>
                }
                theme={Field.Theme.BLUE}
              />
            </Fieldset>
          )}

          <div style={!isOwner || !this.state.canChangeCustomParseOptions ? { pointerEvents: 'none', opacity: 0.6 } : {}}>

          <Fieldset
            legend='Core Configuration'
            description='Core Parse Server endpoints and database connection.'
          >
            <Field
              label={
                <Label
                  text='Core Configuration'
                  description='Manage server URL and database URI settings'
                  dark={true}
                />
              }
              input={
                <div style={{ flex: 1 }}>
                  <FieldSettings
                    containerStyles={{ borderTop: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.publicServerURL')}
                    label={
                      <LabelSettings
                        text='Public ServerURL'
                        description='URL accessible by the Parse JavaScript SDK'
                        helpText='Public URL of your Parse Server (include http:// or https://). Client SDKs use this endpoint for API calls and user flows like password reset and email verification.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='https://api.example.com/parse'
                        value={customOptions?.publicServerURL ?? ''}
                        error={getError(errors, 'customOptions.publicServerURL')}
                        onChange={({ target: { value } }) =>
                          setCustomOption('publicServerURL', value)
                        }
                      />
                    }
                  />
                </div>
              }
              theme={Field.Theme.BLUE}
            />
          </Fieldset>

          <hr className={styles.fieldHr} />

          <Fieldset
            legend='Server Settings'
            description='Configure server-level settings for file uploads.'
          >
            <Field
              label={
                <Label
                  text='Server Settings'
                  description='Manage server settings for file handling'
                  dark={true}
                />
              }
              input={
                <div style={{ flex: 1 }}>
                  {/* <FieldSettings
                    containerStyles={{ borderTop: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.maxUploadSize')}
                    label={
                      <LabelSettings
                        text='maxUploadSize'
                        description='Maximum file upload size in MB (0-100)'
                      />
                    }
                    input={
                      <NumericInputSettings
                        min={20}
                        max={100}
                        value={customOptions?.maxUploadSize ?? ''}
                        error={getError(errors, 'customOptions.maxUploadSize')}
                        onChange={value =>
                          setCustomOption('maxUploadSize', parseIntegerValue(value))
                        }
                      />
                    }
                  /> */}
                  <FieldSettings
                    containerStyles={{ borderTop: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Push Notification from Client'
                        description='For security reasons, we recommend to disable this option.'
                        helpText='Allows clients to trigger push operations directly. Keep disabled in production to reduce abuse risk and keep push logic on trusted server-side code.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={clientPush}
                        onChange={value =>
                          setField('clientPush', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Client Class Creation'
                        description='For security reasons, we recommend to disable this option.'
                        helpText='Maps to allowClientClassCreation. If enabled, clients can create classes dynamically. Parse Server default is false; keeping it off helps prevent unwanted schema changes.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={clientClassCreation}
                        onChange={value =>
                          setField('clientClassCreation', value)
                        }
                      />
                    }
                  />
                  {versionSupport.preserveFileName && <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Preserve File Name'
                        description='Preserve file names when uploading files'
                        helpText='When enabled, Parse Server preserves the original filename instead of always adding a generated hash suffix. Enable this only if your file naming strategy avoids collisions and does not expose sensitive naming patterns.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={customOptions?.preserveFileName}
                        onChange={value =>
                          setCustomOption('preserveFileName', value)
                        }
                      />
                    }
                  />}
                  {/* {versionSupport.allowClientClassCreation && <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Allow Client Class Creation'
                        description='Allow clients to create new classes'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={customOptions?.allowClientClassCreation}
                        onChange={value =>
                          setCustomOption('allowClientClassCreation', value)
                        }
                      />
                    }
                  />} */}
                  {versionSupport.enableSingleSchemaCache && <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Enable Single Schema Cache'
                        description='Use a single schema cache for all requests'
                        helpText='Uses one shared schema cache for requests to reduce repeated schema lookups. This can improve performance on stable schemas, but confirm behavior in your environment before enabling broadly.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={customOptions?.enableSingleSchemaCache}
                        onChange={value =>
                          setCustomOption('enableSingleSchemaCache', value)
                        }
                      />
                    }
                  />}
                  {versionSupport.allowCustomObjectId && <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Allow Custom ObjectId'
                        description='Allow custom objectId values on create'
                        helpText='Maps to allowCustomObjectId. When enabled, create requests may provide their own objectId instead of using server-generated IDs. Use carefully to avoid collisions and preserve predictable data integrity.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={customOptions?.allowCustomObjectId}
                        onChange={value =>
                          setCustomOption('allowCustomObjectId', value)
                        }
                      />
                    }
                  />}
                  {versionSupport.objectIdSize && <FieldSettings
                    containerStyles={{ borderBottom: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.objectIdSize')}
                    label={
                      <LabelSettings
                        text='ObjectId Size'
                        description='Length of generated objectId values'
                        helpText='Maps to objectIdSize. Defines how many characters Parse Server uses when generating objectIds. The documented default is 10 characters.'
                      />
                    }
                    input={
                      <NumericInputSettings
                        min={1}
                        value={customOptions?.objectIdSize ?? ''}
                        error={getError(errors, 'customOptions.objectIdSize')}
                        onChange={value =>
                          setCustomOption('objectIdSize', parseIntegerValue(value))
                        }
                      />
                    }
                  />}
                </div>
              }
              theme={Field.Theme.BLUE}
            />
          </Fieldset>

          <hr className={styles.fieldHr} />

          {versionSupport.passwordPolicy && <Fieldset
            legend='Password Policy'
            description='Manage password policies for this app.'
          >
            <Field
              label={
                <Label
                  text='Password policy'
                  description='Manage password policies for this app'
                  dark={true}
                />
              }
              input={
                <div style={{ flex: 1 }}>
                  <FieldSettings
                    containerStyles={{ borderTop: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.passwordPolicy.resetTokenValidityDuration')}
                    label={
                      <LabelSettings
                        text='Reset Token Validity Duration'
                        description='Set the validity duration of the password reset token in seconds after which the token expires.'
                        helpText='Part of passwordPolicy. Sets password reset token lifetime in seconds. After this period, the reset link becomes invalid and users must request a new one.'
                      />
                    }
                    input={
                      <NumericInputSettings
                        placeholder={0}
                        min={0}
                        value={passwordPolicy?.resetTokenValidityDuration ?? ''}
                        error={getError(errors, 'customOptions.passwordPolicy.resetTokenValidityDuration')}
                        onChange={resetTokenValidityDuration =>
                          setNestedCustomOption(
                            'passwordPolicy',
                            'resetTokenValidityDuration',
                            parseIntegerValue(resetTokenValidityDuration)
                          )
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Reset Token Reuse If Valid'
                        description='If a password reset token should be reused in case another token is requested but there is a token that is still valid.'
                        helpText='Part of passwordPolicy. If enabled, Parse Server reuses an existing valid reset token instead of creating a new one for repeated reset requests, reducing user confusion from multiple emails.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={passwordPolicy?.resetTokenReuseIfValid}
                        onChange={resetTokenReuseIfValid =>
                          setNestedCustomOption('passwordPolicy', 'resetTokenReuseIfValid', resetTokenReuseIfValid)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.passwordPolicy.validatorPattern')}
                    label={
                      <LabelSettings
                        text='Password Validator Pattern'
                        description='Set the regular expression validation pattern a password must match to be accepted.'
                        helpText='Part of passwordPolicy. Regular expression that passwords must match to be accepted. Use this to enforce complexity rules such as minimum length, uppercase letters, or numeric characters.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='^(?=.*[A-Z])(?=.*[0-9]).{8,}$'
                        value={passwordPolicy?.validatorPattern}
                        error={getError(errors, 'customOptions.passwordPolicy.validatorPattern')}
                        onChange={({ target: { value } }) =>
                          setNestedCustomOption('passwordPolicy', 'validatorPattern', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.passwordPolicy.validationError')}
                    label={
                      <LabelSettings
                        text='Validation Error Message'
                        description='Set the error message to be sent for failed password validation'
                        helpText='Part of passwordPolicy. Custom message returned when a password fails the validator pattern. Keep this clear so users understand how to fix their password input.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='Password must include at least 8 characters, a uppercase letter, and a number.'
                        value={passwordPolicy?.validationError}
                        error={getError(errors, 'customOptions.passwordPolicy.validationError')}
                        onChange={({ target: { value } }) =>
                          setNestedCustomOption('passwordPolicy', 'validationError', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Do Not Allow Username'
                        description='Set to true to disallow the username as part of the password.'
                        helpText='Part of passwordPolicy. Prevents users from including their username in their password, reducing easily guessable credential combinations.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={passwordPolicy?.doNotAllowUsername}
                        onChange={doNotAllowUsername =>
                          setNestedCustomOption('passwordPolicy', 'doNotAllowUsername', doNotAllowUsername)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.passwordPolicy.maxPasswordAge')}
                    label={
                      <LabelSettings
                        text='Max Password Age'
                        description='Set the number of days after which a password expires.'
                        helpText='Part of passwordPolicy. Maximum password lifetime in days. After expiration, users must set a new password according to your policy.'
                      />
                    }
                    input={
                      <NumericInputSettings
                        min={0}
                        value={passwordPolicy?.maxPasswordAge ?? ''}
                        error={getError(errors, 'customOptions.passwordPolicy.maxPasswordAge')}
                        onChange={maxPasswordAge =>
                          setNestedCustomOption('passwordPolicy', 'maxPasswordAge', parseIntegerValue(maxPasswordAge))
                        }
                      />
                    }
                  />
                  <FieldSettings
                    containerStyles={{ borderBottom: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.passwordPolicy.maxPasswordHistory')}
                    label={
                      <LabelSettings
                        text='Max Password History'
                        description='Set the number of previous password that will not be allowed to be set as new password.'
                        helpText='Part of passwordPolicy. Number of previous passwords that users cannot reuse. Higher values strengthen password rotation by preventing repeated historical passwords.'
                      />
                    }
                    input={
                      <NumericInputSettings
                        min={0}
                        value={passwordPolicy?.maxPasswordHistory ?? ''}
                        error={getError(errors, 'customOptions.passwordPolicy.maxPasswordHistory')}
                        onChange={maxPasswordHistory =>
                          setNestedCustomOption('passwordPolicy', 'maxPasswordHistory', parseIntegerValue(maxPasswordHistory))
                        }
                      />
                    }
                  />
                </div>
              }
              theme={Field.Theme.BLUE}
            />
          </Fieldset>}

          {versionSupport.passwordPolicy && <hr className={styles.fieldHr} />}

          {versionSupport.accountLockout && <Fieldset
            legend='Account Lockout'
            description='Manage account lockout policies for this app.'
          >
            <Field
              label={
                <Label
                  text='Account lockout'
                  description='Manage account lockout policies'
                  dark={true}
                />
              }
              input={
                <div style={{ flex: 1 }}>
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.accountLockout.duration')}
                    label={
                      <LabelSettings
                        text='Duration'
                        description='Set the duration in minutes that a locked-out account remains locked out before automatically becoming unlocked.'
                        helpText='Part of accountLockout. Lockout duration in minutes after a user exceeds failed login attempts. During this window, authentication attempts remain blocked.'
                      />
                    }
                    input={
                      <NumericInputSettings
                        min={0}
                        value={accountLockout?.duration ?? ''}
                        error={getError(errors, 'customOptions.accountLockout.duration')}
                        onChange={duration =>
                          setNestedCustomOption('accountLockout', 'duration', parseIntegerValue(duration))
                        }
                      />
                    }
                  />
                  <FieldSettings
                    containerStyles={{ borderBottom: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.accountLockout.threshold')}
                    label={
                      <LabelSettings
                        text='Threshold'
                        description='Set the number of failed sign-in attempts that will cause a user account to be locked.'
                        helpText='Part of accountLockout. Number of failed sign-in attempts allowed before the account is locked. Lower values improve brute-force resistance but may increase accidental lockouts.'
                      />
                    }
                    input={
                      <NumericInputSettings
                        min={0}
                        value={accountLockout?.threshold ?? ''}
                        error={getError(errors, 'customOptions.accountLockout.threshold')}
                        onChange={threshold =>
                          setNestedCustomOption('accountLockout', 'threshold', parseIntegerValue(threshold))
                        }
                      />
                    }
                  />
                </div>
              }
              theme={Field.Theme.BLUE}
            />
          </Fieldset>}

          {versionSupport.accountLockout && <hr className={styles.fieldHr} />}

          <Fieldset
            legend='Security & Authentication'
            description='Configure security and authentication settings for this app.'
          >
            <Field
              label={
                <Label
                  text='Security & Authentication'
                  description='Manage security and authentication options'
                  dark={true}
                />
              }
              input={
                <div style={{ flex: 1 }}>
                  {versionSupport.enableAnonymousUsers && <FieldSettings
                    containerStyles={{ borderTop: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Enable Anonymous Users'
                        description='Enable anonymous users to sign up without credentials'
                        helpText='Maps to enableAnonymousUsers. Allows users to be created without username/password credentials. Parse Server defaults this to true.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={customOptions?.enableAnonymousUsers}
                        onChange={value =>
                          setCustomOption('enableAnonymousUsers', value)
                        }
                      />
                    }
                  />}
                  {versionSupport.enforcePrivateUsers && <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Enforce Private Users'
                        description='Make new users private by default'
                        helpText='Maps to enforcePrivateUsers. When enabled, newly created users do not get public read/write access by default, improving baseline privacy for user objects.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={customOptions?.enforcePrivateUsers}
                        onChange={value =>
                          setCustomOption('enforcePrivateUsers', value)
                        }
                      />
                    }
                  />}
                  {versionSupport.sessionLength && <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.sessionLength')}
                    label={
                      <LabelSettings
                        text='Session Length'
                        description='Session token expiration (in seconds, default: 1 year)'
                        helpText='Maps to sessionLength. Session lifetime in seconds. Parse Server defaults to one year if not customized.'
                      />
                    }
                    input={
                      <NumericInputSettings
                        min={0}
                        value={customOptions?.sessionLength ?? ''}
                        error={getError(errors, 'customOptions.sessionLength')}
                        onChange={value =>
                          setCustomOption('sessionLength', parseIntegerValue(value))
                        }
                      />
                    }
                  />}
                  {versionSupport.emailVerifyTokenValidityDuration && <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.emailVerifyTokenValidityDuration')}
                    label={
                      <LabelSettings
                        text='Email Verify Token Validity Duration'
                        description='Email verification token expiration (in seconds)'
                        helpText='Maps to emailVerifyTokenValidityDuration. Sets email verification token lifetime in seconds. If not set, the token may not expire. Requires verifyUserEmails to be enabled.'
                      />
                    }
                    input={
                      <NumericInputSettings
                        min={1}
                        value={customOptions?.emailVerifyTokenValidityDuration ?? ''}
                        error={getError(errors, 'customOptions.emailVerifyTokenValidityDuration')}
                        onChange={value =>
                          setCustomOption('emailVerifyTokenValidityDuration', parseIntegerValue(value))
                        }
                      />
                    }
                  />}
                  {versionSupport.expireInactiveSessions && <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    label={
                      <LabelSettings
                        text='Expire Inactive Sessions'
                        description='Expire inactive sessions automatically'
                        helpText='Maps to expireInactiveSessions. When enabled, inactive sessions expire automatically. If disabled, new sessions may be created without expiration.'
                      />
                    }
                    input={
                      <B4aToggle
                        additionalStyles={{ margin: '6px 16px' }}
                        value={customOptions?.expireInactiveSessions}
                        onChange={value =>
                          setCustomOption('expireInactiveSessions', value)
                        }
                      />
                    }
                  />}
                </div>
              }
              theme={Field.Theme.BLUE}
            />
          </Fieldset>

          <hr className={styles.fieldHr} />

          {versionSupport.customPages && <Fieldset
            legend='Custom Pages'
            description='Set custom page URLs for user-facing flows.'
          >
            <Field
              label={
                <Label
                  text='Custom pages'
                  description='Configure custom page URLs for password reset, email verification, and other user-facing flows.'
                  dark={true}
                />
              }
              input={
                <div style={{ flex: 1 }}>
                  <FieldSettings
                    containerStyles={{ borderTop: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.choosePassword')}
                    label={
                      <LabelSettings
                        text='Choose Password '
                        description='Custom page URL for choose password'
                        helpText='Custom page URL used for the password choice/reset flow. This belongs to Parse custom pages configuration and should point to a publicly reachable frontend route.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='https://app.example.com/choose-password'
                        value={customOptions?.choosePassword ?? ''}
                        error={getError(errors, 'customOptions.choosePassword')}
                        onChange={({ target: { value } }) =>
                          setCustomOption('choosePassword', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.verifyEmailSuccess')}
                    label={
                      <LabelSettings
                        text='Verify Email Success '
                        description='Custom page URL for email verification success'
                        helpText='Custom page URL users are redirected to after successful email verification. Use a trusted public route that confirms verification and guides next steps.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='https://app.example.com/verify-email-success'
                        value={customOptions?.verifyEmailSuccess ?? ''}
                        error={getError(errors, 'customOptions.verifyEmailSuccess')}
                        onChange={({ target: { value } }) =>
                          setCustomOption('verifyEmailSuccess', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.parseFrameURL')}
                    label={
                      <LabelSettings
                        text='Parse Frame '
                        description='Custom page URL for iFrame embeds'
                        helpText='Custom page URL used for Parse-hosted iframe related flows. Ensure the route is secure, publicly reachable, and consistent with your application domain policy.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='https://app.example.com/parse-frame'
                        value={customOptions?.parseFrameURL ?? ''}
                        error={getError(errors, 'customOptions.parseFrameURL')}
                        onChange={({ target: { value } }) =>
                          setCustomOption('parseFrameURL', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.passwordResetSuccess')}
                    label={
                      <LabelSettings
                        text='Password Reset Success '
                        description='Custom page URL for password reset success'
                        helpText='Custom page URL users see after successfully resetting their password. Usually this page confirms success and offers a sign-in action.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='https://app.example.com/password-reset-success'
                        value={customOptions?.passwordResetSuccess ?? ''}
                        error={getError(errors, 'customOptions.passwordResetSuccess')}
                        onChange={({ target: { value } }) =>
                          setCustomOption('passwordResetSuccess', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.invalidLink')}
                    label={
                      <LabelSettings
                        text='Invalid Link '
                        description='Custom page URL for invalid links'
                        helpText='Custom page URL shown when a reset or verification link is invalid or expired. Provide recovery actions such as requesting a new email.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='https://app.example.com/invalid-link'
                        value={customOptions?.invalidLink ?? ''}
                        error={getError(errors, 'customOptions.invalidLink')}
                        onChange={({ target: { value } }) =>
                          setCustomOption('invalidLink', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.invalidVerificationLink')}
                    label={
                      <LabelSettings
                        text='Invalid Verification Link '
                        description='Custom page URL for invalid verification links'
                        helpText='Custom page URL shown when an email verification link is invalid or expired. Use this page to explain the issue and offer resend verification.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='https://app.example.com/invalid-verification-link'
                        value={customOptions?.invalidVerificationLink ?? ''}
                        error={getError(errors, 'customOptions.invalidVerificationLink')}
                        onChange={({ target: { value } }) =>
                          setCustomOption('invalidVerificationLink', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.linkSendSuccess')}
                    label={
                      <LabelSettings
                        text='Link Send Success '
                        description='Custom page URL for link sent success'
                        helpText='Custom page URL shown after a link email is successfully sent. Useful for confirmation messaging and user guidance.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='https://app.example.com/link-sent-success'
                        value={customOptions?.linkSendSuccess ?? ''}
                        error={getError(errors, 'customOptions.linkSendSuccess')}
                        onChange={({ target: { value } }) =>
                          setCustomOption('linkSendSuccess', value)
                        }
                      />
                    }
                  />
                  <FieldSettings
                    containerStyles={{ borderBottom: 'none' }}
                    padding={'16px 0px'}
                    labelWidth={'50%'}
                    error={getError(errors, 'customOptions.linkSendFail')}
                    label={
                      <LabelSettings
                        text='Link Send Fail '
                        description='Custom page URL for link sent failure'
                        helpText='Custom page URL shown when sending a verification or reset link fails. Use it to communicate retry options and support paths.'
                      />
                    }
                    input={
                      <TextInputSettings
                        placeholder='https://app.example.com/link-sent-fail'
                        value={customOptions?.linkSendFail ?? ''}
                        error={getError(errors, 'customOptions.linkSendFail')}
                        onChange={({ target: { value } }) =>
                          setCustomOption('linkSendFail', value)
                        }
                      />
                    }
                  />
                </div>
              }
              theme={Field.Theme.BLUE}
            />
          </Fieldset>}
          </div>

          <hr className={styles.fieldHr} />

          <Fieldset>
            <Field
              label={
                <Label
                  text='Advanced Options'
                  description='Add custom parse options here.'
                  dark={true}
                />
              }
              input={
                <div style={{ width: '100%', padding: '0 1rem', textAlign: 'right' }}>
                  <Button
                    value='Edit as JSON'
                    primary={true}
                    disabled={!isOwner || !this.state.canChangeCustomParseOptions}
                    onClick={() => {
                      if (!isOwner || !this.state.canChangeCustomParseOptions) {
                        return;
                      }
                      const flatPayload = buildFlatEditorPayload(fields);
                      this.setState({
                        showPayloadModal: true,
                        copyStatus: '',
                        payloadSaveError: '',
                        payloadJson: stringifyAlpha(flatPayload),
                      });
                    }}
                  />
                </div>
              }
              theme={Field.Theme.BLUE}
            />
          </Fieldset>
        </div>
      </div>

      {this.state.showPayloadModal && this.renderPayloadModal(fields, setField, resetFields)}
      </>
    )
  }

  renderPayloadModal(fields, setField, resetFields) {
    const payloadJson = this.state.payloadJson;
    const isSaving = this.state.isSavingPayload;
    const payloadSaveError = this.state.payloadSaveError;

    let parseError = '';
    try {
      JSON.parse(payloadJson);
    } catch (e) {
      parseError = e && e.message ? e.message : 'Invalid JSON';
    }

    const closeModal = () => {
      if (isSaving) {
        return;
      }
      this.setState({
        showPayloadModal: false,
        copyStatus: '',
        payloadSaveError: '',
      });
    };

    const resetPayload = () => {
      // Revert to the original values from the most recent API response
      // (stored in `initialFields`). This drops every form-level and
      // JSON-editor change the user has made in this session and surfaces
      // every saved key — including any the form doesn't render — so the
      // editor matches the GET /parseOptions response.
      const apiInitialFields = this.state.initialFields || {};
      const flatPayload = buildFlatEditorPayload(apiInitialFields);
      this.setState({
        payloadJson: stringifyAlpha(flatPayload),
        copyStatus: '',
        payloadSaveError: '',
      });
      // Clear FlowView's tracked changes so `fields` = `initialFields` again
      // (the form fields revert alongside the JSON).
      if (typeof resetFields === 'function') {
        resetFields();
      }
    };

    const applyJsonToFields = (value) => {
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        return;
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return;
      }
      const unflat = unflattenEditorPayload(parsed);
      setField('customOptions', reverseTransformCustomOptions(unflat.customOptions));
      if (Object.prototype.hasOwnProperty.call(parsed, 'clientPush')) {
        setField('clientPush', unflat.clientPush);
      }
      if (Object.prototype.hasOwnProperty.call(parsed, 'clientClassCreation')) {
        setField('clientClassCreation', unflat.clientClassCreation);
      }
    };

    const handleCodeChange = (value) => {
      this.setState({ payloadJson: value, copyStatus: '', payloadSaveError: '' });
      applyJsonToFields(value);
    };

    const copyToClipboard = async () => {
      try {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(payloadJson);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = payloadJson;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        this.setState({ copyStatus: 'Copied!' });
        setTimeout(() => {
          if (this.state.showPayloadModal) {
            this.setState({ copyStatus: '' });
          }
        }, 1500);
      } catch (e) {
        this.setState({ copyStatus: 'Failed to copy' });
        setTimeout(() => {
          if (this.state.showPayloadModal && this.state.copyStatus === 'Failed to copy') {
            this.setState({ copyStatus: '' });
          }
        }, 1500);
      }
    };

    const handleSave = async () => {
      let parsed;
      try {
        parsed = JSON.parse(payloadJson);
      } catch (e) {
        this.setState({
          payloadSaveError: `Invalid JSON: ${e && e.message ? e.message : 'parse failed'}`,
        });
        return;
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        this.setState({ payloadSaveError: 'Payload must be a JSON object.' });
        return;
      }

      const unflat = unflattenEditorPayload(parsed);

      this.setState({ isSavingPayload: true, payloadSaveError: '' });

      try {
        await this.context.saveParseOptionsAndSettings(unflat);

        const prevInitial = this.state.initialFields || {};
        this.setState({
          isSavingPayload: false,
          payloadSaveError: '',
          showPayloadModal: false,
          copyStatus: '',
          payloadJson: '',
          initialFields: {
            customOptions: reverseTransformCustomOptions(unflat.customOptions),
            clientPush: Object.prototype.hasOwnProperty.call(parsed, 'clientPush')
              ? unflat.clientPush
              : prevInitial.clientPush,
            clientClassCreation: Object.prototype.hasOwnProperty.call(parsed, 'clientClassCreation')
              ? unflat.clientClassCreation
              : prevInitial.clientClassCreation,
          },
        });

        if (typeof resetFields === 'function') {
          // Clear FlowView's local changes so the dirty-footer resets to the new baseline.
          resetFields();
        }
      } catch (e) {
        const errors = Array.isArray(e && e.errors) ? e.errors : [];
        const message =
          errors.join(' ') ||
          (e && (e.error || e.message || e.notice)) ||
          (typeof e === 'string' ? e : 'Failed to save parse options.');
        this.setState({
          isSavingPayload: false,
          payloadSaveError: message,
        });
      }
    };

    return (
      <B4aModal
        title='Custom Parse Options'
        subtitle='Configure advanced settings of your Parse Server instance, including server behavior, authentication, and security rules.'
        cancelText='Close'
        confirmText={isSaving ? 'Saving\u2026' : 'Save Changes'}
        onCancel={closeModal}
        onConfirm={handleSave}
        canCancel={!isSaving}
        disableConfirm={!!parseError || isSaving}
        progress={isSaving}
        width={680}
      >
        <div>
          <div
            style={{
              height: '380px',
              border: `1px solid ${parseError ? 'rgba(220, 38, 38, 0.5)' : 'rgba(16, 32, 58, 0.12)'}`,
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <B4aCodeEditor
              code={payloadJson}
              mode='json'
              onCodeChange={handleCodeChange}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '10px',
              minHeight: '18px',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: parseError ? '#dc2626' : 'rgba(16, 32, 58, 0.55)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {parseError
                ? `Invalid JSON: ${parseError}`
                : 'Valid edits sync to the form fields.'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              <button
                type='button'
                onClick={copyToClipboard}
                disabled={isSaving}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isSaving ? 'rgba(16, 32, 58, 0.35)' : '#2563eb',
                  fontSize: '12px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  padding: 0,
                }}
              >
                {this.state.copyStatus || 'Copy JSON'}
              </button>
              <button
                type='button'
                onClick={resetPayload}
                disabled={isSaving}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isSaving ? 'rgba(16, 32, 58, 0.35)' : '#2563eb',
                  fontSize: '12px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  padding: 0,
                }}
              >
                Reset to saved values
              </button>
            </div>
          </div>
          {payloadSaveError && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#b91c1c',
              }}
            >
              {payloadSaveError}
            </div>
          )}
        </div>
      </B4aModal>
    );
  }

  renderContent() {
    const toolbar = this.renderToolbar();
    const loading = this.state.isLoading;
    const initialFields = this.state.initialFields || {
      customOptions: {},
      clientPush: false,
      clientClassCreation: true,
    };

    const customParseOptionsFieldsOptions = {
      customOptions: { friendlyName: 'custom options', type: 'json' },
      clientPush: { friendlyName: 'push notification from client', showTo: true },
      clientClassCreation: { friendlyName: 'client class creation', showTo: true },
    };

    let content = null;
    if (loading) {
      content = null;
    } else if (this.state.loadingError) {
      content = <div style={{ marginTop: '3rem' }}><EmptyGhostState
        title="Error loading parse options"
        description={this.state.loadingError}
      /></div>
    } else {
      const isOwnerState = this.state.isOwner;
      content = <div className={styles.mainContent}>
          <FlowView
            initialFields={initialFields}
            showFooter={changes => !isOwnerState || Object.keys(getActualChanges(changes, initialFields)).length > 0}
            validate={({ changes }) => {
              if (!isOwnerState) {
                return 'use default';
              }
              const merged = deepmerge(
                JSON.parse(JSON.stringify(initialFields)),
                changes
              );
              return CustomParseOptionsValidations
                .validate(merged, { abortEarly: false })
                .then(() => '')
                .catch(err => {
                  const errors = (err.inner || []).map(e => e.path + e.message);
                  return Promise.reject({ errors });
                });
            }}
            defaultFooterMessage={<span>You don&apos;t have permission to edit this feature.</span>}
            hideButtonsOnDefaultMessage={true}
            onSubmit={({ changes: rawChanges }) => {
              return this.context.saveParseOptionsAndSettings(
                buildSaveParseOptionsPayload(rawChanges, initialFields)
              );
            }}
            afterSave={({ fields, resetFields }) => {
              this.setState({
                initialFields: {
                  customOptions: JSON.parse(JSON.stringify(fields.customOptions || {})),
                  clientPush: fields.clientPush,
                  clientClassCreation: fields.clientClassCreation,
                },
              });
              // Let FlowView render success feedback before clearing form state.
              setTimeout(() => resetFields(), 1200);
            }}
            footerContents={({ changes }) => {
              const actual = getActualChanges(changes, initialFields);
              for (const key of Object.keys(actual)) {
                if (typeof actual[key] === 'boolean') {
                  actual[key] = String(actual[key]);
                }
              }
              return renderFlowFooterChanges(actual, initialFields, customParseOptionsFieldsOptions);
            }}
            renderForm={this.renderParseOptionsForm.bind(this)}
          />
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
      </div>
    );
  }
}

export default CustomParseOptions;

