/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*

This is the NFTAttributesTable component used in the NFTPanel component. It displays the attributes of an NFT. The attributes are displayed in a table, with the attribute name in the first column and the attribute value in the second column. The attributes are displayed in the order they are returned by the API.

*/

import Icon       from 'components/Icon/Icon.react';
import React      from 'react';
import styles     from 'components/NFTAttributesTable/NFTAttributesTable.scss';
import baseStyles from 'stylesheets/base.scss';

// Class-style component, because we need refs
export default class NFTAttributesTable extends React.Component {
  constructor() {
    super();
    this.formRef = React.createRef();
  }
  render() {
    return (
      <div className={styles.nftattributestable}>
        <table>
          <tbody>
            {this.props.nft.attributes.map((attribute, index) => (
              <tr key={index}>
                <td className={styles.nftattributestable__name}>{attribute.trait_type}</td>
                <td className={styles.nftattributestable__value}>{attribute.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
