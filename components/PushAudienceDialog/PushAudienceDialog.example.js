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
