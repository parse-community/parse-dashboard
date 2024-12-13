import React from 'react';
import { mount } from 'enzyme';
import DataBrowser from '../DataBrowser.react';

describe('DataBrowser TimeZone Feature', () => {
  let wrapper;
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };

  beforeEach(() => {
    global.localStorage = mockLocalStorage;
  });

  it('should initialize with stored timezone preference', () => {
    mockLocalStorage.getItem.mockReturnValue('true');
    wrapper = mount(<DataBrowser {...defaultProps} />);
    expect(wrapper.state().useLocalTime).toBe(true);
  });

  it('should toggle timezone and save preference', () => {
    wrapper = mount(<DataBrowser {...defaultProps} />);
    
    wrapper.instance().toggleTimeZone();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'parse_dashboard_useLocalTime',
      'true'
    );
    expect(wrapper.state().useLocalTime).toBe(true);

    wrapper.instance().toggleTimeZone();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'parse_dashboard_useLocalTime',
      'false'
    );
    expect(wrapper.state().useLocalTime).toBe(false);
  });
}); 