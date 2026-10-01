/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Quickstart from 'quickstart/Quickstart.react';
import React from 'react';
import { createRoot } from 'react-dom/client';

require('stylesheets/fonts.scss');

// App entry point

const root = createRoot(document.getElementById('quickstart_mount'));
root.render(<Quickstart />);
