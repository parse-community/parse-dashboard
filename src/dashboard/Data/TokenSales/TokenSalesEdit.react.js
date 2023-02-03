/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { ActionTypes } from 'lib/stores/TokenSalesStore';
import JobsForm        from 'dashboard/Data/TokenSales/TokenSalesForm.react';
import React           from 'react';
import subscribeTo     from 'lib/subscribeTo';
import generatePath    from 'lib/generatePath';
import { CurrentApp }  from 'context/currentApp';
import { withRouter } from 'lib/withRouter';

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

@subscribeTo('TokenSales', 'tokensales')
@withRouter
class TokensSaleEdit extends React.Component {
    static contextType = CurrentApp;

    submitForm(changes) {
        let tokenSale = {
            token_sale: {
                name: changes.name,
                description: changes.description,
                tokenAddress: changes.tokenAddress,
                maxSupply: changes.maxSupply,
                price: changes.price,
                saleImage: changes.saleImage,
                startDate: changes.startDate.toISOString(),
                endDate: changes.endDate.toISOString(),
                minPurchase: changes.minPurchase,
                maxPurchase: changes.maxPurchase,
                whitelist: changes.whitelist,
                whitelistEnabled: changes.whitelistEnabled,
                whitelistOnly: changes.whitelistOnly,
                kycEnabled: changes.kycEnabled,
                kycProvider: changes.kycProvider,
                rarities: changes.rarities,
                attributes: changes.attributes
            }
        }

        let promise = this.props.params.tokenSaleId ?
            this.props.tokensales.dispatch(ActionTypes.EDIT, { tokenSaleId: this.props.params.tokenSaleId, updates: tokenSale }) :
            this.props.tokensales.dispatch(ActionTypes.CREATE, { tokenSale });
        promise.then(() => {this.props.navigate(generatePath(this.context, 'tokensales'))});
        return promise;
    }

    componentWillMount() {
        this.props.tokensales.dispatch(ActionTypes.FETCH);
    }

    render() {
        return (
            <div>
                <JobsForm
                    onSubmit={this.submitForm.bind(this)}
                    job={this.props.tokensales.get(this.props.params.tokenSaleId)}
                    jobs={this.props.tokensales}
                    params={this.props.params}
                    />
            </div>
        );
    }
}
export default TokensSaleEdit;
