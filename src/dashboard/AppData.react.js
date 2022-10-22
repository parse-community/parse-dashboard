/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React          from 'react';
import AppSelector    from 'dashboard/AppSelector.react';
import AppsManager    from 'lib/AppsManager';
import { CurrentApp } from 'context/currentApp';
import { Outlet, useNavigate , useParams} from 'react-router-dom';


function AppData() {
  const navigate = useNavigate();
  const params = useParams();

  if (params.appId === '_') {
    return <AppSelector />;
  }

  // Find by name to catch edge cases around escaping apostrophes in URLs
  let current = AppsManager.findAppBySlugOrName(params.appId);

  if (current) {
    current.setParseKeys();
  } else {
    navigate('/apps', { replace: true });
    return <div />;
  }

  return (
    <CurrentApp.Provider value={current}>
      <Outlet />
    </CurrentApp.Provider>
  );
}

export default AppData;
