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
import FileInput               from 'components/FileInput/FileInput.react';
import FlowView                from 'components/FlowView/FlowView.react';
import FormNote                from 'components/FormNote/FormNote.react';
import getSiteDomain           from 'lib/getSiteDomain';
import Label                   from 'components/Label/Label.react';
import React                   from 'react';
import renderFlowFooterChanges from 'lib/renderFlowFooterChanges';
import styles                  from 'dashboard/Settings/Settings.scss';
import TextInput               from 'components/TextInput/TextInput.react';
import Toggle                  from 'components/Toggle/Toggle.react';
import Toolbar                 from 'components/Toolbar/Toolbar.react';
import unique                  from 'lib/unique';
import { Promise }             from 'parse';

export default class HostingSettings extends DashboardView {
	constructor() {
		super();
		this.section = 'App Settings';
		this.subsection = 'Hosting and Emails';

		this.state = {
			sslPublicCertUploading: false,
			sslPublicCertError: '',

			sslPrivateKeyUploading: false,
			sslPrivateKeyError:'',
		};
	}

	renderForm({fields, setField}) {
		let hostingSubdomainFields = <Fieldset
			legend="Hosting Subdomain"
			description="Content from your public directory will be served to users that visit this address.">
			<Field
				labelWidth={62}
				label={<Label
					text="Subdomain name"
					description="The name may consist of 3 to 20 alphanumeric characters and dashes, and may not start or end with a dash."
				/>}
				input={<TextInput
					value={fields.subdomain_name}
					placeholder={'yourapp.parseapp.com'}
					onChange={setField.bind(this, 'subdomain_name')} />
				}
			/>
		</Fieldset>;

		let customDomainsFields = <Fieldset
			legend="Custom Domains"
			description="Use this Parse app with your own custom URLs.">
			<Field
				labelWidth={62}
				label={<Label
					text="Host name"
					description={"A host with a subdomain CNAME entry set to " + (fields.subdomain_name || '[your subdomain name]') + ".parseapp.com"}
				/>}
				input={<TextInput
					value={fields.host_name}
					placeholder={'Give it a good name\u2026'}
					onChange={setField.bind(this, 'host_name')}
				/>}
			/>
			<Field
				labelWidth={62}
				label={<Label
					text="Host Name Key"
					description={'To claim a host name like "www.example.com", either "www.example.com" or "' + (fields.host_name_key || '') +'.www.example.com" must resolve to "' + (fields.subdomain_name || '[your subdomain name]') + '.parseapp.com".'}
				/>}
				input={<TextInput
					value={fields.host_name_key}
					height={100}
					monospace={true}
					disabled={true}
					onChange={() => {}}/>
				} />
			<Field
				labelWidth={62}
				label={<Label
					text="SSL Public Certificate"
					description="Upload your SSL public certificate, in PEM or DER format, to allow your users to access your app over HTTPS." />
				}
				input={<FileInput
					disabled={this.state.sslPublicCertUploading}
					onChange={file => {
						this.setState({
							sslPublicCertUploading: true,
							sslPublicCertError: '',
						});
						//TODO: do something here to indicate success and/or upload when you click the FlowView save button rather than immediately
						this.context.currentApp.uploadSSLPublicCertificate(file).fail(({ error }) => {
							this.setState({ sslPublicCertError: error });
						}).always(() => {
							this.setState({ sslPublicCertUploading: false });
						});
					}} />
				} />
			<FormNote
				show={this.state.sslPublicCertError.length > 0}
				color='red'>
				{this.state.sslPublicCertError}
			</FormNote>
			<Field
				labelWidth={62}
				label={<Label
					text="SSL Private Key"
					description="Upload your SSL private key, in PEM or DER format, to allow your users to access your app over HTTPS." />
				}
				input={<FileInput
					disabled={this.state.sslPrivateKeyUploading}
					onChange={file => {
						this.setState({
							sslPrivateKeyUploading: true,
							sslPrivateKeyError: '',
						});
						//TODO: do something here to indicate success and/or upload when you click the FlowView save button rather than immediately
						this.context.currentApp.uploadSSLPrivateKey(file).fail(({ error }) => {
							this.setState({ sslPrivateKeyError: error });
						}).always(() => {
							this.setState({ sslPrivateKeyUploading: false });
						});
					}} />
				} />
			{this.state.sslPrivateKeyError.length > 0 ? <FormNote
				show={this.state.sslPrivateKeyError.length > 0}
				color='red'>
				{this.state.sslPrivateKeyError}
			</FormNote> : null}
		</Fieldset>;

		let emailSettingsFields = <Fieldset
			legend="Email Settings"
			description="Manage this app’s automated email communication.">
			<Field
				labelWidth={62}
				label={<Label
					text="Reply-to address"
					description="Emails sent from your app will come from this address." />
				}
				input={<TextInput
					value={fields.send_email_address}
					onChange={setField.bind(this, 'send_email_address')} />
				}
			/>
			<Field
				labelWidth={62}
				label={<Label
					text="Display name"
					description={"The name we\u2019ll use when sending emails from your app."}/>
				}
				input={<TextInput
					value={fields.sender_display_name}
					onChange={setField.bind(this, 'sender_display_name')} />
				}
			/>
			<Field
				labelWidth={62}
				label={<Label
					text="Verify user emails"
					description="Automatically send a verification email on signup. The user's emailVerified field reflects their status." />
				}
				input={<Toggle
					value={fields.verify_emails}
					type={Toggle.Types.YES_NO}
					onChange={setField.bind(this, 'verify_emails')} />
				}
			/>
		</Fieldset>;

		let emailTemplatesFields = <Fieldset
			legend="Email Templates"
			description="Customize the emails sent to your users when they manage their account information.">
			<Field
				labelWidth={44}
				label={<Label text="Verification Email Subject" />}
				input={<TextInput
					value={fields.email_verification_mail_subject}
					onChange={setField.bind(this, 'email_verification_mail_subject')} />
				} />
			<Field
				labelWidth={28}
				label={<Label text="Verification Email Body" />}
				input={<TextInput
					value={fields.email_verification_mail_body}
					multiline={true}
					height={235}
					onChange={setField.bind(this, 'email_verification_mail_body')} />
				} />
			<Field
				labelWidth={44}
				label={<Label text="Password Reset Subject" />}
				input={<TextInput
					value={fields.reset_password_mail_subject}
					onChange={setField.bind(this, 'reset_password_mail_subject')} />
				} />
			<Field
				labelWidth={28}
				label={<Label text="Password Reset Email Body" />}
				input={<TextInput
					value={fields.reset_password_mail_body}
					multiline={true}
					height={235}
					onChange={setField.bind(this, 'reset_password_mail_body')} />
				} />
		</Fieldset>;

		let userFacingPagesFields = <Fieldset
			legend="Customize User-Facing Pages"
			description="These are the pages your users visit when managing their account information. You can change these pages by uploading a modified copy to your own server.">
			<Field
				labelWidth={62}
				label={<Label
					text={"Custom “choose a new password” page"}
					//getSiteDomain() is required here and not for the other templates because this template is an erb file, as opposed to the others which are html.
					description={<span>This page will be loaded when users click on a reset password link. <a href={getSiteDomain() + '/apps/choose_password'} download="choose_password.html">Download the template</a>.</span>} />
				}
				input={<TextInput
					value={fields.choose_password_link}
					placeholder="Where is it?"
					onChange={setField.bind(this, 'choose_password_link')} />
				} />
			<Field
				labelWidth={62}
				label={<Label
					text={"Custom “password changed” page"}
					description={<span>This page will be loaded when users successfully change their password. <a href="/apps/password_reset_success.html" download="password_updated.html">Download the template</a>.</span>} />
				}
				input={<TextInput
					value={fields.password_updated_link}
					placeholder="Where is it?"
					onChange={setField.bind(this, 'password_updated_link')} />
				} />
			<Field
				labelWidth={62}
				label={<Label
					text={"Custom “email verified” page"}
					description={<span>This page will be loaded when users verify their email address. <a href="/apps/verify_email_success.html" download="email_verification.html">Download the template</a>.</span>} />
				}
				input={<TextInput
					value={fields.email_verification_link}
					placeholder="Where is it?"
					onChange={setField.bind(this, 'email_verification_link')}/>
				} />
			<Field
				labelWidth={62}
				label={<Label
					text={"Custom 404 page"}
					description={<span>This page will be loaded whenever users mistype the reset password or verify email links. <a href="/apps/invalid_link.html" download="invalid_link.html">Download the template</a>.</span>} />
				}
				input={<TextInput
					value={fields.invalid_link_link}
					placeholder="Where is it?"
					onChange={setField.bind(this, 'invalid_link_link')}/>
				} />
		</Fieldset>

		let whiteLabelURLsFields = <Fieldset
			legend="Whitelabel URLs"
			description="Use this to hide the Parse.com URLs on user-facing pages.">
			<Field
				labelWidth={62}
				label={<Label
					text={"Parse Frame URL"}
					description={<span>Upload <a href="/apps/user_management" download="user_management.html">this file</a> to your server and tell us where you put it.</span>} />
				}
				input={<TextInput
					value={fields.external_frame_link}
					placeholder="Where is it?"
					onChange={setField.bind(this, 'external_frame_link')} />
				} />
		</Fieldset>;
		return <div className={styles.settings_page}>
			{hostingSubdomainFields}
			{customDomainsFields}
			{emailSettingsFields}
			{emailTemplatesFields}
			{userFacingPagesFields}
			{whiteLabelURLsFields}
			<Toolbar section='Settings' subsection='Hosting' />
		</div>;
	}

