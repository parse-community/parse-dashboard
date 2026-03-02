/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Parse from 'parse';

/**
 * Parse a JSON string containing an array of objects for import.
 * @param {string} content - Raw JSON string
 * @returns {{ rows: Object[]|null, error: string|null }}
 */
export function parseImportJSON(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    return { rows: null, error: `Invalid JSON: ${e.message}` };
  }
  if (!Array.isArray(parsed)) {
    return { rows: null, error: 'JSON content must be an array of objects.' };
  }
  if (parsed.length === 0) {
    return { rows: null, error: 'The array is empty. Nothing to import.' };
  }
  const invalidRowIndex = parsed.findIndex(
    row => !row || typeof row !== 'object' || Array.isArray(row)
  );
  if (invalidRowIndex !== -1) {
    return {
      rows: null,
      error: `Row ${invalidRowIndex + 1} is not an object.`,
    };
  }
  return { rows: parsed, error: null };
}

/**
 * Parse a CSV string using the given column schema for type reconstruction.
 * @param {string} content - Raw CSV string
 * @param {Object} schema - Map of { columnName: { type, targetClass? } }
 * @returns {{ rows: Object[]|null, error: string|null }}
 */
export function parseImportCSV(content, schema = {}) {
  if (!content || content.trim().length === 0) {
    return { rows: null, error: 'File is empty.' };
  }

  const lines = parseCSVLines(content);
  if (lines.length === 0) {
    return { rows: null, error: 'File is empty.' };
  }

  const headers = lines[0];
  if (lines.length < 2) {
    return { rows: null, error: 'No data rows found. The file contains only headers.' };
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const raw = j < values.length ? values[j] : '';
      if (raw === '') {
        continue; // omit empty cells
      }
      const colSchema = schema[header];
      const type = colSchema ? colSchema.type : 'String';
      const converted = convertCSVValue(raw, type, colSchema);
      if (converted === undefined) {
        continue;
      }
      if (type === 'Number' && Number.isNaN(converted)) {
        return {
          rows: null,
          error: `Invalid number in row ${i}, column "${header}".`,
        };
      }
      if (type === 'Boolean' && raw.toLowerCase() !== 'true' && raw.toLowerCase() !== 'false') {
        return {
          rows: null,
          error: `Invalid boolean in row ${i}, column "${header}".`,
        };
      }
      row[header] = converted;
    }
    if (Object.keys(row).length === 0) {
      continue;
    }
    rows.push(row);
  }

  return { rows, error: null };
}

/**
 * Parse CSV content into an array of arrays (rows of fields).
 * Handles quoted fields, escaped double-quotes, embedded commas and newlines.
 */
