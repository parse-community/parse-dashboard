/**
 * @jest-environment jsdom
 */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../importData');
jest.dontMock('parse');

const Parse = require('parse');
const {
  parseImportJSON,
  parseImportCSV,
  buildBatchRequests,
  sendBatchImport,
  checkDuplicates,
} = require('../importData');

// ──────────────────────────────────────────────
// parseImportJSON
// ──────────────────────────────────────────────
describe('parseImportJSON', () => {
  it('parses a valid JSON array of objects', () => {
    const content = JSON.stringify([
      { objectId: 'abc123', name: 'Alice', score: 100 },
      { objectId: 'def456', name: 'Bob', score: 200 },
    ]);
    const result = parseImportJSON(content);
    expect(result.error).toBeNull();
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ objectId: 'abc123', name: 'Alice', score: 100 });
    expect(result.rows[1]).toEqual({ objectId: 'def456', name: 'Bob', score: 200 });
  });

  it('preserves Parse _toFullJSON() typed fields', () => {
    const content = JSON.stringify([
      {
        objectId: 'xyz',
        createdAt: '2024-01-01T00:00:00.000Z',
        location: { __type: 'GeoPoint', latitude: 40, longitude: -74 },
        avatar: { __type: 'File', name: 'pic.jpg', url: 'http://example.com/pic.jpg' },
      },
    ]);
    const result = parseImportJSON(content);
    expect(result.error).toBeNull();
    expect(result.rows[0].location.__type).toBe('GeoPoint');
    expect(result.rows[0].avatar.__type).toBe('File');
  });

  it('returns error for invalid JSON', () => {
    const result = parseImportJSON('not json at all');
    expect(result.rows).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('returns error when JSON is not an array', () => {
    const result = parseImportJSON(JSON.stringify({ key: 'value' }));
    expect(result.rows).toBeNull();
    expect(result.error).toMatch(/array/i);
  });

  it('returns error for an empty array', () => {
    const result = parseImportJSON(JSON.stringify([]));
    expect(result.rows).toBeNull();
    expect(result.error).toMatch(/empty/i);
  });

  it('returns error when array contains non-object items', () => {
    const result = parseImportJSON(JSON.stringify([1, 'hello', null]));
    expect(result.rows).toBeNull();
    expect(result.error).toMatch(/row 1.*not an object/i);
  });

  it('returns error for non-object item in middle of array', () => {
    const result = parseImportJSON(JSON.stringify([{ name: 'Alice' }, 42]));
    expect(result.rows).toBeNull();
    expect(result.error).toMatch(/row 2.*not an object/i);
  });

  it('returns error for null content', () => {
    const result = parseImportJSON(null);
    expect(result.rows).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('returns error for undefined content', () => {
    const result = parseImportJSON(undefined);
    expect(result.rows).toBeNull();
    expect(result.error).toBeTruthy();
  });
});

// ──────────────────────────────────────────────
// parseImportCSV
// ──────────────────────────────────────────────
describe('parseImportCSV', () => {
  it('parses basic CSV with String columns', () => {
    const csv = 'name,city\nAlice,NYC\nBob,LA';
    const schema = {
      name: { type: 'String' },
      city: { type: 'String' },
    };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ name: 'Alice', city: 'NYC' });
    expect(result.rows[1]).toEqual({ name: 'Bob', city: 'LA' });
  });

  it('converts Number type', () => {
    const csv = 'score\n42\n3.14';
    const schema = { score: { type: 'Number' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].score).toBe(42);
    expect(result.rows[1].score).toBe(3.14);
  });

  it('converts Boolean type', () => {
    const csv = 'active\ntrue\nFalse\nTRUE';
    const schema = { active: { type: 'Boolean' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].active).toBe(true);
    expect(result.rows[1].active).toBe(false);
    expect(result.rows[2].active).toBe(true);
  });

  it('converts Pointer type', () => {
    const csv = 'author\nptr123';
    const schema = { author: { type: 'Pointer', targetClass: '_User' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].author).toEqual({
      __type: 'Pointer',
      className: '_User',
      objectId: 'ptr123',
    });
  });

  it('skips Relation type columns (cannot be set via batch import)', () => {
    const csv = 'name,friends\nAlice,rel456';
    const schema = { name: { type: 'String' }, friends: { type: 'Relation', targetClass: '_User' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].name).toBe('Alice');
    expect(result.rows[0].friends).toBeUndefined();
  });

  it('converts Date type', () => {
    const csv = 'birthday\n2024-01-15T10:30:00.000Z';
    const schema = { birthday: { type: 'Date' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].birthday).toEqual({
      __type: 'Date',
      iso: '2024-01-15T10:30:00.000Z',
    });
  });

  it('parses GeoPoint from JSON string', () => {
    const geoStr = JSON.stringify({ __type: 'GeoPoint', latitude: 40.7, longitude: -74.0 });
    const csv = `location\n"${geoStr.replace(/"/g, '""')}"`;
    const schema = { location: { type: 'GeoPoint' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].location).toEqual({
      __type: 'GeoPoint',
      latitude: 40.7,
      longitude: -74.0,
    });
  });

  it('parses File from JSON string', () => {
    const fileStr = JSON.stringify({ __type: 'File', name: 'pic.jpg', url: 'http://example.com/pic.jpg' });
    const csv = `avatar\n"${fileStr.replace(/"/g, '""')}"`;
    const schema = { avatar: { type: 'File' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].avatar).toEqual({
      __type: 'File',
      name: 'pic.jpg',
      url: 'http://example.com/pic.jpg',
    });
  });

  it('parses Object from JSON string', () => {
    const objStr = JSON.stringify({ key: 'value', nested: { a: 1 } });
    const csv = `data\n"${objStr.replace(/"/g, '""')}"`;
    const schema = { data: { type: 'Object' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].data).toEqual({ key: 'value', nested: { a: 1 } });
  });

  it('parses Array from JSON string', () => {
    const arrStr = JSON.stringify([1, 2, 3]);
    const csv = `tags\n"${arrStr.replace(/"/g, '""')}"`;
    const schema = { tags: { type: 'Array' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].tags).toEqual([1, 2, 3]);
  });

  it('parses ACL from JSON string', () => {
    const aclStr = JSON.stringify({ '*': { read: true }, 'user123': { read: true, write: true } });
    const csv = `ACL\n"${aclStr.replace(/"/g, '""')}"`;
    const schema = { ACL: { type: 'ACL' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].ACL).toEqual({ '*': { read: true }, 'user123': { read: true, write: true } });
  });

  it('omits empty cells (undefined)', () => {
    const csv = 'name,score\nAlice,\n,200';
    const schema = {
      name: { type: 'String' },
      score: { type: 'Number' },
    };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0]).toEqual({ name: 'Alice' });
    expect(Object.prototype.hasOwnProperty.call(result.rows[0], 'score')).toBe(false);
    expect(result.rows[1]).toEqual({ score: 200 });
    expect(Object.prototype.hasOwnProperty.call(result.rows[1], 'name')).toBe(false);
  });

  it('handles quoted fields with escaped double quotes', () => {
    const csv = 'name,bio\nAlice,"She said ""hello"" to Bob"';
    const schema = {
      name: { type: 'String' },
      bio: { type: 'String' },
    };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].bio).toBe('She said "hello" to Bob');
  });

  it('handles quoted fields with commas inside', () => {
    const csv = 'name,address\nAlice,"123 Main St, Apt 4"';
    const schema = {
      name: { type: 'String' },
      address: { type: 'String' },
    };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].address).toBe('123 Main St, Apt 4');
  });

  it('handles quoted fields with newlines inside', () => {
    const csv = 'name,notes\nAlice,"line1\nline2"';
    const schema = {
      name: { type: 'String' },
      notes: { type: 'String' },
    };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].notes).toBe('line1\nline2');
  });

  it('treats columns without schema as String (default)', () => {
    const csv = 'name,unknown\nAlice,something';
    const schema = { name: { type: 'String' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0].unknown).toBe('something');
  });

  it('returns error for empty content', () => {
    const result = parseImportCSV('', {});
    expect(result.rows).toBeNull();
    expect(result.error).toMatch(/empty/i);
  });

  it('returns error for header-only CSV (no data rows)', () => {
    const result = parseImportCSV('name,score', { name: { type: 'String' } });
    expect(result.rows).toBeNull();
    expect(result.error).toMatch(/no data/i);
  });

  it('handles Windows-style line endings (CRLF)', () => {
    const csv = 'name,score\r\nAlice,100\r\nBob,200';
    const schema = {
      name: { type: 'String' },
      score: { type: 'Number' },
    };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ name: 'Alice', score: 100 });
  });

  it('returns error for invalid number value', () => {
    const csv = 'score\nnot-a-number';
    const schema = { score: { type: 'Number' } };
    const result = parseImportCSV(csv, schema);
    expect(result.rows).toBeNull();
    expect(result.error).toMatch(/invalid number/i);
  });

  it('returns error for invalid boolean value', () => {
    const csv = 'active\nyes';
    const schema = { active: { type: 'Boolean' } };
    const result = parseImportCSV(csv, schema);
    expect(result.rows).toBeNull();
    expect(result.error).toMatch(/invalid boolean/i);
  });

  it('skips blank CSV rows (trailing newlines)', () => {
    const csv = 'name,score\nAlice,100\n\n';
    const schema = {
      name: { type: 'String' },
      score: { type: 'Number' },
    };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toEqual({ name: 'Alice', score: 100 });
  });

  it('skips Relation values without leaking undefined into row', () => {
    const csv = 'name,friends\nAlice,rel123';
    const schema = { name: { type: 'String' }, friends: { type: 'Relation', targetClass: '_User' } };
    const result = parseImportCSV(csv, schema);
    expect(result.error).toBeNull();
    expect(result.rows[0]).toEqual({ name: 'Alice' });
    expect(Object.keys(result.rows[0])).not.toContain('friends');
  });
});

