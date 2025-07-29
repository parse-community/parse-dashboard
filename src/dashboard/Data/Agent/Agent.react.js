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
import MenuItem from 'components/BrowserMenu/MenuItem.react';
import React from 'react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import Toolbar from 'components/Toolbar/Toolbar.react';
import styles from './Agent.scss';
import { withRouter } from 'lib/withRouter';

@withRouter
class Agent extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Agent';
    
    this.state = {
      messages: [],
      inputValue: '',
      isLoading: false,
    };
    
    this.action = new SidebarAction('Clear Chat', () => this.clearChat());
  }

  clearChat() {
    this.setState({ messages: [] });
  }

  handleInputChange = (event) => {
    this.setState({ inputValue: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { inputValue } = this.state;
    
    if (inputValue.trim() === '') {
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
    
    // Simulate AI response (replace with actual AI integration later)
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: `I received your message: "${inputValue.trim()}". This is a placeholder response. AI integration will be implemented here.`,
        timestamp: new Date(),
      };
      
      this.setState(prevState => ({
        messages: [...prevState.messages, aiMessage],
        isLoading: false,
      }));
    }, 1000);
  }

  renderToolbar() {
    return (
      <Toolbar section="Core" subsection="Agent">
        <BrowserMenu title="Chat" icon="collaborate-solid">
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
            className={`${styles.message} ${styles[message.type]}`}
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
            type="text"
            className={styles.chatInput}
            placeholder="Type your message here..."
            value={inputValue}
            onChange={this.handleInputChange}
            disabled={isLoading}
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
    
    return (
      <div className={styles.agentContainer}>
        {this.renderToolbar()}
        <div className={styles.chatContainer}>
          <div className={styles.chatWindow}>
            {this.renderMessages()}
          </div>
          {this.renderChatInput()}
        </div>
        {messages.length === 0 && (
          <div className={styles.emptyStateOverlay}>
            <EmptyState
              icon="collaborate-outline"
              title="AI Agent"
              description="Start a conversation with the AI agent to get help with your database queries and operations."
              cta="Type a message below to get started"
            />
          </div>
        )}
      </div>
    );
  }
}

export default Agent;