function parseCSVLines(content) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        // Look ahead for escaped quote
        if (i + 1 < content.length && content[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        row.push(field);
        field = '';
        i++;
      } else if (ch === '\r') {
        // Handle \r\n or lone \r
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        i++;
        if (i < content.length && content[i] === '\n') {
          i++;
        }
      } else if (ch === '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Push last field/row if there is content
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Convert a raw CSV string value to the correct type based on schema.
 */
function convertCSVValue(value, type, colSchema) {
  switch (type) {
    case 'Number':
      return Number(value);
    case 'Boolean':
      return value.toLowerCase() === 'true';
    case 'Pointer':
      return {
        __type: 'Pointer',
        className: colSchema ? colSchema.targetClass : undefined,
        objectId: value,
      };
    case 'Relation':
      // Relations cannot be set via batch create/update; skip
      return undefined;
    case 'Date':
      return { __type: 'Date', iso: value };
    case 'GeoPoint':
    case 'File':
    case 'Object':
    case 'Array':
    case 'ACL':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    case 'String':
    default:
      return value;
  }
}

/**
 * Build Parse REST API batch request objects from parsed rows.
 * @param {Object[]} rows - Parsed row objects
 * @param {string} className - Parse class name
 * @param {Object} options - { preserveObjectIds, preserveTimestamps, duplicateHandling, unknownColumns, knownColumns }
 * @returns {{ method: string, path: string, body: Object }[]}
 */
export function buildBatchRequests(rows, className, options) {
  const {
    preserveObjectIds = false,
    preserveTimestamps = false,
    duplicateHandling,
    unknownColumns,
    knownColumns,
  } = options || {};

  const allowed = (unknownColumns === 'ignore' && knownColumns) ? new Set(knownColumns) : null;

  return rows.map(row => {
    // Clone the row to avoid mutating the original
    let body = { ...row };

    // Filter unknown columns if requested
    if (allowed) {
      const filtered = {};
      for (const key of Object.keys(body)) {
        if (allowed.has(key)) {
          filtered[key] = body[key];
        }
      }
      body = filtered;
    }

    // Handle timestamps
    if (!preserveTimestamps) {
      delete body.createdAt;
      delete body.updatedAt;
    } else {
      // Ensure createdAt/updatedAt are in { __type: 'Date', iso: '...' } format
      if (body.createdAt !== undefined) {
        body.createdAt = ensureDateObject(body.createdAt);
      }
      if (body.updatedAt !== undefined) {
        body.updatedAt = ensureDateObject(body.updatedAt);
      }
    }

    // Determine method and path based on preserveObjectIds and duplicateHandling
    if (preserveObjectIds && duplicateHandling === 'overwrite' && body.objectId) {
      const path = `/classes/${className}/${body.objectId}`;
      delete body.objectId;
      if (Object.keys(body).length === 0) {
        return null;
      }
      return { method: 'PUT', path, body };
    }

    if (!preserveObjectIds) {
      delete body.objectId;
    }
    if (Object.keys(body).length === 0) {
      return null;
    }
    return { method: 'POST', path: `/classes/${className}`, body };
  }).filter(Boolean);
}

/**
 * Ensure a value is in Parse Date object format { __type: 'Date', iso: '...' }.
 * Converts plain ISO strings to the object format.
 */
function ensureDateObject(value) {
  if (value && typeof value === 'object' && value.__type === 'Date') {
    return value;
  }
  if (typeof value === 'string') {
    return { __type: 'Date', iso: value };
  }
  return value;
}

/**
 * Send batch import requests to Parse Server.
 *
 * Uses the REST batch endpoint directly instead of Parse.Object.saveAll() because the
 * JS SDK does not support: maintenanceKey headers (needed for preserving timestamps),
 * per-batch progress callbacks, per-row error collection with indices, or explicit PUT
 * vs POST control for overwrites.
 *
 * @param {{ method: string, path: string, body: Object }[]} requests
 * @param {Object} options - { serverURL, applicationId, masterKey, maintenanceKey, continueOnError, onProgress }
 * @returns {Promise<{ imported: number, skipped: number, failed: number, errors: Object[], stopped: boolean }>}
 */
export async function sendBatchImport(requests, options) {
  const {
    serverURL,
    applicationId,
    masterKey,
    maintenanceKey,
    continueOnError = true,
    onProgress,
  } = options || {};

  const normalizedServerURL = (serverURL || '').replace(/\/+$/, '');
  const BATCH_SIZE = 50;
  let imported = 0;
  let failed = 0;
  const errors = [];
  let stopped = false;
  let completed = 0;
  const total = requests.length;

  // Extract the path prefix from serverURL (e.g., '/parse' from 'http://localhost:1337/parse')
  // Parse Server's batch handler requires paths to include this prefix
  let serverPath = '';
  try {
    serverPath = new URL(normalizedServerURL).pathname.replace(/\/+$/, '');
  } catch {
    // If URL parsing fails, try to extract path manually
    const pathMatch = normalizedServerURL.match(/https?:\/\/[^/]+(\/.*)/);
    if (pathMatch) {
      serverPath = pathMatch[1].replace(/\/+$/, '');
    }
  }

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': applicationId,
  };
  if (maintenanceKey) {
    headers['X-Parse-Maintenance-Key'] = maintenanceKey;
  } else {
    headers['X-Parse-Master-Key'] = masterKey;
  }

  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    const batch = requests.slice(i, i + BATCH_SIZE).map(req => ({
      ...req,
      path: `${serverPath}${req.path}`,
    }));
    const response = await fetch(`${normalizedServerURL}/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requests: batch }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorBody}`);
    }

    const results = await response.json();
    let batchHasErrors = false;

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.success) {
        imported++;
      } else if (result.error) {
        failed++;
        batchHasErrors = true;
        errors.push({ index: i + j, ...result.error });
      }
    }

    completed += batch.length;

    if (batchHasErrors && !continueOnError) {
      stopped = true;
      if (onProgress) {
        onProgress({ completed, total });
      }
      break;
    }

    if (onProgress) {
      onProgress({ completed, total });
    }
  }

  return { imported, skipped: 0, failed, errors, stopped };
}

/**
 * Check which objectIds already exist in a Parse Server class.
 * @param {string[]} objectIds
 * @param {string} className
 * @returns {Promise<string[]>}
 */
export async function checkDuplicates(objectIds, className) {
  if (!objectIds || objectIds.length === 0) {
    return [];
  }

  const CHUNK_SIZE = 1000;
  const allExisting = [];

  for (let i = 0; i < objectIds.length; i += CHUNK_SIZE) {
    const chunk = objectIds.slice(i, i + CHUNK_SIZE);
    const query = new Parse.Query(className);
    query.containedIn('objectId', chunk);
    query.select('objectId');
    query.limit(chunk.length);
    const results = await query.find({ useMasterKey: true });
    allExisting.push(...results.map(obj => obj.id));
  }

  return allExisting;
}
