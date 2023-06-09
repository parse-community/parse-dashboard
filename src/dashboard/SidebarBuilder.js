/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Sidebar from 'components/Sidebar/Sidebar.react';
import {useTranslation} from 'react-i18next';

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

  const {t} = useTranslation();
  return (
    <Sidebar
      sections={accountSidebarSections.map(function (value) {
        value['name'] = t(value['name']);
        return value;
      })}
      section={section}
      subsection={subsection}
      prefix={''}/>
  );
}
