'use strict';

/**
 * Helpers for building OpenAI Chat Completions request parameters that work
 * across both legacy and next-generation models.
 *
 * OpenAI changed the Chat Completions API contract starting with the GPT-5
 * family and the "o" reasoning series (o1, o3, ...):
 *   - The token-limit parameter was renamed from `max_tokens` to
 *     `max_completion_tokens`. Sending `max_tokens` to these models fails with
 *     "Unsupported parameter: 'max_tokens' is not supported with this model.
 *     Use 'max_completion_tokens' instead."
 *   - Only the default `temperature` (1) is accepted. Sending a custom value
 *     fails with "Unsupported value: 'temperature' does not support ...".
 *
 * Legacy models (GPT-4.1 and older, GPT-4o, GPT-4-turbo, GPT-3.5, ...) keep the
 * original contract. These helpers detect the model generation and emit the
 * correct parameters so both old and new models work without the caller needing
 * to know the difference.
 */

const MAX_OUTPUT_TOKENS = 2000;
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Determine whether a model uses the next-generation Chat Completions contract
 * (renamed token parameter, fixed default temperature).
 *
 * @param {string} model The configured model name, e.g. "gpt-4.1", "gpt-5.5".
 * @returns {boolean} True for GPT-5 and later plus the "o" reasoning series.
 */
function usesNextGenContract(model) {
  const normalized = typeof model === 'string' ? model.trim().toLowerCase() : '';

  // "o" reasoning series: o1, o1-mini, o3, o3-mini, o4-mini, ...
  if (/^o\d/.test(normalized)) {
    return true;
  }

  // "gpt-<major>[.<minor>]..." — treat major version 5 and above as next-gen.
  const match = normalized.match(/^gpt-(\d+)/);
  if (match) {
    return parseInt(match[1], 10) >= 5;
  }

  // Unknown/unmatched names default to the legacy contract to preserve
  // backwards compatibility.
  return false;
}

/**
 * Build the request-body parameters that differ between model generations: the
 * token-limit field and (for legacy models only) the temperature.
 *
 * @param {string} model The configured model name.
 * @returns {object} A partial request body with the correct token/temperature keys.
 */
function buildModelParams(model) {
  if (usesNextGenContract(model)) {
    // Next-gen models: renamed token field, and only the default temperature is
    // allowed — so we omit `temperature` entirely.
    return { max_completion_tokens: MAX_OUTPUT_TOKENS };
  }

  // Legacy models: original parameters.
  return { max_tokens: MAX_OUTPUT_TOKENS, temperature: DEFAULT_TEMPERATURE };
}

module.exports = {
  usesNextGenContract,
  buildModelParams,
  MAX_OUTPUT_TOKENS,
  DEFAULT_TEMPERATURE,
};
