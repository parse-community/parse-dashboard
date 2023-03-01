import React from 'react';

export function withForwardedRef(Component) {
  function render(props, ref) {
    const innerRef = React.useRef();
    React.useImperativeHandle(ref, () => innerRef.current, [props.multiline]);
    return <Component {...props} forwardedRef={innerRef} />;
  }

  const name = Component.displayName || Component.name;
  render.displayName = `withForwardedRef(${name})`;

  return React.forwardRef(render);
}
