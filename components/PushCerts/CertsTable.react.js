/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import FormTable from 'components/FormTable/FormTable.react';
import React from 'react';
import { dateStringUTC } from 'lib/DateUtils';

const MONTH_IN_MS = 1000 * 60 * 60 * 24 * 30;

let CertsTable = ({ certs, onDelete, uploadPending }) => {
  let tableData = certs.map(c => {
    let color = '';
    let expiresKeyColor = '';
    let isExpired = new Date(c.expiration) < Date.now();
    if (isExpired) {
      expiresKeyColor = color = 'red';
    } else if (new Date(c.expiration) - Date.now() < MONTH_IN_MS) {
      expiresKeyColor = color = 'orange';
    } else {
      color = 'green';
    }
    return {
      title: c.bundle,
      onDelete: onDelete.bind(null, c.id),
      color: color,
      notes: [
        {
          key: 'Type',
          value: c.type,
          strong: true,
        },
        {
          key: isExpired ? 'Expired' : 'Expires',
          keyColor: expiresKeyColor,
          value: dateStringUTC(new Date(c.expiration)),
        }
      ]
    };
  })
  if (uploadPending) {
    tableData.unshift({
      title: 'Processing File\u2026',
      color: 'blue',
      notes:[
        {
          key: 'Type',
          value: 'Not Sure',
          strong: true,
        },
        {
          key: 'Expires',
          value: 'TBD',
        }
      ],
    });
  }
  return <FormTable items={tableData} />
};

export default CertsTable;
