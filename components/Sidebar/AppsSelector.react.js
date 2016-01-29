import AppsMenu       from 'components/Sidebar/AppsMenu.react';
import { Directions } from 'lib/Constants';
import Popover        from 'components/Popover/Popover.react';
import history        from 'dashboard/history';
import NewAppDialog   from 'dashboard/Apps/NewAppDialog.react';
import ParseApp       from 'lib/ParseApp';
import Position       from 'lib/Position';
import React          from 'react';
import ReactDOM       from 'react-dom';
import SliderWrap     from 'components/SliderWrap/SliderWrap.react';
import styles         from 'components/Sidebar/Sidebar.scss';

export default class AppsSelector extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      position: null,
      showDialog: false,
    }
  }

  componentDidMount() {
    this.setState({
      position: Position.inWindow(ReactDOM.findDOMNode(this))
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.setState({ open: false, showDialog: false });
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
        history.pushState(null, `/apps/${value}/${sections[2]}`);
      }
    });
  }

  render() {
    let popover = null;
    if (this.state.open) {
      let height = window.innerHeight - this.state.position.y;
      popover = (
        <Popover fixed={true} position={this.state.position} onExternalClick={this.close.bind(this)}>
          <AppsMenu
            apps={this.props.apps}
            current={this.context.currentApp}
            height={height}
            onSelect={this.select.bind(this)}
            showCreateDialog={() => this.setState({ showDialog: true })} />
        </Popover>
      );
    }
    return (
      <div className={styles.apps}>
        <div className={styles.currentApp} onClick={this.toggle.bind(this)}>
          {this.context.currentApp.name}
        </div>
        {popover}
        <NewAppDialog open={this.state.showDialog} onCancel={() => this.setState({ showDialog: false })} />
      </div>
    );
  }
}

AppsSelector.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};

