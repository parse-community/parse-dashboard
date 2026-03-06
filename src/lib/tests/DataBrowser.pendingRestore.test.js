/**
 * @jest-environment jsdom
 */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class MockDataBrowser {
  constructor(props = {}, state = {}) {
    this.props = {
      data: null,
      className: 'TestClass',
      app: { applicationId: 'testApp' },
      ...props,
    };

    this.state = {
      current: null,
      order: [
        { name: 'objectId' },
        { name: 'username' },
        { name: 'email' },
      ],
      pendingRestore: null,
      selectedObjectId: undefined,
      autoLoadFirstRow: false,
      isPanelVisible: false,
      lastSelectedCol: 0,
      ...state,
    };

    this._setCurrentCalls = [];
    this._setSelectedObjectIdCalls = [];
    this._handleCallCloudFunctionCalls = [];
    this._setStateCalls = [];
  }

  setCurrent(current) {
    if (JSON.stringify(this.state.current) !== JSON.stringify(current)) {
      this._setCurrentCalls.push(current);
      this.state.current = current;
    }
  }

  setSelectedObjectId(objectId) {
    this._setSelectedObjectIdCalls.push(objectId);
    this.state.selectedObjectId = objectId;
  }

  handleCallCloudFunction(objectId, className, appId) {
    this._handleCallCloudFunctionCalls.push({ objectId, className, appId });
  }

  setState(partial) {
    this._setStateCalls.push(partial);
    Object.assign(this.state, partial);
  }

  runPendingRestoreLogic(prevProps) {
    // Block A - save selection when refresh clears data
    if (
      this.props.data === null &&
      prevProps.data !== null &&
      this.props.className === prevProps.className
    ) {
      const { current, order } = this.state;
      if (current !== null) {
        const objectId = prevProps.data[current.row]?.id;
        const fieldName = order[current.col]?.name;
        if (objectId && fieldName) {
          this.setState({ pendingRestore: { objectId, fieldName } });
        }
      }
    }

    // Block B - restore selection when refresh delivers new data
    if (
      this.props.data !== null &&
      prevProps.data === null &&
      this.state.pendingRestore
    ) {
      const { objectId, fieldName } = this.state.pendingRestore;
      const newRowIndex = this.props.data.findIndex(obj => obj.id === objectId);
      const newColIndex = this.state.order.findIndex(col => col.name === fieldName);

      if (newRowIndex !== -1 && newColIndex !== -1) {
        this.setCurrent({ row: newRowIndex, col: newColIndex });
        this.setState({ pendingRestore: null });
        this.setSelectedObjectId(objectId);
        this.handleCallCloudFunction(objectId, this.props.className, this.props.app.applicationId);
      } else {
        this.setState({ current: null, pendingRestore: null });
      }
    }

    // Block C - discard stale pendingRestore when class changes
    if (this.props.className !== prevProps.className && this.state.pendingRestore) {
      this.setState({ pendingRestore: null });
    }
  }

  wouldAutoLoadFirstRowFire(prevProps, prevState) {
    return !!(
      this.state.autoLoadFirstRow &&
      this.state.isPanelVisible &&
      this.props.data &&
      this.props.data.length > 0 &&
      !this.state.selectedObjectId &&
      !this.state.pendingRestore &&
      ((!prevProps.data || prevProps.data.length === 0) ||
        prevProps.className !== this.props.className ||
        prevState.isPanelVisible !== this.state.isPanelVisible)
    );
  }
}

function makeObj(id) {
  return { id };
}

