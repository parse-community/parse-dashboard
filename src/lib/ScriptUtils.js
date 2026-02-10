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
 * Checks if a script response is a ScriptResponse with a form definition.
 * Uses __type: "ScriptResponse" as a discriminator to avoid collisions
 * with existing cloud functions that may return objects with a "form" key.
 * @param {*} response - The response from a cloud function
 * @returns {boolean}
 */
export function isFormResponse(response) {
  return (
    response != null &&
    typeof response === 'object' &&
    response.__type === 'ScriptResponse' &&
    response.form != null
  );
}

/**
 * Executes a Parse Cloud Code script
 * @param {Object} script - The script configuration
 * @param {string} className - The Parse class name
 * @param {string} objectId - The object ID
 * @param {Function} showNote - Callback to show notification
 * @param {Function} onRefresh - Callback to refresh all data
 * @param {Function} onRefreshObjects - Callback to refresh specific objects by IDs
 * @param {Function} onFormResponse - Callback when response contains a form definition
 */
export async function executeScript(script, className, objectId, showNote, onRefresh, onRefreshObjects, onFormResponse) {
  try {
    const object = Parse.Object.extend(className).createWithoutData(objectId);
    const response = await Parse.Cloud.run(
      script.cloudCodeFunction,
      { object: object.toPointer() },
      { useMasterKey: true }
    );
    if (isFormResponse(response) && onFormResponse) {
      onFormResponse({
        response,
        script,
        className,
        objectIds: [objectId],
      });
      return;
    }
    const note =
      (typeof response === 'object' ? JSON.stringify(response) : response) ||
      `Ran script "${script.title}" on "${className}" object "${object.id}".`;
    showNote?.(note);
    if (onRefreshObjects) {
      onRefreshObjects([objectId]);
    } else {
      onRefresh?.();
    }
  } catch (e) {
    showNote?.(e.message, true);
    console.error(`Could not run ${script.title}:`, e);
  }
}

/**
 * Executes a script callback after form submission
 * @param {string} cloudCodeFunction - The callback cloud function name
 * @param {string} className - The Parse class name
 * @param {string[]} objectIds - Array of object IDs to execute on
 * @param {Object} payload - Pass-through payload from the initial response
 * @param {Object} formData - Form values from the modal
 * @param {Function} showNote - Callback to show notification
 * @param {Function} onRefresh - Callback to refresh all data
 * @param {Function} onRefreshObjects - Callback to refresh specific objects by IDs
 */
export async function executeScriptCallback(cloudCodeFunction, className, objectIds, payload, formData, showNote, onRefresh, onRefreshObjects) {
  try {
    const objects = objectIds.map(id =>
      Parse.Object.extend(className).createWithoutData(id)
    );

    const results = await Promise.all(
      objects.map(object =>
        Parse.Cloud.run(
          cloudCodeFunction,
          { object: object.toPointer(), payload, formData },
          { useMasterKey: true }
        )
          .then(response => ({ objectId: object.id, response }))
          .catch(error => ({ objectId: object.id, error }))
      )
    );

    let errorCount = 0;
    results.forEach(({ objectId, response, error }) => {
      if (error) {
        errorCount++;
        showNote?.(`Error running callback on "${objectId}": ${error.message}`, true);
      } else {
        const note =
          (typeof response === 'object' ? JSON.stringify(response) : response) ||
          `Ran callback on "${objectId}".`;
        showNote?.(note);
      }
    });

    if (objectIds.length > 1) {
      showNote?.(
        `Ran callback on ${objectIds.length} objects with ${errorCount} errors.`,
        errorCount > 0
      );
    }

    if (onRefreshObjects) {
      onRefreshObjects(objectIds);
    } else {
      onRefresh?.();
    }
  } catch (e) {
    showNote?.(e.message, true);
    console.error(`Could not run callback ${cloudCodeFunction}:`, e);
  }
}
