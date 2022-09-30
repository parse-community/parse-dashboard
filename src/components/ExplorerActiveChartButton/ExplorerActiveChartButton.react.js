/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { Directions }        from 'lib/Constants';
import ExplorerQueryComposer from 'components/ExplorerQueryComposer/ExplorerQueryComposer.react';
import Icon                  from 'components/Icon/Icon.react';
import Popover               from 'components/Popover/Popover.react';
import Position              from 'lib/Position';
import PropTypes             from 'lib/PropTypes';
import React                 from 'react';
import styles                from 'components/ExplorerActiveChartButton/ExplorerActiveChartButton.scss';
import baseStyles            from 'stylesheets/base.scss';

export default class ExplorerActiveChartButton extends React.Component {
  constructor() {
    super();

    this.state = {
      position: null,
      open: false,
      active: true,
      align: Directions.LEFT
    }

    this.wrapRef = React.createRef();
  }

  handleCheckbox() {
    let nextActiveState = !this.state.active;
    this.props.onToggle(nextActiveState);
    this.setState({
      active: nextActiveState
    });
  }

  handleSave(query) {
    this.setState({ open: false });
    this.props.onSave(query);
  }

  handleDismiss() {
    this.setState({ open: false });
    this.props.onDismiss();
  }

  renderButton() {
    let checkMark = null;
    let color = '#343445';
    if (this.state.active) {
      // TODO (hallucinogen): a11y the checkbox
      checkMark = <Icon width={12} height={12} name='check' fill='white' />;
      color = this.props.color;
    }
    let dropdown = null;
    if (!this.props.disableDropdown) {
      dropdown = (
        <div
          className={[styles.rightArrow, baseStyles.verticalCenter].join(' ')}
          onClick={() => {
            let position = Position.inDocument(this.wrapRef.current);
            let align = Directions.LEFT;
            if (position.x > 700) {
              position.x += this.wrapRef.current.clientWidth;
              align = Directions.RIGHT;
            }
            this.setState({
              open: !this.state.open,
              position,
              align
            });
          }} />
      );
    }

    return (
      <div className={styles.button}>
        <div
          className={[styles.checkbox, baseStyles.verticalCenter].join(' ')}
          onClick={this.handleCheckbox.bind(this)}
          style={{
            backgroundColor: this.state.active ? this.props.color : null,
            border: `1px solid ${color}`
          }}>
          {checkMark}
        </div>
        <div className={styles.label}>{this.props.query.name}</div>
        {dropdown}
      </div>
    );
  }

  render() {
    let popover = null;
    let content = this.renderButton();

    if (this.state.open) {
      let classes = [styles.composerContainer];
      let calloutStyle = { marginLeft: '10px' };
      if (this.state.align === Directions.RIGHT) {
        classes.push(styles.right);
        calloutStyle = { marginRight: '10px' };
      }

      popover = (
        <Popover
          fixed={false}
          position={this.state.position}>
          <div className={classes.join(' ')}>
            {content}
            <div className={styles.callout} style={calloutStyle}></div>
            <ExplorerQueryComposer
              isNew={false}
              query={this.props.query}
              isTimeSeries={this.props.isTimeSeries}
              onSave={this.handleSave.bind(this)}
              onDismiss={() => {
                this.setState({ open: false });
                this.props.onDismiss();
              }} />
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

ExplorerActiveChartButton.propTypes = {
  query: PropTypes.object.describe(
    'Current query being rendered.'
  ),
  queries: PropTypes.arrayOf(PropTypes.object).describe(
    'An array of queryGroups. Each querygroup should include the following fields: name, children. ' +
    'children of queryGroup contains an array of queries. Each query should include the following fields: ' +
    'name, query, (optional)preset.'
  ),
  onSave: PropTypes.func.describe(
    'Function to be called when an analytics query is sucessfully composed.'
  ),
  onToggle: PropTypes.func.isRequired.describe(
    'Function to be called when the chart active state is toggled.'
  ),
  onDismiss: PropTypes.func.describe(
    'Function to be called when current chart is being dismissed from list of active charts.'
  ),
  color: PropTypes.string.describe(
    'The color of the checkbox and the chart to be rendered.'
  ),
  disableDropdown: PropTypes.bool.describe(
    'If set to true, disable dropdown to pick/compose the query.'
  ),
  isTimeSeries: PropTypes.bool.describe(
    'If set to true, add default grouping (day, hour) and aggregate to the composer. ' +
    'Otherwise, render limit inside the composer.'
  )
}
