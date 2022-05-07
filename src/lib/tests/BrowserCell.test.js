/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../components/BrowserCell/BrowserCell.react');
jest.mock('idb-keyval');

import React     from 'react';
import renderer from 'react-test-renderer';
const BrowserCell = require('../../components/BrowserCell/BrowserCell.react').default;

describe('BrowserCell', () => {

  describe('Required fields', () => {

    it('should not highlight 0 value', () => {
      const component = renderer.create(
        <BrowserCell value={0} markRequiredField={true} isRequired={true}/>
      ).toJSON();
      expect(component.props.className).not.toContain('required');
    });

    it('should not highlight false value', () => {
      const component = renderer.create(
        <BrowserCell value={false} markRequiredField={true} isRequired={true}/>
      ).toJSON();
      expect(component.props.className).not.toContain('required');
    });

    it('should not highlight empty string value', () => {
      const component = renderer.create(
        <BrowserCell value="" markRequiredField={true} isRequired={true}/>
      ).toJSON();
      expect(component.props.className).not.toContain('required');
    });

    it('should highlight null value', () => {
      const component = renderer.create(
        <BrowserCell value={null} markRequiredField={true} isRequired={true}/>
      ).toJSON();
      expect(component.props.className).toContain('required');
    });

    it('should highlight undefined value', () => {
      const component = renderer.create(
        <BrowserCell markRequiredField={true} isRequired={true}/>
      ).toJSON();
      expect(component.props.className).toContain('required');
    });
  });
});
