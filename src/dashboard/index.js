/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Immutable from 'immutable';
import installDevTools from 'immutable-devtools';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './Dashboard';
import registerServiceWorker from '../registerServiceWorker';
// GraphiQL 5 uses Monaco; register its web workers once before the app mounts.
import 'graphiql/setup-workers/webpack';
import 'graphiql/style.css';

require('stylesheets/fonts.scss');
installDevTools(Immutable);

const path = window.PARSE_DASHBOARD_PATH || '/';
const root = createRoot(document.getElementById('browser_mount'));
root.render(<Dashboard path={path} />);
registerServiceWorker();
