import React from 'react';
import PushAudiencesOption from 'components/PushAudiencesSelector/PushAudiencesOption.react';

export const component = PushAudiencesOption;

let mockData = {
  id: '1',
  name: 'Everyone',
  createdAt: new Date(1444757195683)
};

export const demos = [
  {
  render() {
    return (
      <PushAudiencesOption
        id={mockData.id}
        inputId={mockData.inputId}
        name={mockData.name}
        createdAt={mockData.createdAt}
        inputName='test'
      />
    );
  }
}
];
