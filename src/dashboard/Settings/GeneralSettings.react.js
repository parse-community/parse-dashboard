/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AccountManager                    from 'lib/AccountManager';
import AppsManager                       from 'lib/AppsManager';
import Collaborators                     from 'dashboard/Settings/Collaborators.react';
import DashboardView                     from 'dashboard/DashboardView.react';
import Dropdown                          from 'components/Dropdown/Dropdown.react';
import DropdownOption                    from 'components/Dropdown/Option.react';
import Field                             from 'components/Field/Field.react';
import Fieldset                          from 'components/Fieldset/Fieldset.react';
import FlowView                          from 'components/FlowView/FlowView.react';
import FormButton                        from 'components/FormButton/FormButton.react';
import FormModal                         from 'components/FormModal/FormModal.react';
import FormNote                          from 'components/FormNote/FormNote.react';
import getSiteDomain                     from 'lib/getSiteDomain';
import joinWithFinal                     from 'lib/joinWithFinal';
import KeyField                          from 'components/KeyField/KeyField.react';
import Label                             from 'components/Label/Label.react';
import Modal                             from 'components/Modal/Modal.react';
import MultiSelect                       from 'components/MultiSelect/MultiSelect.react';
import MultiSelectOption                 from 'components/MultiSelect/MultiSelectOption.react';
import pluck                             from 'lib/pluck';
import Range                             from 'components/Range/Range.react';
import React                             from 'react';
import renderFlowFooterChanges           from 'lib/renderFlowFooterChanges';
import setDifference                     from 'lib/setDifference';
import settingsStyles                    from 'dashboard/Settings/Settings.scss';
import TextInput                         from 'components/TextInput/TextInput.react';
import Toggle                            from 'components/Toggle/Toggle.react';
import Toolbar                           from 'components/Toolbar/Toolbar.react';
import unique                            from 'lib/unique';
import validateAndSubmitConnectionString from 'lib/validateAndSubmitConnectionString';
import styles                            from 'dashboard/Settings/GeneralSettings.scss';
import { Link, useNavigate }             from 'react-router-dom';
import { withRouter } from 'lib/withRouter';

const DEFAULT_SETTINGS_LABEL_WIDTH = 62;

let numJobsFromRequestLimit = (limit) => Math.floor((limit-10)/20);

let CurrentPlan = ({requestLimit}) => {
  let costString = requestLimit === 30 ?
    'Free' :
    '$' + ((requestLimit-30) * 10).toString();
  return (
    <div>
      <div className={styles.cost}>{costString}</div>
      <div className={styles.features}>{requestLimit.toString() + ' requests per second'}<br/>{numJobsFromRequestLimit(requestLimit).toString() + ' background job' + (numJobsFromRequestLimit(requestLimit) > 1 ? 's' : '')}</div>
    </div>
)};

let CurrentPlanFields = ({
  visible,
  requestLimit,
  setRequestLimit,
}) => visible ? <Fieldset
  legend='Current Plan'
  description={'Adjust your pricing and your app\u2019s request limit'}>
  <Field
    labelWidth={40}
    label={<Label
      text='Scale your app'
      description='This will take effect as soon as you save your changes.' />}
    input={<Range
      min={0}
      max={600}
      step={10}
      color='#169CEE'
      value={requestLimit}
      track={true}
      units={value => {
        let numJobs = numJobsFromRequestLimit(value);
        return value + 'req/s & ' + numJobs + ' job' + (numJobs == 1 ? '' : 's')
      }}
      width={220}
      onChange={limit => {
        if (limit < 30) {
          limit = 30;
        }
        setRequestLimit(limit);
      }} />} />
  <Field
    labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
    label={<Label text='Your plan' />}
    input={<CurrentPlan requestLimit={requestLimit} />} />
</Fieldset> : <noscript/>;

