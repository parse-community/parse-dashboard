/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as PushAudiencesStore from 'lib/stores/PushAudiencesStore';
import * as PushConstants      from './PushConstants';
import Button                  from 'components/Button/Button.react';
import LoaderContainer         from 'components/LoaderContainer/LoaderContainer.react';
import ParseApp                from 'lib/ParseApp';
import PushAudienceDialog      from 'components/PushAudienceDialog/PushAudienceDialog.react';
import PushAudiencesSelector   from 'components/PushAudiencesSelector/PushAudiencesSelector.react';
import queryFromFilters        from 'lib/queryFromFilters';
import React                   from 'react';
import styles                  from './PushAudiencesData.scss';
import { List }           from 'immutable';

const XHR_KEY = 'PushAudiencesData';

//TODO: lazy render options - avoid necessary calls for count if user doesn't see the audience
export default class PushAudiencesData extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      showMore: false,
      showCreateModal: false,
      currentAudience: null,
      defaultAudience: null,
      newSegment: null,
      newSegmentInfo: null,
      showEditModal: false,
      availableDevices: [],
      createProgress: false,
      createErrorMessage: null,
    };
  }

  componentWillMount(){
    if (this.props.loaded){ //case when data already fetched
      this.setState({ loading: false});
    }

    this.setState({
      defaultAudience: {
        createdAt: this.context.currentApp.createdAt,
        name: 'Everyone',
        count: 0,
        objectId: 'everyone',
        icon: 'users-solid',
      }
    });

    this.context.currentApp.fetchAvailableDevices().then(({ available_devices }) => {
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
    this.props.pushAudiencesStore.dispatch(PushAudiencesStore.ActionTypes.ABORT_FETCH, { xhrKey: XHR_KEY});
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.newlyCreatedSegment && this.state.newlyCreatedSegment) {
      return false;
    }
    return true;
  }

  handleShowMoreClick(){
    this.setState({ loading: true });
    this.props.pushAudiencesStore.dispatch(PushAudiencesStore.ActionTypes.FETCH,
      {
        min: PushConstants.INITIAL_PAGE_SIZE,
        limit: PushConstants.SHOW_MORE_LIMIT,
        xhrKey: XHR_KEY,
      }).then(() => {
      this.setState({ loading: false });
    });
  }

  handleEditAudienceClick(audienceInfo){
    this.setState({
      showEditModal: true,
      newSegmentInfo: audienceInfo,
    });
  }

  /**
   * Method that initiates audience creation
   * @param  {[type]} modelType             [description]
   * @param  {[type]} options.platforms     [description]
   * @param  {[type]} options.name          [description]
   * @param  {[type]} options.filters       [description]
   * @param  {[type]} options.saveForFuture [description]
   * @return {[type]}                       [description]
   */
  createAudience(modalState, { platforms, name, formattedFilters, saveForFuture, filters }) {
    this.setState({
      createProgress: true,
      createErrorMessage: '',
    });
    let query = {};
    let parseQuery = queryFromFilters('_Installation', formattedFilters);

    if (parseQuery && parseQuery.toJSON()) {
      query = parseQuery.toJSON().where || {};
    }

    query.deviceType = { $in: platforms };

    // Horrible code here is due to old rails code that sent pushes through it's own endpoint, while Parse Server sends through Parse.Push.
    // Ideally, we would pass a Parse.Query around everywhere.
    parseQuery.containedIn('deviceType', platforms);
    this.props.onChange(saveForFuture ? (() => {throw "Audiences not supported"})() : PushConstants.NEW_SEGMENT_ID, parseQuery, 1 /* TODO: get the read device count */);

    if (saveForFuture){
      this.props.pushAudiencesStore.dispatch(PushAudiencesStore.ActionTypes.CREATE, {
        query: JSON.stringify(query),
        name,
      }).then(() => {
        let stateSettings = {};
        stateSettings[modalState] = false;
        stateSettings.newlyCreatedSegment = true;
        stateSettings.createProgress = false;
        this.setState(stateSettings);
      }, (e) => {
        this.setState({
          createErrorMessage: e.message,
          createProgress: false,
        });
      });
    } else { //saveAudience one time use audience
      let stateSettings = {
        newSegment: {
          createdAt: new Date(),
          name: "New Segment",
          count: 0,
          objectId: PushConstants.NEW_SEGMENT_ID,
          query,
          filters,
        }
      };
      stateSettings[modalState] = false;
      stateSettings.createProgress = false;
      this.setState(stateSettings);
      this.newlyCreatedTempSegment = true;
    }
  }

  render() {
    let { pushAudiencesStore, current, ...otherProps } = this.props;

    let pushAudienceData = pushAudiencesStore.data;
    let audiences = null;
    let showMore = false;

    if (pushAudienceData){
      audiences = pushAudienceData.get('audiences') || new List();
      showMore = pushAudienceData.get('showMore') || false;
    }

    let showMoreContent = showMore ? (
      <div className={styles.showMoreWrap}>
        <Button value={this.state.loading ? 'Fetching all audiences' : 'Show all audiences'} onClick={this.handleShowMoreClick.bind(this)}/>
      </div>
    ) : null;

    let createAudienceButton = (
      <div className={styles.pushAudienceDialog}>
        <Button
          value='Create an audience'
          primary={true}
          onClick={() => {
            this.setState({
              showCreateModal: true
            });
          }}>
        </Button>
        {this.state.showCreateModal ? <PushAudienceDialog
          availableDevices={this.state.availableDevices}
          progress={this.state.createProgress}
          errorMessage={this.state.createErrorMessage}
          schema={this.props.schema}
          primaryAction={this.createAudience.bind(this,'showCreateModal')}
          secondaryAction={() => {
            this.setState({
              showCreateModal: false,
              createErrorMessage: '',
            });
          }}/> : null}
      </div>
    );

    let editAudienceModal = (
      <div className={styles.pushAudienceDialog}>
        <PushAudienceDialog
          availableDevices={this.state.availableDevices}
          progress={this.state.createProgress}
          errorMessage={this.state.createErrorMessage}
          audienceInfo={this.state.newSegmentInfo}
          editMode={true}
          schema={this.props.schema}
          primaryAction={this.createAudience.bind(this,'showEditModal')}
          secondaryAction={() => {
            this.setState({
              showEditModal: false,
              createErrorMessage: '',
            });
          }}/>
      </div>
    );

    let _current;

    //TODO: should idealy be moved outside render()
    if (this.newlyCreatedTempSegment) {
      _current = PushConstants.NEW_SEGMENT_ID;
      this.newlyCreatedTempSegment = false;
    } else if (this.state.newlyCreatedSegment) {
      _current  = audiences.get(0).objectId;
      this.setState({ newlyCreatedSegment: false });
    } else {
      _current = current;
    }

    return (
      <div className={styles.pushAudienceData}>
        <LoaderContainer loading={this.state.loading} solid={false} className={styles.loadingContainer}>
          <PushAudiencesSelector
            defaultAudience={this.state.defaultAudience}
            newSegment={this.state.newSegment}
            audiences={audiences}
            onEditAudience={this.handleEditAudienceClick.bind(this)}
            current={_current}
            {...otherProps}>
            {showMoreContent}
          </PushAudiencesSelector>
        </LoaderContainer>
        {createAudienceButton}
        {this.state.showEditModal ? editAudienceModal : null}
      </div>
    )
  }
}

PushAudiencesData.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