// ──────────────────────────────────────────────
// buildBatchRequests
// ──────────────────────────────────────────────
describe('buildBatchRequests', () => {
  const baseRows = [
    { objectId: 'id1', name: 'Alice', score: 100, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-02T00:00:00.000Z' },
    { objectId: 'id2', name: 'Bob', score: 200, createdAt: '2024-02-01T00:00:00.000Z', updatedAt: '2024-02-02T00:00:00.000Z' },
  ];

  it('creates POST requests stripping objectId when preserveObjectIds=false', () => {
    const requests = buildBatchRequests(baseRows, 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: false,
    });
    expect(requests).toHaveLength(2);
    expect(requests[0].method).toBe('POST');
    expect(requests[0].path).toBe('/classes/GameScore');
    expect(requests[0].body.objectId).toBeUndefined();
    expect(requests[0].body.name).toBe('Alice');
    expect(requests[1].method).toBe('POST');
    expect(requests[1].body.objectId).toBeUndefined();
  });

  it('creates PUT requests when preserveObjectIds=true and duplicateHandling=overwrite', () => {
    const requests = buildBatchRequests(baseRows, 'GameScore', {
      preserveObjectIds: true,
      preserveTimestamps: false,
      duplicateHandling: 'overwrite',
    });
    expect(requests).toHaveLength(2);
    expect(requests[0].method).toBe('PUT');
    expect(requests[0].path).toBe('/classes/GameScore/id1');
    expect(requests[0].body.objectId).toBeUndefined();
    expect(requests[0].body.name).toBe('Alice');
    expect(requests[1].method).toBe('PUT');
    expect(requests[1].path).toBe('/classes/GameScore/id2');
  });

  it('creates POST requests with objectId in body when preserveObjectIds=true and duplicateHandling is not overwrite', () => {
    const requests = buildBatchRequests(baseRows, 'GameScore', {
      preserveObjectIds: true,
      preserveTimestamps: false,
      duplicateHandling: 'skip',
    });
    expect(requests).toHaveLength(2);
    expect(requests[0].method).toBe('POST');
    expect(requests[0].path).toBe('/classes/GameScore');
    expect(requests[0].body.objectId).toBe('id1');
  });

  it('strips createdAt and updatedAt when preserveTimestamps=false', () => {
    const requests = buildBatchRequests(baseRows, 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: false,
    });
    expect(requests[0].body.createdAt).toBeUndefined();
    expect(requests[0].body.updatedAt).toBeUndefined();
  });

  it('preserves timestamps as Date objects when preserveTimestamps=true with string dates', () => {
    const requests = buildBatchRequests(baseRows, 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: true,
    });
    expect(requests[0].body.createdAt).toEqual({
      __type: 'Date',
      iso: '2024-01-01T00:00:00.000Z',
    });
    expect(requests[0].body.updatedAt).toEqual({
      __type: 'Date',
      iso: '2024-01-02T00:00:00.000Z',
    });
  });

  it('preserves timestamps that are already in Date object format', () => {
    const rows = [
      {
        objectId: 'id1',
        name: 'Alice',
        createdAt: { __type: 'Date', iso: '2024-01-01T00:00:00.000Z' },
        updatedAt: { __type: 'Date', iso: '2024-01-02T00:00:00.000Z' },
      },
    ];
    const requests = buildBatchRequests(rows, 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: true,
    });
    expect(requests[0].body.createdAt).toEqual({
      __type: 'Date',
      iso: '2024-01-01T00:00:00.000Z',
    });
  });

  it('filters unknown columns when unknownColumns=ignore', () => {
    const rows = [
      { objectId: 'id1', name: 'Alice', score: 100, unknownField: 'foo', anotherUnknown: 'bar' },
    ];
    const requests = buildBatchRequests(rows, 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: false,
      unknownColumns: 'ignore',
      knownColumns: ['objectId', 'name', 'score', 'createdAt', 'updatedAt'],
    });
    expect(requests[0].body.name).toBe('Alice');
    expect(requests[0].body.score).toBe(100);
    expect(requests[0].body.unknownField).toBeUndefined();
    expect(requests[0].body.anotherUnknown).toBeUndefined();
  });

  it('keeps unknown columns when unknownColumns is not ignore', () => {
    const rows = [
      { objectId: 'id1', name: 'Alice', unknownField: 'foo' },
    ];
    const requests = buildBatchRequests(rows, 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: false,
      unknownColumns: 'create',
      knownColumns: ['objectId', 'name'],
    });
    expect(requests[0].body.unknownField).toBe('foo');
  });

  it('handles rows without objectId gracefully', () => {
    const rows = [{ name: 'Alice', score: 100 }];
    const requests = buildBatchRequests(rows, 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: false,
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe('POST');
    expect(requests[0].path).toBe('/classes/GameScore');
    expect(requests[0].body).toEqual({ name: 'Alice', score: 100 });
  });

  it('returns empty array for empty rows', () => {
    const requests = buildBatchRequests([], 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: false,
    });
    expect(requests).toEqual([]);
  });

  it('skips rows that become empty after filtering and field removal', () => {
    const rows = [
      { objectId: 'abc', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { objectId: 'def', name: 'Alice', createdAt: '2024-01-01' },
    ];
    const requests = buildBatchRequests(rows, 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: false,
    });
    // First row has only system fields → empty after stripping → skipped
    // Second row retains name → included
    expect(requests).toEqual([
      { method: 'POST', path: '/classes/GameScore', body: { name: 'Alice' } },
    ]);
  });

  it('skips rows that become empty after unknown column filtering', () => {
    const rows = [
      { unknownField: 'value' },
      { name: 'Bob', unknownField: 'value' },
    ];
    const requests = buildBatchRequests(rows, 'GameScore', {
      preserveObjectIds: false,
      preserveTimestamps: false,
      unknownColumns: 'ignore',
      knownColumns: ['name', 'score'],
    });
    expect(requests).toEqual([
      { method: 'POST', path: '/classes/GameScore', body: { name: 'Bob' } },
    ]);
  });
});

