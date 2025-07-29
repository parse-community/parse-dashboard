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
import Markdown from 'components/Markdown/Markdown.react';
import MenuItem from 'components/BrowserMenu/MenuItem.react';
import React from 'react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import Toolbar from 'components/Toolbar/Toolbar.react';
import AgentService from 'lib/AgentService';
import styles from './Agent.scss';
import { withRouter } from 'lib/withRouter';
import { CurrentApp } from 'context/currentApp';

@withRouter
class Agent extends DashboardView {
  static contextType = CurrentApp;

  constructor(props) {
    super(props);
    this.section = 'Core';
    this.subsection = 'Agent';

    this.state = {
      messages: [],
      inputValue: '',
      isLoading: false,
      selectedModel: this.getStoredSelectedModel(),
      conversationId: null,
      permissions: this.getStoredPermissions(),
      // Force re-render key
      permissionsKey: 0,
    };

    this.browserMenuRef = React.createRef();
    this.chatInputRef = React.createRef();
    this.chatWindowRef = React.createRef();
    this.action = new SidebarAction('Clear Chat', () => this.clearChat());
  }

  getStoredSelectedModel() {
    const stored = localStorage.getItem('selectedAgentModel');
    return stored;
  }

  getStoredPermissions() {
    try {
      const stored = localStorage.getItem('agentPermissions');
      return stored ? JSON.parse(stored) : {
        deleteObject: false,
        deleteClass: false,
        updateObject: false,
        createObject: false,
        createClass: false,
      };
    } catch (error) {
      console.warn('Failed to parse stored permissions, using defaults:', error);
      return {
        deleteObject: false,
        deleteClass: false,
        updateObject: false,
        createObject: false,
        createClass: false,
      };
    }
  }

  setPermission = (operation, enabled) => {
    this.setState(prevState => {
      const newPermissions = {
        ...prevState.permissions,
        [operation]: enabled
      };

      // Save to localStorage immediately
      localStorage.setItem('agentPermissions', JSON.stringify(newPermissions));

      return {
        permissions: newPermissions,
        permissionsKey: prevState.permissionsKey + 1
      };
    });
  }

  getStoredChatState() {
    try {
      const appSlug = this.context ? this.context.slug : null;
      if (!appSlug) {return null;}

      const stored = localStorage.getItem(`agentChat_${appSlug}`);
      if (!stored) {return null;}

      const parsedState = JSON.parse(stored);

      // Validate the structure
      if (!parsedState || typeof parsedState !== 'object') {return null;}
      if (!Array.isArray(parsedState.messages)) {return null;}

      // Check if the data is too old (optional: 24 hours expiry)
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (parsedState.timestamp && (Date.now() - parsedState.timestamp > ONE_DAY)) {
        localStorage.removeItem(`agentChat_${appSlug}`);
        return null;
      }

      return parsedState;
    } catch (error) {
      console.warn('Failed to parse stored chat state:', error);
      return null;
    }
  }

  saveChatState() {
    try {
      const appSlug = this.context ? this.context.slug : null;
      if (!appSlug) {return;}

      const chatState = {
        messages: this.state.messages,
        conversationId: this.state.conversationId,
        timestamp: Date.now()
      };
      localStorage.setItem(`agentChat_${appSlug}`, JSON.stringify(chatState));
    } catch (error) {
      console.warn('Failed to save chat state:', error);
    }
  }

  componentDidMount() {
    // Fix the routing issue by ensuring this.state.route is set to 'agent'
    if (this.state.route !== 'agent') {
      this.setState({ route: 'agent' });
    }

    this.setDefaultModel();

    // Load saved chat state after component mounts when context is available
    this.loadSavedChatState();
  }

  loadSavedChatState() {
    const savedChatState = this.getStoredChatState();
    if (savedChatState && savedChatState.messages && savedChatState.messages.length > 0) {
      // Convert timestamp strings back to Date objects
      const messagesWithDateTimestamps = savedChatState.messages.map(message => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }));

