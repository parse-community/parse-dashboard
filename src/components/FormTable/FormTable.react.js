/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React from 'react';
import styles from 'components/FormTable/FormTable.scss';

let Row = ({
  title,
  notes = [],
  color = 'blue',
  onDelete,
  keyWidth
}) => {
  return (
    <div className={styles.row}>
      <div className={styles.header}>
        <span className={[styles.indicator, styles[color]].join(' ')} />
        <span className={styles.title}>{title}</span>
        {typeof onDelete === 'function' ? <a href='javascript:;' role='button' className={styles.del} onClick={onDelete}>&times;</a> : null}
      </div>
      {notes.map(({ key, keyColor = '', value, strong }, index) => {
        return <div key={index.toString()} className={styles.info}>
          <span style={{width: keyWidth}} className={[styles.label, styles[keyColor]].join(' ')}>{key}</span>
          {strong ? <strong>{value}</strong> : <span className={styles.din}>{value}</span>}
        </div>;
      })}
    </div>
  );
};

let FormTable = ({ items, keyWidth = '70px' }) => (
  <div className={styles.table}>
    {items.map((item, index) => <Row key={index.toString()} keyWidth={keyWidth} {...item} />)}
  </div>
);

FormTable.propTypes = {
  items: PropTypes.array.isRequired.describe('An array of objects to go in the table. Each object should include a title (string), optional color (blue, red, green, orange), optional onDelete function, and notes (array). Each object in the notes array should contain a key (string), keyColor (blue, red, green, or orange), a value (string), and optionally strong (bool) to use a bold font for the value.'),
  keyWidth: PropTypes.string.describe('A CSS unit for the width of the key portion of the table. Defaults to 70px.'),
};

export default FormTable;
