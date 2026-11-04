/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse from 'parse';

export default function buildConfigTableData(params, masterKeyOnlyParams) {
  const data = [];
  params.forEach((value, param) => {
    const masterKeyOnly = masterKeyOnlyParams?.get?.(param) || false;
    const type = typeof value;
    if (type === 'object' && value !== null && value.__type == 'File') {
      value = Parse.File.fromJSON(value);
    } else if (type === 'object' && value !== null && value.__type == 'GeoPoint') {
      value = new Parse.GeoPoint(value);
    }
    data.push({
      param: param,
      value: value,
      masterKeyOnly: masterKeyOnly,
    });
  });
  data.sort((object1, object2) => {
    return object1.param.localeCompare(object2.param);
  });
  return data;
}
