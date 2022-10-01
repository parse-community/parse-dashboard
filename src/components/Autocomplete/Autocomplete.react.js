/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Position             from 'lib/Position';
import PropTypes            from 'lib/PropTypes'
import React, { Component } from 'react';
import styles               from 'components/Autocomplete/Autocomplete.scss';
import SuggestionsList      from 'components/SuggestionsList/SuggestionsList.react';

export default class Autocomplete extends Component {
  constructor(props) {
    super(props);

    this.setHidden = this.setHidden.bind(this);
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);

    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.onClick = this.onClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onInputClick = this.onInputClick.bind(this);
    this.onExternalClick = this.onExternalClick.bind(this);

    this.getPosition = this.getPosition.bind(this);
    this.recalculatePosition = this.recalculatePosition.bind(this);

    this.inputRef = React.createRef();
    this.dropdownRef = React.createRef();
    this.fieldRef = React.createRef();

    this.handleScroll = () => {
      const pos = this.getPosition();
      this.dropdownRef.current.setPosition(pos);
    };

    this.handleResize = () => {
      const pos = this.getPosition();
      this.dropdownRef.current.setPosition(pos);
    };

    this.state = {
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: '',
      label: props.label,
      position: null
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.fieldRef.current.addEventListener('scroll', this.handleScroll);
    this.recalculatePosition();
    this._ignoreBlur = false;
  }

  componentWillUnmount() {
    this.fieldRef.current.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }

  getPosition() {
    const node = this.fieldRef.current;

    let newPosition = this.props.fixed
      ? Position.inWindow(node)
      : Position.inDocument(node);

    newPosition.y += node.offsetHeight;

    return newPosition;
  }

  recalculatePosition() {
    const position = this.getPosition();
    // update position of dropdown w/o rerendering this whole component
    this.dropdownRef.current
      ? this.dropdownRef.current.setPosition(position)
      : this.setState({ position }, () => this.forceUpdate());
  }

  getSuggestions(userInput) {
    const { suggestions, buildSuggestions } = this.props;
    // either rely on external logic to recalculate suggestioons,
    // or just filter by input
    const filteredSuggestions = buildSuggestions
      ? buildSuggestions(userInput)
      : suggestions.filter(
          suggestion =>
            suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );
    return filteredSuggestions;
  }

  getLabel(userInput) {
    return this.props.label || this.props.buildLabel(userInput);
  }

  onChange(e) {
    const userInput = e.currentTarget && e.currentTarget.value;

    const filteredSuggestions = this.getSuggestions(userInput);
    const label = this.getLabel(userInput);

    this.setState({
      active: true,
      activeSuggestion: 0,
      filteredSuggestions,
      showSuggestions: true,
      userInput,
      label,
      error: undefined
    });

    this.props.onChange && this.props.onChange(userInput);
  }

  onClick(e) {
    const userInput = e.currentTarget.innerText;
    const label = this.props.label || this.props.buildLabel(userInput);

    this.inputRef.current.focus();
    this._ignoreBlur = false;

    this.setState(
      {
        activeSuggestion: 0,
        filteredSuggestions: [],
        showSuggestions: false,
        userInput,
        label
      },
      () => {
        this.props.onClick && this.props.onClick(e);
      }
    );
  }

  onFocus(e) {
    if (!this._ignoreBlur && !this.state.showSuggestions) {
      this._ignoreBlur = true;
    }

    this.activate(e);
  }

  onBlur(e) {
    this.props.onBlur && this.props.onBlur(e);
  }

  onExternalClick(e) {
    if (this._ignoreBlur) {
      // because events flow in order: onFocus:input -> onClick:popover -> onClick:input
      // need to ignore the click that initially focuses the input field
      // otherwise it will hide the dropdown instantly.
      // _ignoreBlur will be unset in input click handler right after.
      return;
    }
    if (e.target.id !== this.inputRef.current.id) {
      this.deactivate();
    }
  }

  onInputClick() {
    this._ignoreBlur = false;
  }

  activate(e) {
    const userInput = e.currentTarget && e.currentTarget.value;

    const position = this.getPosition();
    const filteredSuggestions = this.getSuggestions(userInput);
    const label = this.getLabel(userInput);

    this.setState(
      {
        active: true,
        filteredSuggestions,
        position,
        label,
        showSuggestions: true
      },
      () => {
        this.props.onFocus && this.props.onFocus();
      }
    );
  }

