import React        from 'react';
import PlatformCard from 'components/PlatformCard/PlatformCard.react';

export const component = PlatformCard;

export const demos = [
  {
    name: 'iOS PlatformCard',
    render: () => (
      <PlatformCard
       platform='apple'
       name='iOS'
       subtitle='Swift'
       color='blue' />
    )
  },
  {
    name: 'Xamarin PlatformCard',
    render: () => (
      <PlatformCard
       platform='xamarin'
       name='iOS'
       subtitle='Xamarin'
       color='blue' />
    )
  },
  {
    name: 'OSX PlatformCard',
    render: () => (
      <PlatformCard
       platform='apple'
       name='OSX'
       color='green' />
    )
  },
  {
    name: 'RPi PlatformCard',
    render: () => (
      <PlatformCard
       platform='rpi'
       name='Linux C (Raspberry Pi)'
       color='red' />
    )
  },
  {
    name: 'Arduino PlatformCard',
    render: () => (
      <PlatformCard
       platform='arduino'
       name='Arduino Yun'
       color='red' />
    )
  },
];
