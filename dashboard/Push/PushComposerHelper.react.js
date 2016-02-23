/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimeInput from 'components/DateTimeInput/DateTimeInput.react';
import Dropdown      from 'components/Dropdown/Dropdown.react';
import Field         from 'components/Field/Field.react';
import Label         from 'components/Label/Label.react';
import Option        from 'components/Dropdown/Option.react';
import React         from 'react';
import Toggle        from 'components/Toggle/Toggle.react';
import { pad }       from 'lib/DateUtils';

export function setTimeFieldDescription(isLocal) {
  return isLocal ? 'LOCAL TIME' : null;
} 

/**
 * Sets the field with or without 'Z' ending based on isLocal flag
 * Passing a date value without iso ending of 'Z' is considered user local time
 * @param {Function}  setField - function to set field
 * @param {String}  field - field name in flow view
 * @param {Date}  value - Date value
 * @param {Boolean} isLocal - flag describing if time is displayed as local or UTC time
 */
export function setPushTimeField(setField, field, value, isLocal) {
  if (isLocal && value.constructor === Date) {
    let _value = value.getFullYear()
      + '-' + pad(value.getMonth() + 1)
      + '-' + pad(value.getDate())
      + 'T' + pad(value.getHours())
      + ':' + pad(value.getMinutes())
      + ':' + pad(value.getSeconds())
      + '.' + String((value.getMilliseconds()/1000).toFixed(3)).slice(2, 5);
    setField(field, _value);
  } else {
    setField(field, value);
  }
}

/**
 * Formats time to local or to UTC time based on isLocal flag
 * @param {Function}  setField - function to set field
 * @param {String}  field - field name in flow view
 * @param {Date}  value - Date value
 * @param {Boolean} isLocal - flag describing if time is displayed as local or UTC time
 */
export function localTimeFormater(setField, field, value, isLocal) {
  if (value && value.constructor === Date) {
    let offset = value.getTimezoneOffset()*60*1000;
    let newDate = new Date(value.getTime() + (isLocal ? offset : -offset ));
    setField(field + '_iso', newDate);
    setPushTimeField(setField, field, newDate, isLocal);
  }
}

export function renderExpirationContent(fields, setField) {
  if (!fields.push_expires) {
    return null;
  }
  let expirationContent = [
    <Field
      key='expiration_time_type'
      label={<Label text='What type of expiration?' />}
      input={<Toggle
        type={Toggle.Types.CUSTOM}
        labelLeft='A Specific Time'
        labelRight='After Interval'
        optionLeft='time'
        optionRight='interval'
        direction='left'
        value={fields.expiration_time_type}
        onChange={setField.bind(null, 'expiration_time_type')} />
      } />
  ];
  if (fields.expiration_time_type === 'time') {
    expirationContent.push(
      <Field
        key='expiration_time'
        label={<Label text='When should it expire?' description={setTimeFieldDescription(fields.local_time)} />}
        input={
          <DateTimeInput
            local={fields.local_time}
            value={fields.expiration_time_iso}
            onChange={(value) => {
              setField('expiration_time_iso', value);
              setPushTimeField(setField, 'expiration_time', value, fields.local_time);
            }} /> 
        } />
    );
  } else {
    let expirationIntervalNums = [];
    let unit = fields.expiration_interval_unit === 'hours' ? 24 : 30;
    for (let i = 1; i <= unit; i++) {
      expirationIntervalNums.push(
        <Option key={'intervalNums' + i} value={`${i}`}>{i}</Option>
      );
    }

    let expirationIntervalUnits = [
      <Option key={'intervalUnitHours'} value={'hours'}>{fields.expiration_interval_num === '1' ? 'Hour' : 'Hours'}</Option>,
      <Option key={'intervalUnitDays'} value={'days'}>{fields.expiration_interval_num === '1' ? 'Day' : 'Days'}</Option>
    ];

    expirationContent.push(
      <Field
        key='expiration_interval'
        label={<Label text='Expire after how long?' />}
        input={
          <div>
            <Dropdown
              width='40%'
              value={fields.expiration_interval_num}
              onChange={setField.bind(null, 'expiration_interval_num')}>
              {expirationIntervalNums}
            </Dropdown>
            <Dropdown
              width='60%'
              value={fields.expiration_interval_unit}
              onChange={(value) => {
                //handle case when interval num is out of expected range
                if (value === 'hours' && Number(fields.expiration_interval_num) > 24 ) {
                  setField('expiration_interval_num', '24');
                }
                setField('expiration_interval_unit', value);
              }} >
              {expirationIntervalUnits}
            </Dropdown>
          </div>
        } />
    );
  }
  return expirationContent;
}
