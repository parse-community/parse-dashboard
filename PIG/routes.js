import createHashHistory from 'history/lib/createHashHistory';
import PIG from 'PIG/PIG.react';
import React from 'react';
import { Router, Route } from 'react-router';

module.exports = (
<Router history={createHashHistory()}>
  <Route path='/' component={PIG} />
  <Route path='/:component' component={PIG} />
</Router>
);
