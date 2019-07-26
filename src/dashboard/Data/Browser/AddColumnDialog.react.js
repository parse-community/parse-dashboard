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
import TextInput          from 'components/TextInput/TextInput.react';
import Toggle             from 'components/Toggle/Toggle.react';
import styles             from 'dashboard/Data/Browser/Browser.scss';
import {
  DataTypes,
  SpecialClasses
}                         from 'lib/Constants';

function validColumnName(name) {
  return !!name.match(/^[a-zA-Z0-9][_a-zA-Z0-9]*$/);
}

export default class AddColumnDialog extends React.Component {
  constructor(props) {
    super();
    this.state = {
      type: 'String',
      target: props.classes[0],
      name: '',
      required: false
    };
  }

  valid() {
    if (this.state.name.length === 0) {
      return false;
    }
    if (!validColumnName(this.state.name)) {
      return false;
    }
    if (this.props.currentColumns.indexOf(this.state.name) > -1) {
      return false;
    }
    return true;
  }

  renderClassDropdown() {
    return (
      <Dropdown
        value={this.state.target}
        onChange={(target) => this.setState({ target: target })}>
        {this.props.classes.map((c) => <Option key={c} value={c}>{SpecialClasses[c] || c}</Option>)}
      </Dropdown>
    );
  }

  render() {
    let typeDropdown = (
      <Dropdown
        value={this.state.type}
        onChange={(type) => this.setState({ type: type })}>
        {DataTypes.map((t) => <Option key={t} value={t}>{t}</Option>)}
      </Dropdown>
    );
    return (
      <Modal
        type={Modal.Types.INFO}
        icon='ellipses'
        iconSize={30}
        title='Add a new column'
        subtitle='Store another type of data in this class.'
        disabled={!this.valid()}
        confirmText='Add column'
        cancelText={'Never mind, don\u2019t.'}
        onCancel={this.props.onCancel}
        onConfirm={() => {
          this.props.onConfirm(this.state);
        }}>
        <Field
          label={
            <Label
              text='What type of data do you want to store?' />
          }
          input={typeDropdown} />
        {this.state.type === 'Pointer' || this.state.type === 'Relation' ?
          <Field
            label={<Label text='Target class' />}
            input={this.renderClassDropdown()} /> : null}
        <Field
          label={<Label text='What should we call it?' description={'Don\u2019t use any special characters, and start your name with a letter.'} />}
          input={<TextInput placeholder='Give it a good name...' value={this.state.name} onChange={(name) => this.setState({ name })} />}/>
        <Field
          label={<Label text='Is it a required field?' description={'When true this field must be filled when a new object is created'} />}
          input={<Toggle value={this.state.required} type={Toggle.Types.YES_NO} onChange={(required) => this.setState({ required })}  additionalStyles={{ margin: '0px' }}/>}
          className={styles.addColumnToggleWrapper}/>
      </Modal>
    );
  }
}