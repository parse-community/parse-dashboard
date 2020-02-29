/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as CSRFManager from 'lib/CSRFManager';
import encodeFormData   from 'lib/encodeFormData';

let basePath = '';
export function setBasePath(newBasePath) {
  basePath = newBasePath || '';
  if (basePath.endsWith('/')) {
    basePath = basePath.slice(0, basePath.length-1);
  }
}

// abortable flag used to pass xhr reference so user can abort accordingly
export function request(method, url, body, abortable = false, withCredentials = true, useRequestedWith = true) {
  if (!url.startsWith('http://')
      && !url.startsWith('https://')
      && basePath.length
      && !url.startsWith(basePath + '/')) {
    url = basePath + url;
  }
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    xhr.setRequestHeader('X-CSRF-Token', CSRFManager.getToken());
  }
  if (useRequestedWith) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  }
  xhr.withCredentials = withCredentials;
  let resolve;
  let reject;
  let p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  p.resolve = resolve;
  p.reject = reject;
  xhr.onerror = () => {
    p.reject({
      success: false,
      message: 'Network Error',
      error: 'Network Error',
      errors: ['Network Error'],
      notice: 'Network Error',
    });
  };
  xhr.onload = function() {
    if (this.status === 200) {
      let json = {};
      try {
        json = JSON.parse(this.responseText);
      } catch(ex) {
        p.reject(this.responseText);
        return;
      }
      if (Object.prototype.hasOwnProperty.call(json, 'success') && json.success === false) {
        p.reject(json);
      } else {
        p.resolve(json);
      }
    } else if (this.status === 403) {
      p.reject({
        success: false,
        message: 'Permission Denied',
        error: 'Permission Denied',
        errors: ['Permission Denied'],
        notice: 'Permission Denied',
      });
    } else if (this.status >= 400 && this.status < 500) {
      let json = {};
      try {
        json = JSON.parse(this.responseText);
      } catch(ex) {
        p.reject(this.responseText)
        return;
      }
      let message = json.message || json.error || json.notice || 'Request Error';
      p.reject({
        success: false,
        message: message,
        error: message,
        errors: json.errors || [message],
        notice: message,
      });
    } else if (this.status >= 500) {
      p.reject({
        success: false,
        message: 'Server Error',
        error: 'Server Error',
        errors: ['Server Error'],
        notice: 'Server Error',
      });
    }
  };
  if (typeof body === 'object') {
    if (body instanceof FormData) {
      xhr.send(body);
    } else {
      xhr.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded; charset=UTF-8'
      );
      // Encode it as a url parameter string
      let formData = [];
      for (let k in body) {
        formData.push(encodeFormData(k, body[k]));
      }
      xhr.send(formData.join('&'));
    }
  } else {
    xhr.send(body);
  }
  if (abortable) {
    return {
      xhr,
      promise: p
    }
  }
  return p;
}

/**
 * abortableGet - get request for requests that may need to be aborted
 * @param  {String} url - get request path
 * @return {Object} {promise, xhr} - promise and xhr reference
 */
export function abortableGet(url) {
  return request('GET', url, null, true);
}

export function getHerokuAppName(url) {
  return request('GET', url, null, false, false, false);
}

export function get(url) {
  return request('GET', url);
}

export function post(url, body) {
  return request('POST', url, body);
}

export function put(url, body) {
  return request('PUT', url, body);
}

// `delete` is a keyword
export function del(url) {
  return request('DELETE', url);
}
