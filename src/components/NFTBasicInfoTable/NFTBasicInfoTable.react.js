/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*

This is the NFTBasicInfo table component used in the NFTPanel component. It displays the basic information about an NFT. 
The information is displayed in a table, with the information name in the first column and the information value in the 
second column. The information is displayed in the order they are returned by the API.

*/

import Icon       from 'components/Icon/Icon.react';
import React      from 'react';
import styles     from 'components/NFTBasicInfoTable/NFTBasicInfoTable.scss';
import baseStyles from 'stylesheets/base.scss';

// Class-style component, because we need refs
export default class NFTBasicInfoTable extends React.Component {
  constructor() {
    super();
    this.formRef = React.createRef();
  }
  render() {
    return (
      <div className={styles.nftbasicinfotable}>
        <table>
          <tbody>
            <tr>
              <td className={styles.nftbasicinfotable__name}>Name</td>
              <td className={styles.nftbasicinfotable__value}>{this.props.nft.name}</td>
            </tr>
            <tr>
              <td className={styles.nftbasicinfotable__name}>Description</td>
              <td className={styles.nftbasicinfotable__value}>{this.props.nft.description}</td>
            </tr>
            <tr>
              <td className={styles.nftbasicinfotable__name}>Token ID</td>
              <td className={styles.nftbasicinfotable__value}>{this.props.nft.token_id}</td>
            </tr>
            <tr>
              <td className={styles.nftbasicinfotable__name}>OpenSea</td>
              <td className={styles.nftbasicinfotable__value}>
                <a href={this.props.nft.permalink} target="_blank" rel="noopener noreferrer">
                  {this.props.nft.permalink}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}