/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button             from 'components/Button/Button.react';
import PushAudienceDialog from 'components/PushAudienceDialog/PushAudienceDialog.react';
import React              from 'react';

export const component = PushAudienceDialog;

class PushAudienceDialogDemo extends React.Component {
  constructor() {
    super()
    this.state = {
      showModal: false
    };
  }

  render() {
    return (
      <div>
        <Button
          value='Create a new audiences'
          primary={true}
          onClick={() => {
            this.setState({
              showModal: true
            });
          }}>
        </Button>
        {this.state.showModal ? <PushAudienceDialog
          audienceSize={999999}
          secondaryAction={() => {
            this.setState({
              showModal: false
            });
          }}/> : null}
      </div>
    )
  }
}

export const demos = [
  {
    render() {
      return (<PushAudienceDialogDemo />);
    }
  }
];
