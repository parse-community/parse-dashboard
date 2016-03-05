/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Fieldset     from 'components/Fieldset/Fieldset.react';
import JsonPrinter  from 'components/JsonPrinter/JsonPrinter.react';
import React        from 'react';

export const component = JsonPrinter;

let json = {
  results: [
    {
      name: 'Apples',
      description: 'Blah blah blah...',
      count: 12,
      edible: true,
      lengthyProp: 'This is a really long sentence that hopefully fills up the entire width of the container, and demonstrates overflow.'
    }, {
      name: 'Bananas',
      description: 'Blah blah blah...',
      count: 3,
      edible: true,
    }, {
      name: 'Rocks',
      description: 'Blah blah blah...',
      count: 44,
      edible: false,
      acquiredAt: {
        name: 'Dusty Flea Market',
        address: '1 Main St',
        phone: '555-555-1234'
      }
    }
  ]
};

export const demos = [
  {
    render: () => (
      <Fieldset legend='My Cool JSON'>
        <JsonPrinter object={json} />
      </Fieldset>
    )
  }
];
