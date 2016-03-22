/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AppsManager     from 'lib/AppsManager';
import Immutable       from 'immutable';
import installDevTools from 'immutable-devtools';
import Parse           from 'parse';
import React           from 'react';
import ReactDOM        from 'react-dom';
import Dashboard       from './Dashboard';
import 'babel-polyfill';

require('stylesheets/fonts.scss');
installDevTools(Immutable);

ReactDOM.render(<Dashboard/>, document.getElementById('browser_mount'));
