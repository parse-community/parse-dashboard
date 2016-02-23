/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React  from 'react';
import Button from 'components/Button/Button.react';

export const component = Button;

export const demos = [
  {
    name: 'Normal buttons',
    render: () => (
      <div>
        <Button value='Click me' />&nbsp;
        <Button color='green' value='Green' />&nbsp;
        <Button color='red' value='Red' />
      </div>
    )
  }, {
    name: 'Primary vs secondary buttons',
    render: () => (
      <div>
        <Button value='Primary action' primary={true} />&nbsp;
        <Button value='Secondary action' />
      </div>
    )
  }, {
    name: 'Disabled button',
    render: () => (
      <div>
        <Button value='Do not click' disabled={true} />
      </div>
    )
  }, {
    name: 'Progress button',
    render: () => (
      <div>
        <Button value='Saving.' progress={true} primary={true} />
      </div>
    )
  }, {
    name: 'Red progress button',
    render: () => (
      <div>
        <Button value='Saving.' color='red' progress={true} primary={true} />
      </div>
    )
  }
];
