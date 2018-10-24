/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { centered } from 'components/Field/Field.scss';
import PropTypes    from 'lib/PropTypes';
import React        from 'react';
import styles       from 'components/B4AAlert/B4AAlert.scss';

export default class B4AAlert extends React.Component {
  constructor() {
    super()

    this.state = {
      show: false
    }
  }

  componentWillMount() {
    if (typeof this.props.show !== 'undefined')
      return this.setState({ show: this.props.show })
    this.setState({ show: true })
  }

  async onClose() {
    await this.setState({ show: false })
    this.props.handlerCloseEvent && this.props.handlerCloseEvent(this.props.title)
  }

  render() {
    let padding = (this.props.padding || 20) + 'px';
    return this.state.show && (
      <div
        className={styles.label}
        style={{ padding: '0 ' + padding }}>
        <div
          className={styles.title} >
          {this.props.title}
          <a
            className={`zmdi zmdi-close ${styles.close}`}
            onClick={this.onClose.bind(this)}>
          </a>
        </div>
        {this.props.description ? <div className={styles.description}>{this.props.description}</div> : null}
      </div>
    );
  }
}

B4AAlert.PropTypes = {
  title: PropTypes.node.describe(
    'The main title/node of the label.'
  ),
  description: PropTypes.node.describe(
    'The secondary title/node of the label.'
  ),
  padding: PropTypes.number.describe(
    'Allows you to override the left-right padding of the label.'
  ),
  handlerCloseEvent: PropTypes.func.describe(
    'Handler event function to close alert'
  )
};
