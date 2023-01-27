/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Modal       from 'components/Modal/Modal.react';
import React       from 'react';
import Dropdown    from 'components/Dropdown/Dropdown.react';
import Field       from 'components/Field/Field.react';
import Label       from 'components/Label/Label.react';
import Option      from 'components/Dropdown/Option.react';
import Toggle      from 'components/Toggle/Toggle.react';

export default class ExportSchemaDialog extends React.Component {
  constructor(props) {
    super();
    const classes = Object.keys(props.schema.toObject()).sort();
    classes.sort((a, b) => {
      if (a[0] === '_' && b[0] !== '_') {
        return -1;
      }
      if (b[0] === '_' && a[0] !== '_') {
        return 1;
      }
      return a.toUpperCase() < b.toUpperCase() ? -1 : 1;
    });
    this.state = {
      all: false,
      className: props.className,
      classes
    };
  }


  render() {
    return (
      <Modal
        type={Modal.Types.INFO}
        icon='down-outline'
        iconSize={40}
        title={`Export SCHEMA for ${this.state.className}`}
        confirmText='Export'
        cancelText='Cancel'
        onCancel={this.props.onCancel}
        onConfirm={() => this.props.onConfirm(this.state.className, this.state.all)}>
        {!this.state.all &&
          <Field
            label={<Label text='Select class' />}
            input={
              <Dropdown
                value={this.state.className}
                onChange={(className) => this.setState({ className })}>
                {this.state.classes.map(schema => <Option value={schema} key={schema}>{schema}</Option>)}
              </Dropdown>
            } />
        }
        <Field
          label={<Label text='Export all classes' />}
          input={<Toggle value={this.state.all} type={Toggle.Types.YES_NO} onChange={(all) => {this.setState({all})}} />} />
      </Modal>
    );
  }
}
