/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button       from 'components/Button/Button.react';
import Icon         from 'components/Icon/Icon.react';
import PropTypes    from 'lib/PropTypes';
import React        from 'react';
import styles       from 'components/EmptyState/EmptyState.scss';
import stylesButton from 'components/Button/Button.scss';
import baseStyles   from 'stylesheets/base.scss';

let ctaButton = (cta, action) => {
  if (cta) {
    if (action.constructor === String) {
      return (
        <a href={action} className={[stylesButton.button, stylesButton.primary].join(' ')} target='_blank'>
          {cta}
        </a>
      );
    } else {
      return (
       <Button
        value={cta}
        color={'blue'}
        primary={true}
        onClick={action} />
      );
    }
  } else {
    return null;
  }
}

let EmptyState = ({
  icon='',
  title='',
  description='',
  cta='',
  action=() => {},
  secondaryCta='',
  secondaryAction=() => {},
}) => (
  <div className={baseStyles.center}>
    <div className={styles.icon}>
      <Icon
        width={80}
        height={80}
        fill='#343445'
        name={icon} />
    </div>
    <div className={styles.title}>{title}</div>
    <div className={styles.description}>{description}</div>
    {ctaButton(cta, action)}
    {secondaryCta && ' '}
    {ctaButton(secondaryCta, secondaryAction)}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.string.describe(
    'The name of the large icon that appears in the empty state.'
  ),
  title: PropTypes.string.describe(
    'Help text that explains why this is an empty state; ' +
    'usually because you haven\u2019t created any data here.'
  ),
  description: PropTypes.node.describe(
    'Help text that indicates how to leave the empty state, ' +
    'usually by visiting docs or using the CTA.'
  ),
  cta: PropTypes.string.describe(
    'The text that appears in the CTA button.'
  ),
  action: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).describe(
    'An href link or a click handler that is forwarded to the CTA button.'
  ),
  secondaryCta: PropTypes.string.describe(
    'The text that appears in the secondary CTA button.'
  ),
  secondaryAction: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).describe(
    'An href link or a click handler that is forwarded to the secondary CTA button.'
  ),
};

export default EmptyState;
