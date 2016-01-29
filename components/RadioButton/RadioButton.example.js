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
