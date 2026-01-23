/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Builds a "Related records" context menu item for a text value.
 * Finds all classes with String type fields that can be filtered by this value.
 * Groups fields by class name in a hierarchical submenu structure.
 *
 * @param {Object} schema - The schema object containing class definitions
 * @param {string} textValue - The text value to search for
 * @param {Function} onNavigate - Callback function to navigate to the related records
 * @returns {Object|undefined} The menu item object or undefined if no fields found
 */
export function buildRelatedTextFieldsMenuItem(schema, textValue, onNavigate) {
  if (!textValue || typeof textValue !== 'string' || textValue.trim() === '' || !schema || !onNavigate) {
    return undefined;
  }

  const relatedRecordsMenuItem = {
    text: 'Related records',
    items: [],
  };

  schema.data
    .get('classes')
    .sortBy((_v, k) => k)
    .forEach((cl, className) => {
      const classFields = [];

      cl.forEach((column, field) => {
        if (column.type !== 'String') {
          return;
        }
        // Exclude objectId - it's a special field referenced by pointers, not strings
        if (field === 'objectId') {
          return;
        }
        // Exclude hidden/sensitive fields
        if (field === 'password' && className === '_User') {
          return;
        }
        if (field === 'sessionToken' && (className === '_User' || className === '_Session')) {
          return;
        }
        classFields.push({
          text: field,
          callback: () => {
            onNavigate({
              className,
              id: textValue,
              field,
            });
          },
        });
      });

      if (classFields.length > 0) {
        // Sort fields alphabetically
        classFields.sort((a, b) => a.text.localeCompare(b.text));
        relatedRecordsMenuItem.items.push({
          text: className,
          items: classFields,
        });
      }
    });

  return relatedRecordsMenuItem.items.length ? relatedRecordsMenuItem : undefined;
}
