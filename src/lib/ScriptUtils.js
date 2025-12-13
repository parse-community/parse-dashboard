/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse from 'parse';

/**
 * Filters scripts to only those valid for the given className and field
 * @param {Array} scripts - Array of script configurations
 * @param {string} className - The Parse class name
 * @param {string} field - The field name
 * @returns {Object} - { validScripts: Array, validator: Function|null }
 */
export function getValidScripts(scripts, className, field) {
  let validator = null;
  const validScripts = (scripts || []).filter(script => {
    if (script.classes?.includes(className)) {
      return true;
    }
    for (const scriptClass of script?.classes || []) {
      if (scriptClass?.name !== className) {
        continue;
      }
      const fields = scriptClass?.fields || [];
      if (scriptClass?.fields.includes(field) || scriptClass?.fields.includes('*')) {
        return true;
      }
      for (const currentField of fields) {
        if (Object.prototype.toString.call(currentField) === '[object Object]') {
          if (currentField.name === field) {
            if (typeof currentField.validator === 'string') {
              // SAFETY: eval() is used here on validator strings from trusted admin-controlled
              // dashboard configuration only (not user input). These validators are used solely
              // for UI validation logic to enable/disable script menu items. This is an accepted
              // tradeoff in this trusted admin context. If requirements change, consider replacing
              // with Function constructor or a safer expression parser.
              validator = eval(currentField.validator);
            } else {
              validator = currentField.validator;
            }
            return true;
          }
        }
      }
    }
    return false;
  });

  return { validScripts, validator };
}

/**
 * Executes a Parse Cloud Code script
 * @param {Object} script - The script configuration
 * @param {string} className - The Parse class name
 * @param {string} objectId - The object ID
 * @param {Function} showNote - Callback to show notification
 * @param {Function} onRefresh - Callback to refresh data
 */
export async function executeScript(script, className, objectId, showNote, onRefresh) {
  try {
    const object = Parse.Object.extend(className).createWithoutData(objectId);
    const response = await Parse.Cloud.run(
      script.cloudCodeFunction,
      { object: object.toPointer() },
      { useMasterKey: true }
    );
    showNote?.(
      response || `Ran script "${script.title}" on "${className}" object "${object.id}".`
    );
    onRefresh?.();
  } catch (e) {
    showNote?.(e.message, true);
    console.error(`Could not run ${script.title}:`, e);
  }
}
