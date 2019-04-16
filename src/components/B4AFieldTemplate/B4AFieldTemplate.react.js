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

const openLink = (link, title, author, technologies) => {
  window.open(link, "_blank")
  if (typeof back4AppNavigation !== 'undefined' && typeof back4AppNavigation.onClickAppTemplate === 'function')
    back4AppNavigation.onClickAppTemplate({ title, link, author, technologies })
}

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
        title={title}
        description={description}
        onOpenLink={() => openLink(link, title, author, technologies)}
      />
      </div>
    </div>
  );
};

export default B4AFieldTemplate;

B4AFieldTemplate.propTypes = {};
