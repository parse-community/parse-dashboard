/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { getToken } from 'lib/CSRFManager';
import React        from 'react';

// An invisible component that embeds a hidden input
// containing the CSRF token into a form
let CSRFInput = () => (
  <div style={{ margin: 0, padding: 0, display: 'inline' }}>
    <input name='_csrf' type='hidden' value={getToken()} />
  </div>
);

export default CSRFInput;
