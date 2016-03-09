/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PIG               from 'parse-interface-guide/PIG.react';
import React             from 'react';
import { browserHistory, Router, Route } from 'react-router';

module.exports = (
<Router history={browserHistory}>
  <Route path='/' component={PIG} />
  <Route path='/:component' component={PIG} />
</Router>
);
