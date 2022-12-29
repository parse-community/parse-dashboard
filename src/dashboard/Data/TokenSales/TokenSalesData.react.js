/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React          from 'react';
import { CurrentApp } from 'context/currentApp';
import { Outlet }     from 'react-router-dom';

export default class TokenSalesData extends React.Component {
    static contextType = CurrentApp;
    constructor() {
        super();

        this.state = {
            tokenSales: undefined,
            inUse: undefined,
            release: undefined
        };
    }

    fetchTokenSales(app) {
        app.getAvailableTokenSales().then(
            ({ tokenSales, in_use }) => {
                let available = [];
                for (let i = 0; i < tokenSales.length; i++) {
                    if (in_use.indexOf(tokenSales[i]) < 0) {
                        available.push(tokenSales[i]);
                    }
                }
                this.setState({ tokenSales: available, inUse: in_use })
            }, () => this.setState({ tokenSales: [], inUse: [] })
        );
    }

    componentDidMount() {
        this.fetchTokenSales(this.context);
    }

    componentWillReceiveProps(props, context) {
        if (this.context !== context) {
            this.fetchTokenSales(context);
        }
    }

    render() {
        <Outlet
            context={{
                availableTokenSales: this.state.tokenSales,
                tokenSalesInUse: this.state.inUse,
                release: this.state.release
            }}
        />
    }
}