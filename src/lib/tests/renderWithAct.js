/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { act } from 'react';
import renderer from 'react-test-renderer';

// act() imported from 'react' expects the host to declare an act environment;
// react-test-renderer's own act() used to set this implicitly. Declare it once
// here so the concurrent renderer flushes without an "environment not
// configured to support act" warning.
global.IS_REACT_ACT_ENVIRONMENT = true;

// Shared test helper. React 19's react-test-renderer renders concurrently, so
// create() must run inside act() for toJSON()/getInstance() to reflect the
// flushed render rather than returning null. (act is imported from 'react', its
// canonical location in React 19.)
export function renderComponent(element) {
  let component;
  act(() => {
    component = renderer.create(element);
  });
  return component;
}
