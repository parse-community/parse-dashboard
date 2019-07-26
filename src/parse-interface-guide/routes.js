/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PIG               from 'parse-interface-guide/PIG.react';
import React             from 'react';
import { Router, Route } from 'react-router';
import { createBrowserHistory } from 'history';
const history = createBrowserHistory({});

const routes = (
<Router history={history}>
  <div>
    <Route path='/:component?' render={(props) => {
      return <PIG params={props.match.params || {}} />
    }} />
  </div>
</Router>
);

export default routes
