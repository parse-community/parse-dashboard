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
   * @param {string} appSlug - The app slug to scope the request to
   * @param {string|null} conversationId - Optional conversation ID to maintain context
   * @returns {Promise<{response: string, conversationId: string}>} The AI's response and conversation ID
   */
  static async sendMessage(message, modelConfig, instructions = null, appSlug, conversationId = null) {
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
- Database queries and data operations using the Parse JS SDK
- Understanding Parse Server concepts and best practices
- Troubleshooting common issues
- Best practices for data modeling
- Cloud Code and server configuration guidance

You have access to database function tools that allow you to:
- Query classes/tables to retrieve objects (read-only, no confirmation needed)
- Create new objects in classes (REQUIRES USER CONFIRMATION)
- Update existing objects (REQUIRES USER CONFIRMATION)  
- Delete objects (REQUIRES USER CONFIRMATION)
- Get schema information for classes (read-only, no confirmation needed)
- Count objects that match certain criteria (read-only, no confirmation needed)

CRITICAL SECURITY RULE FOR WRITE OPERATIONS:
- ANY write operation (create, update, delete) MUST have explicit user confirmation BEFORE execution
- You MUST ask the user to confirm each write operation individually
- You CANNOT assume consent or perform write operations without explicit permission
- The user cannot disable this confirmation requirement
- Even if the user says "yes to all" or similar, you must still ask for each operation
- If a user requests multiple write operations, ask for confirmation for each one separately

When working with the database:
- Read operations (query, getSchema, count) can be performed immediately
- Write operations require the pattern: 1) Explain what you'll do, 2) Ask for confirmation, 3) Only then execute if confirmed
- Always use the provided database functions to interact with data
- Class names are case-sensitive
- Use proper Parse query syntax for complex queries
- Handle objectId fields correctly
- Be mindful of data types (Date, Pointer, etc.)
- Always consider security and use appropriate query constraints
- Provide clear explanations of what database operations you're performing
- If any database function returns an error, you MUST include the full error message in your response to the user. Never hide error details or give vague responses like "there was an issue" - always show the specific error message.

When responding:
- Be concise and helpful
- Provide practical examples when relevant
- Ask clarifying questions if the user's request is unclear
- Focus on Parse-specific solutions and recommendations
- If you perform database operations, explain what you did and show the results
- For write operations, always explain the impact and ask for explicit confirmation
- Format your responses using Markdown for better readability:
  * Use **bold** for important information
  * Use *italic* for emphasis
  * Use \`code\` for field names, class names, and values
  * Use numbered lists for step-by-step instructions
  * Use bullet points for listing items
  * Use tables when showing structured data
  * Use code blocks with language specification for code examples
  * Use headers (##, ###) to organize longer responses
  * When listing database classes, format as a numbered list with descriptions
  * Use tables for structured data comparison

You have direct access to the Parse database through function calls, so you can query actual data and provide real-time information about the user's Parse Dashboard interface.`;
  }
}
