/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';
import styles    from 'components/B4AFieldTemplate/B4AFieldTemplate.scss';
import B4ALabelTemplate    from 'components/B4ALabelTemplate/B4ALabelTemplate.react';
import B4ADescriptionTemplate    from 'components/B4ADescriptionTemplate/B4ADescriptionTemplate.react';

let B4AFieldTemplate = ({imageSource, title, subtitle, author, description, link, technologies}) => {
  let classes = [styles.field];

  return (
    <div className={classes.join(' ')}>
      <div className={styles.left}>
        <B4ALabelTemplate
          imageSource={imageSource}
          title={title}
          subtitle={subtitle}
          author={author}
          technologies={technologies}
        />
      </div>
      <div className={styles.right}>
      <B4ADescriptionTemplate
        description={description}
        link={link}
      />
      </div>
    </div>
  );
};

export default B4AFieldTemplate;

B4AFieldTemplate.propTypes = {};
