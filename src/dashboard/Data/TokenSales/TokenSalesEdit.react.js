/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import TokenSalesForm from "dashboard/Data/TokenSales/TokenSalesForm.react";
import React from "react";
import Parse from "parse";
import { CurrentApp } from "context/currentApp";
import { withRouter } from "lib/withRouter";
import generatePath from "lib/generatePath";

/*
    token sale fields:

    name: string
    description: string
    tokenAddress: string
    maxSupply: number
    price: number
    saleImage: string
    startDate: date
    endDate: date
    minPurchase: number
    maxPurchase: number
    whitelist: array
    whitelistEnabled: boolean
    whitelistOnly: boolean
    kycEnabled: boolean
    kycProvider: string
    rarities: [
        {
            name: string
            probability: number
            images: [
                string
            ]
        }
    ]
    attributes: [
        {
            name: string
            values: {
                value: string
                probability: number
                images: [
                    string
                ]
            }
        }
    ]
*/

// @subscribeTo("TokenSales", "tokensales")
@withRouter
class TokensSaleEdit extends React.Component {
  static contextType = CurrentApp;

  submitForm(changes) {
    const updatePromise = new Promise((resolve, reject) => {
      var multiSaleQuery = new Parse.Query("MultiSaleCreated__e");
      multiSaleQuery.equalTo("tokenSaleId", changes.tokenSaleId);
      multiSaleQuery
        .first({ useMasterKey: true })
        .then(async (object) => {
          let jsonObj = object.toJSON();
          jsonObj.settings[8] = changes.name;
          jsonObj.settings[7] = changes.symbol;
          jsonObj.settings[13] = changes.totalSupply;
          jsonObj.settings[20][0] = changes.price;
          jsonObj.settings[11] = changes.startTime;
          jsonObj.settings[12] = changes.endTime;
          jsonObj.settings[10] = changes.status;
          object.set("settings", jsonObj.settings);
          await object.save();
          resolve();
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
    return updatePromise.then(() => {
      this.forceUpdate();
      this.props.navigate(generatePath(this.context, "tokensales/all"));
    });
  }

  render() {
    const tokenSale = this.props.availableTokenSales.filter(
      (tokensale) => tokensale.tokenSaleId === this.props.params.tokenSaleId
    );
    let initialFields = {};
    if (tokenSale.length) {
      initialFields["tokenSaleId"] = tokenSale[0].tokenSaleId;
      initialFields["name"] = tokenSale[0].settings[8];
      initialFields["symbol"] = tokenSale[0].settings[7];
      initialFields["totalSupply"] = tokenSale[0].settings[13];
      initialFields["price"] = tokenSale[0].settings[20][0];
      initialFields["startTime"] = tokenSale[0].settings[11];
      initialFields["endTime"] = tokenSale[0].settings[12];
      initialFields["status"] = tokenSale[0].settings[10];
    }
    return (
      <div>
        <TokenSalesForm
          onSubmit={this.submitForm.bind(this)}
          initialFields={initialFields}
          params={this.props.params}
        />
      </div>
    );
  }
}
export default TokensSaleEdit;
