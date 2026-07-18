/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import hasAncestor from 'lib/hasAncestor';
import React from 'react';
import styles from 'components/Popover/Popover.scss';
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

    const wrapperStyle = this.props.fixed ? styles.fixed_wrapper : styles.popover_wrapper;

    this._popoverWrapper.className = wrapperStyle;
    this._popoverWrapper.appendChild(this._popoverLayer);

    if (this.props.position) {
      this._popoverLayer.style.left = this.props.position.x + 'px';
      this._popoverLayer.style.top = this.props.position.y + 'px';
    }
    if (this.props.modal) {
      this._popoverLayer.style.right = 0;
      this._popoverLayer.style.bottom = 0;
      this._popoverLayer.dataset.modal = 'true';
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

    if (this.props['data-popover-type']) {
      this._popoverLayer.setAttribute('data-popover-type', this.props['data-popover-type']);
    }

    // Register the external-click listener on the next tick. Under React's
    // root-level event delegation (React 17+/createRoot), the click that opens
    // this popover is still bubbling to document.body when this component mounts,
    // so registering synchronously would let that same click trigger
    // onExternalClick and close the popover immediately (menus never open).
    this._externalClickTimer = setTimeout(() => {
      document.body.addEventListener('click', this._checkExternalClick);
    }, 0);
  }

  setPosition(position) {
    this._popoverLayer.style.left = position.x + 'px';
    this._popoverLayer.style.top = position.y + 'px';
    this.forceUpdate();
  }

  componentWillUnmount() {
    clearTimeout(this._externalClickTimer);
    // Remove via parentNode (not document.body) so this can't throw if the
    // wrapper was moved/detached, and null the reference so a reused instance
    // (StrictMode / Activity remount) re-creates and re-appends the wrapper in
    // componentDidMount instead of skipping it via the `!this._popoverWrapper`
    // guard and rendering into a detached node.
    if (this._popoverWrapper && this._popoverWrapper.parentNode) {
      this._popoverWrapper.parentNode.removeChild(this._popoverWrapper);
    }
    this._popoverWrapper = null;
    document.body.removeEventListener('click', this._checkExternalClick);
  }

  _checkExternalClick(e) {
    // A click whose target detached from the DOM during this same click — React
    // 19 flushes discrete updates synchronously, so an element that swaps/removes
    // itself on click (e.g. an icon that toggles) is already gone by the time
    // this document-level listener runs — breaks the hasAncestor() walk below:
    // its ancestor chain no longer reaches the popover. Decide inside-vs-outside
    // from composedPath() instead, which preserves the event's dispatch-time path
    // even after the target detaches.
    if (!e.target.isConnected) {
      // composedPath() is only populated during dispatch; this native listener
      // runs in the click's bubble phase, so it is valid here. It preserves the
      // event's dispatch-time ancestors even after the target detaches, so apply
      // the same inside-vs-outside criteria as the connected branch below (this
      // popover's wrapper/portal layer, a nested parentContentId, an inner
      // popover, or a chrome dropdown) against the captured path. Checking only
      // this popover's own layer would wrongly close it when the detached target
      // came from a nested popover (e.g. an Autocomplete suggestion), which lives
      // in its own portal layer.
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      if (path.length === 0) {
        // composedPath unavailable/empty — fall back to the prior "don't close".
        return;
      }
      const { contentId } = this.props;
      const wrapper = contentId ? document.getElementById(contentId) : this._popoverLayer;
      const clickedInside = path.some(
        node =>
          node === wrapper ||
          node === this._popoverLayer ||
          (node instanceof Element &&
            ((contentId && node.dataset.parentContentId === contentId) ||
              node.getAttribute('data-popover-type') === 'inner' ||
              node.classList.contains('chromeDropdown')))
      );
      if (clickedInside) {
        return;
      }
      // A genuine outside click whose target merely happened to detach: close.
      // Returning here also avoids the parentNode/closest reads below, which
      // would throw on a fully detached node.
      if (this.props.onExternalClick) {
        this.props.onExternalClick(e);
      }
      return;
    }
    const { contentId } = this.props;
    const popoverWrapper = contentId ? document.getElementById(contentId) : this._popoverLayer;
    const isChromeDropdown = e.target.parentNode.classList.contains('chromeDropdown');
    // Find the inner popover element so on clicking inside it
    // we can prevent external click function
    const innerPopover = e.target.closest('[data-popover-type="inner"]');
    if (
      !hasAncestor(e.target, popoverWrapper, contentId) &&
      !innerPopover &&
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
