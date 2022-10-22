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

    this.wrapRef = React.createRef();
  }

  toggle() {
    this.setState(() => {
      if (this.state.currentView) {
        return { currentView: null };
      }
      let position = Position.inDocument(this.wrapRef.current);
      let align = Directions.LEFT;
      if (position.x > 700) {
        position.x += this.wrapRef.current.clientWidth;
        align = Directions.RIGHT;
      }
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
              onSave={this.handleSave.bind(this)} />
          );
          break;
      }

      popover = (
        <Popover
          fixed={false}
          position={this.state.position}>
          <div className={classes.join(' ')}>
            {content}
            <div className={styles.callout} style={calloutStyle}></div>
            {queryMenu}
          </div>
        </Popover>
      );
    }

    return (
      <div className={styles.wrap} ref={this.wrapRef}>
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
