/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import RadioButton from 'components/RadioButton/RadioButton.react';

export const component = RadioButton;

export const demos = [
  {
    name: 'Unchecked State',
    render() {
      return (
        <RadioButton />
     );
    },
  },
  {
    name: 'Checked State',
    render() {
      return (
        <RadioButton checked={true}/>
      );
    }
  },
  {
    name: 'Disabled State [styles tbd]',
    render() {
      return (
        <RadioButton disabled={true}/>
      );
    }
  },
  {
    name: 'Disabled Checked State [styles tbd]',
    render() {
      return (
        <RadioButton checked={true} disabled={true}/>
      );
    }
  }
];
