/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import hasAncestor from 'lib/hasAncestor';
import React       from 'react';
import ReactDOM    from 'react-dom';
import styles      from 'components/Popover/Popover.scss';

// We use this component to proxy the current tree's context (just the React Router history for now) to the new tree
class ContextProxy extends React.Component {
  getChildContext() {
    return this.props.cx;
  }

  render() {
    return this.props.children;
  }
}

ContextProxy.childContextTypes = {
  history: React.PropTypes.object,
  router: React.PropTypes.object
};

export default class Popover extends React.Component {
  constructor() {
    super();
    this._checkExternalClick = this._checkExternalClick.bind(this);
  }
  componentWillMount() {
    let wrapperStyle = this.props.fixed ?
      styles.fixed_wrapper :
      styles.popover_wrapper;
    this._popoverWrapper = document.getElementById(wrapperStyle);
    if (!this._popoverWrapper) {
      this._popoverWrapper = document.createElement('div');
      this._popoverWrapper.id = wrapperStyle;
      document.body.appendChild(this._popoverWrapper);
    }
    this._popoverLayer = document.createElement('div');
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
    if (this.props.fadeIn){
      this._popoverLayer.className = styles.transition;
    }
    this._popoverWrapper.appendChild(this._popoverLayer);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.position) {
      this._popoverLayer.style.left = this.props.position.x + 'px';
      this._popoverLayer.style.top = this.props.position.y + 'px';
    }
  }

  componentDidMount() {
    ReactDOM.render(<ContextProxy cx={this.context}>{React.Children.only(this.props.children)}</ContextProxy>, this._popoverLayer);
    document.body.addEventListener('click', this._checkExternalClick);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this._checkExternalClick);
    ReactDOM.unmountComponentAtNode(this._popoverLayer);
    this._popoverWrapper.removeChild(this._popoverLayer);
  }

  componentWillUpdate(nextProps) {
    ReactDOM.render(<ContextProxy cx={this.context}>{React.Children.only(nextProps.children)}</ContextProxy>, this._popoverLayer);
  }

  _checkExternalClick(e) {
    if (!hasAncestor(e.target, this._popoverLayer) &&
      this.props.onExternalClick) {
      this.props.onExternalClick(e);
    }
  }

  render() {
    return <div></div>;
  }
}

Popover.contextTypes = {
  history: React.PropTypes.object,
  router: React.PropTypes.object
};
