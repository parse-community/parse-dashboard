const headerNavData = {
  items: [
    {label: 'My Apps', url: 'https://dashboard.back4app.com/apps/#!/admin'},
    {label: 'Dashboard', url: 'https://parse-dashboard.back4app.com/'},
    {label: 'Docs', url: 'http://docs.back4app.com/'},
    {label: 'Community', url: 'https://groups.google.com/forum/#!forum/back4app'},
    {label: 'Blog', url: 'http://blog.back4app.com/'}
  ],
  dropdownItems: [
    {label: 'Account Keys', url:'https://dashboard.back4app.com/classic#/wizard/account-key'},
    {label: 'Edit Email', url:'https://dashboard.back4app.com/email/change'},
    {label: 'Edit Password', url:'https://dashboard.back4app.com/password/change'}
  ]
}

headerNavData.sidebarItems = [
  ...headerNavData.items,
  ...headerNavData.dropdownItems,
]

export default headerNavData;