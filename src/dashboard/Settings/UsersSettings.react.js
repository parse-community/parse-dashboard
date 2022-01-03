/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DashboardView           from 'dashboard/DashboardView.react';
import Field                   from 'components/Field/Field.react';
import Fieldset                from 'components/Fieldset/Fieldset.react';
import FlowView                from 'components/FlowView/FlowView.react';
import FormTable               from 'components/FormTable/FormTable.react';
import Label                   from 'components/Label/Label.react';
import pluck                   from 'lib/pluck';
import React                   from 'react';
import renderFlowFooterChanges from 'lib/renderFlowFooterChanges';
import style                   from 'dashboard/Settings/Settings.scss';
import TextInput               from 'components/TextInput/TextInput.react';
import Toggle                  from 'components/Toggle/Toggle.react';
import Toolbar                 from 'components/Toolbar/Toolbar.react';
import unique                  from 'lib/unique';

const DEFAULT_SETTINGS_LABEL_WIDTH = 62;

export default class UsersSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Users';
  }

  renderContent() {
		let toolbar = <Toolbar section='Settings' subsection='Users' />
		if (!this.props.initialFields) {
			return toolbar;
		}
		let initialFields = {
			requireRevocableSessions: this.props.initialFields.require_revocable_session,
			expireInactiveSessions: this.props.initialFields.expire_revocable_session,
			revokeSessionOnPasswordChange: this.props.initialFields.revoke_on_password_reset,

			enableNewMethodsByDefault: this.props.initialFields.auth_options_attributes._enable_by_default,
			allowUsernameAndPassword: this.props.initialFields.auth_options_attributes.username.enabled,
			allowAnonymousUsers: this.props.initialFields.auth_options_attributes.anonymous.enabled,
			allowCustomAuthentication: (this.props.initialFields.auth_options_attributes.custom || {enabled: false}).enabled,

			allowFacebookAuthentication: this.props.initialFields.auth_options_attributes.facebook.enabled,
			facebookAppIDList: this.props.initialFields.auth_options_attributes.facebook.app_ids || [],
			facebookAppSecretList: this.props.initialFields.auth_options_attributes.facebook.app_secrets || [],

			facebookAppID: '',
			facebookAppSecret: '',

			allowTwitterAuthentication: this.props.initialFields.auth_options_attributes.twitter.enabled,
			twitterConsumerKeysList: this.props.initialFields.auth_options_attributes.twitter.consumer_keys || [],

			twitterConsumerKey: '',
		};
		let renderForm = ({fields, setField}) => {
				let userSessionsFields = <Fieldset
					legend='User Sessions'
					description={<div>This feature allows for better security and management <br/>of sessions for users.<a>Learn more</a></div>}>
					<Field
						labelWidth={68}
						label={<Label
							text='Require revocable sessions'
							description={<span>Disable legacy session tokens to make your app more secure. If enabled, all requests with legacy tokens will error. <a>Learn more</a></span>}
						/>}
						input={<Toggle
							onChange={setField.bind(this, 'requireRevocableSessions')}
							value={fields.requireRevocableSessions}
						/>}
					/>
					<Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label
							text='Expire inactive sessions'
							description={<span>We’ll automatically delete revocable sessions that have not made an API request in the last year.</span>}
						/>}
						input={<Toggle
							onChange={setField.bind(this, 'expireInactiveSessions')}
							value={fields.expireInactiveSessions}
						/>}
					/>
					<Field
						labelWidth={68}
						label={<Label
							text='Revoke session on password change'
							description={<span>When a user changes or resets their password, we’ll <br/>automatically delete all Session objects associated with this user.</span>}
						/>}
						input={<Toggle
							onChange={setField.bind(this, 'revokeSessionOnPasswordChange')}
							value={fields.revokeSessionOnPasswordChange}
						/>}
					/>
				</Fieldset>

				let userAuthenticationFields = <Fieldset
					legend='User Authentication'
					description='You can enable and disable various authentication types for your application and provide additional settings for login methods, which will limit and help secure your application.'>
					<Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label
							text='Enable new methods by default'
							description='If we add new authentication methods, they will be allowed by default.'
						/>}
						input={<Toggle
							onChange={setField.bind(this, 'enableNewMethodsByDefault')}
							value={fields.enableNewMethodsByDefault}
						/>}
					/>
					<Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label
							text='Allow username and password-based authentication'
						/>}
						input={<Toggle
							onChange={setField.bind(this, 'allowUsernameAndPassword')}
							value={fields.allowUsernameAndPassword}
						/>}
					/>
					<Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label
							text='Allow anonymous users'
						/>}
						input={<Toggle
							onChange={setField.bind(this, 'allowAnonymousUsers')}
							value={fields.allowAnonymousUsers}
						/>}
					/>
				</Fieldset>

				let socialLoginFields = <Fieldset
					legend='Social Login'
					description='Enable and secure your app’s third-party login methods.'>
					<Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label
							text='Allow Facebook authentication'
						/>}
						input={<Toggle
							onChange={enabled => {
								setField('allowFacebookAuthentication', enabled);
								if (!enabled) {
									setField('facebookAppID', '');
									setField('facebookAppSecret', '');
								}
							}}
							value={fields.allowFacebookAuthentication}
						/>}
					/>
					{fields.allowFacebookAuthentication ? <Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label text='Add a Facebook App' />}
						input={[
							<TextInput
								key='id'
								value={fields.facebookAppID}
								placeholder='App ID'
								onChange={setField.bind(this, 'facebookAppID')} />,
							<TextInput
								key='secret'
								value={fields.facebookAppSecret}
								placeholder='App secret'
								onChange={setField.bind(this, 'facebookAppSecret')} />,
							]}
					/> : null}
					{fields.facebookAppIDList.length > 0 ? <Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label text='Linked Facebook Apps'/>}
						input={<FormTable
							keyWidth='75px'
							items={fields.facebookAppIDList.map((id, index) => ({
								title: 'App #' + (index + 1).toString(),
								color: 'green',
								onDelete: () => {
									let newFacebookAppIDList = fields.facebookAppIDList.slice();
									newFacebookAppIDList.splice(index, 1);

									let newFacebookAppSecretList = fields.facebookAppSecretList.slice();
									newFacebookAppSecretList.splice(index, 1);

									//TODO(drewgross): handle errors, display progress, etc.
									this.context.setConnectedFacebookApps(newFacebookAppIDList, newFacebookAppSecretList).then(() => {
										this.forceUpdate();
									});
								},
								notes: [
									{
										key: 'App ID',
										value: fields.facebookAppIDList[index],
									},
									{
										key: 'App Secret',
										value: fields.facebookAppSecretList[index],
									}
								],
							}))}
						/>}
					/> : null}
					<Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label text='Allow Twitter authentication'/>}
						input={<Toggle
							onChange={enabled => {
								setField('allowTwitterAuthentication', enabled);
								if (!enabled) {
									setField('twitterConsumerKey', '');
								}
							}}
							value={fields.allowTwitterAuthentication}
						/>} />
					{fields.allowTwitterAuthentication ? <Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label text='Twitter Consumer Key' />}
						input={<TextInput
							value={fields.twitterConsumerKey}
							placeholder={'Key'}
							onChange={setField.bind(this, 'twitterConsumerKey')} />
						}/> : null}
					{fields.twitterConsumerKeysList.length > 0 ? <Field
						labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
						label={<Label text='Linked Twitter Apps'/>}
						input={<FormTable
							keyWidth='93px'
							items={fields.twitterConsumerKeysList.map((id, index) => ({
								title: 'App #' + (index + 1).toString(),
								color: 'green',
								onDelete: () => {
									let twitterConsumerKeyList = fields.twitterConsumerKeysList.slice();
									twitterConsumerKeyList.splice(index, 1);

									//TODO(drewgross): handle errors, display progress, etc.
									this.context.setConnectedTwitterApps(twitterConsumerKeyList).then(() => {
										this.forceUpdate();
									});
								},
								notes: [
									{
										key: 'Consumer Key',
										value: fields.twitterConsumerKeysList[index],
									},
								],
							}))}
						/>}
					/> : null}
				</Fieldset>

				return <div className={style.settings_page}>
					{userSessionsFields}
					{userAuthenticationFields}
					{socialLoginFields}
					{toolbar}
				</div>;
			}

		return <FlowView
			initialFields={initialFields}
			renderForm={renderForm}
			footerContents={({changes}) => renderFlowFooterChanges(changes, initialFields, userFieldOptions)}
			onSubmit={({ changes, setField }) => {
				let promiseList = [];
				if (changes.requireRevocableSessions !== undefined) {
					promiseList.push(this.context.setRequireRevocableSessions(changes.requireRevocableSessions));
				}
				if (changes.expireInactiveSessions !== undefined) {
					promiseList.push(this.context.setExpireInactiveSessions(changes.expireInactiveSessions));
				}
				if (changes.revokeSessionOnPasswordChange !== undefined) {
					promiseList.push(this.context.setRevokeSessionOnPasswordChange(changes.revokeSessionOnPasswordChange));
				}
				if (changes.enableNewMethodsByDefault !== undefined) {
					promiseList.push(this.context.setEnableNewMethodsByDefault(changes.enableNewMethodsByDefault));
				}
				if (changes.allowUsernameAndPassword !== undefined) {
					promiseList.push(this.context.setAllowUsernameAndPassword(changes.allowUsernameAndPassword));
				}
				if (changes.allowAnonymousUsers !== undefined) {
					promiseList.push(this.context.setAllowAnonymousUsers(changes.allowAnonymousUsers));
				}
				if (changes.allowFacebookAuthentication !== undefined) {
					promiseList.push(this.context.setAllowFacebookAuth(changes.allowFacebookAuthentication));
				}
				if (changes.allowCustomAuthentication !== undefined) {
					promiseList.push(this.context.setAllowCustomAuthentication(changes.allowCustomAuthentication));
				}
				if (changes.facebookAppID !== undefined && changes.facebookAppSecret !== undefined) {
					let fbAppPromise = this.context.addConnectedFacebookApp(changes.facebookAppID, changes.facebookAppSecret);
					fbAppPromise.then(() => {
						setField('facebookAppID', '');
						setField('facebookAppSecret', '');
					})
					promiseList.push(fbAppPromise);
				}
				if (changes.twitterConsumerKey !== undefined) {
					let twitterAppPromise = this.context.addConnectedTwitterApp(changes.twitterConsumerKey);
					twitterAppPromise.then(() => {
						setField('twitterConsumerKey', '');
					});
					promiseList.push(twitterAppPromise);
				}
				if (changes.allowTwitterAuthentication !== undefined) {
					promiseList.push(this.context.setAllowTwitterAuth(changes.allowTwitterAuthentication));
				}

				return Promise.all(promiseList).then(() => {
          this.forceUpdate(); //Need to forceUpdate to see changes applied to source ParseApp
				}).catch(errors => {
					return Promise.reject({ error: unique(pluck(errors, 'error')).join(' ') });
				});
			}}
		/>;
  }
}

