/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/PermissionsCollaboratorDialog/PermissionsCollaboratorDialog.react');

import React                            from 'react';
import ReactDOM                         from 'react-dom';
import TestUtils                        from 'react-addons-test-utils';

const PermissionsCollaboratorDialog = require('../../components/PermissionsCollaboratorDialog/PermissionsCollaboratorDialog.react');

describe('PermissionsCollaboratorDialog', () => {
  it('can render examples', () => {
    jest.dontMock('../../components/PermissionsCollaboratorDialog/PermissionsCollaboratorDialog.example');
    const example = require('../../components/PermissionsCollaboratorDialog/PermissionsCollaboratorDialog.example');
    example.demos.forEach((example, i) => {
      example.render();
    });
  });
  // test suite goes here
});
