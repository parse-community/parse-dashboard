import React from 'react';
import Modal from 'components/Modal/Modal.react';
import Button from 'components/Button/Button.react';

export const component = Modal;

class ModalDemo extends React.Component {
  constructor() {
    super()
    this.state = {
      showModal: false,
    };
  }

  render() {
    return (
      <div>
        <Button
          value='Show demo modal'
          onClick={this.setState.bind(this, { showModal: true }, () => {})}/>
        {this.state.showModal ? <Modal
          {...this.props}
          onConfirm={this.setState.bind(this, { showModal: false }, () => {})}
          onCancel={this.setState.bind(this, { showModal: false }, () => {})}>
          {this.props.children}
        </Modal> : null}
      </div>
    );
  }
}

export const demos = [
  {
    name: 'Modal with children',
    render: () => <ModalDemo title='With Children' subtitle='And Subtitle'>Children</ModalDemo>,
  },
  {
    name: 'Modal without children',
    render: () => <ModalDemo title='Without Children'>{null}</ModalDemo>,
  },
  {
    name: 'Modal without children, but with buttons on right anyway.',
    render: () => <ModalDemo title='Without Children' buttonsInCenter={false}>{null}</ModalDemo>,
  },
];
