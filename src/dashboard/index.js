/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Immutable       from 'immutable';
import installDevTools from 'immutable-devtools';
import React           from 'react';
import ReactDOM        from 'react-dom';
import Dashboard       from './Dashboard';
import { mountPath}    from 'lib/path';
import '@babel/polyfill';

require('stylesheets/fonts.scss');
installDevTools(Immutable);

ReactDOM.render(<Dashboard path={mountPath}/>, document.getElementById('browser_mount'));