let AppInformationFields = ({
  appName,
  setAppName,
  inProduction,
  setInProduction,
  iTunesURL,
  setiTunesURL,
  googlePlayURL,
  setGooglePlayURL,
  windowsAppStoreURL,
  setWindowsAppStoreURL,
  webAppURL,
  setWebAppURL,
  otherURL,
  setOtherURL,
}) => <Fieldset
  legend='App Information'
  description='Update general information about your app.'>
  <Field
    labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
    label={<Label text='App name' />}
    input={<TextInput
      value={appName}
      onChange={setAppName} />
    } />
  <Field
    labelWidth={58}
    label={<Label
      text='In production?'
      description='Flip this switch when you launch. This will help us track your traffic and allow us to properly scale your app.' />}
    input={<Toggle
      value={inProduction}
      type={Toggle.Types.YES_NO}
      onChange={setInProduction} />
    } />
  { inProduction ? <div>
    <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label text='iTunes App Store URL' />}
      input={<TextInput
        value={iTunesURL}
        placeholder='Where is it?'
        onChange={setiTunesURL} />
      } />
    <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label text='Google Play Store URL' />}
      input={<TextInput
        value={googlePlayURL}
        placeholder='Where is it?'
        onChange={setGooglePlayURL} />
      } />
    <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label text='Windows App Store URL' />}
      input={<TextInput
        value={windowsAppStoreURL}
        placeholder='Where is it?'
        onChange={setWindowsAppStoreURL} />
      } />
    <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label text='Web App URL' />}
      input={<TextInput
        value={webAppURL}
        placeholder='Where is it?'
        onChange={setWebAppURL} />
      } />
    <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label text='Other URL' />}
      input={<TextInput
        value={otherURL}
        placeholder='Where is it?'
        onChange={setOtherURL} />
      } />
  </div> : null }
</Fieldset>;

let CollaboratorsFields = ({
  collaborators,
  ownerEmail,
  viewerEmail,
  addCollaborator,
  removeCollaborator,
}) => <Collaborators
  legend='Collaborators'
  description='Team up and work together with other people.'
  collaborators={collaborators}
  owner_email={ownerEmail}
  viewer_email={viewerEmail}
  onAdd={addCollaborator}
  onRemove={removeCollaborator} />;

