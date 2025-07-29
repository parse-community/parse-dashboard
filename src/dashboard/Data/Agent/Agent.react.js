/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import BrowserMenu from 'components/BrowserMenu/BrowserMenu.react';
import DashboardView from 'dashboard/DashboardView.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Icon from 'components/Icon/Icon.react';
import MenuItem from 'components/BrowserMenu/MenuItem.react';
import React from 'react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import Toolbar from 'components/Toolbar/Toolbar.react';
import AgentService from 'lib/AgentService';
import styles from './Agent.scss';
import { withRouter } from 'lib/withRouter';

@withRouter
class Agent extends DashboardView {
  constructor(props) {
    super(props);
    this.section = 'Core';
    this.subsection = 'Agent';
    
    this.state = {
      messages: [],
      inputValue: '',
      isLoading: false,
      selectedModel: this.getStoredSelectedModel(),
      conversationId: null, // Add conversation tracking
    };
    
    this.browserMenuRef = React.createRef();
    this.chatInputRef = React.createRef();
    this.action = new SidebarAction('Clear Chat', () => this.clearChat());
  }

  getStoredSelectedModel() {
    const stored = localStorage.getItem('selectedAgentModel');
    return stored;
  }

  componentDidMount() {
    // Fix the routing issue by ensuring this.state.route is set to 'agent'
    if (this.state.route !== 'agent') {
      this.setState({ route: 'agent' });
    }
    
    this.setDefaultModel();
  }

  componentDidUpdate(prevProps) {
    // If agentConfig just became available, set default model
    if (!prevProps.agentConfig && this.props.agentConfig) {
      this.setDefaultModel();
    }
  }

  setDefaultModel() {
    // Set default selected model if none is selected and models are available
    const { agentConfig } = this.props;
    const { selectedModel } = this.state;
    const models = agentConfig?.models || [];
    
    if (!selectedModel && models.length > 0) {
      this.setSelectedModel(models[0].name);
    }
  }

  setSelectedModel(modelName) {
    this.setState({ selectedModel: modelName });
    localStorage.setItem('selectedAgentModel', modelName);
  }

  clearChat() {
    this.setState({
      messages: [],
      conversationId: null // Reset conversation to start fresh
    });
    // Close the menu by simulating an external click
    if (this.browserMenuRef.current) {
      this.browserMenuRef.current.setState({ open: false });
    }
  }

  handleInputChange = (event) => {
    this.setState({ inputValue: event.target.value });
  }

  handleExampleClick = (exampleText) => {
    this.setState({ inputValue: exampleText }, () => {
      // Auto-submit the example query
      const event = { preventDefault: () => {} };
      this.handleSubmit(event);
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const { inputValue, selectedModel } = this.state;
    const { agentConfig } = this.props;
    
    if (inputValue.trim() === '') {
      return;
    }

    // Find the selected model configuration
    const models = agentConfig?.models || [];
    const modelConfig = models.find(model => model.name === selectedModel) || models[0];
    
    if (!modelConfig) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: 'No AI model is configured. Please check your dashboard configuration.',
        timestamp: new Date(),
        isError: true,
      };
      
      this.setState(prevState => ({
        messages: [...prevState.messages, errorMessage],
        isLoading: false,
      }));
      return;
    }
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    
    this.setState(prevState => ({
      messages: [...prevState.messages, userMessage],
      inputValue: '',
      isLoading: true,
    }));
    
    try {
      // Validate model configuration
      AgentService.validateModelConfig(modelConfig);
      
      // Get app slug from context
      const appSlug = this.context ? this.context.slug : null;
      if (!appSlug) {
        throw new Error('App context not available');
      }
      
      // Get response from AI service with conversation context
      const instructions = AgentService.getDefaultInstructions();
      const result = await AgentService.sendMessage(
        inputValue.trim(),
        modelConfig,
        instructions,
        appSlug,
        this.state.conversationId
      );
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: result.response,
        timestamp: new Date(),
      };
      
      this.setState(prevState => ({
        messages: [...prevState.messages, aiMessage],
        isLoading: false,
        conversationId: result.conversationId, // Update conversation ID
      }));
      
    } catch (error) {
      console.error('Agent API error:', error);
      
      let errorContent = `Error: ${error.message}`;
      
      // Handle specific error types
      if (error.message && error.message.includes('Permission Denied')) {
        errorContent = 'Error: Permission denied. Please refresh the page and try again.';
      } else if (error.message && error.message.includes('CSRF')) {
        errorContent = 'Error: Security token expired. Please refresh the page and try again.';
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: errorContent,
        timestamp: new Date(),
        isError: true,
      };
      
      this.setState(prevState => ({
        messages: [...prevState.messages, errorMessage],
        isLoading: false,
      }));
    }
    
