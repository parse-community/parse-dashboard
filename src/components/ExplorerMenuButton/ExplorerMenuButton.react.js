/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Directions }        from 'lib/Constants';
import ExplorerQueryComposer from 'components/ExplorerQueryComposer/ExplorerQueryComposer.react';
import ExplorerQueryPicker   from 'components/ExplorerQueryPicker/ExplorerQueryPicker.react';
import Popover               from 'components/Popover/Popover.react';
import Position              from 'lib/Position';
import PropTypes             from 'lib/PropTypes';
import React                 from 'react';
import ReactDOM              from 'react-dom';
import styles                from 'components/ExplorerMenuButton/ExplorerMenuButton.scss';

export default class ExplorerMenuButton extends React.Component {
  constructor() {
    super();
    this.state = {
      // can be null, 'picker', or 'composer'
      currentView: null,
      position: null,
      align: Directions.LEFT
    };
    this.parentNode = {}
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
  }

  componentWillMount() {
    // Used to close query picker
    document.addEventListener('mousedown', this.handleClick.bind(this), false)
  }

  componentWillUnmount() {
    // Used to close query picker
    document.removeEventListener('mousedown', this.handleClick.bind(this), false)
  }

  // Intercept all click events
  handleClick(e) {
    // Verify if the click is outside the picker
    if (this.state.currentView && this.parentNode && !this.parentNode.contains(e.target)) {
      // Click target is not inside the configuration dropdown
      if (e.target.parentNode && !e.target.parentNode.className.match('menu'))
        this.toggle() // Close picker
    }
  }

  // Set parent node
  setParentNode(node) {
    this.parentNode = node
  }

  toggle() {
    this.setState(() => {
      if (this.state.currentView) {
        return { currentView: null };
      }
      let position = Position.inDocument(this.node);
      let align = Directions.LEFT;
      if (position.x > 700) {
        position.x += this.node.clientWidth;
        align = Directions.RIGHT;
      }
      // Add the button height to the picker appear on the bottom
      position.y += this.node.clientHeight
      return {
        currentView: 'picker',
        position,
        align
      };
    });
  }

  renderButton() {
    return (
      <div className={styles.button} onClick={this.toggle.bind(this)}>
        {this.props.value}
      </div>
    );
  }

  handleSelect(query) {
    this.setState({ currentView: null });
    this.props.onSelect(query);
  }

  handleDelete(query) {
    this.setState({ currentView: null });
    this.props.onDelete(query);
  }

  handleSave(query) {
    this.setState({ currentView: null });
    this.props.onSave(query);
  }

  render() {
    let popover = null;
    let content = this.renderButton();

    if (this.state.currentView) {
      let queryMenu = null;
      let classes = [styles.queryMenuContainer];
      let calloutStyle = { marginLeft: '10px' };
      if (this.state.align === Directions.RIGHT) {
        classes.push(styles.right);
        calloutStyle = { marginRight: '10px' };
      }

      switch (this.state.currentView) {
        case 'picker':
          queryMenu = (
            <ExplorerQueryPicker
              queries={this.props.queries}
              onCompose={() => {
                this.setState({ currentView: 'composer' })
              }}
              onSelect={this.handleSelect.bind(this)}
              onDelete={this.handleDelete.bind(this)} />
          );
          break;
        case 'composer':
          queryMenu = (
            <ExplorerQueryComposer
              isNew={true}
              isTimeSeries={this.props.isTimeSeries}
              onSave={this.handleSave.bind(this)}
              index={this.props.index || 0}/>
          );
          break;
      }

      popover = (
        <Popover
          fixed={true}
          position={this.state.position}>
          <div ref={this.setParentNode.bind(this)}
            className={classes.join(' ')}>
            <div className={styles.callout} style={calloutStyle}></div>
            {queryMenu}
          </div>
        </Popover>
      );
    }

    return (
      <div className={styles.wrap}>
        {content}
        {popover}
      </div>
    );
  }
}

ExplorerMenuButton.propTypes = {
  value: PropTypes.string.describe('The label of the button.'),
  queries: PropTypes.arrayOf(PropTypes.object).describe(
    'An array of queryGroups. Each querygroup should include the following fields: name, children. ' +
    'children of queryGroup contains an array of queries. Each query should include the following fields: ' +
    'name, query, (optional)preset.'
  ),
  onSave: PropTypes.func.describe(
    'Function to be called when an analytics query is sucessfully composed.'
  ),
  onSelect: PropTypes.func.describe(
    'Function to be called when a query is being selected.'
  ),
  onDelete: PropTypes.func.describe(
    'Function to be called when a query is being deleted.'
  ),
  isTimeSeries: PropTypes.bool.describe(
    'If set to true, add default grouping (day, hour) and aggregate to the composer. ' +
    'Otherwise, render limit inside the composer.'
  )
};
