/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import LoginForm from 'components/LoginForm/LoginForm.react';
import LoginRow  from 'components/LoginRow/LoginRow.react';
import React     from 'react';
import styles    from './Login.scss';
import { setBasePath }    from 'lib/AJAX';

export default class Login extends React.Component {
  constructor(props) {
    super();

    let errorDiv = document.getElementById('login_errors');
    let otpLength = 6;
    if (errorDiv) {
      this.errors = errorDiv.innerHTML;
      try {
        const json = JSON.parse(this.errors)
        this.errors = json.text
        otpLength = json.otpLength;
      } catch (e) {
        this.errors = this.errors ?? `Error: ${JSON.stringify(e)}`;
      }
    }

    const url = new URL(window.location);
    const redirect = url.searchParams.get('redirect');
    this.state = {
      forgot: false,
      username: sessionStorage.getItem('username') || '',
      password: sessionStorage.getItem('password') || '',
      redirect: redirect !== '/' ? redirect : undefined
    };
    sessionStorage.clear();
    setBasePath(props.path);
    this.inputRefUser = React.createRef();
    this.inputRefPass = React.createRef();
    this.inputRefMfa = React.createRef();
    this.otpLength = otpLength;
  }

  componentDidMount() {
    if (this.errors) {
      const e = this.errors.toLowerCase();
      if (e.includes('missing credentials') || e.includes('invalid username or password')) {
        if (this.inputRefUser.current.value.length < 1) {
          this.inputRefUser.current.focus();
        } else {
          this.inputRefPass.current.focus();
        }
      } else if (e.includes('one-time')) {
        this.inputRefMfa.current.focus();
      }
    } else {
      this.inputRefUser.current.focus();
    }
  }

  render() {
    const {path} = this.props;
    const updateField  = (field, e) => {
      this.setState({[field]: e.target.value});
      if (field === 'otp' && e.target.value.length >= this.otpLength) {
        const input = document.querySelectorAll('input');
        for (const field of input) {
          if (field.type === 'submit') {
            field.click();
            break;
          }
        }
      }
    }
    const formSubmit = () => {
      sessionStorage.setItem('username', this.state.username);
      sessionStorage.setItem('password', this.state.password);
    }

    return (
      <LoginForm
        header='Access your Dashboard'
        action='Log In'
        endpoint={`${path}login`}
        formSubmit={formSubmit}
        >
        <LoginRow
          label='Username'
          input={
            <input
              name='username'
              type='username'
              value={this.state.username}
              onChange={e => updateField('username', e)}
              ref={this.inputRefUser}
            />
          } />
        <LoginRow
          label='Password'
          input={
            <input
              name='password'
              type='password'
              value={this.state.password}
              onChange={e => updateField('password', e)}
              ref={this.inputRefPass}
            />
          } />
          {this.state.redirect && <input
              name='redirect'
              type='hidden'
              value={this.state.redirect}
            />}
        {
          this.errors && this.errors.includes('one-time') ?
          <LoginRow
            label='OTP'
            input={
              <input
                name='otpCode'
                type='text'
                inputMode="numeric"
                autoComplete='one-time-code'
                pattern="[0-9]*"
                onChange={e => updateField('otp', e)}
                ref={this.inputRefMfa}
              />
            } />
          : null
        }
        {this.errors ?
          <div className={styles.error}>
            {this.errors}
          </div> : null}
      </LoginForm>
    );
  }
}
