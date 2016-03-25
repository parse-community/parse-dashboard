/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes           from 'lib/PropTypes';
import PushAudiencesOption from 'components/PushAudiencesSelector/PushAudiencesOption.react';
import React               from 'react';
import styles              from 'components/PushAudiencesSelector/PushAudiencesSelector.scss';

const AUDIENCE_SIZE_FETCHING_ENABLED = false;
const AUDIENCE_CREATED_DATE_ENABLED = false;

let pushAudiencesHelper = ({
  current,
  onChange,
  onEditAudience,
  schema,
}, audiences) => {
  if (!audiences){
    return null;
  }
  let _audiences = [];
  audiences.map((data) => {
    _audiences.push(<PushAudiencesOption
      icon={data.icon}
      key={data.objectId}
      id={data.objectId}
      name={data.name}
      query={data.query}
      createdAt={new Date(data.createdAt)}
      isChecked={current === data.objectId ? true : false}
      onChange={onChange.bind(undefined, data.objectId, data.query)}
      onEditAudience={onEditAudience}
      schema={schema}
      filters={data.filters} />);
  });
  return _audiences;
};

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
    {pushAudiencesHelper({current, onChange, onEditAudience, schema}, defaultAudience ? [defaultAudience] : null)}
    {pushAudiencesHelper({current, onChange, onEditAudience, schema}, newSegment ? [newSegment] : null)}
    {pushAudiencesHelper({current, onChange, onEditAudience, schema}, audiences)}
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
