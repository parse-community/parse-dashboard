import React from 'react';
import { mount } from 'enzyme';
import TimeZoneToggle from '../TimeZoneToggle.react';

describe('TimeZoneToggle', () => {
  it('should render UTC text when value is false', () => {
    const wrapper = mount(<TimeZoneToggle value={false} onChange={() => {}} />);
    expect(wrapper.find('.option').text()).toBe('UTC');
    expect(wrapper.find('.switch').hasClass('left')).toBe(true);
  });

  it('should render Local text when value is true', () => {
    const wrapper = mount(<TimeZoneToggle value={true} onChange={() => {}} />);
    expect(wrapper.find('.option').text()).toBe('Local');
    expect(wrapper.find('.switch').hasClass('right')).toBe(true);
  });

  it('should call onChange with opposite value when clicked', () => {
    const onChange = jest.fn();
    const wrapper = mount(<TimeZoneToggle value={false} onChange={onChange} />);
    
    wrapper.find('.container').simulate('click');
    expect(onChange).toHaveBeenCalledWith(true);

    wrapper.setProps({ value: true });
    wrapper.find('.container').simulate('click');
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should have correct background color based on value', () => {
    const wrapper = mount(<TimeZoneToggle value={false} onChange={() => {}} />);
    expect(wrapper.find('.switch').prop('style').backgroundColor).toBe('rgb(204, 204, 204)');

    wrapper.setProps({ value: true });
    expect(wrapper.find('.switch').prop('style').backgroundColor).toBe('rgb(0, 219, 124)');
  });
}); 