/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.mock('../subscribeTo', () => () => Component => Component);
jest.mock('context/currentApp', () => ({ CurrentApp: {} }), { virtual: true });
jest.mock('../../dashboard/TableView.react', () => {
  return class TableView {};
});
jest.mock('../../dashboard/Data/Config/ConfigDialog.react', () => () => null);
jest.mock('../../dashboard/Data/Config/DeleteParameterDialog.react', () => () => null);
jest.mock('../../dashboard/Data/Config/AddArrayEntryDialog.react', () => () => null);
jest.mock('../../dashboard/Data/Config/RemoveArrayEntryDialog.react', () => () => null);
jest.mock('../../dashboard/Data/Browser/Notification.react', () => () => null);
jest.mock('../../components/Sidebar/SidebarAction', () => {
  return class SidebarAction {
    constructor() {}
  };
});
jest.mock('../../components/EmptyState/EmptyState.react', () => () => null);
jest.mock('../../components/Button/Button.react', () => () => null);
jest.mock('../../components/Icon/Icon.react', () => () => null);
jest.mock('../../components/Table/TableHeader.react', () => () => null);
jest.mock('../../components/Toolbar/Toolbar.react', () => () => null);
jest.mock('../ServerConfigStorage', () => {
  return class ServerConfigStorage {};
});
jest.mock('../StoragePreferences', () => ({
  prefersServerStorage: () => false,
}));
jest.dontMock('../../dashboard/Data/Config/Config.react');

const { Map } = require('immutable');
const Config = require('../../dashboard/Data/Config/Config.react').default;

describe('Config.tableData', () => {
  it('does not throw when a param value is null', () => {
    const instance = Object.create(Config.prototype);
    instance.props = {
      config: {
        data: Map({
          params: Map({ nullParam: null, other: 'ok' }),
          masterKeyOnly: Map(),
        }),
      },
    };

    let data;
    expect(() => {
      data = instance.tableData();
    }).not.toThrow();

    expect(data).toEqual([
      { param: 'nullParam', value: null, masterKeyOnly: false },
      { param: 'other', value: 'ok', masterKeyOnly: false },
    ]);
  });
});
