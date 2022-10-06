/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Dropdown           from 'components/Dropdown/Dropdown.react';
import Field              from 'components/Field/Field.react';
import Label              from 'components/Label/Label.react';
import Modal              from 'components/Modal/Modal.react';
import Option             from 'components/Dropdown/Option.react';
import React              from 'react';
import { SpecialClasses } from 'lib/Constants';
import TextInput          from 'components/TextInput/TextInput.react';
import { withRouter } from 'lib/withRouter';

function validClassName(name) {
  return !!name.match(/^[a-zA-Z][_a-zA-Z0-9]*$/);
}

@withRouter
class CreateClassDialog extends React.Component {
  constructor() {
    super();
    this.state = {
      type: 'Custom',
      name: ''
    };
  }

  valid() {
    if (this.state.type !== 'Custom') {
      return true;
    }
    if (this.state.name.length === 0) {
      return false;
    }
    if (!validClassName(this.state.name)) {
      return false;
    }
    if (this.props.currentClasses.indexOf(this.state.name) > -1) {
      return false;
    }
    return true;
  }

  render() {
    let availableClasses = ['Custom'];
    for (let raw of SpecialClasses) {
      if (raw !== '_Session' && !this.props.currentClasses.includes(raw)) {
        availableClasses.push(raw);
      }
    }

    let typeDropdown = (
      <Dropdown
        value={this.state.type}
        onChange={(type) => this.setState({ type: type, name: '' })}>
        {availableClasses.map((t) => <Option key={t} value={t}>{t}</Option>)}
      </Dropdown>
    );
    return (
      <Modal
        type={Modal.Types.INFO}
        icon='plus'
        iconSize={40}
        title='Create a new class?'
        subtitle='This creates a new class to hold objects.'
        disabled={!this.valid()}
        confirmText='Create'
        cancelText='Cancel'
        continueText={'Create & add columns'}
        onCancel={this.props.onCancel}
        showContinue={true}
        onContinue={async () => {
          let type = this.state.type;
          let className = type === 'Custom' ? this.state.name : type;
          await this.props.onConfirm(className);
          this.props.navigate(`/apps/${this.props.currentAppSlug}/browser/${className}`);
          this.props.onAddColumn();
        }}
        onConfirm={() => {
          let type = this.state.type;
          let className = type === 'Custom' ? this.state.name : type;
          this.props.onConfirm(className);
        }}>
        {availableClasses.length > 1 ?
          <Field
          label={
            <Label
              text='What type of class do you need?' />
          }
          input={typeDropdown} /> : null
        }
        {this.state.type === 'Custom' ?
          <Field
            label={<Label text='What should we call it?' description={'Don\u2019t use any special characters, and start your name with a letter.'} />}
            input={<TextInput placeholder='Give it a good name...' value={this.state.name} onChange={(name) => this.setState({ name })} />}/> : null
        }
      </Modal>
    );
  }
}

export default CreateClassDialog;
