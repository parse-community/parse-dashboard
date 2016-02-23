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

export const component = LoginForm;

export const demos = [
  {
    render() {
      return (
        <div style={{ background: '#06283D', height: 500, position: 'relative' }}>
          <LoginForm
            header='Access your Dashboard'
            footer={<a href='javascript:;'>Forgot something?</a>}
            action='Log In'>
            <LoginRow
              label='Email'
              input={<input type='email' />} />
            <LoginRow
              label='Password'
              input={<input type='password' />} />
          </LoginForm>
        </div>
      );
    }
  }, {
    render() {
      return (
        <div style={{ background: '#06283D', height: 700, position: 'relative' }}>
          <LoginForm
            header='Sign up with Parse'
            footer={
              <div>
                <span>Signing up signifies that you have read and agree to the </span>
                <a href='https://parse.com/about/terms'>Terms of Service</a>
                <span> and </span>
                <a href='https://parse.com/about/privacy'>Privacy Policy</a>.
              </div>
            }
            action='Sign Up'>
            <LoginRow
              label='Email'
              input={<input type='email' placeholder='email@domain' autoComplete='off' />} />
            <LoginRow
              label='Password'
              input={<input type='password' placeholder='The stronger, the better' autoComplete='off' />} />
            <LoginRow
              label='App Name'
              input={<input type='text' placeholder='Name your first app' />} />
            <LoginRow
              label='Company'
              input={<input type='text' placeholder='(Optional)' />} />
          </LoginForm>
        </div>
      );
    }
  }
];
