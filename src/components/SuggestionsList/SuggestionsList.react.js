/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Popover  from 'components/Popover/Popover.react';
import React    from 'react';
import styles   from 'components/SuggestionsList/SuggestionsList.scss';

export default class Suggestion extends React.Component {
  constructor() {
    super();
    this.state = {
      activeSuggestion: 0,
      open: false,
      position: null
    };

    this.popoverRef = React.createRef();
  }

  toggle() {
    this.setPosition();
    this.setState({ open: !this.state.open });
  }

  setPosition(position) {
   this.popoverRef.current && this.popoverRef.current.setPosition(position);
  }

  close() {
    this.setState({ open: false });
  }

  render() {
  const {
    position,
    onExternalClick,
    suggestions,
    suggestionsStyle,
    suggestionsItemStyle,
    activeSuggestion,
    onClick,
    onMouseDown,
    onKeyDown} = this.props;

    return (
      <Popover
      fixed={false}
      position={position}
      ref={this.popoverRef}
      onExternalClick={onExternalClick}
      data-popover-type="inner"
    >
      <ul style={suggestionsStyle} className={styles.suggestions} onKeyDown={onKeyDown}>
        {suggestions.map((suggestion, index) => {
          let className;
          if (index === activeSuggestion) {
            className = styles.active;
          }
          return (
            <li style={suggestionsItemStyle} className={className} key={suggestion} onMouseDown={onMouseDown} onClick={onClick}>
              {suggestion}
            </li>
          );
        })}
      </ul>
    </Popover>
    );
  }
}
