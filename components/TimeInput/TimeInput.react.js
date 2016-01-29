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