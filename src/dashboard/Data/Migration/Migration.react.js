/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import base                                         from 'stylesheets/base.scss';
import Button                                       from 'components/Button/Button.react';
import DashboardView                                from 'dashboard/DashboardView.react';
import FormNote                                     from 'components/FormNote/FormNote.react';
import Icon                                         from 'components/Icon/Icon.react';
import LiveReload                                   from 'components/LiveReload/LiveReload.react';
import LoaderContainer                              from 'components/LoaderContainer/LoaderContainer.react';
import MigrationStep                                from 'dashboard/Data/Migration/MigrationStep.react';
import Modal                                        from 'components/Modal/Modal.react';
import prettyNumber                                 from 'lib/prettyNumber';
import React                                        from 'react';
import styles                                       from 'dashboard/Data/Migration/Migration.scss';
import Toolbar                                      from 'components/Toolbar/Toolbar.react';
import { AsyncStatus }                              from 'lib/Constants';
import { horizontalCenter, verticalCenter, center } from 'stylesheets/base.scss';

const MIGRATION_INVALID = 0;
const MIGRATION_NOTSTARTED = 1;
const MIGRATION_INITIALSYNC = 2;
const MIGRATION_OPLOGREPLAY = 3;
const MIGRATION_COMMITREADY = 4;
const MIGRATION_FINISH = 5;
const MIGRATION_DONE = 6;
const MIGRATION_FATALED = 7;
const MIGRATION_STOPPED = 8;

let StatusBarNote = ({note, value}) => <span className={styles.statusNote}>
  {note}<span className={styles.infoText}>{value}</span>
</span>;

let StatusBar = ({
  errorMessage,
  rowsMigrated,
  classesMigrated,
  migrationSpeed,
  secondsRemainingStr,
  detailsVisible,
}) => {
  let classes = [styles.statusBar, detailsVisible ? styles.statusBottomCorners : ''];
  if (errorMessage) {
    classes.push(styles.migrationStatusError);
    return <div className={classes.join(' ')}>{errorMessage}</div>
  }
  return <div className={classes.join(' ')}>
    <StatusBarNote note='Rows Migrated: ' value={prettyNumber(rowsMigrated)} />
    <StatusBarNote note='Classes Migrated: ' value={prettyNumber(classesMigrated)} />
    <StatusBarNote note='Speed: ' value={prettyNumber(migrationSpeed) + ' rows/s'} />
    <StatusBarNote note='ETA: ' value={secondsRemainingStr} />
  </div>
}

let ClassProgressBar = ({ job, last }) => {
  let percentComplete = 100 * job.InsertPosition / (job.ExpectedDocumentMinimum || job.ExpectedDocumentsApprox);
  let progressDiv = null;
  let icon = null;
  switch (job.State) {
    case MIGRATION_INITIALSYNC:
      progressDiv = <div
        style={{width: percentComplete.toString() + '%'}}
        className={[styles.detailCompletion, base.progressBackground].join(' ')} />
      break;
    case MIGRATION_DONE:
      progressDiv = <div
        style={{width: '100%'}}
        className={[styles.detailCompletion, base.succeededBackground].join(' ')}/>
        icon = <Icon name='check-solid' fill='#00db7c' width={15} height={15}/>;
      break;
    case MIGRATION_FATALED:
      progressDiv = <div
        style={{width: '100%'}}
        className={[styles.detailCompletion, base.failedBackground].join(' ')}/>
        icon = <Icon name='x-solid' fill='#ff395e' width={15} height={15}/>;
  }
  return <div>
    <div
      style={{
        borderBottomLeftRadius: last ? '5px': 0,
        marginBottom: last ? '20px' : 0,
      }}
      className={styles.detailClassName}>
      {job.Name}
    </div>
    <div className={styles.detailProgressWrapper}>
      <div className={[styles.detailPercent, verticalCenter].join(' ')}>
        <div className={styles.detailBackground}>
          {progressDiv}
        </div>
      </div>
      <div className={styles.detailIcon}>
        {icon}
      </div>
    </div>
    <div
      style={{
        textAlign: 'right',
        borderBottomRightRadius: last ? '5px' : 0,
      }}
      className={styles.detailClassName}>
      {job.Name}
    </div>
  </div>;
}

