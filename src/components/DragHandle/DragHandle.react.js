/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes from 'lib/PropTypes';
import React     from 'react';

export default class DragHandle extends React.Component {
  constructor() {
    super();

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);

    this.lastEvent = null;
    this.x = 0;
    this.y = 0;

    this.state = {
      dragging: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.dragging && !prevState.dragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.dragging && prevState.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  onMouseDown(e) {
    this.x = e.pageX;
    this.y = e.pageY;
    this.setState({ dragging: true });
    e.preventDefault();
    e.stopPropagation();
  }

  onMouseUp(e) {
    this.setState({ dragging: false });
    e.preventDefault();
    e.stopPropagation();
  }

  onMouseMove(e) {
    if (this.lastEvent) {
      return;
    }
    this.lastEvent = e;
    requestAnimationFrame(this.mouseMoveHandler);
    e.stopPropagation();
    e.preventDefault();
  }

  mouseMoveHandler() {
    if (this.state.dragging) {
      this.props.onDrag(this.lastEvent.pageX - this.x, this.lastEvent.pageY - this.y);
      this.x = this.lastEvent.pageX;
      this.y = this.lastEvent.pageY;
    }
    this.lastEvent = null;
  }

  render() {
    return <div {...this.props} onMouseDown={this.onMouseDown} />;
  }
}

DragHandle.propTypes = {
  onDrag: PropTypes.func.isRequired.describe(
    'A function called when the handle is dragged. It takes deltas for X and Y as the two parameters.'
  )
}
