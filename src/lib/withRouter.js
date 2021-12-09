import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function withRouter(Component) {
  function render(props) {
    const params = useParams();
    const navigate = useNavigate();

    return <Component {...props} params={params} navigate={navigate} />;
  }

  const name = Component.displayName || Component.name;
  render.displayName = `withRouter(${name})`;

  return render;
}
