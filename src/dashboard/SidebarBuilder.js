/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React          from 'react';
import Sidebar        from 'components/Sidebar/Sidebar.react';

let accountSidebarSections = [
  {
    name: 'Your Apps',
    icon: 'blank-app-outline',
    link: '/apps'
  }, /*{
    name: 'Account Settings',
    icon: 'users-solid',
    link: '/account',
  }*/
];

export function buildAccountSidebar(options) {
  let {
    section,
    subsection
  } = options;
  return (
    <Sidebar
      sections={accountSidebarSections}
      section={section}
      subsection={subsection}
      prefix={''} />
  );
}
