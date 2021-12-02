/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as PushUtils       from 'lib/PushUtils';
import * as DateUtils       from 'lib/DateUtils';

import Icon                 from 'components/Icon/Icon.react';
import PropTypes            from 'lib/PropTypes';
import PushAudiencesBaseRow from 'components/PushAudiencesSelector/PushAudiencesBaseRow.react';
import React                from 'react';

import styles               from './PushAudiencesIndexRow.scss';

export default class PushAudiencesIndexRow extends PushAudiencesBaseRow {
  constructor() {
    super();
    this.state = {
      loading: true,
      count: undefined,
      expandedView: false,
      approximate: false,
      isNewSegment: false,
    }
  }

  render() {
    let detailsView = this.state.expandedView ?
      PushUtils.largeInfoBuilder(this.props.query, this.props.schema, styles) :
      (
        <div className={styles.shortInfo}>
          {PushUtils.shortInfoBuilder(this.props.query, this.props.schema)}
        </div>
      );
    let countDetails = PushUtils.formatCountDetails(this.state.count, this.state.approximate);
    return (
      <tr>
        <td className={styles.colName}>
          {this.props.name}
          <button
            className={styles.newPushButton}
            type='button'
            onClick={this.props.onSendPush.bind(undefined, this.props.id)}>
              Send a new push
          </button>
        </td>
        <td className={styles.colSize}>{countDetails}</td>
        <td className={styles.colDetails}>
          {detailsView}
          <button
            type='button'
            className={[styles.moreDetails, !this.props.query ? styles.hideMoreDetails : ''].join(' ')}
            onClick={this.handleDetailsToggle.bind(this,this.props.query, this.props.schema)}>
            {this.state.expandedView ? 'less details' : 'more details' }
          </button>
        </td>
        <td className={styles.colCreatedOn}>
          {DateUtils.yearMonthDayFormatter(this.props.createdAt)}
        </td>
        <td className={styles.colPushesSent}>
          {this.props.timesUsed}
        </td>
        <td className={styles.colAction}>
          <button
            className={styles.removeIcon}
            type='button'
            onClick={this.props.onDelete.bind(undefined, this.props.id, this.props.name)}>
            <Icon name='trash-outline' fill='#343445' width={20} height={20} role='button'/>
          </button>
        </td>
      </tr>
    );
  }
}

PushAudiencesIndexRow.propTypes = {
  id: PropTypes.string.isRequired.describe(
    'The id of the push audience option.'
  ),
  name: PropTypes.string.describe(
    'The name of the push audience option.'
  ),
  createdAt: PropTypes.instanceOf(Date).describe(
    'The size of the push audience option.'
  ),
  query: PropTypes.object.describe(
    'Key value pair of installation condition info for the specific audience.'
  ),
  schema: PropTypes.object.describe(
    'Schema of installation.'
  ),
  timesUsed: PropTypes.number.describe(
    'Number of times audience has been used.'
  ),
  onDelete: PropTypes.func.describe(
    'Callback to be executed on click of delete button.'
  ),
  onSendPush: PropTypes.func.describe(
    'Callback to be executed on send push button.'
  ),
};
