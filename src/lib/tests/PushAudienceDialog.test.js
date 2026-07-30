/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/PushAudienceDialog/PushAudienceDialog.react');
jest.mock('../../components/Filter/Filter.react');
jest.mock('../../components/MultiSelect/MultiSelect.react');
jest.mock('../../components/Popover/Popover.react', () => 'div');
jest.mock('context/currentApp', () => require('../../context/currentApp'), { virtual: true });

const Filter = require('../../components/Filter/Filter.react').default;
const FormNote = require('../../components/FormNote/FormNote.react').default;
const PushAudienceDialog =
  require('../../components/PushAudienceDialog/PushAudienceDialog.react').default;
const React = require('react');
const { act } = React;
const { List, Map } = require('immutable');
const { renderComponent } = require('./renderWithAct');

const defaultProps = {
  availableDevices: [],
  primaryAction: jest.fn(),
  secondaryAction: jest.fn(),
};

function renderDialog(schema, audienceInfo, props = {}) {
  return renderComponent(
    <PushAudienceDialog {...defaultProps} audienceInfo={audienceInfo} schema={schema} {...props} />
  );
}

describe('PushAudienceDialog', () => {
  beforeEach(() => {
    jest.spyOn(PushAudienceDialog.prototype, 'fetchAudienceSize').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('configures the shared filter for the Installation class', () => {
    const schema = {
      deviceType: { type: 'String' },
    };
    const component = renderDialog(schema);
    const filter = component.root.findByType(Filter);

    expect(filter.props.className).toBe('_Installation');
    expect(filter.props.schema).toEqual({ _Installation: schema });
    expect(filter.props.allClasses).toEqual({ _Installation: schema });
  });

  it('adds an available audience condition for the Installation class', () => {
    const component = renderDialog({
      deviceType: { type: 'String' },
    });
    const dialog = component.getInstance();

    act(() => {
      dialog.setState({ errorMessage: 'No condition available.' });
    });
    act(() => {
      dialog.handleAddCondition();
    });

    expect(dialog.state.filters.size).toBe(1);
    expect(dialog.state.filters.getIn([0, 'class'])).toBe('_Installation');
    expect(dialog.state.filters.getIn([0, 'field'])).toBe('deviceType');
    expect(dialog.state.filters.getIn([0, 'constraint'])).toBe('exists');
    expect(dialog.state.errorMessage).toBeUndefined();
    expect(dialog.fetchAudienceSize).toHaveBeenCalledTimes(1);
  });

  it('shows an error when no audience condition is available', () => {
    const component = renderDialog({
      unsupported: { type: 'File' },
    });
    const dialog = component.getInstance();

    act(() => {
      dialog.handleAddCondition();
    });

    expect(dialog.state.filters.size).toBe(0);
    expect(dialog.state.errorMessage).toBe('No condition available.');
  });

  it('normalizes persisted audience filters for the Installation class', () => {
    const filters = new List([
      new Map({
        field: 'deviceType',
        constraint: 'exists',
      }),
    ]);
    const component = renderDialog(
      { deviceType: { type: 'String' } },
      {
        filters,
      }
    );
    const dialog = component.getInstance();

    expect(dialog.state.filters.getIn([0, 'class'])).toBe('_Installation');
    expect(dialog.fetchAudienceSize).toHaveBeenCalledTimes(1);
  });

  it('clears stale errors when filters change', () => {
    const schema = {
      deviceType: { type: 'String' },
    };
    const component = renderDialog(schema);
    const dialog = component.getInstance();
    const filters = new List([
      new Map({
        class: '_Installation',
        field: 'deviceType',
        constraint: 'exists',
      }),
    ]);
    act(() => {
      dialog.setState({ errorMessage: 'No condition available.' });
    });
    const filter = component.root.findByType(Filter);

    act(() => {
      filter.props.onChange(filters);
    });

    expect(dialog.state.filters).toBe(filters);
    expect(dialog.state.errorMessage).toBeUndefined();
    expect(dialog.fetchAudienceSize).toHaveBeenCalledTimes(1);
  });

  it('clears stale errors when filters are searched', () => {
    const component = renderDialog(
      {
        deviceType: { type: 'String' },
      },
      undefined,
      { errorMessage: 'Request failed.' }
    );
    const dialog = component.getInstance();
    const filter = component.root.findByType(Filter);

    expect(dialog.state.errorMessage).toBe('Request failed.');

    act(() => {
      filter.props.onSearch();
    });

    expect(dialog.state.errorMessage).toBeUndefined();
    expect(component.root.findByType(FormNote).props.show).toBe(false);
    expect(dialog.fetchAudienceSize).toHaveBeenCalledTimes(1);
  });
});