      this.setState({
        messages: messagesWithDateTimestamps,
        conversationId: savedChatState.conversationId || null,
      });
    }
  }

  componentWillUnmount() {
    // Save chat state when component unmounts (navigation away)
    this.saveChatState();
  }

  componentDidUpdate(prevProps, prevState) {
    // If agentConfig just became available, set default model
    if (!prevProps.agentConfig && this.props.agentConfig) {
      this.setDefaultModel();
    }

    // Save chat state when messages change
    if (prevState.messages.length !== this.state.messages.length ||
        prevState.conversationId !== this.state.conversationId) {
      this.saveChatState();
    }

    // Auto-scroll to bottom when new messages are added or loading state changes
    if (prevState.messages.length !== this.state.messages.length ||
        prevState.isLoading !== this.state.isLoading) {
      // Use requestAnimationFrame and setTimeout to ensure DOM has updated
      requestAnimationFrame(() => {
        setTimeout(() => this.scrollToBottom(), 50);
      });
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

  scrollToBottom() {
    if (this.chatWindowRef.current) {
      const element = this.chatWindowRef.current;
      element.scrollTop = element.scrollHeight;

      // Force smooth scrolling behavior
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  clearChat() {
    this.setState({
      messages: [],
      conversationId: null, // Reset conversation to start fresh
    });

    // Clear saved chat state from localStorage
    try {
      const appSlug = this.context ? this.context.slug : null;
      if (appSlug) {
        localStorage.removeItem(`agentChat_${appSlug}`);
      }
    } catch (error) {
      console.warn('Failed to clear saved chat state:', error);
    }

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
    const { inputValue, selectedModel, messages } = this.state;
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

    // Add warning message if this is the first message in the conversation
    const isFirstMessage = messages.length === 0;
    const messagesToAdd = [];

    if (isFirstMessage) {
      const warningMessage = {
        id: Date.now() - 1,
        type: 'warning',
        content: 'The AI agent has full access to your database using the master key. It can read, modify, and delete any data. This feature is highly recommended for development environments only. Always back up important data before using the AI agent. Use the permissions menu to restrict operations.',
        timestamp: new Date(),
      };
      messagesToAdd.push(warningMessage);
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    messagesToAdd.push(userMessage);

    this.setState(prevState => ({
      messages: [...prevState.messages, ...messagesToAdd],
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
      const result = await AgentService.sendMessage(
        inputValue.trim(),
        modelConfig,
        appSlug,
        this.state.conversationId,
        this.state.permissions
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
    const { selectedModel, permissions, permissionsKey } = this.state;
    const models = agentConfig?.models || [];

    const permissionOperations = [
      { key: 'deleteObject', label: 'Delete Objects' },
      { key: 'deleteClass', label: 'Delete Classes' },
      { key: 'updateObject', label: 'Update Objects' },
      { key: 'createObject', label: 'Create Objects' },
      { key: 'createClass', label: 'Create Classes' },
    ];

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
          key={`permissions-${permissionsKey}`}
          title="Permissions"
          icon="locked-solid"
          setCurrent={() => {}}
        >
          {permissionOperations.map((operation) => (
            <MenuItem
              key={operation.key}
              active={permissions[operation.key]}
              text={
                <span>
                  {permissions[operation.key] && (
                    <Icon
                      name="check"
                      width={12}
                      height={12}
                      fill="#ffffffff"
                      className="menuCheck"
                    />
                  )}
                  {operation.label}
                </span>
              }
              onClick={() => {
                this.setPermission(operation.key, !permissions[operation.key]);
              }}
            />
          ))}
        </BrowserMenu>
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

  formatMessageContent(content) {
    // Use the existing Markdown component to render the content
    return <Markdown content={content} />;
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
            className={`${styles.message} ${styles[message.type]} ${message.isError ? styles.error : ''} ${message.type === 'warning' ? styles.warningMessage : ''}`}
          >
            {message.type === 'warning' ? (
              <>
                <Icon name="warn-outline" width={16} height={16} fill="#856404" className={styles.warningIcon} />
                <div className={styles.warningContent}>
                  {message.content}
                </div>
              </>
            ) : (
              <>
                <div className={styles.messageContent}>
                  {message.type === 'agent' ? this.formatMessageContent(message.content) : message.content}
                </div>
                <div className={styles.messageTime}>
                  {message.timestamp instanceof Date ?
                    message.timestamp.toLocaleTimeString() :
                    new Date(message.timestamp).toLocaleTimeString()
                  }
                </div>
              </>
            )}
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
          <div ref={this.chatWindowRef} className={styles.chatWindow}>
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
                        onClick={() => this.handleExampleClick('How many users do I have?')}
                      >
                        &ldquo;How many users do I have?&rdquo;
                      </button>
                      <button
                        className={styles.exampleButton}
                        onClick={() => this.handleExampleClick('What classes do I have in my database?')}
                      >
                        &ldquo;What classes do I have in my database?&rdquo;
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
