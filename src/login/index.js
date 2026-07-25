/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Login from './Login';
import React from 'react';
import { createRoot } from 'react-dom/client';

require('stylesheets/fonts.scss');

// App entry point

const path = window.PARSE_DASHBOARD_PATH || '/';
const root = createRoot(document.getElementById('login_mount'));
root.render(<Login path={path} />);