let ManageAppFields = ({
  isCollaborator,
  hasCollaborators,
  mongoURL,
  changeConnectionString,
  startMigration,
  hasInProgressMigration,
  appSlug,
  cleanUpFiles,
  cleanUpFilesMessage,
  cleanUpMessageColor = 'orange',
  exportData,
  exportDataMessage,
  exportMessageColor = 'orange',
  cloneApp,
  cloneAppMessage,
  transferApp,
  transferAppMessage,
  deleteApp,
}) => {
  const navigate = useNavigate();
  let migrateAppField = null;
  if (!mongoURL && !hasInProgressMigration) {
    migrateAppField = <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label
        text='Migrate to external database'
        description='Move your data and queries to your own database.' />
      }
      input={<FormButton
        color='red'
        onClick={startMigration}
        value='Migrate' />
      } />;
  } else if (hasInProgressMigration) {
    migrateAppField = <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label
        text='Migrate to external database'
        description='View your migration progress.' />}
      input={<FormButton
        color='blue'
        onClick={() => navigate(`/apps/${appSlug}/migration`)}
        value='View progress' />} />
  } else {
    migrateAppField = [<Field
      key='show'
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label
        text='Migration complete'
        description='Your database has been migrated to an external database.'
      />}
      //TODO: KeyField bascially does what we want, but is maybe too specialized. Maybe at some point we should have a component dedicated to semi-secret stuff that we want to prevent shoulder surfers from seeing, and emphasizing that stuff something should be secret.
      input={<KeyField
        hidden={true}
        whenHiddenText='Show connection string'
      >
        <TextInput
          value={mongoURL}
          onChange={() => {}} //Make propTypes happy
          disabled={true}
          monospace={true}
        />
      </KeyField>}
    />,
    <Field
      key='new'
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label
        text='Change connection string'
        description='Upgrate or change your database.'/>}
      input={<FormButton
        additionalStyles={{fontSize: '13px'}}
        color='red'
        onClick={changeConnectionString}
        value='Change connection string' />} />
    ];
  }
  return (
    <Fieldset
    legend='App Management'
    description='These options will affect your entire app.' >
    <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label
        text='Clean up app'
        description={<span>This will delete any files that <br/>are not referenced by any objects.</span>} />}
      input={<FormButton
        onClick={cleanUpFiles}
        value='Clean Up Files'/>} />
    {cleanUpFilesMessage ? <FormNote
      show={true}
      color={cleanUpMessageColor}>
      <div>{cleanUpFilesMessage}</div>
    </FormNote> : null}
    <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label
        text='Export app data'
        description={'We firmly believe in data portability.'} />}
      //TODO: Add export progress view when designs are ready.
      input={<FormButton
        onClick={exportData}
        value='Export Data'/>} />
    {exportDataMessage ? <FormNote
      show={true}
      color={exportMessageColor}>
      <div>{exportDataMessage}</div>
    </FormNote> : null}
    {migrateAppField}
    <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label
        text='Clone app'
        description={<span>Choose what you want to carry over <br/>and create a copy of this Parse app.</span>} />}
      input={<FormButton
        value='Clone this app'
        onClick={cloneApp} />
      } />
    {cloneAppMessage ? <FormNote
      show={true}
      color='green'>
      <div>{cloneAppMessage} Check out the progress on your <Link to='/apps'>apps page</Link>!</div>
    </FormNote> : null}
    {!isCollaborator ? <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label
        text='Transfer app'
        description={<span>Give an existing collaborator <br/>ownership over this app.</span>} />
      }
      input={<FormButton
        value='Transfer this app'
        color='red'
        disabled={!hasCollaborators}
        onClick={transferApp} />
      } /> : null}
    {transferAppMessage ? <FormNote
      color='green'>
      {transferAppMessage}
    </FormNote> : null}
    {!isCollaborator ? <Field
      labelWidth={DEFAULT_SETTINGS_LABEL_WIDTH}
      label={<Label
        text='Delete app'
        description={<span>Completely remove any trace <br/>of this app's existence.</span>} />}
      input={<FormButton
        color='red'
        value='Delete this app'
        onClick={deleteApp} />
      } /> : null}
  </Fieldset>);
}

