/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import styles from 'components/StringEditor/StringEditor.scss';

export default class StringEditor extends React.Component {
  constructor(props) {
    super();

    this.state = {
      value: props.value || '',
    };

    this.checkExternalClick = this.checkExternalClick.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.inputRef.current.setSelectionRange(0, this.state.value.length);
    document.body.addEventListener('click', this.checkExternalClick);
    document.body.addEventListener('touchend', this.checkExternalClick);
    document.body.addEventListener('keydown', this.handleKey);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.checkExternalClick);
    document.body.removeEventListener('touchend', this.checkExternalClick);
    document.body.removeEventListener('keydown', this.handleKey);
  }

  checkExternalClick(e) {
    if (e.target !== this.inputRef.current) {
      this.props.onCommit(this.state.value);
    }
  }

  handleKey(e) {
    if (e.keyCode === 13) {
      // if it's a multiline input, we allow Shift+Enter to create a newline
      // Otherwise, we submit
      if (!this.props.multiline || !e.shiftKey) {
        this.props.onCommit(this.state.value);
        e.preventDefault();
      }
    } else if (e.keyCode === 27) {
      // ESC key - cancel editing
      if (this.props.onCancel) {
        this.props.onCancel();
      } else {
        // If no onCancel callback, just commit the original value
        this.props.onCommit(this.props.value);
      }
      e.preventDefault();
      e.stopPropagation();
    }
  }

  handleContextMenu(e) {
    const { setContextMenu, arrayConfigParams, onAddToArrayConfig, getRelatedRecordsMenuItem } = this.props;

    // Only show custom context menu when Alt key is held
    if (!e.altKey) {
      return;
    }

    // Check if setContextMenu is available
    if (!setContextMenu) {
      return;
    }

    // Get selected text from the input/textarea
    const input = this.inputRef.current;
    const selectedText = input.value.substring(input.selectionStart, input.selectionEnd).trim();

    // Only show if there's selected text
    if (!selectedText) {
      return;
    }

    // Build context menu items
    const menuItems = [];

    // Add "Add to config parameter" option if available
    if (arrayConfigParams && arrayConfigParams.length > 0 && onAddToArrayConfig) {
      menuItems.push({
        text: 'Add to config parameter...',
        items: arrayConfigParams.map(param => ({
          text: param.name,
          callback: () => {
            onAddToArrayConfig(param.name, selectedText);
          },
        })),
      });
    }

    // Add "Related records" option if available (using selected text)
    if (getRelatedRecordsMenuItem) {
      const relatedRecordsItem = getRelatedRecordsMenuItem(selectedText);
      if (relatedRecordsItem) {
        if (menuItems.length > 0) {
          menuItems.push({ type: 'separator' });
        }
        menuItems.push(relatedRecordsItem);
      }
    }

    // Only show context menu if there are items
    if (menuItems.length === 0) {
      return;
    }

    // Prevent default context menu
    e.preventDefault();
    e.stopPropagation();

    setContextMenu(e.pageX, e.pageY, menuItems);
  }

  render() {
    const classes = [styles.editor];
    const onChange = this.props.readonly ? () => {} : e => this.setState({ value: e.target.value });
    if (this.props.readonly) {
      classes.push(styles.readonly);
    }

    if (this.props.multiline) {
      const style = { minWidth: this.props.minWidth };
      if (this.props.resizable) {
        style.resize = 'both';
      }
      return (
        <div className={styles.editor}>
          <textarea
            ref={this.inputRef}
            value={this.state.value}
            onChange={onChange}
            onContextMenu={this.handleContextMenu}
            style={style}
          />
        </div>
      );
    }
    return (
      <div style={{ width: this.props.width }} className={classes.join(' ')}>
        <input
          ref={this.inputRef}
          value={this.state.value}
          onChange={onChange}
          onContextMenu={this.handleContextMenu}
          disabled={this.props.readonly}
        />
      </div>
    );
  }
}