	renderContent() {
		let initialFields = {
			...(this.props.initialFields || {})
		};
		return <FlowView
			initialFields={initialFields}
			footerContents={({changes}) => renderFlowFooterChanges(changes, initialFields, hostingFieldOptions)}
			onSubmit={({ changes, setField }) => {
				let promise = new Promise();
				this.props.saveChanges(changes).then(({ successes, failures }) => {
					for (let k in successes) {
						setField(k, successes[k]);
					}
					if (Object.keys(failures).length > 0) {
						promise.reject({ error: Object.values(failures).join(' ') });
					} else {
						promise.resolve();
					}
				}).fail(({ error, failures = {} }) => {
					promise.reject({ error: unique(Object.values(failures).concat(error)).join(' ') });
				});
				return promise;
			}}
			validate={() => '' /*TODO: do some validation*/}
			renderForm={this.renderForm.bind(this)}
		/>;
	}
}

let hostingFieldOptions = {
	external_frame_link: {
		friendlyName: 'parse frame URL',
		showTo: true,
	},
	invalid_link_link: {
		friendlyName: 'custom 404 page',
	},
	choose_password_link: {
		friendlyName: 'custom "choose a new password" page',
	},
	email_verification_link: {
		friendlyName: 'custom "email verified" page'
	},
	password_updated_link: {
		friendlyName: 'custom "password changed" page',
	},

	subdomain_name: {
		friendlyName: 'subdomain name',
		showFrom: true,
		showTo: true,
	},

	send_email_address: {
		friendlyName: 'reply-to address',
		showTo: true,
	},
	sender_display_name: {
		friendlyName: 'display name',
		showTo: true,
		showFrom: true,
	},
	verify_emails: {
		friendlyName: 'user email verification',
		type: 'boolean'
	},

	host_name: {
		friendlyName: 'host name',
		showTo: true,
	},

	email_verification_mail_subject: {
		friendlyName: 'verification email subject',
	},
	email_verification_mail_body: {
		friendlyName: 'verification email body',
	},
	reset_password_mail_subject: {
		friendlyName: 'password reset subject',
	},
	reset_password_mail_body: {
		friendlyName: 'password reset email body',
	},
}