    // Focus the input field after the response
    setTimeout(() => {
      if (this.chatInputRef.current) {
        this.chatInputRef.current.focus();
      }
    }, 100);
  }

  renderToolbar() {
    const { agentConfig } = this.props;
    const { selectedModel } = this.state;
    const models = agentConfig?.models || [];

    return (
      <Toolbar section="Core" subsection="Agent">
        {models.length > 0 && (
          <BrowserMenu
            title="Model"
            icon="gear-solid"
            setCurrent={() => {}}
          >
            {models.map((model, index) => (
              <MenuItem
                key={index}
                text={
                  <span>
                    {selectedModel === model.name && (
                      <Icon
                        name="check"
                        width={12}
                        height={12}
                        fill="#ffffffff"
                        className="menuCheck"
                      />
                    )}
                    {model.name}
                  </span>
                }
                onClick={() => this.setSelectedModel(model.name)}
              />
            ))}
          </BrowserMenu>
        )}
        <BrowserMenu
          ref={this.browserMenuRef}
          title="Chat"
          icon="collaborate-solid"
          setCurrent={() => {}}
        >
          <MenuItem text="Clear" onClick={() => this.clearChat()} />
        </BrowserMenu>
      </Toolbar>
    );
  }

  renderMessages() {
    const { messages, isLoading } = this.state;
    
    if (messages.length === 0) {
      return null; // Empty state is now handled as overlay
    }
    
    return (
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${styles[message.type]} ${message.isError ? styles.error : ''}`}
          >
            <div className={styles.messageContent}>
              {message.content}
            </div>
            <div className={styles.messageTime}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.agent}`}>
            <div className={styles.messageContent}>
              <div className={styles.typing}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  renderChatInput() {
    const { inputValue, isLoading } = this.state;
    
    return (
      <form className={styles.chatForm} onSubmit={this.handleSubmit}>
        <div className={styles.inputContainer}>
          <input
            ref={this.chatInputRef}
            type="text"
            className={styles.chatInput}
            placeholder="Type your message here..."
            value={inputValue}
            onChange={this.handleInputChange}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading || inputValue.trim() === ''}
          >
            Send
          </button>
        </div>
      </form>
    );
  }

  renderContent() {
    const { messages } = this.state;
    const { agentConfig } = this.props;
    const models = agentConfig?.models || [];
    
    // Check if agent configuration is missing or no models are configured
    const hasNoAgentConfig = !agentConfig;
    const hasNoModels = models.length === 0;
    
    return (
      <div className={styles.agentContainer}>
        {this.renderToolbar()}
        <div className={styles.chatContainer}>
          <div className={styles.chatWindow}>
            {this.renderMessages()}
          </div>
          {!hasNoAgentConfig && !hasNoModels && this.renderChatInput()}
        </div>
        {messages.length === 0 && (
          <div className={styles.emptyStateOverlay}>
            {hasNoAgentConfig || hasNoModels ? (
              <EmptyState
                icon="collaborate-outline"
                title="AI Agent"
                description={
                  hasNoAgentConfig
                    ? 'No AI agent configuration found. Please add an \'agent\' section to your dashboard configuration file.'
                    : 'No AI models configured. Please add models to the \'agent.models\' array in your dashboard configuration file.'
                }
              />
            ) : (
              <EmptyState
                icon="collaborate-outline"
                title="AI Agent"
                description="Start a conversation with the AI agent to get help with your database queries and operations. The agent can query your Parse classes, create and update objects, analyze your schema, and provide Parse Server guidance."
                useFlexLayout={true}
                customContent={
                  <div className={styles.exampleQueries}>
                    <h4>Try asking:</h4>
                    <div className={styles.queryExamples}>
                      <button
                        className={styles.exampleButton}
                        onClick={() => this.handleExampleClick('Which classes do I have in my database?')}
                      >
                        &ldquo;Which classes do I have in my database?&rdquo;
                      </button>
                      <button
                        className={styles.exampleButton}
                        onClick={() => this.handleExampleClick('How many users do I have?')}
                      >
                        &ldquo;How many users do I have?&rdquo;
                      </button>
                      <button
                        className={styles.exampleButton}
                        onClick={() => this.handleExampleClick('Can you fill a class with test data?')}
                      >
                        &ldquo;Can you fill a class with test data?&rdquo;
                      </button>
                    </div>
                  </div>
                }
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Agent;
