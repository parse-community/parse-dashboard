/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Login    from './Login.react';
import React    from 'react';
import ReactDOM from 'react-dom';

require('stylesheets/fonts.scss');

// App entry point

ReactDOM.render(<Login />, document.getElementById('login_mount'));
