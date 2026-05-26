/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
jest.dontMock('../../../Parse-Dashboard/openAIModelParams.js');

const {
  usesNextGenContract,
  buildModelParams,
  MAX_OUTPUT_TOKENS,
  DEFAULT_TEMPERATURE,
} = require('../../../Parse-Dashboard/openAIModelParams.js');

describe('openAIModelParams.usesNextGenContract', () => {
  it('treats GPT-4.1 and older as legacy', () => {
    expect(usesNextGenContract('gpt-4.1')).toBe(false);
    expect(usesNextGenContract('gpt-4')).toBe(false);
    expect(usesNextGenContract('gpt-4o')).toBe(false);
    expect(usesNextGenContract('gpt-4-turbo')).toBe(false);
    expect(usesNextGenContract('gpt-4.5-preview')).toBe(false);
    expect(usesNextGenContract('gpt-3.5-turbo')).toBe(false);
  });

  it('treats GPT-5 and newer as next-gen', () => {
    expect(usesNextGenContract('gpt-5')).toBe(true);
    expect(usesNextGenContract('gpt-5.4')).toBe(true);
    expect(usesNextGenContract('gpt-5.5')).toBe(true);
    expect(usesNextGenContract('gpt-6')).toBe(true);
    expect(usesNextGenContract('gpt-10')).toBe(true);
  });

  it('treats the "o" reasoning series as next-gen', () => {
    expect(usesNextGenContract('o1')).toBe(true);
    expect(usesNextGenContract('o1-mini')).toBe(true);
    expect(usesNextGenContract('o3')).toBe(true);
    expect(usesNextGenContract('o4-mini')).toBe(true);
  });

  it('is case- and whitespace-insensitive', () => {
    expect(usesNextGenContract('  GPT-5.5  ')).toBe(true);
    expect(usesNextGenContract('GPT-4.1')).toBe(false);
  });

  it('defaults unknown/invalid names to legacy for backwards compatibility', () => {
    expect(usesNextGenContract('')).toBe(false);
    expect(usesNextGenContract(undefined)).toBe(false);
    expect(usesNextGenContract(null)).toBe(false);
    expect(usesNextGenContract('some-custom-model')).toBe(false);
  });
});

describe('openAIModelParams.buildModelParams', () => {
  it('uses max_tokens and temperature for legacy models', () => {
    expect(buildModelParams('gpt-4.1')).toEqual({
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: DEFAULT_TEMPERATURE,
    });
  });

  it('uses max_completion_tokens and omits temperature for next-gen models', () => {
    const params = buildModelParams('gpt-5.5');
    expect(params).toEqual({ max_completion_tokens: MAX_OUTPUT_TOKENS });
    expect(params).not.toHaveProperty('max_tokens');
    expect(params).not.toHaveProperty('temperature');
  });
});
