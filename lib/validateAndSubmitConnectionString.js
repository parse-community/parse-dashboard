/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import encodeFormData from 'lib/encodeFormData';
import { Promise }    from 'parse';
import { get }        from 'lib/AJAX';


export default function validateAndSubmitConnectionString(connectionString, ignoredWarnings, stoppedWithWarnings, submit) {
  let promise = new Promise();
  get('/validate_mongo_connection_string?' + encodeFormData('connection_string', connectionString)).then(result => {
    if (result.warnings && result.warnings.every(warning => ignoredWarnings.indexOf(warning))) {
      // If they have already seen the current set of warnings and want to continue anyway,
      // just let them. If there are new warnings, show those warnings.
      stoppedWithWarnings(result.warnings);
      promise.reject({ success: false, error: "Warnings" }); // Consumer needs to do custom handling of warnings.
    } else {
      submit(connectionString).then(result => {
        promise.resolve(result);
      }).fail(error => {
        promise.reject(error);
      });
    }
  }).fail(error => {
    promise.reject(error);
  });
  return promise;
}
