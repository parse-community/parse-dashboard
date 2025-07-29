/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { post } from './AJAX';

/**
 * Service class for handling AI agent API requests to different providers
 */
export default class AgentService {
  /**
   * Send a message to the configured AI model and get a response
   * @param {string} message - The user's message
   * @param {Object} modelConfig - The model configuration object
   * @param {string} appSlug - The app slug to scope the request to
   * @param {string|null} conversationId - Optional conversation ID to maintain context
   * @param {Object} permissions - Permission settings for operations
   * @returns {Promise<{response: string, conversationId: string}>} The AI's response and conversation ID
   */
  static async sendMessage(message, modelConfig, appSlug, conversationId = null, permissions = {}) {
    if (!modelConfig) {
      throw new Error('Model configuration is required');
    }

    const { name } = modelConfig;

    if (!name) {
      throw new Error('Model name is required in model configuration');
    }

    if (!appSlug) {
      throw new Error('App slug is required to send message to agent');
    }

    try {
      const requestBody = {
        message: message,
        modelName: name
      };

      // Include conversation ID if provided
      if (conversationId) {
        requestBody.conversationId = conversationId;
      }

      // Include permissions if provided
      if (permissions) {
        requestBody.permissions = permissions;
      }

      const response = await post(`/apps/${appSlug}/agent`, requestBody);

      if (response.error) {
        throw new Error(response.error);
      }

      return {
        response: response.response,
        conversationId: response.conversationId
      };
    } catch (error) {
      // Handle specific error types
      if (error.message && error.message.includes('Permission Denied')) {
        throw new Error('Permission denied. Please refresh the page and try again.');
      }

      if (error.message && error.message.includes('CSRF')) {
        throw new Error('Security token expired. Please refresh the page and try again.');
      }

      // Handle network errors and other fetch-related errors
      if (error.message && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to agent service. Please check your internet connection.');
      }

      // Re-throw the original error if it's not a recognized type
      throw error;
    }
  }

  /**
   * Validate model configuration
   * @param {Object} modelConfig - The model configuration object
   * @returns {boolean} True if valid, throws error if invalid
   */
  static validateModelConfig(modelConfig) {
    if (!modelConfig) {
      throw new Error('Model configuration is required');
    }

    const { name, provider, model, apiKey } = modelConfig;

    if (!name) {
      throw new Error('Model name is required in model configuration');
    }

    if (!provider) {
      throw new Error('Provider is required in model configuration');
    }

    if (!model) {
      throw new Error('Model name is required in model configuration');
    }

    if (!apiKey) {
      throw new Error('API key is required in model configuration');
    }

    return true;
  }

}
