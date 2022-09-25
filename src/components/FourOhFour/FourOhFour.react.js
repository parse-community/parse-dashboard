/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React   from 'react';
import styles  from 'components/FourOhFour/FourOhFour.scss';
import { withRouter } from 'lib/withRouter';

const EMOJI_COUNT = 30;

@withRouter
class FourOhFour extends React.Component {
  constructor() {
    super();

    this.state = {
      emoji: (Math.random() * EMOJI_COUNT) | 0
    };
    this.timeout = null;
    this.updateEmoji = this.updateEmoji.bind(this);
  }

  componentWillMount() {
    this.timeout = setTimeout(this.updateEmoji, 3000);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  updateEmoji() {
    this.setState({ emoji: (Math.random() * EMOJI_COUNT) | 0 });
    this.timeout = setTimeout(this.updateEmoji, 3000);
  }

  render() {
    let offset = this.state.emoji * -1;
    if (window.innerWidth > 400) {
      offset *= 200;
    } else {
      offset *= 100;
    }
    return (
      <div className={styles.fourOhFour}>
        <div className={styles.wrap}>
          <div className={styles.error}>
            4<div className={styles.emoji} style={{ backgroundPosition: offset + 'px 0px' }} />4
          </div>
          <div className={styles.message}>Oh no, we can't find that page!</div>

          <div className={styles.back}>
            <button type='button' onClick={() => this.props.navigate(-1)}>Go back</button>
          </div>
        </div>
      </div>
    );
  }
}

export default FourOhFour;
