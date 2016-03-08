/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import LiveReload from 'components/LiveReload/LiveReload.react';
import Parse      from 'parse';
import React      from 'react';

export const component = LiveReload;
export const demos = [
  {
    render: () => <LiveReload
			source={() => Parse.Promise.as(Math.random())}
			render={num => <span>{num}</span>}
			refreshIntervalMillis={100}
			initialData={0}/>,
  },
 ];