  deactivate() {
    this.setState(
      {
        active: false,
        showSuggestions: false,
        activeSuggestion: 0
      },
      () => {
        this.props.onBlur && this.props.onBlur();
      }
    );
  }

  resetInput() {
    this.setState(
      {
        active: false,
        activeSuggestion: 0,
        showSuggestions: false,
        userInput: ''
      },
      () => {
        this.inputRef.current.blur();
      }
    );
  }

  onKeyDown(e) {
    const { activeSuggestion, filteredSuggestions } = this.state;

    // Enter
    const { userInput } = this.state;

      if (e.keyCode === 13) {
            if (userInput && userInput.length > 0) {
        this.props.onSubmit(userInput);
      }
    } else if (e.keyCode === 9) {
      // Tab
      // do not type it
      e.preventDefault();
      
      e.stopPropagation();
      // move focus to input
      this.inputRef.current.focus();
      this.setState({
        active: true,
        activeSuggestion: 0,
        showSuggestions: false,
        userInput: filteredSuggestions[activeSuggestion]
      });
    } else if (e.keyCode === 38) {
      // arrow up
      if (activeSuggestion === 0) {
        return;
      }

      this.setState({
        active: false,
        activeSuggestion: activeSuggestion - 1
      });
    } else if (e.keyCode === 40) {
      // arrow down
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }

      this.setState({
        active: false,
        activeSuggestion: activeSuggestion + 1
      });
    }
  }

  setHidden(hidden) {
    this.setState({ hidden });
  }

  render() {
    const {
      onExternalClick,
      onInputClick,
      onChange,
      onClick,
      onBlur,
      onFocus,
      onKeyDown,
      props: { suggestionsStyle, inputStyle, placeholder, error },
      state: {
        activeSuggestion,
        filteredSuggestions,
        showSuggestions,
        userInput,
        hidden,
        active,
        label
      }
    } = this;

    const fieldClassName = [
      styles.field,
      active && styles.active,
      error ? styles.error : undefined,
      showSuggestions &&
        !hidden &&
        filteredSuggestions.length &&
        styles.dropdown
    ].join(' ');

    const inputClasses = [error && styles.error].join(' ');

    let suggestionsListComponent;
    if (showSuggestions && !hidden && filteredSuggestions.length) {
      suggestionsListComponent = (
        <SuggestionsList
          position={this.state.position}
          ref={this.dropdownRef}
          onExternalClick={onExternalClick}
          suggestions={filteredSuggestions}
          suggestionsStyle={suggestionsStyle}
          activeSuggestion={activeSuggestion}
          onClick={onClick}
        />
      );
    } 

    return (
      <React.Fragment>
        <div className={fieldClassName} ref={this.fieldRef}>
          <input
            id={1}
            role={'combobox'}
            autoComplete='off'
            className={inputClasses}
            placeholder={placeholder}
            ref={this.inputRef}
            style={inputStyle}
            value={userInput}
            onClick={onInputClick}
            onBlur={onBlur}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
          />
          <label htmlFor={1} className={error && styles.error}>
            {error || label}
          </label>
        </div>
        {suggestionsListComponent}
      </React.Fragment>
    );
  }
}

Autocomplete.propTypes = {
  inputStyle: PropTypes.object.describe(
    'Styling for the input.'
  ),
  suggestionsStyle: PropTypes.object.describe(
    'Styling for the suggestions dropdown.'
  ),
  onChange: PropTypes.func.describe(
    'Callback triggered when input fiield is changed'
  ),
  onSubmit: PropTypes.func.describe(
    'Callback triggered when "enter" key pressed'
  ),
  placeholder: PropTypes.string.describe(
    'Placeholder text'
  ),
  buildSuggestions: PropTypes.func.describe(
    'Function receiving current input as an argument and should return an array to be rendered as suggestions'
  ),
  buildLabel: PropTypes.func.describe(
    'Function receiving current input as an argument and should return a string to be rendered as label'
  ),
  error: PropTypes.string.describe(
    'Error to be rendered in place of label if defined'
  ) 
} 
