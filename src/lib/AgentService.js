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
   * @param {string|null} instructions - Optional system instructions for the AI (currently ignored, handled server-side)
   * @returns {Promise<string>} The AI's response
   */
  static async sendMessage(message, modelConfig, instructions = null) {
    if (!modelConfig) {
      throw new Error('Model configuration is required');
    }

    const { name } = modelConfig;

    if (!name) {
      throw new Error('Model name is required in model configuration');
    }

    try {
      const response = await post('/agent', {
        message: message,
        modelName: name
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.response;
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

    if (apiKey === 'xxxxx' || apiKey.includes('xxx')) {
      throw new Error('Please replace the placeholder API key with your actual API key');
    }

    return true;
  }

  /**
   * Get default system instructions for Parse Dashboard agent
   * @returns {string} Default system instructions
   */
  static getDefaultInstructions() {
    return `You are an AI assistant integrated into Parse Dashboard, a data management interface for Parse Server applications.

Your role is to help users with:
- Database queries and data operations
- Understanding Parse Server concepts
- Troubleshooting common issues
- Best practices for data modeling
- Cloud Code and server configuration

When responding:
- Be concise and helpful
- Provide practical examples when relevant
- Ask clarifying questions if the user's request is unclear
- Focus on Parse-specific solutions and recommendations

You have access to the user's Parse Dashboard interface, so you can reference their database schema, classes, and data when appropriate.`;
  }
}
