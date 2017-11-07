/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import joinWithFinal from 'lib/joinWithFinal';
import React         from 'react';
import setDifference from 'lib/setDifference';

// Display changes in a FlowFooter. The first argument is
// an object of { changed_key: new_value ... }. The second argument is the initial
// value of all the fields. The third argument is a list of options for each key:
// {
//    key_name: {
//      friendlyName: the name of the key for display to the user (mandatory).
//      type: What kind of value is changing.
//      showTo: if true, display the new value of the key along with it's friendlyName.
//      showFrom: if true, and showTo is also true, display the new and old value of the key.
//    }
// }
// Note: key_name is snake_case because in most cases it will come directly from ruby, which
// uses snake_case
export default (changes, initial, fieldOptions) => {
  let booleanChanges = [];
  let stringChangesWithTo = [];
  let stringChanges = [];
  let additions = [];
  let setChanges = [];
  for (let key in changes) {
    if (fieldOptions[key]) {
      if (fieldOptions[key].type === 'boolean') {

        // If a boolean is changing, display whether it is now enabled or disabled.
        booleanChanges.push(
          <strong key={key}>{changes[key] ? 'enabled' : 'disabled'} {fieldOptions[key].friendlyName}</strong>
        );

      } else if (fieldOptions[key].type === 'addition') {

        // If a new value is being added to a list, display that it has been added.
        additions.push(<strong key={key}>{fieldOptions[key].friendlyName}</strong>);

      } else if (fieldOptions[key].showTo && changes[key] !== '') {

        // If the caller wants to display the new value, and there is a new value,
        // display what has changed, what it has changed to, and what it changed from if requested.
        stringChangesWithTo.push(<span key={key}>
          changed your <strong>{fieldOptions[key].friendlyName}</strong>
          {fieldOptions[key].showFrom && initial[key] ? <span> from <strong>{initial[key]}</strong></span> : null}
          {fieldOptions[key].showTo ? <span> to <strong>{changes[key]}</strong></span> : null}
        </span>);
      } else if (fieldOptions[key].type === 'set') {
        let additionsToSet = setDifference(changes[key], initial[key], fieldOptions[key].equalityPredicate);
        let removalsFromSet = setDifference(initial[key], changes[key], fieldOptions[key].equalityPredicate);

        let friendlyAddition = additionsToSet.length > 1 ? fieldOptions[key].friendlyNamePlural : fieldOptions[key].friendlyName;
        let friendlyRemoval = removalsFromSet.length > 1 ? fieldOptions[key].friendlyNamePlural : fieldOptions[key].friendlyName;
        if (additionsToSet.length > 0) {
          setChanges.push(<span key={key+'added'}>added <strong>{additionsToSet.length} {friendlyAddition}</strong></span>);
        }
        if (removalsFromSet.length > 0) {
          setChanges.push(<span key={key+'removed'}>removed <strong>{removalsFromSet.length} {friendlyRemoval}</strong></span>);
        }

      } else {

        // If the caller specifies no options, just display what has been changed.
        stringChanges.push(<strong key={key}>{fieldOptions[key].friendlyName}</strong>);

      }
    }
  }

  let renderChangeList = (prefix, changes, isLastList) => {
    return joinWithFinal(prefix, changes, ', ', isLastList ? ' and ' : ', ');
  };

  let changesList = [
    {
      changes: booleanChanges,
      prefix: null,
    },
    {
      changes: setChanges,
      prefix: null,
    },
    {
      changes: additions,
      prefix: 'added a ',
    },
    {
      changes: stringChangesWithTo,
      prefix: null,
    },
    {
      changes: stringChanges,
      prefix: 'changed your ',
    },
  ];
  let allChangeNodes = changesList.filter(({ changes }) => changes.length > 0).map(({ changes, prefix }, index, wholeList) =>
    renderChangeList(prefix, changes, index === wholeList.length - 1)
  );
  return <span>
    You've {joinWithFinal(null, allChangeNodes, ', ', allChangeNodes.length < 3 ? ' and ' : ', and ')}.
  </span>;
};