describe('DataBrowser - pendingRestore (Block A: save on refresh start)', () => {
  it('saves objectId and fieldName when data becomes null during a same-class refresh', () => {
    const prevData = [makeObj('abc'), makeObj('def')];
    const browser = new MockDataBrowser(
      { data: null, className: 'User' },
      {
        current: { row: 1, col: 2 },
        order: [{ name: 'objectId' }, { name: 'username' }, { name: 'email' }],
      }
    );
    const prevProps = { data: prevData, className: 'User' };

    browser.runPendingRestoreLogic(prevProps);

    expect(browser.state.pendingRestore).toEqual({ objectId: 'def', fieldName: 'email' });
  });

  it('does NOT save pendingRestore when current is null (nothing was selected)', () => {
    const prevData = [makeObj('abc')];
    const browser = new MockDataBrowser(
      { data: null, className: 'User' },
      { current: null }
    );
    const prevProps = { data: prevData, className: 'User' };

    browser.runPendingRestoreLogic(prevProps);

    expect(browser.state.pendingRestore).toBeNull();
  });

  it('does NOT save pendingRestore when the class also changed (class switch, not a refresh)', () => {
    const prevData = [makeObj('abc')];
    const browser = new MockDataBrowser(
      { data: null, className: 'NewClass' },
      { current: { row: 0, col: 1 } }
    );
    const prevProps = { data: prevData, className: 'OldClass' };

    browser.runPendingRestoreLogic(prevProps);

    expect(browser.state.pendingRestore).toBeNull();
  });

  it('does NOT save pendingRestore when current.col is out of bounds for order', () => {
    const prevData = [makeObj('abc')];
    const browser = new MockDataBrowser(
      { data: null, className: 'User' },
      { current: { row: 0, col: 99 }, order: [{ name: 'objectId' }] }
    );
    const prevProps = { data: prevData, className: 'User' };

    browser.runPendingRestoreLogic(prevProps);

    // order[99] is undefined -> fieldName is undefined -> guard prevents save
    expect(browser.state.pendingRestore).toBeNull();
  });
});

describe('DataBrowser - pendingRestore (Block B: restore on refresh end)', () => {
  it('restores current to the new row/col when the document is still in the refreshed data', () => {
    // After refresh, document "def" moved from row 0 to row 1
    const newData = [makeObj('xyz'), makeObj('def'), makeObj('ghi')];
    const browser = new MockDataBrowser(
      { data: newData, className: 'User' },
      {
        pendingRestore: { objectId: 'def', fieldName: 'email' },
        order: [{ name: 'objectId' }, { name: 'username' }, { name: 'email' }],
        current: { row: 0, col: 2 }, // stale position from before refresh
      }
    );
    const prevProps = { data: null, className: 'User' };

    browser.runPendingRestoreLogic(prevProps);

    expect(browser.state.current).toEqual({ row: 1, col: 2 });
    expect(browser.state.pendingRestore).toBeNull();
    expect(browser._setSelectedObjectIdCalls).toContain('def');
    expect(browser._handleCallCloudFunctionCalls).toEqual([
      { objectId: 'def', className: 'User', appId: 'testApp' },
    ]);
  });

  it('clears current (deselects) when the document is no longer in the refreshed data', () => {
    const newData = [makeObj('xyz'), makeObj('abc')]; // 'def' is gone
    const browser = new MockDataBrowser(
      { data: newData, className: 'User' },
      {
        pendingRestore: { objectId: 'def', fieldName: 'username' },
        order: [{ name: 'objectId' }, { name: 'username' }],
        current: { row: 0, col: 1 },
      }
    );
    const prevProps = { data: null, className: 'User' };

    browser.runPendingRestoreLogic(prevProps);

    expect(browser.state.current).toBeNull();
    expect(browser.state.pendingRestore).toBeNull();
    expect(browser._setSelectedObjectIdCalls).toHaveLength(0);
    expect(browser._handleCallCloudFunctionCalls).toHaveLength(0);
  });

  it('clears current when the field (column) no longer exists after refresh', () => {
    const newData = [makeObj('abc')];
    const browser = new MockDataBrowser(
      { data: newData, className: 'User' },
      {
        pendingRestore: { objectId: 'abc', fieldName: 'deletedField' },
        order: [{ name: 'objectId' }, { name: 'username' }], // deletedField is gone
        current: { row: 0, col: 2 },
      }
    );
    const prevProps = { data: null, className: 'User' };

    browser.runPendingRestoreLogic(prevProps);

    expect(browser.state.current).toBeNull();
    expect(browser.state.pendingRestore).toBeNull();
    expect(browser._handleCallCloudFunctionCalls).toHaveLength(0);
  });

  it('does NOT fire Block B when there is no pendingRestore', () => {
    const newData = [makeObj('abc')];
    const browser = new MockDataBrowser(
      { data: newData, className: 'User' },
      { pendingRestore: null, current: { row: 0, col: 0 } }
    );
    const prevProps = { data: null, className: 'User' };

    browser.runPendingRestoreLogic(prevProps);

    // current should be untouched
    expect(browser.state.current).toEqual({ row: 0, col: 0 });
    expect(browser._setSelectedObjectIdCalls).toHaveLength(0);
  });

  it('restores correctly even when the document moved to a different row', () => {
    // Document "target" was at row 0 before refresh; it is now at row 3 after refresh
    const newData = [makeObj('a'), makeObj('b'), makeObj('c'), makeObj('target')];
    const browser = new MockDataBrowser(
      { data: newData, className: 'User' },
      {
        pendingRestore: { objectId: 'target', fieldName: 'username' },
        order: [{ name: 'objectId' }, { name: 'username' }],
        current: { row: 0, col: 1 },
      }
    );
    const prevProps = { data: null, className: 'User' };

    browser.runPendingRestoreLogic(prevProps);

    expect(browser.state.current).toEqual({ row: 3, col: 1 });
    expect(browser._setSelectedObjectIdCalls).toContain('target');
  });
});

