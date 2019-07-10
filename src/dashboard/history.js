/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { createBrowserHistory } from 'history';

const path = window.PARSE_DASHBOARD_PATH || '/';
export default createBrowserHistory({ basename: path });
