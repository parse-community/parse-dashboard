/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AppleCerts              from 'dashboard/Settings/AppleCerts.react';
import DashboardView           from 'dashboard/DashboardView.react';
import Field                   from 'components/Field/Field.react';
import Fieldset                from 'components/Fieldset/Fieldset.react';
import FlowView                from 'components/FlowView/FlowView.react';
import FormButton              from 'components/FormButton/FormButton.react';
import FormTable               from 'components/FormTable/FormTable.react';
import getSiteDomain           from 'lib/getSiteDomain';
import Label                   from 'components/Label/Label.react';
import pluck                   from 'lib/pluck';
import React                   from 'react';
import renderFlowFooterChanges from 'lib/renderFlowFooterChanges';
import setDifference           from 'lib/setDifference';
import styles                  from 'dashboard/Settings/Settings.scss';
import TextInput               from 'components/TextInput/TextInput.react';
import Toggle                  from 'components/Toggle/Toggle.react';
import Toolbar                 from 'components/Toolbar/Toolbar.react';
import unique                  from 'lib/unique';

const DEFAULT_LABEL_WIDTH = 60;

export default class PushSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Push';
  }

  legacyPushSettings() {
    window.open(`${getSiteDomain()}/apps/` + this.context.slug + '/edit#push', '_blank');
  }

  renderForm({fields, setField}) {
    let pushSettingsFields = <Fieldset
      legend='Push Notification Settings'
      description='Secure push notifications for your app.'>
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label
          text='Enable client push?'
          description='Allow pushes to be sent using the public client keys. Useful during development, but we suggest disabling it on production apps.'/>}
        input={<Toggle
          onChange={setField.bind(this, 'enableClientPush')}
          value={fields.enableClientPush}/>}/>
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label
          text='Enable REST push?'
          description='Allow push notifications to be sent using the REST key. When enabled, be sure to keep your REST key secret.'/>}
        input={<Toggle
          onChange={setField.bind(this, 'enableRestPush')}
          value={fields.enableRestPush}/>}/>
    </Fieldset>;

    let androidPushFields = <Fieldset
      legend='Android Push Credentials'
      description='This information is not necessary for most Parse apps. It is only necessary if you import GCM registration IDs from another push provider via the installation upload API.'>
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label
          text='GCM Sender ID'
          description='This is an integer listed under "Project Number" in the Google API console.'/>}
        input={<TextInput
          value={fields.customGCMSenderID}
          placeholder='GCM Sender ID'
          onChange={setField.bind(this, 'customGCMSenderID')} />} />
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label
          text='API Key'
          description='This is listed under the "Authentication" section of the Google API console.'/>}
        input={<TextInput
          value={fields.customGCMAPIKey}
          placeholder='API Key'
          onChange={setField.bind(this, 'customGCMAPIKey')} />} />
      {fields.gcmCredentials.length > 0 ? <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text='Existing Credentials' />}
        input={
          (<FormTable
          items={fields.gcmCredentials.map((credential, index) => {
            return {
              title: 'Credential #' + (index + 1).toString(),
              onDelete: () => setField('gcmCredentials', fields.gcmCredentials.filter(oldCred =>
                !compareGCMCredentials(oldCred, credential)
              )),
              notes: [
                {
                  key: 'Sender ID',
                  value: credential.sender_id,
                },
                {
                  key: 'API Key',
                  value: credential.api_key,
                }
              ],
            };
          })}/>)}/> : null}
    </Fieldset>;

    let windowsPushFields = <Fieldset
      legend='Windows Push Credentials'
      description='Enable push for Windows apps.'>
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label
              text='Windows Keys' />}
        input={<FormButton onClick={this.legacyPushSettings.bind(this)} value='Configure'/>} />
      {/* TODO(drewgross): make Push Credentials component
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text='Package Security Identifier (SID)' />}
        input={<TextInput
              value={fields.windowsPackageSID}
              placeholder='Package Security Identifier'
              onChange={setField.bind(this, 'windowsPackageSID')} />} />
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text='Client Secret' />}
        input={<TextInput
              value={fields.windowsClientSecret}
              placeholder='Client Secret'
              onChange={setField.bind(this, 'windowsClientSecret')} />} />
      */}
    </Fieldset>;

    return <div className={styles.settings_page}>
      {pushSettingsFields}
      <AppleCerts />
      {androidPushFields}
      {windowsPushFields}
      <Toolbar section='Settings' subsection='Push' />
    </div>
  }

  renderContent() {
    if (!this.props.initialFields) {
      return null;
    }

    let initialFields = {
      enableClientPush: this.props.initialFields.client_push_enabled,
      enableRestPush: this.props.initialFields.rest_push_enabled,
      gcmCredentials: this.props.initialFields.gcm_credentials,
      customGCMSenderID: '',
      customGCMAPIKey: '',
    };

    return <FlowView
      initialFields={initialFields}
      footerContents={({ changes }) => renderFlowFooterChanges(changes, initialFields, pushFieldOptions)}
      onSubmit={({ changes }) => {
        let promiseList = [];
        if (changes.enableClientPush !== undefined) {
          promiseList.push(this.context.setEnableClientPush(changes.enableClientPush));
        }
        if (changes.enableRestPush !== undefined) {
          promiseList.push(this.context.setEnableRestPush(changes.enableRestPush));
        }
        if (changes.customGCMSenderID && changes.customGCMAPIKey) {
          promiseList.push(this.context.addGCMCredentials(changes.customGCMSenderID, changes.customGCMAPIKey));
        }
        if (changes.gcmCredentials) { //Added creds don't show up in "changes"
          let removedGCMcredentials = setDifference(initialFields.gcmCredentials, changes.gcmCredentials, compareGCMCredentials);
          removedGCMcredentials.forEach(({ sender_id }) => {
            promiseList.push(this.context.deleteGCMPushCredentials(sender_id));
          });
        }
        return Promise.all(promiseList).then(() => {
          this.forceUpdate(); //Need to forceUpdate to see changes applied to source ParseApp
        }).catch(errors => {
          return Promise.reject({ error: unique(pluck(errors, 'error')).join(' ') });
        });
      }}
      afterSave={({ setField }) => {
        setField('customGCMSenderID', '', true);
        setField('customGCMAPIKey', '', true);
      }}
      validate={({ changes }) => {
        if (changes.customGCMAPIKey && !changes.customGCMSenderID
            || !changes.customGCMAPIKey && changes.customGCMSenderID) {
          return 'A GCM Sender ID and API Key are both required.';
        }
      }}
      renderForm={this.renderForm.bind(this)} />;
  }
}

let compareGCMCredentials = (c1, c2) => c1.sender_id === c2.sender_id;

let pushFieldOptions = {
  enableClientPush: {
    friendlyName: 'client push',
    type: 'boolean',
  },
  enableRestPush: {
    friendlyName: 'REST push',
    type: 'boolean',
  },
  customGCMSenderID: {
    friendlyName: 'GCM Sender ID',
    type: 'addition',
  },
  customGCMAPIKey: {
    friendlyName: 'API key',
    type: 'addition',
  },
  gcmCredentials: {
    friendlyName: 'GCM Credential',
    friendlyNamePlural: 'GCM Credentials',
    type: 'set',
    equalityPredicate: compareGCMCredentials,
  },
  windowsPackageSID: {
    friendlyName: 'Windows package SID',
  },
  windowsClientSecret: {
    friendlyName: 'Windows client secret',
  },
}
