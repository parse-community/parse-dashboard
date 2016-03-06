/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { daysFrom } from 'lib/DateUtils';
import PushCerts from 'components/PushCerts/PushCerts.react';
import React     from 'react';

export const component = PushCerts;

export const demos = [
  {
    render: () => (
      <PushCerts
        uploadPending={true}
        certs={[
          {id:'1', bundle: 'com.parse.Anypic', type: 'iOS Production', expiration: daysFrom(new Date(), 60).toISOString()},
          {id:'2', bundle: 'com.parse.Anypic', type: 'iOS Development', expiration: daysFrom(new Date(), 20).toISOString()},
          {id:'3', bundle: 'com.parse.Anyphone', type: 'iOS Development', expiration: daysFrom(new Date(), -4).toISOString()},
        ]}
        onUpload={()=>{}}
        onDelete={()=>{}} />
    )
  }, {
    render: () => (
      <PushCerts
        certs={undefined}
        onUpload={()=>{}}
        onDelete={()=>{}} />
    )
  }, {
    render: () => (
      <PushCerts
        uploadPending={true}
        certs={[
          {id:'1', bundle: 'com.parse.Anypic', type: 'iOS Production', expiration: daysFrom(new Date(), 60).toISOString()},
        ]}
        error='Something happened, you might want to get that checked out.'
        onUpload={()=>{}}
        onDelete={()=>{}} />
    )
  },
];
