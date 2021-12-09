import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

export function withRouter(Component) {
  function render(props) {
    const params = useParams();
    const navigate = useLocation();

    return <Component {...props} params={params} navigate={navigate} />;
  }

  const name = Component.displayName || Component.name;
  render.displayName = `withRouter(${name})`;

  return render;
}
