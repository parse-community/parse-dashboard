/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { ActionTypes }        from 'lib/stores/TokensStore';
import Button                 from 'components/Button/Button.react';
import TokenDialog            from 'dashboard/Data/Tokens/TokensDialog.react';
import EmptyState             from 'components/EmptyState/EmptyState.react';
import Icon                   from 'components/Icon/Icon.react';
import { isDate }             from 'lib/DateUtils';
import Parse                  from 'parse';
import React                  from 'react';
import SidebarAction          from 'components/Sidebar/SidebarAction';
import subscribeTo            from 'lib/subscribeTo';
import TableHeader            from 'components/Table/TableHeader.react';
import TableView              from 'dashboard/TableView.react';
import Toolbar                from 'components/Toolbar/Toolbar.react';

@subscribeTo('Tokens', 'tokens')
class Tokens extends TableView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Tokens';
    this.action = new SidebarAction('Create a token', this.createToken.bind(this));
    this.state = {
      modalOpen: false,
      showDeleteParameterDialog: false,
      modalParam: '',
      modalType: 'String',
      modalValue: '',
      modalMasterKeyOnly: false
    };
  }

  componentWillMount() {
    this.props.tokens.dispatch(ActionTypes.FETCH);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      nextProps.tokens.dispatch(ActionTypes.FETCH);
    }
  }

  renderToolbar() {
    return (
      <Toolbar
        section='Core'
        subsection='Tokens'>
        <Button color='white' value='Create a token' onClick={this.craeteToken.bind(this)} />
      </Toolbar>
    );
  }

  renderExtras() {
    const { currentApp = {} } = this.context;
    let extras = null;
    if (this.state.modalOpen) {
      extras = (
        <TokenDialog
          onConfirm={this.saveParam.bind(this)}
          onCancel={() => this.setState({ modalOpen: false })}
          param={this.state.modalParam}
          type={this.state.modalType}
          value={this.state.modalValue}
          masterKeyOnly={this.state.modalMasterKeyOnly}
          parseServerVersion={currentApp.serverInfo && currentApp.serverInfo.parseServerVersion} />
      );
    } else if (this.state.showDeleteParameterDialog) {
      extras = (
        <DeleteParameterDialog
          param={this.state.modalParam}
          onCancel={() => this.setState({ showDeleteParameterDialog: false })}
          onConfirm={this.deleteParam.bind(this, this.state.modalParam)} />
      );
    }
    return extras;
  }

  renderRow(data) {
    let value = data.value;
    let modalValue = value;
    let type = typeof value;

    if (type === 'object') {
      if (isDate(value)) {
        type = 'Date';
        value = value.toISOString();
      } else if (Array.isArray(value)) {
        type = 'Array';
        value = JSON.stringify(value);
        modalValue = value;
      } else if (value instanceof Parse.GeoPoint) {
        type = 'GeoPoint';
        value = `(${value.latitude}, ${value.longitude})`;
        modalValue = data.value.toJSON();
      } else if (data.value instanceof Parse.File) {
        type = 'File';
        value = <a target='_blank' href={data.value.url()}>Open in new window</a>;
      } else {
        type = 'Object';
        value = JSON.stringify(value);
        modalValue = value;
      }
    } else {
      if (type === 'boolean') {
        value = value ? 'true' : 'false';
      }
      type = type.substr(0, 1).toUpperCase() + type.substr(1);
    }
    let openModal = () => this.setState({
      modalOpen: true,
      modalParam: data.param,
      modalType: type,
      modalValue: modalValue,
      modalMasterKeyOnly: data.masterKeyOnly
    });
    let columnStyleLarge = { width: '30%', cursor: 'pointer' };
    let columnStyleSmall = { width: '15%', cursor: 'pointer' };

    let openModalValueColumn = () => {
      if (data.value instanceof Parse.File) {
        return
      }
      openModal()
    }
  
    let openDeleteParameterDialog = () => this.setState({
      showDeleteParameterDialog: true,
      modalParam: data.param
    });

    return (
      <tr key={data.param}>
        <td style={columnStyleLarge} onClick={openModal}>{data.param}</td>
        <td style={columnStyleSmall} onClick={openModal}>{type}</td>
        <td style={columnStyleLarge} onClick={openModalValueColumn}>{value}</td>
        <td style={columnStyleSmall} onClick={openModal}>{data.masterKeyOnly.toString()}</td>
        <td style={{ textAlign: 'center' }}>
          <a onClick={openDeleteParameterDialog}>
            <Icon width={16} height={16} name='trash-solid' fill='#ff395e' />
          </a>
        </td>
      </tr>
    );
  }

  renderHeaders() {
    return [
      <TableHeader key='token' width={30}>Token</TableHeader>,
      <TableHeader key='type' width={15}>Type</TableHeader>,
      <TableHeader key='minted' width={30}>Minted Count</TableHeader>,
    ];
  }

  renderEmpty() {
    return (
      <EmptyState
        title='Create tokens'
        description='Create a new token to use in your app.'
        icon='gears'
        cta='Create your first token'
        action={this.createToken.bind(this)} />
    );
  }

  tableData() {
    let data = undefined;
    if (this.props.tokens.data) {
      let tokens = this.props.tokens.data.get('tokens');
      if (tokens) {
        data = [];
        tokens.forEach((value, token) => {
          data.push({ param: param, value: value })
        });
        data.sort((object1, object2) => {
          return object1.param.localeCompare(object2.param);
        });
      }
    }
    return data;
  }

  saveToken({ name, value }) {
    this.props.tokens.dispatch(
      ActionTypes.SET,
      { token: name, value: value }
    ).then(() => {
      this.setState({ modalOpen: false });
    }, () => {
      // Catch the error
    });
  }

  createToken() {
    this.setState({
      modalOpen: true,
      modalParam: '',
      modalType: 'String',
      modalValue: '',
      modalMasterKeyOnly: false
    });
  }
}

export default Tokens;
