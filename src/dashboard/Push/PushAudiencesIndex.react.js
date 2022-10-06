/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as PushAudiencesStore  from 'lib/stores/PushAudiencesStore';
import * as SchemaStore         from 'lib/stores/SchemaStore';
import * as PushConstants       from './PushConstants';
import Button                   from 'components/Button/Button.react';
import DashboardView            from 'dashboard/DashboardView.react';
import EmptyState               from 'components/EmptyState/EmptyState.react';
import FormModal                from 'components/FormModal/FormModal.react';
import LoaderContainer          from 'components/LoaderContainer/LoaderContainer.react';
import Modal                    from 'components/Modal/Modal.react';
import PushAudienceDialog       from 'components/PushAudienceDialog/PushAudienceDialog.react';
import PushAudiencesIndexRow    from './PushAudiencesIndexRow.react';
import queryFromFilters         from 'lib/queryFromFilters';
import React                    from 'react';
import SidebarAction            from 'components/Sidebar/SidebarAction';
import stylesTable              from 'dashboard/TableView.scss';
import subscribeTo              from 'lib/subscribeTo';
import TableHeader              from 'components/Table/TableHeader.react';
import Toolbar                  from 'components/Toolbar/Toolbar.react';
import { formatAudienceSchema } from 'lib/PushUtils';
import { List }                 from 'immutable';
import generatePath from 'lib/generatePath';
import { withRouter } from 'lib/withRouter';

const XHR_KEY = 'PushAudiencesIndex';

@subscribeTo('Schema', 'schema')
@subscribeTo('PushAudiences', 'pushaudiences')
@withRouter
class PushAudiencesIndex extends DashboardView {
  constructor() {
    super();
    this.section = 'Push';
    this.subsection = 'Audiences';
    this.action = new SidebarAction('Create an audience', this.handleCreateAudienceClick.bind(this));
    this.state = {
      availableDevices: [],
      loading: true,
      audiences: new List(),
      showDeleteAudienceModal: false,
      deletionAudienceId: null,
      deleteionAudienceName: null,
      showCreateAudienceModal: false,
    }
  }

  componentWillMount() {
    this.props.schema.dispatch(SchemaStore.ActionTypes.FETCH);
    this.props.pushaudiences.dispatch(PushAudiencesStore.ActionTypes.FETCH,
      {
        limit: PushConstants.SHOW_MORE_LIMIT,
        min: PushConstants.INITIAL_PAGE_SIZE,
        xhrKey: XHR_KEY,
      }).then(() => {

    }).finally(() => {
      this.setState({ loading: false });
    });
    this.context.fetchAvailableDevices().then(({ available_devices }) => {
      this.setState({
        availableDevices: available_devices
      });
    }, () => {
      this.setState({
        availableDevices: PushConstants.DEFAULT_DEVICES
      });
    });
  }

  componentWillReceiveProps(props) {
    if (props.loaded){
      this.setState({ loading: false});
    }
  }

  componentWillUnmount() {
    this.props.pushaudiences.dispatch(PushAudiencesStore.ActionTypes.ABORT_FETCH, { xhrKey: XHR_KEY});
  }

  handleCreateAudienceClick() {
    this.setState({
      showCreateAudienceModal: true,
    });
  }

  tableData() {
    let schema = formatAudienceSchema(this.props.schema.data.get('classes')) || {};
    let pushAudienceData = this.props.pushaudiences.data;
    let audiences = undefined;

    if (pushAudienceData) {
      audiences = pushAudienceData.get('audiences') || new List();
    }

    this.schema = schema;
    return audiences;
  }

  handleDelete(objectId, objectName) {
    this.setState({
      showDeleteAudienceModal: true,
      deletionAudienceId: objectId,
      deleteionAudienceName: objectName,
    });
  }

  handleSendPush(objectId) {
    this.props.navigate(generatePath(this.context, `push/new?audienceId=${objectId}`));
  }

  renderRow(audience) {
    return (
      <PushAudiencesIndexRow
        key={audience.objectId}
        id={`${audience.objectId}`}
        name={audience.name}
        query={audience.query}
        createdAt={new Date(audience.createdAt)}
        schema={this.schema}
        timesUsed={audience.timesUsed}
        onSendPush={this.handleSendPush.bind(this)}
        onDelete={this.handleDelete.bind(this)}/>
    );
  }

