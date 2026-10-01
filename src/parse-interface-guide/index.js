/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { createRoot } from 'react-dom/client';

import routes from './routes';

// App entry point

const root = createRoot(document.getElementById('browser_mount'));
root.render(routes);
