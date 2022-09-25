import React from 'react';
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom';

export function withRouter(Component) {
  function render(props) {
    const params = useParams();
    const navigate = useNavigate();
    const outletContext = useOutletContext();
    const location = useLocation();

    return <Component {...props} {...outletContext} params={params} navigate={navigate} location={location} />;
  }

  const name = Component.displayName || Component.name;
  render.displayName = `withRouter(${name})`;

  return render;
}
