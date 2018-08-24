/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import ChromeDropdown from 'components/ChromeDropdown/ChromeDropdown.react';
import Icon           from 'components/Icon/Icon.react';
import Popover        from 'components/Popover/Popover.react';
import Position       from 'lib/Position';
import PropTypes      from 'lib/PropTypes';
import React          from 'react';
import ReactDOM       from 'react-dom';
import styles         from 'components/SlowQueriesFilter/SlowQueriesFilter.scss';

export default class SlowQueriesFilter extends React.Component {
  constructor() {
    super();

    this.state = {
      open: false
    }
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
  }

  componentWillReceiveProps(props) {
    if (props.schema !== this.props.schema) {
      this.setState({ open: false });
    }
  }

  render() {
    let { method, path, respStatus, respTime } = this.props;
    let popover = null;
    let active = method || path || respStatus || respTime;
    if (this.state.open) {
      let position = Position.inDocument(this.node);
      let popoverStyle = [styles.popover];
      if (active) {
        popoverStyle.push(styles.active);
      }
      popover = (
        <Popover fixed={false} position={position}>
          <div className={popoverStyle.join(' ')}>
            <div className={styles.title} onClick={() => this.setState({ open: false })}>
              <Icon name='filter-solid' width={14} height={14} />
              <span>Filter</span>
            </div>
            <div className={styles.body}>
              <div className={styles.row}>
                <ChromeDropdown
                  color={active ? 'blue' : 'purple'}
                  value={method || 'Method'}
                  options={this.props.methodOptions}
                  onChange={method => this.props.onChange({ method })} />
                <ChromeDropdown
                  color={active ? 'blue' : 'purple'}
                  value={path || 'Path'}
                  options={this.props.pathOptions}
                  onChange={path => this.props.onChange({ path })}
                  width={'340'} />
                <ChromeDropdown
                  color={active ? 'blue' : 'purple'}
                  value={respStatus || 'Resp. Status'}
                  options={this.props.respStatusOptions}
                  onChange={respStatus => this.props.onChange({ respStatus })} />
                {/*<ChromeDropdown*/}
                  {/*color={active ? 'blue' : 'purple'}*/}
                  {/*value={respTime || 'Res. Time'}*/}
                  {/*options={this.props.respTimeOptions}*/}
                  {/*onChange={respTime => this.props.onChange({ respTime })} />*/}
              </div>
            </div>
          </div>
        </Popover>
      );
    }
    let buttonStyle = [styles.entry];
    if (active) {
      buttonStyle.push(styles.active);
    }
    return (
      <div className={styles.wrap}>
        <div className={buttonStyle.join(' ')} onClick={() => this.setState({ open: true })}>
          <Icon name='filter-solid' width={14} height={14} />
          <span>Filter</span>
        </div>
        {popover}
      </div>
    );
  }
}

SlowQueriesFilter.propTypes = {
  className: PropTypes.string.describe(
    'Filtered class name.'
  ),
  os: PropTypes.string.describe(
    'Filtered OS.'
  ),
  version: PropTypes.string.describe(
    'Filtered app version.'
  ),
  classNameOptions: PropTypes.arrayOf(PropTypes.string).describe(
    'Options for class names.'
  ),
  osOptions: PropTypes.arrayOf(PropTypes.string).describe(
    'Options for OSes.'
  ),
  versionOptions: PropTypes.arrayOf(PropTypes.string).describe(
    'Options for app versions.'
  ),
  methodOptions: PropTypes.arrayOf(PropTypes.string).describe(
    'Request methods.'
  ),
  pathOptions: PropTypes.arrayOf(PropTypes.string).describe(
    'Request paths.'
  ),
  respStatusOptions: PropTypes.arrayOf(PropTypes.string).describe(
    'Response status options.'
  ),
  respTimeOptions: PropTypes.arrayOf(PropTypes.string).describe(
    'Response time options.'
  ),
  onChange: PropTypes.func.isRequired.describe(
    'Function to be called when the filter is changed.'
  )
}
