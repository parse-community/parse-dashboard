import React from 'react';

export function withForwardedRef(Component) {
  function render(props, ref) {
    return <Component {...props} forwardedRef={ref} />;
  }

  const name = Component.displayName || Component.name;
  render.displayName = `withForwardedRef(${name})`;

  return React.forwardRef(render);
}
