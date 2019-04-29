/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/*
 * Escapes slashes, double-quotes, and $
 * Used to escape the POST body and GET parameters
 * when exporting a request to cURL
 */
let escapeValueForCURL = (value) => {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
}

export default function generateCurl(app, method, path, body, options) {
  if (path[0] === '/') {
    path = path.substr(1);
  }
  
  let headers = [[`-H "X-Parse-Application-Id: ${app.applicationId}" \\`]];
  if (options.useMasterKey) {
    headers.push([`-H "X-Parse-Master-Key: ${app.masterKey}" \\`]);
  } else {
    headers.push([`-H "X-Parse-REST-API-Key: ${app.restKey}" \\`]);
  }
  if (options.sessionToken) {
    headers.push([`-H "X-Parse-Session-Token: ${options.sessionToken}" \\`]);
  }

  let _body = escapeValueForCURL(body);

  let request = 'curl -X ' + method +' \\\n' + headers.join('\n') + '\n';
  if (_body && _body.length) {
    if (method === 'GET') {
      request += '-G \\\n';
    }
    request += '--data-urlencode "' + _body + '" \\\n';
  }
  request += app.serverURL + '/' + path;
  return request;
}
