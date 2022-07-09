/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AccountLinkField from 'dashboard/Account/AccountLinkField.react.js'
import AccountManager          from 'lib/AccountManager';
import Field                   from 'components/Field/Field.react';
import Fieldset                from 'components/Fieldset/Fieldset.react';
import FlowView                from 'components/FlowView/FlowView.react';
import FormButton              from 'components/FormButton/FormButton.react';
import FormModal               from 'components/FormModal/FormModal.react';
import FormTable               from 'components/FormTable/FormTable.react';
import getSiteDomain           from 'lib/getSiteDomain';
import KeyField                from 'components/KeyField/KeyField.react';
import Label                   from 'components/Label/Label.react';
import Modal                   from 'components/Modal/Modal.react';
import MoneyInput              from 'components/MoneyInput/MoneyInput.react';
import React                   from 'react';
import renderFlowFooterChanges from 'lib/renderFlowFooterChanges';
import styles                  from 'dashboard/Settings/Settings.scss';
import TextInput               from 'components/TextInput/TextInput.react';
import Toolbar                 from 'components/Toolbar/Toolbar.react';
import { dateStringUTC }       from 'lib/DateUtils';

const DEFAULT_LABEL_WIDTH = 56;
const XHR_KEY = 'AccountOverview';

export default class AccountOverview extends React.Component {
  constructor() {
    super();
    this.state = {
      showChangePasswordModal: false,
      currentPassword: '',
      newPassword: '',
      email: AccountManager.currentUser().email,
      name: AccountManager.currentUser().name,

      showAccountKeyModal: false,
      accountKeyName: '',

      showNewAccountKeyModal: false,
      newAccountKey: '',

      showDeleteAccountKeyModal: false,
      accountKeyIdToDelete: 0,

      linkedAccounts: null,

      saveState: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    AccountManager.fetchLinkedAccounts(XHR_KEY).then((linkedAccounts) => {
      if (this.mounted) {
        this.setState({ linkedAccounts });
      }
    });
  }

  componentWillUnmount() {
    AccountManager.abortFetch(XHR_KEY);
  }

  renderForm({fields}) {
    let accountInfoFields = <Fieldset
      legend='Account Info'
      description='Update the personal information linked to this account.'>
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label
          text='Change your login information'
          description='This is where you can change your email address or password.' />
        }
        input={<FormButton
          value='Change my login information'
          onClick={() => {
            this.setState({showChangePasswordModal: true});
          }} />
        } />
    </Fieldset>;

    let linkedAccountsFields = this.state.linkedAccounts !== null ?
      <Fieldset
          legend='Linked Accounts'
          description='Manage the accounts you have linked to Parse.' >
        <AccountLinkField
          serviceName='Facebook'
          metadata={this.state.linkedAccounts['facebook']} />
        <AccountLinkField
          serviceName='GitHub'
          metadata={this.state.linkedAccounts['github']} />
        <AccountLinkField
          serviceName='Google'
          metadata={this.state.linkedAccounts['google_oauth2']} />
        <AccountLinkField
          serviceName='Heroku'
          metadata={this.state.linkedAccounts['heroku']} />
      </Fieldset> : null;

    let accountKeysFields = <Fieldset
      legend='Account Keys'
      description='These allow you to access your Parse apps without using a password.'>
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text='Create an account key' />}
        input={<FormButton
          value='Create an account key'
          onClick={() => {
            this.setState({showAccountKeyModal: true});
          }} />
        } />
      { AccountManager.currentUser().account_keys.length > 0 ? <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text='Existing keys' />}
        input={<FormTable
          items={AccountManager.currentUser().account_keys.map(key => ({
            title: key.name,
            onDelete: () => {
              this.setState({
                accountKeyIdToDelete: key.id,
                showDeleteAccountKeyModal: true,
              });
            },
            //TODO do fancy colors for (almost) expired keys, like push certs
            color: 'green',
            notes: [
              {
                key: 'Key',
                value: '\u2022\u2022' + key.token,
                strong: true,
              },
              {
                key: 'Expires',
                value: dateStringUTC(new Date(key.expiresAt)),
              },
            ],
          }))} />
        } /> : null}
    </Fieldset>;

    let billingInfoFields = <Fieldset
      legend='Billing Info'
      description='Update your payment information.'>
      {fields.accountCredit > 0 ? <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label
          text='Account credit'
          description={'If you incur any expenses, we\u2019ll use this first'} />
        }
        input={<MoneyInput
          value={fields.accountCredit}
          enabled={false}
          onChange={() => {}} />
        } /> : null}
      { /* TODO
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text='Credit card number' />}
        input={<CreditCardInput
          value={fields.cc}
          lastFour={fields.cc_last4}
          onChange={setField.bind(null, 'cc')}
        />} />
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text='Expiration date (MM/YYYY)' />}
        input={<TextInput
          value={fields.ccExp}
          onChange={value => {
            //TODO(drewgross) build a better component for this
            setField('ccExp', value.replace(/[^\d \/]/g, ''));
          }}
        />} />
      <Field
        labelWidth={62}
        label={<Label text='Security code' />}
        input={<TextInput
          value={fields.ccSecurityCode}
          onChange={value => {
            //TODO(drewgross) build a better component for this
            setField('ccSecurityCode', value.substring(0,4));
          }} />
        } />
      */ }
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text='Credit card information' />}
        input={<FormButton
          value='Update credit card'
          onClick={() => {
            window.open(`${getSiteDomain()}/credit_card/new`);
          }} />
        } />
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text='Billing statements' />}
        input={<FormButton
          value='View billing statements'
          onClick={() => {
            window.open(`${getSiteDomain()}/account/plan`);
          }} />
        } />

    </Fieldset>;

    let changePasswordModal = <FormModal
      title='Change your login information'
      icon='users-solid'
      iconSize={30}
      open={this.state.showChangePasswordModal}
      onSubmit={() => {
        return AccountManager.resetPasswordAndEmailAndName(this.state.currentPassword, this.state.newPassword, this.state.email, this.state.name);
      }}
      onClose={() => {
        this.setState({showChangePasswordModal: false});
      }}
      submitText='Change'
      inProgressText={'Changing\u2026'}
      clearFields={() => {
        this.setState({
          currentPassword: '',
          newPassword: '',
        });
      }}
      enabled={this.state.currentPassword.length > 0 && (this.state.newPassword.length > 0 || this.state.email.length > 0)}>
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text={'What\u2019s your name?'} />}
        input={<TextInput
          value={this.state.name}
          onChange={value => {
            this.setState({
              name: value,
            });
          }} />
        } />
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label
          text={'What\u2019s your email address?'}
          description='This is where we send your password reset instructions.' />
        }
        input={<TextInput
          value={this.state.email}
          onChange={value => {
            this.setState({
              email: value,
            });
          }} />
        } />

      <Field
        label={<Label text={'Your new password'} />}
        labelWidth={DEFAULT_LABEL_WIDTH}
        input={<TextInput
          value={this.state.newPassword}
          onChange={newValue => {
            this.setState({newPassword: newValue});
          }}
          hidden={true} />} />
      <Field
        labelWidth={DEFAULT_LABEL_WIDTH}
        label={<Label text={'Your current password'} />}
        input={<TextInput
          value={this.state.currentPassword}
          onChange={newValue => {
            this.setState({currentPassword: newValue});
          }}
          hidden={true} />} />
    </FormModal>;

    let accountKeyModal = <FormModal
      title='Create an account key'
      icon='keys-solid'
      iconSize={30}
      open={this.state.showAccountKeyModal}
      onSubmit={() => {
        return AccountManager.createAccountKey(this.state.accountKeyName);
      }}
      onSuccess={newKey => {
        this.setState({
          showNewAccountKeyModal: true,
          newAccountKey: newKey.token,
        });
      }}
      onClose={() => {
        this.setState({showAccountKeyModal: false});
      }}
      submitText='Create'
      inProgressText={'Creating\u2026'}
      clearFields={() => {
        this.setState({accountKeyName: ''});
      }}
      enabled={this.state.accountKeyName.length > 0}>
      <Field
        label={<Label text='Name your key' />}
        input={<TextInput
          value={this.state.accountKeyName}
          onChange={newValue => {
            this.setState({accountKeyName: newValue});
          }}
          placeholder='Work Laptop' /> } />
    </FormModal>

    let newAccountKeyModal = this.state.showNewAccountKeyModal ? <Modal
      title='Key Created!'
      subtitle={'Copy it now, you won’t be able to see it again.'}
      icon='check'
      iconSize={30}
      type={Modal.Types.VALID}
      confirmText='Got it!'
      showCancel={false}
      onConfirm={() => {
        this.setState({
          showNewAccountKeyModal: false,
          newAccountKey: '',
        });
      }}
      buttonsInCenter={true}>
      <KeyField>
        {this.state.newAccountKey}
      </KeyField>
    </Modal> : null;

    let deleteAccountKeyModal = <FormModal
      title='Are you sure?'
      subtitle='If you delete this account key, anything that was using it will stop working.'
      type={Modal.Types.DANGER}
      open={this.state.showDeleteAccountKeyModal}
      submitText='Delete'
      inProgressText={'Deleting\u2026'}
      onSubmit={() => {
        return AccountManager.deleteAccountKeyById(this.state.accountKeyIdToDelete);
      }}
      onClose={() => {
        this.setState({showDeleteAccountKeyModal: false});
      }}
      clearFields={() => {
        this.setState({accountKeyIdToDelete: 0});
      }} />

    return <div className={styles.settings_page}>
      {accountInfoFields}
      {accountKeysFields}
      {linkedAccountsFields}
      {billingInfoFields}
      <Toolbar section='Account' subsection='Settings' />
      {changePasswordModal}
      {accountKeyModal}
      {newAccountKeyModal}
      {deleteAccountKeyModal}
    </div>;
  }

  render() {
    let user = AccountManager.currentUser();
    let initialFields = {
      accountCredit: user.stripe_credit,
      cc_last4: user.cc_last4, //null means user has not added a credit card
      ccSecurityCode: '',
      ccExp: '',
    }
    return <FlowView
      initialFields={initialFields}
      footerContents={({changes}) => renderFlowFooterChanges(changes, initialFields, accountOverviewFooterSettings)}
      onSubmit={() => {
        let promiseList = [];
        /* eslint-disable */
        if (changes.cc !== undefined) {
          //TODO change credit card number
        }
        /* eslint-enable */
        return Promise.all(promiseList);
      }}
      renderForm={this.renderForm.bind(this)} />;
  }
}

let accountOverviewFooterSettings = {
  cc: {
    friendlyName: 'credit card information',
  },
}
