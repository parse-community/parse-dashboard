/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// Combines an array into a human-friendly array:
//   joinWithFinal(<any>, [], <any>, <any>): []
//   joinWithFinal('your items: ', ['item1'], <any>, <any>): ['your items: ', 'item1']
//   joinWithFinal('your items: ', ['item1', 'item2'], <any>, ' and '): ['your items: ', 'item1', ' and ', 'item2']
//   joinWithFinal('your items: ', ['item1', 'item2', 'item3'], ', ', ', and ').join(''): 'your items: item1, item2, and item3'
export default (prefix, array, joiner, finalJoiner) => {
  switch (array.length) {
    case 0: return [];
    case 1: return [prefix, array[0]];
    default: return [prefix].concat(array.map((node, index) => {
      if (index === array.length - 1) {
        return [node];
      } else if (index === array.length - 2) {
        return [node, finalJoiner];
      } else {
        return [node, joiner];
      }
    }).reduce((a,b) => a.concat(b), []));
  }
};
