/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button         from 'components/Button/Button.react';
import Dropdown       from 'components/Dropdown/Dropdown.react';
import Field          from 'components/Field/Field.react';
import Fieldset       from 'components/Fieldset/Fieldset.react';
import fieldStyle     from 'components/Field/Field.scss';
import FlowFooter     from 'components/FlowFooter/FlowFooter.react';
import FormNote       from 'components/FormNote/FormNote.react';
import generateCurl   from 'dashboard/Data/ApiConsole/generateCurl';
import JsonPrinter    from 'components/JsonPrinter/JsonPrinter.react';
import Label          from 'components/Label/Label.react';
import Modal          from 'components/Modal/Modal.react';
import Option         from 'components/Dropdown/Option.react';
import Parse          from 'parse';
import React, { Component } from 'react';
import request        from 'dashboard/Data/ApiConsole/request';
import styles         from 'dashboard/Data/ApiConsole/ApiConsole.scss';
import TextInput      from 'components/TextInput/TextInput.react';
import Toggle         from 'components/Toggle/Toggle.react';
import Toolbar        from 'components/Toolbar/Toolbar.react';
import { CurrentApp } from 'context/currentApp';

export default class RestConsole extends Component {
  static contextType = CurrentApp;
  constructor() {
    super()

    this.state = {
      method: 'GET',
      endpoint: '',
      useMasterKey: false,
      runAsIdentifier: '',
      sessionToken: null,
      parameters: '',
      response: {results:[]},
      fetchingUser: false,
      inProgress: false,
      error: false,
      curlModal: false,
    };
  }

  fetchUser() {
    if (this.state.runAsIdentifier.length === 0) {
      this.setState({ error: false, sessionToken: null });
      return;
    }
    Parse.Query.or(
      new Parse.Query(Parse.User).equalTo('username', this.state.runAsIdentifier ),
      new Parse.Query(Parse.User).equalTo('objectId', this.state.runAsIdentifier )
    ).first({ useMasterKey: true }).then((found) => {
      if (found) {
        if (found.getSessionToken()) {
          this.setState({ sessionToken: found.getSessionToken(), error: false, fetchingUser: false });
        } else {
          // Check the Sessions table
          new Parse.Query(Parse.Session).equalTo('user', found).first({ useMasterKey: true }).then((session) => {
            if (session) {
              this.setState({ sessionToken: session.getSessionToken(), error: false, fetchingUser: false });
            } else {
              this.setState({ error: 'Unable to find any active sessions for that user.', fetchingUser: false });
            }
          }, () => {
            this.setState({ error: 'Unable to find any active sessions for that user.', fetchingUser: false });
          });
        }
      } else {
        this.setState({ error: 'Unable to find that user.', fetchingUser: false });
      }
    }, () => {
      this.setState({ error: 'Unable to find that user.', fetchingUser: false });
    });
    this.setState({ fetchingUser: true });
  }

  makeRequest() {
    let endpoint = this.state.endpoint + (this.state.method === 'GET' ? `?${this.state.parameters}` : '');
    let payload = (this.state.method === 'DELETE' || this.state.method === 'GET') ? null : this.state.parameters;
    let options = {};
    if (this.state.useMasterKey) {
      options.useMasterKey = true;
    }
    if (this.state.sessionToken) {
      options.sessionToken = this.state.sessionToken;
    }
    request(
      this.context,
      this.state.method,
      endpoint,
      payload,
      options
    ).then((response) => {
      this.setState({ response });
      document.body.scrollTop = 540;
    });
  }

  showCurl() {
    this.setState({ curlModal: true });
  }

  render() {
    const methodDropdown =
      <Dropdown onChange={(method) => this.setState({method})} value={this.state.method}>
        <Option value='GET'>GET</Option>
        <Option value='POST'>POST</Option>
        <Option value='PUT'>PUT</Option>
        <Option value='DELETE'>DELETE</Option>
      </Dropdown>

    let hasError = this.state.fetchingUser ||
                   this.state.endpoint.length === 0 ||
                   (this.state.runAsIdentifier.length > 0 && !this.state.sessionToken);
    let parameterPlaceholder = 'where={"username":"johndoe"}';
    if (this.state.method === 'POST' || this.state.method === 'PUT') {
      parameterPlaceholder = '{"name":"John"}';
    }

    let modal = null;
    if (this.state.curlModal) {
      let payload = this.state.method === 'DELETE' ? null : this.state.parameters;
      let options = {};
      if (this.state.useMasterKey) {
        options.useMasterKey = true;
      }
      if (this.state.sessionToken) {
        options.sessionToken = this.state.sessionToken;
      }
      let content = generateCurl(
        this.context,
        this.state.method,
        this.state.endpoint,
        payload,
        options
      );
      modal = (
        <Modal
          title='cURL Request'
          subtitle='Use this to replicate the request'
          icon='laptop-outline'
          customFooter={
            <div className={styles.footer}>
              <Button primary={true} value='Close' onClick={() => this.setState({ curlModal: false })} />
            </div>
          }>
          <div className={styles.curl}>{content}</div>
        </Modal>
      );
    }

    return (
      <div style={{ padding: '120px 0 60px 0' }}>
        <Fieldset
          legend='Send a test query'
          description='Try out some queries, and take a look at what they return.'>
          <Field
            label={<Label text='What type of request?' />}
            input={methodDropdown} />
          <Field
            label={<Label text='Which endpoint?' description={<span>Not sure what endpoint you need?<br />Take a look at our <a href="http://docs.parseplatform.org/rest/guide/">REST API guide</a>.</span>} />}
            input={<TextInput value={this.state.endpoint} monospace={true} placeholder={'classes/_User'} onChange={(endpoint) => this.setState({endpoint})} />} />
          <Field
            label={<Label text='Use Master Key?' description={'This will bypass any ACL/CLPs.'} />}
            input={<Toggle value={this.state.useMasterKey} onChange={(useMasterKey) => this.setState({ useMasterKey })} />} />
          <Field
            label={<Label text='Run as...' description={'Send your query as a specific user. You can use their username or Object ID.'} />}
            input={<TextInput value={this.state.runAsIdentifier} monospace={true} placeholder={'Username or ID'} onChange={(runAsIdentifier) => this.setState({runAsIdentifier})} onBlur={this.fetchUser.bind(this)} />} />
          <FormNote color='red' show={!!this.state.error}>{this.state.error}</FormNote>
          <Field
            label={<Label text='Query parameters' description={<span>Learn more about query parameters in our <a href="http://docs.parseplatform.org/rest/guide/#queries">REST API guide</a>.</span>} />}
            input={<TextInput value={this.state.parameters} monospace={true} multiline={true} placeholder={parameterPlaceholder} onChange={(parameters) => this.setState({parameters})} />} />
        </Fieldset>
        <Fieldset
          legend='Results'
          description=''>
          <div className={fieldStyle.field}>
            <JsonPrinter object={this.state.response} />
          </div>
        </Fieldset>
        <Toolbar section='Core' subsection='API Console' />
        <FlowFooter
          primary={<Button primary={true} disabled={hasError} value='Send Query' progress={this.state.inProgress} onClick={this.makeRequest.bind(this)} />}
          secondary={<Button disabled={hasError} value='Export to cURL' onClick={this.showCurl.bind(this)} />} />
        {modal}
      </div>
    );
  }
}
