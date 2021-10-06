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
    if (errorDiv) {
      this.errors = errorDiv.innerHTML;
    }

    this.state = {
      forgot: false,
      username: sessionStorage.getItem('username') || '',
      password: sessionStorage.getItem('password') || ''
    };
    sessionStorage.clear();
    setBasePath(props.path);
    this.inputRefUser = React.createRef();
    this.inputRefPass = React.createRef();
    this.inputRefMfa = React.createRef();
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
        {
          this.errors && this.errors.includes('one-time') ?
          <LoginRow
            label='OTP'
            input={
              <input
                name='otpCode'
                type='number'
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
