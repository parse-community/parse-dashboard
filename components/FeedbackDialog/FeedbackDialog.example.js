/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button         from 'components/Button/Button.react';
import FeedbackDialog from 'components/FeedbackDialog/FeedbackDialog.react';
import React          from 'react';

export const component = FeedbackDialog;

class FeedbackDialogDemo extends React.Component {
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
          value='Send feedback'
          primary={true}
          onClick={() => {
            this.setState({
              showModal: true
            });
          }}>
        </Button>
        {this.state.showModal ? <FeedbackDialog
          onClose={() => {
            this.setState({
              showModal: false
            });
          }}
          open={this.state.showModal} /> : null}
      </div>
    )
  }
}

export const demos = [
  {
    render() {
      return (<FeedbackDialogDemo />);
    }
  }
];
