/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { centered } from 'components/Field/Field.scss';
import PropTypes    from 'lib/PropTypes';
import React        from 'react';
import styles       from 'components/B4ALabelTemplate/B4ALabelTemplate.scss';
import B4aBadge     from 'components/B4aBadge/B4aBadge.react'

const TECHNOLOGIES = {
  ANDROID: "android",
  IOS: "ios"
}

const getBadgeColor = (label = '') => {
  for (let technology in TECHNOLOGIES)
    if (TECHNOLOGIES.hasOwnProperty(technology) && label.indexOf(TECHNOLOGIES[technology]) > -1)
      return TECHNOLOGIES[technology]
  return 'blue'
}

let B4ALabelTemplate = (props) => {
  let padding = (props.padding || 20) + 'px';
  return (
    <div
      className={[styles.labelTemplate, centered].join(' ')}
      style={{ padding: '0 ' + padding }}>

        <div className={styles.imageWrapper}>
          <img src={props.imageSource} />
        </div>

        <div className={styles.infoWrapper}>
          <div className={styles.title}>{props.title}</div>
          <div className={styles.subtitle}>{props.subtitle}</div>
          <div className={styles.author}>{props.author && `by ${props.author}`}</div>
          <div className={styles.technologies}>
            {
              props.technologies ?
                props.technologies.map((technology, index) => (
                  technology && <B4aBadge
                    key={index}
                    label={technology}
                    color={getBadgeColor(technology.toLowerCase())}
                    additionalStyles={{fontSize: '11px', fontWeight: 'normal', padding:'0 5px'}}
                  />)
                ) :
                null
            }
          </div>
        </div>
    </div>
  );
};

export default B4ALabelTemplate;


