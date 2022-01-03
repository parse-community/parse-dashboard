/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as PushUtils            from 'lib/PushUtils';
import Icon                      from 'components/Icon/Icon.react';
import PropTypes                 from 'lib/PropTypes';
import RadioButton               from 'components/RadioButton/RadioButton.react';
import React                     from 'react';
import styles                    from 'components/PushAudiencesSelector/PushAudiencesOption.scss';
import { yearMonthDayFormatter } from 'lib/DateUtils';
import PushAudiencesBaseRow      from 'components/PushAudiencesSelector/PushAudiencesBaseRow.react';

const FORM_PREFIX = 'audience_radio';

const AUDIENCE_SIZE_FETCHING_ENABLED = true;
const AUDIENCE_CREATED_DATE_ENABLED = true;

export default class PushAudiencesOption extends PushAudiencesBaseRow {
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

  handleChange() {
    if(this.props.onChange && !this.props.isDisabled){
      this.props.onChange.call(undefined, this.state.count);
    } else {
      return;
    }
  }

  // pass count information to PushNew flow
  componentWillUpdate(nextProps, nextState) {
    if ((nextState.count !== this.state.count || JSON.stringify(nextProps.query) !== JSON.stringify(this.props.query))
      && this.props.isChecked) {
      nextProps.onChange.call(undefined, nextState.count);
    }
  }

  render() {
    let inputId=[FORM_PREFIX, this.props.id].join('_');

    let detailsView = this.state.expandedView ?
      PushUtils.largeInfoBuilder(this.props.query, this.props.schema, styles) :
      (
        <div className={styles.shortInfo}>
          {PushUtils.shortInfoBuilder(this.props.query, this.props.schema)}
        </div>
      );

    return (
      <label htmlFor={inputId} className={[styles.row, this.props.id === 'everyone' ? styles.everyone : ''].join(' ')}>
        <div className={[styles.cell, styles.col1].join(' ')}>
          <RadioButton
            id={inputId}
            name={FORM_PREFIX}
            className={styles.input}
            parentClassName={styles.radiobutton}
            onChange={this.handleChange.bind(this)}
            checked={this.props.isChecked}
            disabled={this.props.isDisabled}/>
          <div className={styles.audienceInfo}>
            <div className={styles.headline}>
              { this.props.icon ?
                <div className={styles.icon}>
                  <Icon
                    width={18}
                    height={18}
                    fill='#343445'
                    name={this.props.icon} />
                </div> :
                null }
              <span style={ this.props.icon ? { verticalAlign: 'top', paddingLeft: 5 } : {} }>{this.props.name}</span>
            </div>
            <div className={styles.subline}>
              {detailsView}
              {!this.state.isNewSegment ?
                <button
                  type='button'
                  className={[styles.moreDetails, !this.props.query ? styles.hideMoreDetails : ''].join(' ')}
                  onClick={this.handleDetailsToggle.bind(this,this.props.query, this.props.schema)}>
                  {this.state.expandedView ? 'less details' : 'more details'}
                </button> :
                <button
                  type='button'
                  className={[styles.moreDetails, !this.props.query ? styles.hideMoreDetails : ''].join(' ')}
                  onClick={this.props.onEditAudience.bind(undefined, {
                    name: this.props.name,
                    filters: this.props.filters,
                    query: this.props.query,
                  })}>
                  {'Edit audience'}
                </button>
              }
            </div>
          </div>
        </div>
        {AUDIENCE_SIZE_FETCHING_ENABLED ? <div className={[styles.cell, styles.col2].join(' ')}>
          {PushUtils.formatCountDetails(this.state.count, this.state.approximate)}
        </div> : null}
        {AUDIENCE_CREATED_DATE_ENABLED ? <div className={[styles.cell, styles.col3].join(' ')}>
          {yearMonthDayFormatter(this.props.createdAt)}
        </div> : null}
      </label>
    );
  }
}

PushAudiencesOption.propTypes = {
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
    'Key value pair of installation condition info for the specific audience'
  ),
  isChecked: PropTypes.bool.describe(
    'Boolean describing if option is currently selected.'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'Callback that is executed on option change.'
  ),
  isDisabled: PropTypes.bool.describe(
    'Boolean describing if option is disabled.'
  ),
  schema: PropTypes.object.describe(
    'Schema of installation.'
  ),
  onEditAudience: PropTypes.func.isRequired.describe(
    'Callback that is executed on click of edit audience for new segment.'
  ),
  icon: PropTypes.string.describe(
    'Specifiying icon for option. Used for "Everyone" case.'
  ),
};
