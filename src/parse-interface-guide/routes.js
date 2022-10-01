/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PIG               from 'parse-interface-guide/PIG.react';
import React             from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const routes = (
<BrowserRouter>
  <Routes>
    <Route path='*' element={<PIG />} />
  </Routes>
</BrowserRouter>
);

export default routes
