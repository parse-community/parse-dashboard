import React        from 'react';
import ReactTooltip from 'react-tooltip'

let B4ATooltip = ({ event, position, delayTime }) => {
  return <ReactTooltip event={event || 'dblclick'} place={position || 'bottom'} afterShow={() => setTimeout(ReactTooltip.hide, delayTime || 2000)} />
}

export default B4ATooltip
