/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React from 'react';
import styles from 'components/FormTableCollab/FormTableCollab.scss';
import Icon   from 'components/Icon/Icon.react';

let Row = ({
             title,
             color = 'blue',
             onDelete,
             onEdit,
           }) => {
  return (
    <div className={styles.row}>
      <div className={styles.header}>
        <span className={[styles.indicator, styles[color]].join(' ')} />
        <span className={styles.title}>{title}</span>
        {typeof onDelete === 'function' ? <a href='javascript:;' role='button' className={styles.icon} onClick={onDelete}><Icon name='trash-solid' fill='#59596e' width={18} height={18} role='button'/></a> : null}
        {typeof onEdit === 'function' ? <a href='javascript:;' role='button' className={styles.firstIcon} onClick={onEdit}><Icon name='gear-solid' fill='#59596e' width={18} height={18} role='button'/></a> : null}
      </div>
      <hr className={styles.hrTableDivisor}/>
    </div>

  );
};

let FormTableCollab = ({ items, keyWidth = '75px' }) => (
  <div className={styles.table}>
    {items.map((item, index) => <Row key={index.toString()} keyWidth={keyWidth} {...item} />)}
  </div>
);

FormTableCollab.propTypes = {
  items: PropTypes.array.isRequired.describe('An array of objects to go in the table. Each object should include a title (string), optional color (blue, red, green, orange), optional onDelete function, and notes (array). Each object in the notes array should contain a key (string), keyColor (blue, red, green, or orange), a value (string), and optionally strong (bool) to use a bold font for the value.'),
};

export default FormTableCollab;
