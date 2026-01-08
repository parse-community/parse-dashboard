/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import styles from './ResizableSplitView.scss';

export default class ResizableSplitView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topPaneHeight: props.initialTopHeight || 50, // percentage
      isDragging: false
    };
    this.containerRef = React.createRef();
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  handleMouseDown(e) {
    e.preventDefault();
    this.setState({ isDragging: true });
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove(e) {
    if (!this.state.isDragging || !this.containerRef.current) {
      return;
    }

    const container = this.containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const mouseY = e.clientY - containerRect.top;

    // Calculate new percentage, with min/max constraints
    let newPercentage = (mouseY / containerHeight) * 100;
    newPercentage = Math.max(20, Math.min(80, newPercentage)); // Between 20% and 80%

    this.setState({ topPaneHeight: newPercentage });
  }

  handleMouseUp() {
    this.setState({ isDragging: false });
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  render() {
    const { topPane, bottomPane } = this.props;
    const { topPaneHeight, isDragging } = this.state;

    return (
      <div ref={this.containerRef} className={styles.container}>
        <div
          className={styles.topPane}
          style={{ height: `${topPaneHeight}%` }}
        >
          {topPane}
        </div>

        <div
          className={`${styles.divider} ${isDragging ? styles.dragging : ''}`}
          onMouseDown={this.handleMouseDown}
        >
          <div className={styles.dividerHandle} />
        </div>

        <div
          className={styles.bottomPane}
          style={{ height: `${100 - topPaneHeight}%` }}
        >
          {bottomPane}
        </div>
      </div>
    );
  }
}