@withRouter
class GeneralSettings extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'General';

    this.state = {
      cleanupFilesMessage: '',
      cleanupNoteColor: '',

      exportDataMessage: '',
      exportDataColor: '',

      password: '',

      showTransferAppModal: false,
      transferNewOwner: '',
      transferAppSuccessMessage: '',

      showDeleteAppModal: false,

      showCloneAppModal: false,
      cloneAppMessage: '',
      cloneAppName:'',
      cloneOptionsSelection: ['schema', 'app_settings', 'config', 'cloud_code'],

      showMigrateAppModal: false,
      migrationMongoURL: '',
      migrationWarnings: [],
      //TODO: modify FormModal to clear errors when it's content changes, then this hack will be unnecessary.
      showMongoConnectionValidationErrors: true,

      showChangeConnectionStringModal: false,
      newConnectionString: '',

      removedCollaborators: [],
    };
  }

  renderContent() {
    if (!this.props.initialFields) {
      return <Toolbar section='Settings' subsection='General' />
    }
    let passwordField = (
      <Field
        labelWidth={60}
        label={<Label
          text='Your password'
          description={'We want to make sure it\u2019s really you.'} />
        }
        input={<TextInput
          hidden={true}
          value={this.state.password}
          placeholder='Password'
          onChange={(newValue) => {
            this.setState({password: newValue});
          }} />} />
    )

    let closeModalWithConnectionString = () => this.setState({
      showChangeConnectionStringModal: false,
      showMigrateAppModal: false,
      showMongoConnectionValidationErrors: false,
      migrationWarnings: [],
    });

    let migrateAppModal = <FormModal
      title='Migrate app'
      subtitle='Begin migrating data to your own database.'
      icon='gear-solid'
      iconSize={30}
      type={Modal.Types.DANGER}
      open={this.state.showMigrateAppModal}
      submitText={this.state.migrationWarnings && this.state.migrationWarnings.length > 0 ? 'Migrate anyway' : 'Migrate'}
      inProgressText={'Migrating\u2026'}
      showErrors={this.state.showMongoConnectionValidationErrors}
      width={900}
      onSubmit={() => {
        let promise = validateAndSubmitConnectionString(
          this.state.migrationMongoURL,
          this.state.migrationWarnings,
          warnings => this.setState({migrationWarnings: warnings}),
          connectionString => this.context.beginMigration(connectionString)
        );
        promise.catch(({ error }) => this.setState({showMongoConnectionValidationErrors: error !== 'Warnings'}));
        return promise;
      }}
      onClose={closeModalWithConnectionString}
      onSuccess={() => this.props.navigate(`/apps/${this.context.slug}/migration`)}
      clearFields={() => this.setState({
        migrationMongoURL: '',
        migrationWarnings: [],
      })}>
      <Field
        labelWidth={40}
        label={<Label
          text='Your database connection string.'
          description={<span>This database must be prepared to handle all of your app's queries and data. Read <a href={getSiteDomain() + '/docs/server/guide#migrating'}>our migration guide</a> to learn how to create a database.</span>} />
        }
        input={<TextInput
          height={100}
          placeholder='mongodb://...'
          value={this.state.migrationMongoURL}
          onChange={value => this.setState({
            migrationMongoURL: value,
            migrationWarnings: [],
            showMongoConnectionValidationErrors: false,
          })} />} />
      {this.state.migrationWarnings.map(warning => <FormNote key={warning} show={true} color='orange'>{warning}</FormNote>)}
    </FormModal>;

    let changeConnectionStringModal = <FormModal
      title='Change Connection String'
      subtitle={'Immediately switch your connection string for your app\'s database.'}
      open={this.state.showChangeConnectionStringModal}
      onSubmit={() => {
        let promise = validateAndSubmitConnectionString(
          this.state.newConnectionString,
          this.state.migrationWarnings,
          warnings => this.setState({migrationWarnings: warnings}),
          connectionString => this.context.changeConnectionString(connectionString)
        );
        promise.catch(({ error }) => this.setState({showMongoConnectionValidationErrors: error !== 'Warnings'}));
        return promise;
      }}
      onClose={closeModalWithConnectionString}
      type={Modal.Types.DANGER}
      submitText={this.state.migrationWarnings && this.state.migrationWarnings.length > 0 ? 'Change anyway' : 'Change'}
      inProgressText={'Changing\u2026'}
      showErrors={this.state.showMongoConnectionValidationErrors}
      width={900}
      clearFields={() => this.setState({
        migrationMongoURL: '',
        migrationWarnings: [],
      })}>
      <Field
        labelWidth={40}
        label={<Label
          text='Your database connection string'
          description='Specify a valid mongo connection string.' />}
        input={<TextInput
          placeholder='mongodb://...'
          value={this.state.newConnectionString}
          onChange={value => this.setState({
            newConnectionString: value,
            migrationWarnings: [],
            showMongoConnectionValidationErrors: false,
          })} />} />
      {this.state.migrationWarnings.map(warning => <FormNote key={warning}show={true} color='orange'>{warning}</FormNote>)}
    </FormModal>

    let transferAppModal = <FormModal
      title='Transfer App Ownership'
      subtitle='This is an irreversible action!'
      icon='users-solid'
      iconSize={30}
      type={Modal.Types.DANGER}
      open={this.state.showTransferAppModal}
      submitText='Transfer'
      inProgressText={'Transferring\u2026'}
      enabled={
        (this.state.password.length > 0 || !AccountManager.currentUser().has_password)
        && this.state.transferNewOwner.length > 0
      }
      onSubmit={() => AppsManager.transferApp(this.context.slug, this.state.transferNewOwner, this.state.password)}
      onClose={() => this.setState({showTransferAppModal: false})}
      onSuccess={({ message }) => this.setState({transferAppSuccessMessage: message})}
      clearFields={() => this.setState({
        password: '',
        transferNewOwner: '',
        })}>
      <Field
        labelWidth={60}
        label={<Label
          text='Choose new owner'
          description='The new owner must already be a collaborator.' />
        }
        input={<Dropdown
          fixed={true}
          value={this.state.transferNewOwner}
          onChange={(collaborator) => this.setState({transferNewOwner: collaborator})}>
            {((this.props.initialFields||{}).collaborators||[]).map(collaborator =>
              <DropdownOption key={collaborator.id.toString()} value={collaborator.userEmail}>{collaborator.userEmail}</DropdownOption>
            )}
        </Dropdown>} />
      {AccountManager.currentUser().has_password ? passwordField : null}
    </FormModal>;

    let deleteAppModal = <FormModal
      title='Delete App'
      icon='trash-solid'
      iconSize={30}
      subtitle='This is an irreversible action!'
      type={Modal.Types.DANGER}
      open={this.state.showDeleteAppModal}
      submitText='Delete'
      inProgressText={'Deleting\u2026'}
      enabled={this.state.password.length > 0}
      onSubmit={() => AppsManager.deleteApp(this.context.slug, this.state.password)}
      onSuccess={() => this.props.navigate('/apps')}
      onClose={() => this.setState({showDeleteAppModal: false})}
      clearFields={() => this.setState({password: ''})}>
      {passwordField}
    </FormModal>

    let cloneAppModal = <FormModal
      title='Clone App'
      icon='files-outline'
      iconSize={30}
      subtitle='Create a copy of this app'
      submitText='Clone'
      inProgressText={'Cloning\u2026'}
      open={this.state.showCloneAppModal}
      enabled={this.state.cloneAppName.length > 0}
      onSubmit={() => {
        this.setState({
          cloneAppMessage: '',
        });
        return AppsManager.cloneApp(this.context.slug, this.state.cloneAppName, this.state.cloneOptionsSelection)
      }}
      onSuccess={({notice}) => this.setState({cloneAppMessage: notice})}
      onClose={() => this.setState({showCloneAppModal: false})}
      clearFields={() => this.setState({
        cloneAppName: '',
        cloneOptionsSelection: ['schema', 'app_settings', 'config', 'cloud_code'],
      })}>
      <Field
        labelWidth={50}
        label={<Label text='Name your cloned app' />}
        input={<TextInput
          value={this.state.cloneAppName}
          onChange={value => this.setState({cloneAppName: value})
        } /> } />
      <Field
        labelWidth={35}
        label={<Label text='What should we include in the clone?' />}
        input={<MultiSelect
          fixed={true}
          value={this.state.cloneOptionsSelection}
          onChange={options => this.setState({cloneOptionsSelection: options})}
        >
          <MultiSelectOption value='schema'>Schema</MultiSelectOption>
          <MultiSelectOption value='app_settings'>App Settings</MultiSelectOption>
          <MultiSelectOption value='config'>Config</MultiSelectOption>
          <MultiSelectOption value='cloud_code'>Cloud Code</MultiSelectOption>
          <MultiSelectOption value='background_jobs'>Background Jobs</MultiSelectOption>
        </MultiSelect>} />
    </FormModal>;

    let iosUrl = this.props.initialFields.urls.find(({ platform }) => platform === 'ios');
    let anrdoidUrl = this.props.initialFields.urls.find(({ platform }) => platform === 'android');
    let windowsUrl = this.props.initialFields.urls.find(({ platform }) => platform === 'win');
    let webUrl = this.props.initialFields.urls.find(({ platform }) => platform === 'web');
    let otherURL = this.props.initialFields.urls.find(({ platform }) => platform === 'other');

    let initialFields = {
      requestLimit: this.props.initialFields.pricing_plan.request_limit,
      appName: this.context.name,
      inProduction: this.context.production,
      iTunesURL: iosUrl ? iosUrl.url : '',
      googlePlayURL: anrdoidUrl ? anrdoidUrl.url : '',
      windowsAppStoreURL: windowsUrl ? windowsUrl.url : '',
      webAppURL: webUrl ? webUrl.url : '',
      otherURL: otherURL ? otherURL.url : '',
      collaborators: this.props.initialFields.collaborators,
      mongoURL: this.context.settings.fields.fields.opendb_connection_string,
    };

    let collaboratorRemovedWarningModal = this.state.removedCollaborators.length > 0 ? <Modal
      title='Check Master Key Access'
      icon='keys-solid'
      type={Modal.Types.DANGER}
      showCancel={false}
      confirmText='Got it!'
      onConfirm={() => this.setState({removedCollaborators: []})}
      buttonsInCenter={true}
      textModal={true}>
      <span>We have removed <strong>{joinWithFinal('', this.state.removedCollaborators.map(c => c.userName || c.userEmail), ', ', ' and ')}</strong> from this app. If they had saved the master key, they may still have access via an SDK or the API. To be sure, you can reset your master key in the Keys section of app settings.</span>
    </Modal> : null;
    let setCollaborators = (setField, unused, allCollabs) => {
      let addedCollaborators = setDifference(allCollabs, initialFields.collaborators, compareCollaborators);
      let removedCollaborators = setDifference(initialFields.collaborators, allCollabs, compareCollaborators);
      if (addedCollaborators.length === 0 && removedCollaborators.length === 0) {
        //This is neccessary because the footer computes whether or not show a change by reference equality.
        allCollabs = initialFields.collaborators;
      }
      setField('collaborators', allCollabs);
    };

    return <div>
      <FlowView
        initialFields={initialFields}
        footerContents={({changes}) => renderFlowFooterChanges(changes, initialFields, generalFieldsOptions)}
        onSubmit={({ changes }) => {
          let promiseList = [];
          if (changes.requestLimit !== undefined) {
            promiseList.push(this.context.setRequestLimit(changes.requestLimit));
          }
          if (changes.appName !== undefined) {
            promiseList.push(this.context.setAppName(changes.appName));
          }
          if (changes.inProduction !== undefined) {
            promiseList.push(this.context.setInProduction(changes.inProduction));
          }

          let addedCollaborators = setDifference(changes.collaborators, initialFields.collaborators, compareCollaborators);
          addedCollaborators.forEach(({ userEmail }) => {
            promiseList.push(this.context.addCollaborator(userEmail));
          });

          let removedCollaborators = setDifference(initialFields.collaborators, changes.collaborators, compareCollaborators);
          removedCollaborators.forEach(({ id }) => {
            promiseList.push(this.context.removeCollaboratorById(id));
          });

          let urlKeys = {
            iTunesURL: 'ios',
            googlePlayURL: 'android',
            windowsAppStoreURL: 'win',
            webAppURL: 'web',
            otherURL: 'other',
          }

          Object.keys(urlKeys).forEach(key => {
            if (changes[key] !== undefined) {
              promiseList.push(this.context.setAppStoreURL(urlKeys[key], changes[key]));
            }
          });

          return Promise.all(promiseList).then(() => {
            this.forceUpdate(); //Need to forceUpdate to see changes applied to source ParseApp
            this.setState({ removedCollaborators: removedCollaborators });
          }).catch(errors => {
            return Promise.reject({ error: unique(pluck(errors, 'error')).join(' ')});
          });
        }}
        renderForm={({ fields, setField }) => {
          let isCollaborator = AccountManager.currentUser().email !== this.props.initialFields.owner_email;
          return <div className={settingsStyles.settings_page}>
            <CurrentPlanFields
              visible={!isCollaborator}
              requestLimit={fields.requestLimit}
              setRequestLimit={setField.bind(this, 'requestLimit')}/>
            <AppInformationFields
              appName={fields.appName}
              setAppName={setField.bind(this, 'appName')}
              inProduction={fields.inProduction}
              setInProduction={setField.bind(this, 'inProduction')}
              iTunesURL={fields.iTunesURL}
              setiTunesURL={setField.bind(this, 'iTunesURL')}
              googlePlayURL={fields.googlePlayURL}
              setGooglePlayURL={setField.bind(this, 'googlePlayURL')}
              windowsAppStoreURL={fields.windowsAppStoreURL}
              setWindowsAppStoreURL={setField.bind(this, 'windowsAppStoreURL')}
              webAppURL={fields.webAppURL}
              setWebAppURL={setField.bind(this, 'webAppURL')}
              otherURL={fields.otherURL}
              setOtherURL={setField.bind(this, 'otherURL')} />
            <CollaboratorsFields
              collaborators={fields.collaborators}
              ownerEmail={this.props.initialFields.owner_email}
              viewerEmail={AccountManager.currentUser().email}
              addCollaborator={setCollaborators.bind(undefined, setField)}
              removeCollaborator={setCollaborators.bind(undefined, setField)}/>
            <ManageAppFields
              mongoURL={fields.mongoURL}
              changeConnectionString={() => this.setState({showChangeConnectionStringModal: true})}
              isCollaborator={isCollaborator}
              hasCollaborators={initialFields.collaborators.length > 0}
              startMigration={() => this.setState({showMigrateAppModal: true})}
              hasInProgressMigration={!!this.context.migration}
              appSlug={this.context.slug}
              cleanUpFiles={() => this.context.cleanUpFiles().then(result => {
                this.setState({
                  cleanupFilesMessage: result.notice,
                  cleanupNoteColor: 'orange',
                });
              }).catch((e) => {
                this.setState({
                  cleanupFilesMessage: e.error,
                  cleanupNoteColor: 'red',
                });
              })}
              cleanUpFilesMessage={this.state.cleanupFilesMessage}
              cleanUpMessageColor={this.state.cleanupNoteColor}
              exportData={() => this.context.exportData().then((result) => {
                this.setState({
                  exportDataMessage: result.notice,
                  exportDataColor: 'orange',
                });
              }).catch((e) => {
                this.setState({
                  exportDataMessage: e.error,
                  exportDataColor: 'red',
                });
              })}
              exportDataMessage={this.state.exportDataMessage}
              exportMessageColor={this.state.exportDataColor}
              cloneApp={() => this.setState({
                showCloneAppModal: true,
                cloneAppMessage: '',
              })}
              cloneAppMessage={this.state.cloneAppMessage}
              transferApp={() => this.setState({
                showTransferAppModal: true,
                transferAppSuccessMessage: '',
              })}
              transferAppMessage={this.state.transferAppSuccessMessage}
              deleteApp={() => this.setState({showDeleteAppModal: true})}/>
          </div>;
        }} />
      {migrateAppModal}
      {transferAppModal}
      {deleteAppModal}
      {cloneAppModal}
      {collaboratorRemovedWarningModal}
      {changeConnectionStringModal}
      <Toolbar section='Settings' subsection='General' />
    </div>;
  }
}

let compareCollaborators = (collab1, collab2) => collab1.userEmail === collab2.userEmail;

let generalFieldsOptions = {
  requestLimit: {
    friendlyName: 'request limit',
    showTo: true,
    showFrom: true,
  },
  appName: {
    friendlyName: 'app name',
    showTo: true,
  },
  //TODO: This will display 'enabled production' or 'disabled production' which is sub-optimal. Try to make it better.
  inProduction: {
    friendlyName: 'production',
    type: 'boolean',
  },
  collaborators: {
    friendlyName: 'collaborator',
    friendlyNamePlural: 'collaborators',
    type: 'set',
    equalityPredicate: compareCollaborators,
  },
  iTunesURL: {
    friendlyName: 'iTunes URL',
  },
  googlePlayURL: {
    friendlyName: 'Play Store URL',
  },
  windowsAppStoreURL: {
    friendlyName: 'Windows App Store URL',
  },
  webAppURL: {
    friendlyName: 'web URL',
  },
  otherURL: {
    friendlyName: 'other URL',
  },
};

export default GeneralSettings;
