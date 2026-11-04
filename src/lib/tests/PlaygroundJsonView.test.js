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
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ReactJson from '@microlink/react-json-view';

// The Playground console renders logged objects and arrays with
// @microlink/react-json-view. These tests render it with the same props as the
// console output in Playground.react.js.
global.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  jest.restoreAllMocks();
});

function renderConsoleValue(src) {
  act(() => {
    root.render(
      <ReactJson
        src={src}
        collapsed={2}
        theme="solarized"
        name={false}
        displayObjectSize={false}
        displayDataTypes={false}
        enableClipboard={true}
        style={{ marginLeft: '2px', marginBottom: '1px', fontSize: '12px' }}
        onError={() => {
          return false;
        }}
      />
    );
  });
}

// Keys of the rendered object entries, without their quotes
function renderedKeys() {
  return Array.from(container.querySelectorAll('.object-key'), key =>
    key.textContent.replace(/"/g, '')
  );
}

function renderedValues() {
  return Array.from(container.querySelectorAll('.variable-value'), value => value.textContent);
}

// react-json-view shows the copy button of an entry on hover, but the button is
// always in the DOM
function click(button) {
  act(() => {
    button.click();
  });
}

describe('Playground console JSON view', () => {
  it('renders the entries of a logged object', () => {
    renderConsoleValue({ className: 'GameScore', score: 1337, cheatMode: false });
    expect(renderedKeys()).toEqual(['className', 'score', 'cheatMode']);
    expect(renderedValues()).toEqual(['"GameScore"', '1337', 'false']);
  });

  it('renders the items of a logged array', () => {
    renderConsoleValue(['GameScore', 1337]);
    expect(renderedValues()).toEqual(['"GameScore"', '1337']);
  });

  it('renders a date value', () => {
    // The Playground logs the createdAt and updatedAt of a Parse.Object as Date
    // objects. The rendered time depends on the time zone, the year does not.
    renderConsoleValue({ createdAt: new Date('2026-06-15T12:00:00.000Z') });
    expect(container.querySelector('.date-value').textContent).toContain('2026');
  });

  it('hides the root name, data types and object sizes', () => {
    renderConsoleValue({ player: { name: 'Sean Plott' } });
    expect(renderedKeys()).toEqual(['player', 'name']);
    expect(container.textContent).not.toContain('root');
    expect(container.querySelector('.data-type-label')).toBeNull();
    expect(container.querySelector('.object-size')).toBeNull();
  });

  it('expands two levels and collapses deeper objects', () => {
    renderConsoleValue({ level1: { level2: { level3: 'value' } } });
    expect(renderedKeys()).toEqual(['level1', 'level2']);
    expect(container.querySelectorAll('.node-ellipsis')).toHaveLength(1);
    expect(container.textContent).not.toContain('level3');
  });

  it('applies the solarized theme and the console style', () => {
    renderConsoleValue({ score: 1337 });
    const view = container.querySelector('.react-json-view');
    // base00 of the solarized base16 theme is #002b36
    expect(view.style.backgroundColor).toBe('rgb(0, 43, 54)');
    expect(view.style.marginLeft).toBe('2px');
    expect(view.style.marginBottom).toBe('1px');
    expect(view.style.fontSize).toBe('12px');
  });

  it('renders without logging errors or warnings', () => {
    // The Playground console captures console.error and console.warn, so
    // anything logged while rendering a value would show up in the console
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    renderConsoleValue({
      player: { name: 'Sean Plott', scores: [1337, 42] },
      createdAt: new Date('2026-06-15T12:00:00.000Z'),
      cheatMode: false,
    });
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it('logs the error message that the Playground console does not capture', () => {
    // The Playground console does not capture the errors that react-json-view
    // logs, to prevent an infinite loop. It detects them by their message, see
    // isReactJsonError in Playground.react.js.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderConsoleValue('GameScore');
    expect(consoleError).toHaveBeenCalledWith(
      'react-json-view error:',
      'src property must be a valid json object'
    );
  });
});

describe('Playground console JSON view clipboard', () => {
  let writeText;

  beforeEach(() => {
    writeText = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    delete navigator.clipboard;
  });

  it('copies a logged object as formatted JSON', () => {
    renderConsoleValue({ className: 'GameScore', score: 1337 });
    // The copy button of the logged object is in its metadata, after its entries
    const rootNode = container.querySelector('.object-key-val');
    click(rootNode.querySelector(':scope > .object-meta-data .copy-to-clipboard-container > span'));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('{\n  "className": "GameScore",\n  "score": 1337\n}');
  });

  it('copies a number value', () => {
    renderConsoleValue({ score: 1337 });
    click(container.querySelector('.variable-row .copy-to-clipboard-container > span'));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('1337');
  });
});