// ──────────────────────────────────────────────
// sendBatchImport
// ──────────────────────────────────────────────
describe('sendBatchImport', () => {
  const baseOptions = {
    serverURL: 'http://localhost:1337/parse',
    applicationId: 'app1',
    masterKey: 'master1',
    continueOnError: true,
    onProgress: jest.fn(),
  };

  beforeEach(() => {
    global.fetch = jest.fn();
    baseOptions.onProgress = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('sends requests in batches of 50', async () => {
    // Create 120 requests to test batching (should be 3 batches: 50, 50, 20)
    const requests = Array.from({ length: 120 }, (_, i) => ({
      method: 'POST',
      path: '/classes/GameScore',
      body: { score: i },
    }));

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => Array.from({ length: 50 }, () => ({ success: {} })),
    });
    // Override for last batch
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => Array.from({ length: 50 }, () => ({ success: {} })) })
      .mockResolvedValueOnce({ ok: true, json: async () => Array.from({ length: 50 }, () => ({ success: {} })) })
      .mockResolvedValueOnce({ ok: true, json: async () => Array.from({ length: 20 }, () => ({ success: {} })) });

    const result = await sendBatchImport(requests, baseOptions);
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(result.imported).toBe(120);
    expect(result.failed).toBe(0);
    expect(result.errors).toEqual([]);
    expect(result.stopped).toBe(false);
  });

  it('sends correct headers with masterKey', async () => {
    const requests = [{ method: 'POST', path: '/classes/GameScore', body: { score: 1 } }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ success: {} }],
    });

    await sendBatchImport(requests, baseOptions);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:1337/parse/batch',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': 'app1',
          'X-Parse-Master-Key': 'master1',
        },
      })
    );
  });

  it('sends maintenanceKey header when provided', async () => {
    const requests = [{ method: 'POST', path: '/classes/GameScore', body: { score: 1 } }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ success: {} }],
    });

    await sendBatchImport(requests, {
      ...baseOptions,
      maintenanceKey: 'maintenance1',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:1337/parse/batch',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'X-Parse-Application-Id': 'app1',
          'X-Parse-Maintenance-Key': 'maintenance1',
        },
      })
    );
  });

  it('sends request body with requests array', async () => {
    const requests = [
      { method: 'POST', path: '/classes/GameScore', body: { score: 1 } },
      { method: 'PUT', path: '/classes/GameScore/id1', body: { score: 2 } },
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ success: {} }, { success: {} }],
    });

    await sendBatchImport(requests, baseOptions);

    const call = global.fetch.mock.calls[0];
    const sentBody = JSON.parse(call[1].body);
    // Paths should be prefixed with the server path (e.g., /parse)
    expect(sentBody.requests).toEqual([
      { method: 'POST', path: '/parse/classes/GameScore', body: { score: 1 } },
      { method: 'PUT', path: '/parse/classes/GameScore/id1', body: { score: 2 } },
    ]);
  });

  it('counts imported and failed correctly', async () => {
    const requests = [
      { method: 'POST', path: '/classes/GameScore', body: { score: 1 } },
      { method: 'POST', path: '/classes/GameScore', body: { score: 2 } },
      { method: 'POST', path: '/classes/GameScore', body: { score: 3 } },
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { success: { objectId: 'new1' } },
        { error: { code: 137, error: 'A duplicate value for a field with unique values was provided' } },
        { success: { objectId: 'new3' } },
      ],
    });

    const result = await sendBatchImport(requests, baseOptions);
    expect(result.imported).toBe(2);
    expect(result.failed).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].index).toBe(1);
    expect(result.errors[0].code).toBe(137);
  });

  it('calls onProgress after each batch', async () => {
    const requests = Array.from({ length: 75 }, (_, i) => ({
      method: 'POST',
      path: '/classes/GameScore',
      body: { score: i },
    }));

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => Array.from({ length: 50 }, () => ({ success: {} })) })
      .mockResolvedValueOnce({ ok: true, json: async () => Array.from({ length: 25 }, () => ({ success: {} })) });

    await sendBatchImport(requests, baseOptions);

    expect(baseOptions.onProgress).toHaveBeenCalledTimes(2);
    expect(baseOptions.onProgress).toHaveBeenNthCalledWith(1, { completed: 50, total: 75 });
    expect(baseOptions.onProgress).toHaveBeenNthCalledWith(2, { completed: 75, total: 75 });
  });

  it('stops after first batch with errors when continueOnError=false', async () => {
    const requests = Array.from({ length: 75 }, (_, i) => ({
      method: 'POST',
      path: '/classes/GameScore',
      body: { score: i },
    }));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        const results = Array.from({ length: 50 }, () => ({ success: {} }));
        results[10] = { error: { code: 137, error: 'Duplicate' } };
        return results;
      },
    });

    const result = await sendBatchImport(requests, {
      ...baseOptions,
      continueOnError: false,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.stopped).toBe(true);
    expect(result.imported).toBe(49);
    expect(result.failed).toBe(1);
    expect(result.errors).toHaveLength(1);
  });

  it('continues all batches when continueOnError=true even with errors', async () => {
    const requests = Array.from({ length: 75 }, (_, i) => ({
      method: 'POST',
      path: '/classes/GameScore',
      body: { score: i },
    }));

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          const results = Array.from({ length: 50 }, () => ({ success: {} }));
          results[5] = { error: { code: 137, error: 'Duplicate' } };
          return results;
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => Array.from({ length: 25 }, () => ({ success: {} })),
      });

    const result = await sendBatchImport(requests, {
      ...baseOptions,
      continueOnError: true,
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.stopped).toBe(false);
    expect(result.imported).toBe(74);
    expect(result.failed).toBe(1);
  });

  it('handles empty requests array', async () => {
    const result = await sendBatchImport([], baseOptions);
    expect(result.imported).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.errors).toEqual([]);
    expect(result.stopped).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// checkDuplicates
// ──────────────────────────────────────────────
describe('checkDuplicates', () => {
  let mockFind;
  let mockQuery;

  beforeEach(() => {
    mockFind = jest.fn().mockResolvedValue([]);
    mockQuery = {
      containedIn: jest.fn(),
      select: jest.fn(),
      limit: jest.fn(),
      find: mockFind,
    };
    jest.spyOn(Parse, 'Query').mockImplementation(() => mockQuery);
  });

  afterEach(() => {
    Parse.Query.mockRestore();
  });

  it('queries with correct className and objectIds', async () => {
    await checkDuplicates(['id1', 'id2'], 'GameScore');

    expect(Parse.Query).toHaveBeenCalledWith('GameScore');
    expect(mockQuery.containedIn).toHaveBeenCalledWith('objectId', ['id1', 'id2']);
    expect(mockQuery.select).toHaveBeenCalledWith('objectId');
    expect(mockQuery.limit).toHaveBeenCalledWith(2);
    expect(mockFind).toHaveBeenCalledWith({ useMasterKey: true });
  });

  it('returns objectIds that already exist', async () => {
    mockFind.mockResolvedValueOnce([
      { id: 'id1' },
      { id: 'id3' },
    ]);

    const result = await checkDuplicates(['id1', 'id2', 'id3'], 'GameScore');
    expect(result).toEqual(['id1', 'id3']);
  });

  it('returns empty array when no duplicates exist', async () => {
    const result = await checkDuplicates(['id1', 'id2'], 'GameScore');
    expect(result).toEqual([]);
  });

  it('returns empty array for empty objectIds input', async () => {
    const result = await checkDuplicates([], 'GameScore');
    expect(result).toEqual([]);
    expect(Parse.Query).not.toHaveBeenCalled();
  });
});
