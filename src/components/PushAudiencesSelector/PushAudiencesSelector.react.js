/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as PushConstants  from 'dashboard/Push/PushConstants.js';
import PropTypes           from 'lib/PropTypes';
import PushAudiencesOption from 'components/PushAudiencesSelector/PushAudiencesOption.react';
import React               from 'react';
import styles              from 'components/PushAudiencesSelector/PushAudiencesSelector.scss';
import { fromJS }          from 'immutable';

const AUDIENCE_SIZE_FETCHING_ENABLED = true;
const AUDIENCE_CREATED_DATE_ENABLED = true;

const PushAudiencesOptions = ({
  current,
  onChange,
  onEditAudience,
  schema,
  audiences,
}) => <div>
  {audiences.map(({
    icon,
    objectId,
    name,
    query,
    createdAt,
    filters,
  }) => {
    const queryOrFilters = objectId === PushConstants.NEW_SEGMENT_ID ?
      filters.push(fromJS({
        field: 'deviceType',
        constraint: 'containedIn',
        array: query.deviceType['$in'],
      })) :
      query;
    return <PushAudiencesOption
      icon={icon}
      key={objectId}
      id={objectId}
      name={name}
      query={query}
      createdAt={new Date(createdAt)}
      isChecked={current === objectId ? true : false}
      //Super janky. Only works because open dashboard doesn't have saved audiences
      onChange={() => onChange(objectId, queryOrFilters)}
      onEditAudience={onEditAudience}
      schema={schema}
      filters={filters} />
  })}
</div>

let PushAudiencesSelector = ({
  defaultAudience,
  newSegment,
  audiences,
  children,
  current,
  onChange,
  onEditAudience,
  schema,
}) => <div className={styles.container}>
  <div className={styles.body}>
    <PushAudiencesOptions
      current={current}
      onChange={onChange}
      onEditAudience={onEditAudience}
      schema={schema}
      audiences={defaultAudience ? [defaultAudience] : []} />
    <PushAudiencesOptions
      current={current}
      onChange={onChange}
      onEditAudience={onEditAudience}
      schema={schema}
      audiences={newSegment ? [newSegment] : []} />
    <PushAudiencesOptions
      current={current}
      onChange={onChange}
      onEditAudience={onEditAudience}
      schema={schema}
      audiences={audiences} />
  </div>
  <div className={styles.header}>
    <div className={[styles.cell, styles.col1].join(' ')}>
      Audience
    </div>
    {AUDIENCE_SIZE_FETCHING_ENABLED ? <div className={[styles.cell, styles.col2].join(' ')}>
      Size
    </div> : null}
    {AUDIENCE_CREATED_DATE_ENABLED ? <div className={[styles.cell, styles.col3].join(' ')}>
      Created
    </div> : null}
  </div>
  {children}
</div>

PushAudiencesSelector.propTypes = {
  audiences: PropTypes.object.isRequired.describe('Immutable List of push audiences.'),
  defaultAudience: PropTypes.object.describe('Default push audience option. Not added to the store. Everyone.'),
  newSegment: PropTypes.object.describe('New segment (one time use) push audience option. Not added to the store.'),
  current: PropTypes.string.isRequired.describe('id of the currently selected row.'),
  onChange: PropTypes.func.isRequired.describe('callback to be executed when option has changed'),
  schema: PropTypes.object.describe('Schema of installation'),
  onEditAudience: PropTypes.func.isRequired.describe('Callback that is executed on click of edit audience for new segment.'),
};

export default PushAudiencesSelector;