export default class Migration extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Migration'

    this.state = {
      stoppingState: AsyncStatus.WAITING,
      commitingState: AsyncStatus.WAITING,
      commitDialogOpen: false,
      showDetails: false,
    };
  }

  renderContent() {
    return <div>
      <LiveReload
        ref={'reloaderView'}
        source={() => this.context.currentApp.getMigrations()}
        render={migration => {
          if (migration === undefined) {
            return <LoaderContainer loading={true} ><div style={{minHeight: '100vh'}} className={styles.content}/></LoaderContainer>;
          }
          let moreDetails = null;
          let moreDetailsButton = <div className={styles.button}>
            <Button
              value={this.state.showDetails ? 'Show less details' : 'Show more details'}
              primary={true}
              width='160px'
              onClick={() => this.setState({showDetails: !this.state.showDetails})} />
          </div>

          let showStopMigrationButton = false;
          let stopMigrationButton = <div className={styles.button}>
            <Button
              value='Stop the migration'
              primary={true}
              color='red'
              width='160px'
              progress={this.state.stoppingState === AsyncStatus.PROGRESS}
              onClick={()=>{
                this.setState({stoppingState: AsyncStatus.PROGRESS});
                //No need to handle failure of this request becase it's really rare and it doesn't really matter if the user doesn't realize it failed.
                this.context.currentApp.stopMigration().always(() => {
                  this.setState({stoppingState: AsyncStatus.WAITING});
                });
              }}/>
          </div>;

          let showFinalizeButton = false;
          let finalizeButton = <div className={styles.button}>
            <Button
              disabled={this.context.currentApp.migration.migrationState !== MIGRATION_COMMITREADY}
              value='Finalize'
              primary={true}
              width='160px'
              onClick={() => this.setState({commitDialogOpen: true})} />
          </div>

          let collectionJobs = this.context.currentApp.migration.collectionJobs;
          let copyState = AsyncStatus.WAITING;
          let syncState = AsyncStatus.WAITING;
          let verifyState = AsyncStatus.WAITING;

          let longStateDescription = '';
          switch (this.context.currentApp.migration.migrationState) {
            case MIGRATION_NOTSTARTED:
              showStopMigrationButton = true;
              showFinalizeButton = true;
              break;
            case MIGRATION_STOPPED:
            case MIGRATION_INITIALSYNC:
              longStateDescription =
              <div>
                <div style={{paddingBottom: '10px'}}>
                  We are copying a snapshot of your Parse hosted database into your MongoDB instance at <span className={styles.descriptionMongoName}>{this.context.currentApp.migration.destination}</span>.
                </div>
                <div>
                  This could take a while, depending on the amount of data. During this phase, your app continues to read and write to the Parse hosted database.
                </div>
              </div>
              showStopMigrationButton = true;
              showFinalizeButton = true;
              copyState = AsyncStatus.PROGRESS;
              //Even after the migration has entered INITIAL_SYNC, the collection jobs might not be created.
              if (collectionJobs) {
                moreDetails = <div>
                  <div className={styles.mongosBar}>
                    <div className={styles.detailMongoName}>{this.context.currentApp.migration.source}</div>
                    {/* padding */}
                    <div className={styles.detailMongoName}>&nbsp;</div>
                    <div className={styles.detailMongoName}>&nbsp;</div>
                    <div style={{float: 'right'}} className={styles.detailMongoName}>{this.context.currentApp.migration.destination}</div>
                  </div>
                  {Object.keys(collectionJobs).map((mongoKey, index, array) => <ClassProgressBar
                    key={mongoKey}
                    job={collectionJobs[mongoKey]}
                    last={index === array.length - 1}/>)}
                </div>;
              }
              break;
            case MIGRATION_OPLOGREPLAY:
              longStateDescription =
              <div>
                <div style={{paddingBottom: '10px'}}>
                  The snapshot copy has been completed, and we are now syncing any new data since the snapshot into your MongoDB instance at <span className={styles.descriptionMongoName}>{this.context.currentApp.migration.destination}</span>.
                </div>
                <div>
                  This could take a while, depending on the amount of new data. During this phase, your app continues to read and write to the Parse hosted database.
                </div>
              </div>

              showStopMigrationButton = true;
              showFinalizeButton = true;
              copyState = AsyncStatus.SUCCESS;
              syncState = AsyncStatus.PROGRESS;
              break;
            case MIGRATION_COMMITREADY:
              longStateDescription =
              <div>
                <div style={{paddingBottom: '10px'}}>
                  Your MongoDB instance at <span className={styles.descriptionMongoName}>{this.context.currentApp.migration.destination}</span> is now in sync. Browse through the data to make sure your data looks correct.
                </div>
                <div>
                  During this phase, your app continues to read and write to the Parse hosted database. When you are satisfied, you can finalize your migration and all reads and writes will now go to your MongoDB instance.
                </div>
              </div>
              showStopMigrationButton = true;
              showFinalizeButton = true;
              copyState = AsyncStatus.SUCCESS;
              syncState = AsyncStatus.SUCCESS;
              verifyState = AsyncStatus.PROGRESS;
              break;
            case MIGRATION_FINISH:
            case MIGRATION_DONE:
              copyState = AsyncStatus.SUCCESS;
              syncState = AsyncStatus.SUCCESS;
              verifyState = AsyncStatus.SUCCESS;
              break;
            case MIGRATION_INVALID:
            case MIGRATION_FATALED:
              showFinalizeButton = true;
              copyState = AsyncStatus.FAILED;
              syncState = AsyncStatus.FAILED;
              verifyState = AsyncStatus.FAILED;
              break;
          }
          let errorMessage = null;
          switch (this.context.currentApp.migration.wellKnownError) {
            case 1:
              errorMessage = "This is an error state.";
              break;
            default:
              errorMessage = this.context.currentApp.migration.migrationState === MIGRATION_INITIALSYNC ? null : ' ';
              break;
          }

          return <div className={[this.state.showDetails ? horizontalCenter : center, styles.content].join(' ')}>
            <div className={styles.title}>CURRENT PROGRESS</div>
            <div className={styles.stepsWrapper}>
              <MigrationStep
                title='Copy Snapshot'
                description='Migrating existing data.'
                descriptionWidth='100px'
                status={copyState}
                percentComplete={this.context.currentApp.migration.percentMigrated} />
              <MigrationStep
                title='Sync'
                description='Migrating any new data post snapshot.'
                descriptionWidth='130px'
                status={syncState}
                percentComplete={100} />
              <MigrationStep
                title='Verify'
                description='Preview your new database.'
                descriptionWidth='100px'
                status={verifyState}
                percentComplete={100} />
            </div>
            <StatusBar
              errorMessage={errorMessage}
              rowsMigrated={this.context.currentApp.migration.rowsMigrated}
              classesMigrated={this.context.currentApp.migration.classesMigrated}
              migrationSpeed={this.context.currentApp.migration.migrationSpeed}
              secondsRemainingStr={this.context.currentApp.migration.secondsRemainingStr}
              detailsVisible={!this.state.showDetails} />
            {this.state.showDetails ? moreDetails : null}
            {longStateDescription ? <div className={styles.longStateDescription}>{longStateDescription}</div> : null}
            {showStopMigrationButton ? stopMigrationButton : null}
            {moreDetails ? moreDetailsButton : null}
            {showFinalizeButton ? finalizeButton : null}
          </div>
        }}/>
      <Toolbar section='Migration' subsection='Progress' />
      {this.state.commitDialogOpen ? <Modal
        title='Warning!'
        type={Modal.Types.DANGER}
        icon='warn-outline'
        subtitle='This action is irreversible!'
        onCancel={() => this.setState({commitDialogOpen: false})}
        onConfirm={() => {
          this.refs.reloaderView.abortXHR();
          this.setState({commitingState: AsyncStatus.PROGRESS});
          this.context.currentApp.commitMigration().then(() => {
            return this.refs.reloaderView.fetchNewData();
          }).then(() => {
            this.setState({
              commitingState: AsyncStatus.SUCCESS,
              commitDialogOpen: false,
            });
          }).fail(() => {
            this.setState({commitingState: AsyncStatus.FAILED});
          });
        }}
        progress={this.state.commitingState === AsyncStatus.PROGRESS}
        buttonsInCenter={true}>
          <div style={{padding: '17px 55px 10px 55px', textAlign: 'center'}}>After you commit to using your new database, you cannot switch back to using a Parse managed database! You will be responsible for your own imports, exports, backups, indexes, monitoring, and other database administration. Are you sure you want to continue?</div>
          <FormNote
            show={this.state.commitingState === AsyncStatus.FAILED}
            color='red'>
            <div>We were unable to commit your migration. Please try again.</div>
          </FormNote>
      </Modal> : null}
    </div>;
    }
}
