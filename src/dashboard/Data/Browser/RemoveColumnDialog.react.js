/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button             from 'components/Button/Button.react';
import Dropdown           from 'components/Dropdown/Dropdown.react';
import Field              from 'components/Field/Field.react';
import { footer }         from 'components/Modal/Modal.scss';
import Label              from 'components/Label/Label.react';
import Modal              from 'components/Modal/Modal.react';
import Option             from 'components/Dropdown/Option.react';
import React              from 'react';

export default class RemoveColumnDialog extends React.Component {
  constructor(props) {
    super();
    this.state = {
      name: props.currentColumns[0]
    };
  }

  render() {
    let content = null;
    let hasColumns = this.props.currentColumns.length > 0;
    if (hasColumns) {
      content = (
        <Field
          label={
            <Label
              text='Which column?' />
            }
          input={
            <Dropdown
              value={this.state.name}
              onChange={(name) => this.setState({ name: name })}>
              {this.props.currentColumns.map((t) => <Option key={t} value={t}>{t}</Option>)}
            </Dropdown>
          } />
      )
    }
    return (
      <Modal
        type={Modal.Types.DANGER}
        icon='warn-outline'
        title='Remove a column'
        subtitle={hasColumns ? 'Be careful, this action cannot be undone.' : 'There are no removable columns on this class.'}
        confirmText='Remove column'
        cancelText={'Never mind, don\u2019t.'}
        onCancel={this.props.onCancel}
        onConfirm={() => {
          this.props.onConfirm(this.state.name);
        }}
        customFooter={hasColumns ? null :
          <div className={footer}>
            <Button value='Okay, go back.' onClick={this.props.onCancel} />
          </div>
        }>
        {content}
      </Modal>
    );
  }
}