import { center } from 'stylesheets/base.scss';
import Loader from 'components/Loader/Loader.react';
import React  from 'react';

export const component = Loader;

export const demos = [
  {
    render() {
      return (
        <div style={{
          width: 500,
          height: 500,
          margin: '10px auto',
          position: 'relative'
        }}>
          <Loader className={center} />
        </div>
      );
    }
  }
];
