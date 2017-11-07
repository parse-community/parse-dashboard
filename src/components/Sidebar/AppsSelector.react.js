/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AppsMenu       from 'components/Sidebar/AppsMenu.react';
import Popover        from 'components/Popover/Popover.react';
import history        from 'dashboard/history';
import ParseApp       from 'lib/ParseApp';
import Position       from 'lib/Position';
import React          from 'react';
import ReactDOM       from 'react-dom';
import styles         from 'components/Sidebar/Sidebar.scss';

export default class AppsSelector extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      position: null,
    }
  }

  componentDidMount() {
    this.setState({
      position: Position.inWindow(ReactDOM.findDOMNode(this))
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.setState({ open: false });
    }
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  close() {
    this.setState({
      open: false
    });
  }

  select(value) {
    let currentSlug = this.context.currentApp.slug;
    this.setState({
      open: false
    }, () => {
      if (currentSlug !== value) {
        let sections = location.pathname.split('/');
        if (sections[0] === '') {
          sections.shift();
        }
        history.push(`/apps/${value}/${sections[2]}`);
      }
    });
  }

  render() {
    let position = this.state.position;
    let popover = null;
    if (this.state.open) {
      let height = window.innerHeight - position.y;
      popover = (
        <Popover fixed={true} position={position} onExternalClick={this.close.bind(this)}>
          <AppsMenu
            apps={this.props.apps}
            current={this.context.currentApp}
            height={height}
            onSelect={this.select.bind(this)} />
        </Popover>
      );
    }
    return (
      <div className={styles.apps}>
        <div className={styles.currentApp} onClick={this.toggle.bind(this)}>
          {this.context.currentApp.name}
        </div>
        {popover}
      </div>
    );
  }
}

AppsSelector.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
