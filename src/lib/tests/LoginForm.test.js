/**
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @jest-environment jsdom
 */
jest.dontMock('../../components/LoginForm/LoginForm.react');

import React from 'react';
import renderer from 'react-test-renderer';
const LoginForm = require('../../components/LoginForm/LoginForm.react').default;

function renderForm(props) {
  const submit = jest.fn();
  const component = renderer.create(<LoginForm endpoint="login" action="Log In" {...props} />, {
    // Provide a stub host node so any form.submit() call is observable.
    createNodeMock: element => (element.type === 'form' ? { submit } : null),
  });
  const submitButton = component.root.find(
    node => node.type === 'input' && node.props.type === 'submit'
  );
  return { component, submit, submitButton };
}

describe('LoginForm', () => {
  it('renders a native submit button that posts the form', () => {
    const { component, submitButton } = renderForm({ formSubmit: jest.fn() });
    const form = component.root.find(node => node.type === 'form');
    expect(form.props.method).toBe('post');
    expect(form.props.action).toBe('login');
    expect(submitButton.props.type).toBe('submit');
  });

  it('posts the form once on click and does not submit a second time programmatically', () => {
    const formSubmit = jest.fn();
    const { submit, submitButton } = renderForm({ formSubmit });

    submitButton.props.onClick();

    // The pre-submit side effect runs exactly once.
    expect(formSubmit).toHaveBeenCalledTimes(1);
    // The native type="submit" posts the form; calling form.submit() here too would
    // post a second time and break MFA login with a CSRF error.
    expect(submit).not.toHaveBeenCalled();
  });

  it('does not submit when disabled', () => {
    const formSubmit = jest.fn();
    const { submit, submitButton } = renderForm({ formSubmit, disableSubmit: true });

    submitButton.props.onClick();

    expect(formSubmit).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });
});
