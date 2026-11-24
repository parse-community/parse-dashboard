jest.dontMock('../../dashboard/Data/Browser/DataBrowser.react');
// These tests only call DataBrowser's state methods, so its child components
// are replaced by stubs instead of loading their full dependency trees
const stub = () => ({ __esModule: true, default: () => null });
jest.mock('../../components/ContextMenu/ContextMenu.react', stub);
jest.mock('../../dashboard/Data/Browser/BrowserTable.react', stub);
jest.mock('../../dashboard/Data/Browser/BrowserToolbar.react', stub);
jest.mock('../../dashboard/Data/Browser/GraphDialog.react', stub);
jest.mock('../../components/GraphPanel/GraphPanel.react', stub);
jest.mock('../../components/ScriptConfirmationModal/ScriptConfirmationModal.react', stub);
jest.mock('../../components/AggregationPanel/AggregationPanel', stub);
jest.mock('context/currentApp', () => ({ CurrentApp: { Consumer: () => null } }), {
  virtual: true,
});

const DataBrowser = require('../../dashboard/Data/Browser/DataBrowser.react').default;

// A minimal stand-in for a mounted DataBrowser that applies `setState` like
// React does: object updates are merged and updater functions receive the
// latest state, including updates queued earlier in the same event.
function createDataBrowser(state) {
  const instance = {
    props: { updateRow: () => {} },
    state: { current: null, editing: false, editingCell: null, ...state },
    setState(update) {
      const patch = typeof update === 'function' ? update(this.state) : update;
      this.state = { ...this.state, ...patch };
    },
  };
  instance.setEditing = DataBrowser.prototype.setEditing.bind(instance);
  instance.setCurrent = DataBrowser.prototype.setCurrent.bind(instance);
  return instance;
}

describe('DataBrowser editing cell', () => {
  it('remembers the selected cell when editing starts', () => {
    const browser = createDataBrowser({ current: { row: 0, col: 1 } });
    browser.setEditing(true);
    expect(browser.state.editing).toBe(true);
    expect(browser.state.editingCell).toEqual({ row: 0, col: 1 });
  });

  it('keeps the edited cell when another cell is selected before the editor commits', () => {
    const browser = createDataBrowser({ current: { row: 0, col: 1 } });
    browser.setEditing(true);
    // A click on another cell selects it before the editor's commit runs
    browser.setCurrent({ row: 3, col: 2 });
    expect(browser.state.current).toEqual({ row: 3, col: 2 });
    expect(browser.state.editingCell).toEqual({ row: 0, col: 1 });
  });

  it('clears the edited cell when editing ends', () => {
    const browser = createDataBrowser({ current: { row: 0, col: 1 } });
    browser.setEditing(true);
    browser.setEditing(false);
    expect(browser.state.editing).toBe(false);
    expect(browser.state.editingCell).toBe(null);
  });

  it('remembers the newly selected cell when a cell is selected and edited at once', () => {
    // Same order as Browser.handleShowAcl: select the cell, then start editing
    const browser = createDataBrowser({ current: { row: 0, col: 1 } });
    browser.setCurrent({ row: 4, col: 3 });
    browser.setEditing(true);
    expect(browser.state.editingCell).toEqual({ row: 4, col: 3 });
  });

  it('does not start editing when rows cannot be updated', () => {
    const browser = createDataBrowser({ current: { row: 0, col: 1 } });
    browser.props = {};
    browser.setEditing(true);
    expect(browser.state.editing).toBe(false);
    expect(browser.state.editingCell).toBe(null);
  });
});