  renderToolbar() {
    return (
      <Toolbar
        section='Push'
        subsection='Audiences'>
        <Button color='white' value='Create an audience' onClick={this.handleCreateAudienceClick.bind(this)} />
      </Toolbar>
    );
  }

  renderHeaders() {
    return [
      <TableHeader key='name' width={20}>Name</TableHeader>,
      <TableHeader key='size' width={10}>Size</TableHeader>,
      <TableHeader key='details' width={30}>Details</TableHeader>,
      <TableHeader key='created_on' width={20}>Created On</TableHeader>,
      <TableHeader key='pushes_sent' width={10}># of sends</TableHeader>,
      <TableHeader key='action' width={10}>Action</TableHeader>,
    ];
  }

  renderEmpty() {
    if (this.state.availableDevices.length === 0) {
      return (
        <EmptyState
          title='No registered devices'
          description='You have no registered installations of your app. You can get started with our Quick Start guide.'
          icon='devices-solid'
          cta='Push Quick Start'
          action={'https://www.parse.com/apps/quickstart#parse_push'} />
      );
    } else {
      return (
        <EmptyState
          title='No push audiences to display yet.'
          icon='users-solid'
          cta='Create your first audience'
          action={() => {
            this.setState({
              showCreateAudienceModal: true
            });
          }} />
      );
    }
  }

  createAudience(modalState, { platforms, name, formattedFilters }){
    let query = {};

    let parseQuery = queryFromFilters('_Installation', formattedFilters);

    if (parseQuery && parseQuery.toJSON()){
      query = parseQuery.toJSON().where || {};
    }

    query.deviceType = { $in: platforms };
    //TODO: handle fail case - need to modify/extend <FormModal> to handle custom footer
    this.props.pushaudiences.dispatch(PushAudiencesStore.ActionTypes.CREATE,{
      query: JSON.stringify(query),
      name,
    }).then(() => {
      this.setState({
        showCreateAudienceModal: false,
      });
    });
  }

  renderContent() {
    let toolbar = this.renderToolbar();
    let data = this.tableData();
    let content = null;
    let headers = null;

    let createAudienceModal = this.state.showCreateAudienceModal ? (
      <PushAudienceDialog
        availableDevices={this.state.availableDevices}
        schema={this.schema}
        disableNewSegment={true}
        audienceSize={999999}
        primaryAction={this.createAudience.bind(this,'showCreateModal')}
        secondaryAction={() => {
          this.setState({
            showCreateAudienceModal: false
          });
        }}/>
      ) :
      null;

    let deleteSubtitle = (
      <div>
        Are you sure you want to delete <strong>{this.state.deleteionAudienceName}</strong>?
      </div>
    );

    let deleteAudienceModal = <FormModal
      icon='warn-outline'
      title='Delete Audience'
      subtitle={deleteSubtitle}
      type={Modal.Types.DANGER}
      open={this.state.showDeleteAudienceModal}
      submitText='Delete'
      inProgressText={'Deleting\u2026'}
      onSubmit={() => {
        return this.props.pushaudiences.dispatch(PushAudiencesStore.ActionTypes.DESTROY,
          { objectId : this.state.deletionAudienceId });
      }}
      onSuccess={() => {
        this.setState({
          showDeleteAudienceModal: false,
        });
      }}
      onClose={() => {
        this.setState({ showDeleteAudienceModal: false, });
      }}>
    </FormModal>

    if (typeof data !== 'undefined') {
      if (data.size === 0) {
        content = <div className={stylesTable.empty}>{this.renderEmpty()}</div>;
      } else {
        content = (
          <div className={stylesTable.rows}>
            <table>
              <tbody>
                {data.map((row) => this.renderRow(row))}
              </tbody>
            </table>
          </div>
        );
        headers = this.renderHeaders();
      }
    }
    let extras = this.renderExtras ? this.renderExtras() : null;
    return (
      <div>
        <LoaderContainer loading={this.state.loading}>
          <div className={stylesTable.content}>{content}</div>
        </LoaderContainer>
        {toolbar}
        <div className={stylesTable.headers}>{headers}</div>
        {extras}
        {deleteAudienceModal}
        {createAudienceModal}
      </div>
    );
  }
}

export default PushAudiencesIndex;
