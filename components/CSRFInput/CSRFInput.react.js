import { getToken } from 'lib/CSRFManager';
import React        from 'react';

// An invisible component that embeds a hidden input
// containing the CSRF token into a form
let CSRFInput = () => (
  <div style={{ margin: 0, padding: 0, display: 'inline' }}>
    <input name='authenticity_token' type='hidden' value={getToken()} />
  </div>
);

export default CSRFInput;
