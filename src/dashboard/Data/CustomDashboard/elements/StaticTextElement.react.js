/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import styles from './StaticTextElement.scss';

const sizeMap = {
  body: styles.body,
  h1: styles.h1,
  h2: styles.h2,
  h3: styles.h3,
};

const StaticTextElement = ({ config = {} }) => {
  const { text, textSize, isBold, isItalic } = config;

  const className = [
    styles.staticText,
    sizeMap[textSize] || styles.body,
    isBold ? styles.bold : '',
    isItalic ? styles.italic : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {text || 'Enter your text...'}
    </div>
  );
};

export default StaticTextElement;
