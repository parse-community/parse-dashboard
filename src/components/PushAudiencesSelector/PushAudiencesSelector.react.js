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

let pushAudiencesHelper = (props, audiences) => {
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
      isChecked={props.current === data.objectId ? true : false}
      onChange={props.onChange.bind(undefined, data.objectId, data.query)}
      onEditAudience={props.onEditAudience}
      schema={props.schema}
      filters={data.filters} />);
  });
  return _audiences;
};

let PushAudiencesSelector = (props) => {
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        {pushAudiencesHelper(props, props.defaultAudience ? [props.defaultAudience] : null)}
        {pushAudiencesHelper(props, props.newSegment ? [props.newSegment] : null)}
        {pushAudiencesHelper(props, props.audiences)}
      </div>
      <div className={styles.header}>
        <div className={[styles.cell, styles.col1].join(' ')}>
          Audience
        </div>
        <div className={[styles.cell, styles.col2].join(' ')}>
          Size
        </div>
        <div className={[styles.cell, styles.col3].join(' ')}>
          Created
        </div>
      </div>
      {props.children}
    </div>
  );
}

PushAudiencesSelector.propTypes = {
  audiences: PropTypes.object.isRequired.describe(
    'Immutable List of push audiences.'
  ),
  defaultAudience: PropTypes.object.describe(
    'Default push audience option. Not added to the store. Everyone.'
  ),
  newSegment: PropTypes.object.describe(
    'New segment (one time use) push audience option. Not added to the store.'
  ),
  current: PropTypes.string.isRequired.describe(
    'id of the currently selected row.'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'callback to be executed when option has changed'
  ),
  schema: PropTypes.object.describe(
    'Schema of installation'
  ),
  onEditAudience: PropTypes.func.isRequired.describe(
    'Callback that is executed on click of edit audience for new segment.'
  ),
};

export default PushAudiencesSelector;
