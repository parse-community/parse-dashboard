/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*

This is the NFTImage component used in the NFTPanel component. It displays the image of an NFT. The image is displayed in a div with a fixed width and height.

*/

import Icon       from 'components/Icon/Icon.react';
import React      from 'react';
import styles     from 'components/NFTImage/NFTImage.scss';
import baseStyles from 'stylesheets/base.scss';

// Class-style component, because we need refs
export default class NFTImage extends React.Component {
  constructor() {
    super();
    this.formRef = React.createRef();
  }
  render() {
    return (
      <div className={styles.nftimage} style={{ width: this.props.width, height: this.props.height, ...this.props.style }} >
        <div className={styles.nftimage__image} style={{ backgroundImage: `url(${this.props.nft.image_url})` }} />
      </div>
    );
  }
}
