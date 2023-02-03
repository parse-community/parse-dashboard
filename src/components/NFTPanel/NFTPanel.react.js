/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
This component displays a panel of information about an NFT. It is used in the NFTDetailsPage and the NFTDetailsModal. The component consists of an NFTImage component, floated
left, and a panel of information, floated right. The panel contains the NFT name, description, token id, and a link to the NFT's page on OpenSea. Under these two panels is
a panel containing the NFT's attributes. The attributes are displayed in a table, with the attribute name in the first column and the attribute value in the second column.
The attributes are displayed in the order they are returned by the API. The attributes are displayed in a table, with the attribute name in the first column and the attribute
value in the second column. Implementing components:

NFTPanel (this component)
NFTImage (child component)
NFTBasicInfoTable (child component)
NFTAttributesTable (child component)

*/

import Icon       from 'components/Icon/Icon.react';
import React      from 'react';
import styles     from 'components/NFTPanel/NFTPanel.scss';
import NFTImage   from 'components/NFTImage/NFTImage.react';
import NFTBasicInfoTable from 'components/NFTBasicInfoTable/NFTBasicInfoTable.react';
import NFTAttributesTable from 'components/NFTAttributesTable/NFTAttributesTable.react';
import baseStyles from 'stylesheets/base.scss';

// Class-style component, because we need refs
export default class NFTPanel extends React.Component {
  constructor() {
    super();
    this.formRef = React.createRef();
  }
  render() {
    <div className={styles.nftpanel} style={{ marginTop: this.props.marginTop || '0px' }}>
      <div className={styles.nftpanel__image}>
        <NFTImage
          nft={this.props.nft}
          width={this.props.imageWidth}
          height={this.props.imageHeight}
          className={this.props.imageClassName}
          style={this.props.imageStyle}
        />
      </div>
      <div className={styles.nftpanel__info}>
        <NFTBasicInfoTable nft={this.props.nft} />
      </div>
      <div className={styles.nftpanel__attributes}>
        <NFTAttributesTable nft={this.props.nft} />
      </div>
    </div>
  }
}