const userFieldOptions = {
	requireRevocableSessions: {
		friendlyName: 'require revocable sessions',
		type: 'boolean',
	},
	expireInactiveSessions: {
		friendlyName: 'expire inactive sessions',
		type: 'boolean',
	},
	revokeSessionOnPasswordChange: {
		friendlyName: 'revoke session on password change',
		type: 'boolean',
	},
	enableNewMethodsByDefault: {
		friendlyName: 'new authentication methods by default',
		type: 'boolean',
	},
	allowUsernameAndPassword: {
		friendlyName: 'user name and password login',
		type: 'boolean',
	},
	allowAnonymousUsers: {
		friendlyName: 'annonymous users',
		type: 'boolean',
	},
	allowFacebookAuthentication: {
		friendlyName: 'Facebook authentication',
		type: 'boolean',
	},
	facebookAppID: {
		friendlyName: 'Facebook app ID',
		type: 'addition',
	},
	facebookAppSecret: {
		friendlyName: 'Facebook app secret',
		type: 'addition',
	},
	allowTwitterAuthentication: {
		friendlyName: 'Twitter authentication',
		type: 'boolean',
	},
	twitterConsumerKey: {
		friendlyName: 'Twitter Consumer Key',
		type: 'addition',
	},
	allowCustomAuthentication: {
		friendlyName: 'custom authentication',
		type: 'boolean',
	},
};
