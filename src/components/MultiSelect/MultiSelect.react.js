/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import hasAncestor    from 'lib/hasAncestor';
import Popover        from 'components/Popover/Popover.react';
import Position       from 'lib/Position';
import PropTypes      from 'lib/PropTypes';
import React          from 'react';
import ReactDOM       from 'react-dom';
import stringList     from 'lib/stringList';
import styles         from 'components/MultiSelect/MultiSelect.scss';

export default class MultiSelect extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      position: null
    }
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
  }

  componentWillReceiveProps() {
    //Necessary for when the size of the field changes.
    this.setState({}, this.setPosition.bind(this));
  }

  setPosition() {
    let newPosition = this.props.fixed ? Position.inWindow(this.node) : Position.inDocument(this.node);
    newPosition.y += this.node.offsetHeight; //Move dropdown down below field
    //The forceUpdate call is necessary in case the size of the field changes size during the current render.
    this.setState({ position: newPosition }, () => this.forceUpdate());
  }

  toggle() {
    this.setPosition();
    this.setState({ open: !this.state.open });
  }

  close(e) {
    if (!hasAncestor(e.target, this.node)) {
      //In the case where the user clicks on the node, toggle() will handle closing the dropdown.
      this.setState({open: false});
    }
  }

  select(value) {
    let newValue = value;
    if (this.props.value.indexOf(value) > -1) {
      newValue = this.props.value.filter(v => v !== value);
    } else {
      newValue = this.props.value.concat([value]);
    }
    this.props.onChange(newValue);
  }

  render() {
    let popover = null;
    if (this.state.open) {
      let width = this.node.clientWidth;
      popover = (
        <Popover fixed={this.props.fixed} position={this.state.position} onExternalClick={this.close.bind(this)}>
          <div style={{ width }} className={styles.menu}>
            {React.Children.map(this.props.children, c => React.cloneElement(c,
                {
                  ...c.props,
                  checked: this.props.value.indexOf(c.props.value) > -1,
                  onClick: this.select.bind(this, c.props.value)
                }
            ))}
          </div>
        </Popover>
      )
    }
    let content = [];
    let classes = [styles.current];
    React.Children.forEach(this.props.children, c => {
      if (this.props.value.indexOf(c.props.value) > -1) {
        content.push(c.props.children);
      }
    });
    if (content.length === 0 && this.props.placeHolder){
      content.push(this.props.placeHolder);
      classes.push(styles.placeholder);
    }
    let dropdownStyle = {};
    if (this.props.width) {
      dropdownStyle = {
        width: this.props.width,
        float: 'left'
      };
    }
    return (
      <div style={dropdownStyle} className={styles.dropdown}>
        <div className={classes.join(' ')} onClick={this.toggle.bind(this)}>
          {stringList(content, this.props.endDelineator)}
        </div>
        {popover}
      </div>
    );
  }
}

MultiSelect.propTypes = {
  onChange: PropTypes.func.isRequired.describe(
    'A function called when the selection is changed. It receives the new array of selected values as the only parameter.'
  ),
  value: PropTypes.arrayOf(PropTypes.string).isRequired.describe(
    'The currently-selected value of this controlled input. It should be an array of string values.'
  ),
  children: PropTypes.node.isRequired.describe(
    'The children of MultiSelect should only be <Option> components.'
  ),
  placeHolder: PropTypes.string.describe(
    'Option placeholder text to be displayed when no options are chosen.'
  ),
  endDelineator: PropTypes.string.describe(
    'End delineator to separate last selected option.'
  ),
}
