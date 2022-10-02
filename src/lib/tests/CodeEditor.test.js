/**
 * @jest-environment jsdom
 */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { demos } from '../../components/CodeEditor/CodeEditor.example';

describe('CodeEditor', () => {
  it('can render examples', () => {
    demos.forEach(example => {
      example.render();
    });
  });
});
