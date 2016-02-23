/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import createHashHistory from 'history/lib/createHashHistory';
import PIG               from 'parse-interface-guide/PIG.react';
import React             from 'react';
import { Router, Route } from 'react-router';

module.exports = (
<Router history={createHashHistory()}>
  <Route path='/' component={PIG} />
  <Route path='/:component' component={PIG} />
</Router>
);