describe('DataBrowser - pendingRestore (Block C: clear on class change)', () => {
  it('clears pendingRestore when the class changes while a restore was pending', () => {
    const browser = new MockDataBrowser(
      { data: null, className: 'NewClass' },
      { pendingRestore: { objectId: 'abc', fieldName: 'username' } }
    );
    const prevProps = { data: null, className: 'OldClass' };

    browser.runPendingRestoreLogic(prevProps);

    expect(browser.state.pendingRestore).toBeNull();
  });

  it('does NOT call setState unnecessarily when pendingRestore is already null on class change', () => {
    const browser = new MockDataBrowser(
      { data: null, className: 'NewClass' },
      { pendingRestore: null }
    );
    const prevProps = { data: null, className: 'OldClass' };
    const stateBefore = browser._setStateCalls.length;

    browser.runPendingRestoreLogic(prevProps);

    expect(browser._setStateCalls.length).toBe(stateBefore);
  });
});

describe('DataBrowser - pendingRestore (autoLoadFirstRow guard)', () => {
  it('autoLoadFirstRow does NOT fire when pendingRestore is set (Block B handles the selection)', () => {
    const newData = [makeObj('row0'), makeObj('target')];
    const browser = new MockDataBrowser(
      { data: newData, className: 'User' },
      {
        pendingRestore: { objectId: 'target', fieldName: 'username' },
        autoLoadFirstRow: true,
        isPanelVisible: true,
        selectedObjectId: undefined,
        order: [{ name: 'objectId' }, { name: 'username' }],
      }
    );
    const prevProps = { data: null, className: 'User' };

    const wouldFire = browser.wouldAutoLoadFirstRowFire(prevProps, {});

    expect(wouldFire).toBe(false);
  });

  it('autoLoadFirstRow DOES fire normally when there is no pendingRestore', () => {
    const newData = [makeObj('row0')];
    const browser = new MockDataBrowser(
      { data: newData, className: 'User' },
      {
        pendingRestore: null,
        autoLoadFirstRow: true,
        isPanelVisible: true,
        selectedObjectId: undefined,
        order: [{ name: 'objectId' }],
      }
    );
    const prevProps = { data: null, className: 'User' };

    const wouldFire = browser.wouldAutoLoadFirstRowFire(prevProps, {});

    expect(wouldFire).toBe(true);
  });
});
