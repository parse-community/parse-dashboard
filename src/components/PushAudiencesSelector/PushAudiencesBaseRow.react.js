/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes          from 'lib/PropTypes';
import ParseApp           from 'lib/ParseApp';
import React              from 'react';
import { NEW_SEGMENT_ID } from 'dashboard/Push/PushConstants';

export default class PushAudiencesBaseRow extends React.Component {
  constructor() {
    super();
    this.xhrHandle = null;
    this.state = {
      count: undefined,
      expandedView: false,
      approximate: false,
      isNewSegment: false,
    }
  }

  handleDetailsToggle(query, schema, evt) {
    evt.preventDefault();

    this.setState(prevState => ({
      expandedView: !prevState.expandedView
    }));
  }

  fetchPushSubscriberCount(context) {
    if (!context || !context.currentApp) { //so we don't break the PIG demo
      return;
    }
    let query = this.props.id === NEW_SEGMENT_ID ? this.props.query : null;
    //Added count fetch logic directly to component
    let {xhr, promise} = context.currentApp.fetchPushSubscriberCount(this.props.id, query);
    this.xhrHandle = xhr;
    promise.then(({ approximate, count }) => {
      this.setState({ approximate, count });
    }, () => {});
  }

  componentDidMount() {
    this.fetchPushSubscriberCount.call(this,this.context);
    if (this.props.id == NEW_SEGMENT_ID) {
      this.setState({ isNewSegment: true });
    }
  }

  componentWillUnmount() {
    if (this.xhrHandle) {
      this.xhrHandle.abort();
    }
  }
}

PushAudiencesBaseRow.contextTypes = {
  currentApp: PropTypes.instanceOf(ParseApp)
};
