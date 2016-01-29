import * as Email from 'lib/Email';
import LoginForm  from 'components/LoginForm/LoginForm.react';
import LoginRow   from 'components/LoginRow/LoginRow.react';
import passwordStrength from 'lib/passwordStrength';
import PasswordStrength from 'components/PasswordStrength/PasswordStrength.react';
import React      from 'react';
import SliderWrap from 'components/SliderWrap/SliderWrap.react';
import styles     from './Signup.scss';

export default class Signup extends React.Component {
  constructor() {
    super();

    let errorDiv = document.getElementById('signup_errors');
    if (errorDiv) {
      this.errors = errorDiv.innerHTML;
    }

    this.state = {
      email: '',
      suggestion: null,
      password: null,
      appName: ''
    };
  }

  changeEmail(e) {
    let next = e.target.value;
    this.setState({
      email: next,
      suggestion: Email.suggestion(next, false)
    });
  }

  render() {
    let disableSubmit = false;
    if (!this.state.email || !this.state.email.match(Email.emailRegex)) {
      disableSubmit = true;
    }
    let strength = this.state.password === null ? -1 : passwordStrength(this.state.password);
    if (strength < 1) {
      disableSubmit = true;
    }
    if (this.state.appName.length === 0) {
      disableSubmit = true;
    }
    return (
      <LoginForm
        header='Sign up with Parse'
        footer={
          <div>
            <span>Signing up signifies that you have read and agree to the </span><br />
            <a href='https://parse.com/policies#terms-of-service'>Terms of Service</a>
            <span> and </span>
            <a href='https://parse.com/policies#privacy'>Privacy Policy</a>.
          </div>
        }
        action='Sign Up'
        endpoint='/users'
        marginTop='-280px'
        disableSubmit={disableSubmit}
        swapText={
          <span style={{ verticalAlign: 'top' }}>
            I already have a Parse account <span style={{ fontSize: 20, verticalAlign: 'middle' }}>😊</span>
          </span>
        }
        swapTarget='/login'>
        <LoginRow
          label='Email'
          input={
            <input
              type='email'
              name='user[email]'
              placeholder='you@domain'
              autoComplete='off'
              value={this.state.email}
              onChange={this.changeEmail.bind(this)} />
          } />
        <SliderWrap expanded={!!this.state.suggestion}>
          <div className={styles.suggestion}>
            {this.state.suggestion ?
              <div>Did you mean <a href='javascript:;' onClick={() => this.setState({ email: this.state.suggestion, suggestion: null })}>{this.state.suggestion}</a>?</div> : null}
          </div>
        </SliderWrap>
        <LoginRow
          label='Password'
          extra={<div style={{ padding: '14px 10px 0 0' }}><PasswordStrength strength={strength} /></div>}
          input={
            <input
              type='password'
              name='user[password]'
              placeholder='The stronger, the better'
              autoComplete='off'
              style={{ paddingRight: 20 }}
              value={this.state.password}
              onChange={(e) => this.setState({ password: e.target.value })} />
          } />
        <LoginRow
          label='App Name'
          input={
            <input
              type='text'
              name='parse_app[name]'
              placeholder='Name your first app'
              value={this.state.appName}
              onChange={(e) => this.setState({ appName: e.target.value })} />
          } />
        <LoginRow
          label='Company'
          input={<input type='text' name='user[company_name]' placeholder='(Optional)' />} />
        {this.errors ?
          <div className={styles.error}>
            {this.errors}
          </div> : null}
      </LoginForm>
    );
  }
}
