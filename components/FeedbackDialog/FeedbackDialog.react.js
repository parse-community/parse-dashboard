/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AccountManager   from 'lib/AccountManager';
import Button           from 'components/Button/Button.react';
import Dropdown         from 'components/Dropdown/Dropdown.react';
import Field            from 'components/Field/Field.react';
import FormModal        from 'components/FormModal/FormModal.react';
import Label            from 'components/Label/Label.react';
import Modal            from 'components/Modal/Modal.react';
import Option           from 'components/Dropdown/Option.react';
import Parse            from 'parse';
import ParseApp         from 'lib/ParseApp';
import PropTypes        from 'lib/PropTypes';
import queryFromFilters from 'lib/queryFromFilters';
import React            from 'react';
import ReactDOM         from 'react-dom';
import styles           from 'components/FeedbackDialog/FeedbackDialog.scss';
import TextInput        from 'components/TextInput/TextInput.react';

let CATEGORIES_MAP = {
  core: 'Core',
  push: 'Push',
  analytics: 'Analytics',
  appsettings: 'App Settings',
  misc: 'Miscellaneous',
}

let LABELS_MAP = {
  general: 'General',
  bug: 'Bug',
  enhancement: 'Enhancement',
  question: 'Question',
}

let sendFeedback = (body) => {
  let errorMessage = 'An error has ocurred submitting your feedback, please try again.';
  let p = new Parse.Promise();
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.parse.com/1/functions/feedback', true);
  xhr.setRequestHeader('X-Parse-Application-Id', '8g7fNe3bRA5dRBiMdNkcF6DFIxdHmTyQvYoWK5KC');
  xhr.setRequestHeader('X-Parse-REST-API-Key', 'IHm7oxroC2VFRL5gskqBcU8HnUlkFhOU2uFrG7lr');
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onerror = (e) => {
    p.reject({
      success: false,
      message: errorMessage,
    });
  };

  let data = JSON.stringify(body);
  xhr.onload = function(e) {
    if (this.status === 200) {
      let json = {};
      try {
        json = JSON.parse(this.responseText);
      } catch(ex) {
        p.reject(this.responseText);
        return;
      }
      if (json.hasOwnProperty('success') && json.success === false) {
        p.reject(json);
      } else {
        p.resolve(json);
      }
    } else {
      p.reject({
        success: false,
        message: errorMessage,
      });
    }
  };
  xhr.send(data);
  return p;
}

export default class FeedbackDialog extends React.Component {
  constructor() {
    super();
    this.state = {
      label: undefined,
      category: undefined,
      feedback: ''
    };
  }

  componentDidMount() {
    let inputDOMNode = ReactDOM.findDOMNode(this.refs.input);
    inputDOMNode.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });
    inputDOMNode.addEventListener('keypress', (e) => {
      e.stopPropagation();
    });
  }

  componentWillUnMount() {
    let inputDOMNode = ReactDOM.findDOMNode(this.refs.input);
    inputDOMNode.removeEventListener('keydown');
    inputDOMNode.removeEventListener('keypress');
  }

  handleSubmit() {
    let navigator  = window.navigator;
    let screen = window.screen;
    let data = {
      label: this.state.label,
      category: this.state.category,
      feedback: this.state.feedback, 
      userAgent: navigator.userAgent,
      languages: navigator.languages,
      screen: `${screen.width}x${screen.height}`,
      url: window.location.href,
      appName: this.context.currentApp ? this.context.currentApp.name : '',
      email: AccountManager.currentUser().email,
    }
    return sendFeedback(data);
  }

  render() {
    let categories = [];
    let labels = [];
    let enabled = false;

    for (let category in CATEGORIES_MAP) {
      if (CATEGORIES_MAP.hasOwnProperty(category)) {
        categories.push(
          <Option value={category} key={`category${category}`}>{CATEGORIES_MAP[category]}</Option>
        );
      }
    }

    for (let label in LABELS_MAP) {
      if (LABELS_MAP.hasOwnProperty(label)) {
        labels.push(
          <Option value={label} key={`label${label}`}>{LABELS_MAP[label]}</Option>
        );
      }
    }

    if (this.state.label && this.state.category && this.state.feedback !== '') {
      enabled = true;
    }

    return (
      <FormModal
        open={this.props.open}
        onSubmit={this.handleSubmit.bind(this)}
        onClose={this.props.onClose}
        submitText='Send Feedback'
        enabled={enabled}
        title='Dashboard Feedback'
        type={Modal.Types.INFO}
        icon='question-solid'
        inProgressText='Sending...'
        width={600}>
        <div>
        <div className={styles.feedbackSubline}>
          We hope you&#39;re enjoying the new dashboard! If you have any thoughts on how we can make this experience even better, please let us know. We&#39;re actively iterating throughout the beta period!
          <br/>
          <br/>
         <strong> If you&#39;re experiencing an SDK or service related issue</strong> please use our <a target='_blank' href='https://www.parse.com/help'>normal bug reporting flow</a> for the fastest response.
        </div>
        <Field
          label={<Label text='Which part of the dashboard?'/>}
          input={<Dropdown
            fixed={true}
            hideArrow={true}
            value={this.state.category}
            onChange={(category) => {
              this.setState({ category })
            }}
            placeHolder='Choose a category...'
            className={styles.conditionDropdown}>
            {categories}
          </Dropdown>} />
        <Field
          label={<Label text='What type of feedback?'/>}
          input={<Dropdown
            fixed={true}
            hideArrow={true}
            value={this.state.label}
            onChange={(label) => {
              this.setState({ label });
            }}
            placeHolder='Choose a label...'
            className={styles.conditionDropdown}>
            {labels}
          </Dropdown>} />
        <Field
          labelWidth={35}
          label={<Label text='What&#39;s on your mind?'/>}
          input={<TextInput
            ref='input'
            multiline={true}
            value={this.state.feedback}
            onChange={(feedback) => {
              this.setState({ feedback });
            }}
            height={200}
            placeholder='Tell us what&#39;s on your mind...'
            className={styles.conditionDropdown}/>} />
        </div>
      </FormModal>
    );
  }
}

FeedbackDialog.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};

