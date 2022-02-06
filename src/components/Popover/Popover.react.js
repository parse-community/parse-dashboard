/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import hasAncestor      from 'lib/hasAncestor';
import React            from 'react';
import styles           from 'components/Popover/Popover.scss';
import { createPortal } from 'react-dom';

// We use this component to proxy the current tree's context
// (React Router history and ParseApp) to the new tree
export default class Popover extends React.Component {
  constructor(props) {
    super(props);
    this._checkExternalClick = this._checkExternalClick.bind(this);

    this._popoverLayer = document.createElement('div');
  }

  componentDidUpdate(prevState) {
    if (this.props.position !== prevState.position) {
      this._popoverLayer.style.left = this.props.position.x + 'px';
      this._popoverLayer.style.top = this.props.position.y + 'px';
    }
  }

  componentDidMount() {
    if (!this._popoverWrapper) {
      this._popoverWrapper = document.createElement('div');
      document.body.appendChild(this._popoverWrapper);
    }

    let wrapperStyle = this.props.fixed
      ? styles.fixed_wrapper
      : styles.popover_wrapper;

    this._popoverWrapper.className = wrapperStyle;
    this._popoverWrapper.appendChild(this._popoverLayer);

    if (this.props.position) {
      this._popoverLayer.style.left = this.props.position.x + 'px';
      this._popoverLayer.style.top = this.props.position.y + 'px';
    }
    if (this.props.modal) {
      this._popoverLayer.style.right = 0;
      this._popoverLayer.style.bottom = 0;
    }
    if (this.props.color) {
      this._popoverLayer.style.background = this.props.color;
    }
    if (this.props.fadeIn) {
      this._popoverLayer.className = styles.transition;
    }

    if (this.props.parentContentId) {
      this._popoverLayer.dataset.parentContentId = this.props.parentContentId;
    }

    document.body.addEventListener('click', this._checkExternalClick);
  }

  setPosition(position) {
    this._popoverLayer.style.left = position.x + 'px';
    this._popoverLayer.style.top = position.y + 'px';
    this.forceUpdate();
  }

  componentWillUnmount() {
    document.body.removeChild(this._popoverWrapper);
    document.body.removeEventListener('click', this._checkExternalClick);
  }

  _checkExternalClick(e) {
    const { contentId } = this.props;
    const popoverWrapper = contentId
      ? document.getElementById(contentId)
      : this._popoverLayer;
    const isChromeDropdown = e.target.parentNode.classList.contains('chromeDropdown');
    if (
      !hasAncestor(e.target, popoverWrapper, contentId) &&
      this.props.onExternalClick &&
      !isChromeDropdown
    ) {
      this.props.onExternalClick(e);
    }
  }

  render() {
    return createPortal(this.props.children, this._popoverLayer);
  }
}
