/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/BrowserCell/BrowserCell.react');

import React from 'react';
import { renderComponent } from './renderWithAct';
const BrowserCell = require('../../components/BrowserCell/BrowserCell.react').default;

describe('BrowserCell', () => {
  describe('Required fields', () => {
    it('should not highlight 0 value', () => {
      const component = renderComponent(<BrowserCell value={0} markRequiredField={true} isRequired={true} />)
        .toJSON();
      expect(component.props.className).not.toContain('required');
    });

    it('should not highlight false value', () => {
      const component = renderComponent(<BrowserCell value={false} markRequiredField={true} isRequired={true} />)
        .toJSON();
      expect(component.props.className).not.toContain('required');
    });

    it('should not highlight empty string value', () => {
      const component = renderComponent(<BrowserCell value="" markRequiredField={true} isRequired={true} />)
        .toJSON();
      expect(component.props.className).not.toContain('required');
    });

    it('should highlight null value', () => {
      const component = renderComponent(<BrowserCell value={null} markRequiredField={true} isRequired={true} />)
        .toJSON();
      expect(component.props.className).toContain('required');
    });

    it('should highlight undefined value', () => {
      const component = renderComponent(<BrowserCell markRequiredField={true} isRequired={true} />)
        .toJSON();
      expect(component.props.className).toContain('required');
    });
  });

  describe('Date', () => {
    it('should show local time on hover', () => {
      const date = new Date('2026-10-25T16:15:00.000Z');
      const component = renderComponent(<BrowserCell type="Date" value={date} />).toJSON();
      const inner = component.children[0];
      expect(inner.props.title).toBe(date.toLocaleString());
      expect(inner.children[0]).toContain('UTC');
    });
  });
});
