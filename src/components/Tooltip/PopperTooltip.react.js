import React from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';

const PopperTooltip = (props) => {
  const { children, tooltip, visible, placement } = props;
  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef
  } = usePopperTooltip({ placement });

  return (
    <>
      <span ref={setTriggerRef}>{children}</span>
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: 'tooltip-container' })}
        >
          <div
            {...getArrowProps({
              className: 'tooltip-arrow'
            })}
          />
          {tooltip}
        </div>
      )}
    </>
  );
}

export default PopperTooltip;
