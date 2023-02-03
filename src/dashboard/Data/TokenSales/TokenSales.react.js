import React from 'react';

import { ActionTypes }        from 'lib/stores/TokenSalesStore';
import Button                 from 'components/Button/Button.react';
import EmptyState             from 'components/EmptyState/EmptyState.react';
import Icon                   from 'components/Icon/Icon.react';
import SidebarAction          from 'components/Sidebar/SidebarAction';
import styles                 from 'dashboard/Data/TokenSales/TokenSales.scss';
import browserStyles          from 'dashboard/Data/Browser/Browser.scss';
import ReleaseInfo            from 'components/ReleaseInfo/ReleaseInfo';
import TableHeader            from 'components/Table/TableHeader.react';
import TableView              from 'dashboard/TableView.react';
import Toolbar                from 'components/Toolbar/Toolbar.react';
import subscribeTo            from 'lib/subscribeTo';
import generatePath from 'lib/generatePath';
import { withRouter } from 'lib/withRouter';

let subsections = {
    all: 'All Token Sales',
    running: 'Runmning Token Sales',
    notStarted: 'Not Started Token Sales',
    completed: 'Completed Token Sales'
};

/*
    This page displays a list of TokenSale objects. The TokenSale object is a Parse.Object which stores NFT token sale information. This page works almost identically to the Jobs page in the Gemforce Dashboard, except that it displays TokenSale objects instead of Job objects. 
*/

@subscribeTo('TokenSales', 'tokensales')
@withRouter
class TokenSales extends TableView {
    constructor() {
        super();
        this.section = 'Core';
        this.subsection = 'All Token Sales';

        this.state = {
            tokenSaleStatus: undefined,
            loading: true
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.context.currentApp.fetchTokenSaleStatus().then((tokenSaleStatus) => {
            this.setState({ tokenSaleStatus, loading: false });
        });
    }

    componentWillMount() {
        this.loadData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.availableTokenSales) {
            if (nextProps.availableTokenSales.length > 0) {
                this.action = new SidebarAction('Edit Token Sale', this.navigateToNew.bind(this));
                return;
            }
        }
    }

    navigateToNew() {
        this.props.navigate(generatePath(this.context, 'tokensales/new'));
    }
    
    navigateToTokenSale(tokenSaleId) {
        this.props.navigate(generatePath(this.context, `tokensales/edit/${tokenSaleId}`))
    }

    loadData() {
        this.props.tokenSales.dispatch(ActionTypes.FETCH).finally(() => {
            this.setState({ loading: false });
        });
        this.context.getTokenSaleStatus().then((status) => {
            this.setState({ tokenSaleStatus: status });
        });
    }
    
    renderSidebar() {
        let current = this.props.params.section || '';
        return (
            <CategoryList current={current} linkPrefix={'tokensales/'} categories={[
                { name: 'All Token Sales', id: 'all' },
                { name: 'Running Token Sales', id: 'running' },
                { name: 'Not Started Token Sales', id: 'notStarted' },
                { name: 'Completed Token Sales', id: 'completed' }
            ]} />
        );
    }

    renderRow(tokenSale) {
        if(this.props.params.section === 'all') {
            return (
                <tr key={tokenSale.id} onClick={this.navigateToTokenSale.bind(this, tokenSale.id)}>
                    <td>{tokenSale.get('name')}</td>
                    <td>{tokenSale.get('symbol')}</td>
                    <td>{tokenSale.get('totalSupply')}</td>
                    <td>{tokenSale.get('price')}</td>
                    <td>{tokenSale.get('startTime')}</td>
                    <td>{tokenSale.get('endTime')}</td>
                    <td>{tokenSale.get('status')}</td>
                    <td className={styles.buttonCell}>
                        <Button width={'80px'} value='Edit' onClick={() => this.navigateToTokenSale(tokenSale.objectId)} />
                    </td>
                </tr>
            );
        } else if (this.props.params.section === 'running') {
            if (tokenSale.get('status') === 'running') {
                return (
                    <tr key={tokenSale.id} onClick={this.navigateToTokenSale.bind(this, tokenSale.id)}>
                        <td>{tokenSale.get('name')}</td>
                        <td>{tokenSale.get('symbol')}</td>
                        <td>{tokenSale.get('totalSupply')}</td>
                        <td>{tokenSale.get('price')}</td>
                        <td>{tokenSale.get('startTime')}</td>
                        <td>{tokenSale.get('endTime')}</td>
                        <td>{tokenSale.get('status')}</td>
                        <td className={styles.buttonCell}>
                            <Button width={'80px'} value='Edit' onClick={() => this.navigateToJob(tokenSale.objectId)} />
                        </td>
                    </tr>
                );
            }
        } else if (this.props.params.section === 'notStarted') {
            if (tokenSale.get('status') === 'notStarted') {
                return (
                    <tr key={tokenSale.id} onClick={this.navigateToTokenSale.bind(this, tokenSale.id)}>
                        <td>{tokenSale.get('name')}</td>
                        <td>{tokenSale.get('symbol')}</td>
                        <td>{tokenSale.get('totalSupply')}</td>
                        <td>{tokenSale.get('price')}</td>
                        <td>{tokenSale.get('startTime')}</td>
                        <td>{tokenSale.get('endTime')}</td>
                        <td>{tokenSale.get('status')}</td>
                        <td className={styles.buttonCell}>
                            <Button width={'80px'} value='Edit' onClick={() => this.navigateToJob(tokenSale.objectId)} />
                            <Button width={'80px'} color='red' value='Delete' onClick={() => this.setState({ toDelete: tokenSale.objectId })} />
                        </td>
                    </tr>
                );
            }
        } else if (this.props.params.section === 'completed') {
            if (tokenSale.get('status') === 'completed') {
                return (
                    <tr key={tokenSale.id} onClick={this.navigateToTokenSale.bind(this, tokenSale.id)}>
                        <td>{tokenSale.get('name')}</td>
                        <td>{tokenSale.get('symbol')}</td>
                        <td>{tokenSale.get('totalSupply')}</td>
                        <td>{tokenSale.get('price')}</td>
                        <td>{tokenSale.get('startTime')}</td>
                        <td>{tokenSale.get('endTime')}</td>
                        <td>{tokenSale.get('status')}</td>
                        <td className={styles.buttonCell}></td>
                    </tr>
                );
            }
        }
    }

