import Calendar from 'components/Calendar/Calendar.react';
import React    from 'react';

export const component = Calendar;

export const demos = [
  {
    render: () => (
      <div>
        <Calendar value={new Date()} onChange={function() {}} />
      </div>
    )
  }
];
