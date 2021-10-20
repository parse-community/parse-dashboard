/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option   from 'components/Dropdown/Option.react';
import React    from 'react';

let hourOptions = [];
for (let i = 0; i < 24; i++) {
  hourOptions.push(<Option key={`hour_${i}`} value={String(i)}>{i}</Option>);
}

let minuteOptions = [];
for (let i = 0; i < 60; i++) {
  let content = String(i);
  if (content.length === 1) {
    content = '0' + content;
  }
  minuteOptions.push(<Option key={`minute_${i}`} value={content}>{content}</Option>);
}

let TimeInput = ({ hours, minutes, onChange }) => {
  return (
    <div>
      <div style={{ width: '50%', display: 'inline-block', verticalAlign: 'top' }}>
        <Dropdown value={hours} onChange={(newHours) => onChange(newHours, minutes)}>
          {hourOptions}
        </Dropdown>
      </div>
      <div style={{ width: '50%', display: 'inline-block', verticalAlign: 'top' }}>
        <Dropdown value={minutes} onChange={(newMinutes) => onChange(hours, newMinutes)}>
          {minuteOptions}
        </Dropdown>
      </div>
    </div>
  );
};

export default TimeInput;