    renderHeaders() {
        if(this.props.params.section === 'all') {
            return [
                <TableHeader key='name' width={60}>Name</TableHeader>,
                <TableHeader key='symbol' width={60}>Symbol</TableHeader>,
                <TableHeader key='totalSupply' width={60}>Total Supply</TableHeader>,
                <TableHeader key='price' width={60}>Price</TableHeader>,
                <TableHeader key='startTime' width={60}>Start Time</TableHeader>,
                <TableHeader key='endTime' width={60}>End Time</TableHeader>,
                <TableHeader key='status' width={60}>Status</TableHeader>,
                <TableHeader key="sold" width={60}>Sold</TableHeader>
            ];
        } else if (this.props.params.section === 'running') {
            return [
                <TableHeader key='name' width={60}>Name</TableHeader>,
                <TableHeader key='symbol' width={60}>Symbol</TableHeader>,
                <TableHeader key='totalSupply' width={60}>Total Supply</TableHeader>,
                <TableHeader key='price' width={60}>Price</TableHeader>,
                <TableHeader key='startTime' width={60}>Start Time</TableHeader>,
                <TableHeader key='endTime' width={60}>End Time</TableHeader>,
                <TableHeader key='status' width={60}>Status</TableHeader>,
                <TableHeader key="sold" width={60}>Sold</TableHeader>
            ];
        } else if (this.props.params.section === 'notStarted') {
            return [
                <TableHeader key='name' width={60}>Name</TableHeader>,
                <TableHeader key='symbol' width={60}>Symbol</TableHeader>,
                <TableHeader key='totalSupply' width={60}>Total Supply</TableHeader>,
                <TableHeader key='price' width={60}>Price</TableHeader>,
                <TableHeader key='startTime' width={60}>Start Time</TableHeader>,
                <TableHeader key='endTime' width={60}>End Time</TableHeader>,
                <TableHeader key='status' width={60}>Status</TableHeader>,
                <TableHeader key="sold" width={60}>Sold</TableHeader>
            ];
        } else if (this.props.params.section === 'completed') {
            return [
                <TableHeader key='name' width={60}>Name</TableHeader>,
                <TableHeader key='symbol' width={60}>Symbol</TableHeader>,
                <TableHeader key='totalSupply' width={60}>Total Supply</TableHeader>,
                <TableHeader key='price' width={60}>Price</TableHeader>,
                <TableHeader key='startTime' width={60}>Start Time</TableHeader>,
                <TableHeader key='endTime' width={60}>End Time</TableHeader>,
                <TableHeader key='status' width={60}>Status</TableHeader>,
                <TableHeader key="sold" width={60}>Sold</TableHeader>
            ];
        }
    }

    renderFooter() {
        return null;
    }

    renderEmpty() {
        if (this.props.params.section === 'all') {
            return (
                <EmptyState
                    title='No Token Sales'
                    description='There are no token sales to display.'
                    icon='cloud-happy' />
            );
        } else if (this.props.params.section === 'running') {
            return (
                <EmptyState
                    title='No Running Token Sales'
                    description='There are no running token sales to display.'
                    icon='cloud-happy' />
            );
        } else if (this.props.params.section === 'notStarted') {
            return (
                <EmptyState
                    title='No Not Started Token Sales'
                    description='There are no not started token sales to display.'
                    icon='cloud-happy' />
            );
        }
    }

    renderExtras() {}

    tableData() {
        let data = undefined;
        if (this.props.params.section === 'all') {
            data = this.props.tokenSales;
        } else if (this.props.params.section === 'running') {
            data = this.props.tokenSales.filter((tokenSale) => {
                return tokenSale.get('status') === 'running';
            });
        } else if (this.props.params.section === 'notStarted') {
            data = this.props.tokenSales.filter((tokenSale) => {
                return tokenSale.get('status') === 'notStarted';
            });
        }
        return data;
    }

    onRefresh() {
        this.setState({
            tokenSaleStatus: 'all',
            loading: true
        });
    }

    renderToolbar() {
        if(subsections[this.props.params.section]) {
            return (
                <Toolbar
                section='Jobs'
                subsection={subsections[this.props.params.section]}
                details={ReleaseInfo({ release: this.props.release })}>
                <a className={browserStyles.toolbarButton} onClick={this.onRefresh.bind(this)}>
                    <Icon name='refresh-solid' width={14} height={14} />
                    <span>Refresh</span>
                </a>
                {this.props.availableTokenSales && this.props.availableTokenSales.length > 0 ?
                    <Button color='white' value='Edit token sale' onClick={this.navigateToNew.bind(this)} /> : null}
                </Toolbar>
            );
        }
    }
}

export default TokenSales;