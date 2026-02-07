/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Builds a "Related records" context menu item for a text value.
 * Lists all classes with objectId first, followed by String type fields.
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

  const systemClasses = [];
  const regularClasses = [];

  schema.data
    .get('classes')
    .sortBy((_v, k) => k)
    .forEach((cl, className) => {
      const classFields = [];

      cl.forEach((column, field) => {
        if (column.type !== 'String') {
          return;
        }
        // Skip objectId here - it's added separately as first element
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

      // Sort fields alphabetically
      classFields.sort((a, b) => a.text.localeCompare(b.text));
      // Add separator after objectId if there are more fields
      if (classFields.length > 0) {
        classFields.unshift({ type: 'separator' });
      }
      // Add objectId as first element
      classFields.unshift({
        text: 'objectId',
        callback: () => {
          onNavigate({
            className,
            id: textValue,
            field: 'objectId',
          });
        },
      });

      const classItem = {
        text: className,
        items: classFields,
      };

      // Group classes by system (starting with "_") and regular
      if (className.startsWith('_')) {
        systemClasses.push(classItem);
      } else {
        regularClasses.push(classItem);
      }
    });

  // Add system classes first, then separator, then regular classes
  relatedRecordsMenuItem.items.push(...systemClasses);
  if (systemClasses.length > 0 && regularClasses.length > 0) {
    relatedRecordsMenuItem.items.push({ type: 'separator' });
  }
  relatedRecordsMenuItem.items.push(...regularClasses);

  return relatedRecordsMenuItem.items.length ? relatedRecordsMenuItem : undefined;
}
