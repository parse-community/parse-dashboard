import React from 'react';
import { horizontalCenter } from 'stylesheets/base.scss'

export default class JobScheduleReminder extends React.Component {
  render() {
    return (
      <div className={horizontalCenter}>
        <p>
          {"Be noted that "}
          <b>{"parse-server doesn't run the jobs in the scheduled times"}</b>
          {" by itself."}
        </p>
        <p>
          {"Please take a look at the "}
          <a href="http://docs.parseplatform.org/parse-server/guide/#jobs">{'docs'}</a>
          {" on how to do that."}
        </p>
      </div>
    );
  }
}
