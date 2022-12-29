/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DashboardView          from 'dashboard/DashboardView.react';
import DateTimeInput          from 'components/DateTimeInput/DateTimeInput.react';
import Dropdown               from 'components/Dropdown/Dropdown.react';
import Field                  from 'components/Field/Field.react';
import Fieldset               from 'components/Fieldset/Fieldset.react';
import FlowView               from 'components/FlowView/FlowView.react';
import IntervalInput          from 'components/IntervalInput/IntervalInput.react';
import JobScheduleReminder    from 'dashboard/Data/Jobs/JobScheduleReminder.react';
import Label                  from 'components/Label/Label.react';
import Option                 from 'components/Dropdown/Option.react';
import pluralize              from 'lib/pluralize';
import React                  from 'react';
import ReleaseInfo            from 'components/ReleaseInfo/ReleaseInfo';
import styles                 from 'dashboard/Data/Jobs/Jobs.scss';
import TextInput              from 'components/TextInput/TextInput.react';
import TimeInput              from 'components/TimeInput/TimeInput.react';
import Toggle                 from 'components/Toggle/Toggle.react';
import Toolbar                from 'components/Toolbar/Toolbar.react';
import { hoursFrom, dateStringUTC }  from 'lib/DateUtils';

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
export default class TokenSalesForm extends DashboardView {
    constructor(props) {
        super(props);
        this.section = 'Core';
        this.subsection = 'TokenSales';
    }

    initialChanges() {
        if (this.props.initialFields.tokenSale) {
            let changes = {};
            if (!this.props.initialFields.name) {
                changes.name = 'New Token Sale';
            }
            if(!this.props.initialFields.description) {
                changes.description = 'New Token Sale';
            }
            if(!this.props.initialFields.tokenAddress) {
                changes.tokenAddress = '0x';
            }
            if(!this.props.initialFields.maxSupply) {
                changes.maxSupply = 0;
            }
            if(!this.props.initialFields.price) {
                changes.price = 0;
            }
            if(!this.props.initialFields.saleImage) {
                changes.saleImage = '';
            }
            if(!this.props.initialFields.startDate) {
                changes.startDate = new Date();
            }
            if(!this.props.initialFields.endDate) {
                changes.endDate = new Date();
            }
            if(!this.props.initialFields.minPurchase) {
                changes.minPurchase = 0;
            }
            if(!this.props.initialFields.maxPurchase) {
                changes.maxPurchase = 0;
            }
            if(!this.props.initialFields.whitelist) {
                changes.whitelist = [];
            }
            if(!this.props.initialFields.whitelistEnabled) {
                changes.whitelistEnabled = false;
            }
            if(!this.props.initialFields.whitelistOnly) {
                changes.whitelistOnly = false;
            }
            if(!this.props.initialFields.kycEnabled) {
                changes.kycEnabled = false;
            }
            if(!this.props.initialFields.kycProvider) {
                changes.kycProvider = '';
            }
            if(!this.props.initialFields.rarities) {
                changes.rarities = [{
                    name: 'common',
                    probability: 1,
                    images: []
                }];
            }
            if(!this.props.initialFields.attributes) {
                changes.attributes = [{
                    name: 'attribute',
                    values: [{
                        value: 'value',
                        probability: 1,
                        images: []
                    }]
                }];
            }
            return changes;

        }
        return {
            name: 'New Token Sale',
            description: 'New Token Sale',
            tokenAddress: '0x',
            maxSupply: 0,
            price: 0,
            saleImage: '',
            startDate: new Date(),
            endDate: new Date(),
            minPurchase: 0,
            maxPurchase: 0,
            whitelist: [],
            whitelistEnabled: false,
            whitelistOnly: false,
            kycEnabled: false,
            kycProvider: '',
            rarities: [{
                name: 'common',
                probability: 1,
                images: []
            }],
            attributes: [{
                name: 'attribute',
                values: [{
                    value: 'value',
                    probability: 1,
                    images: []
                }]
            }]
        };
    }
    renderForm({ fields, setField }) {
        return (
            <div>
                <Fieldset
                    legend='Token Sale Information'
                    description='Enter the information for your token sale.'
                    fields={[
                        <Field
                            key='name'
                            label='Name'
                            input={<TextInput value={fields.name} onChange={(value) => setField('name', value)} />}
                            description='The name of your token sale.'
                        />,
                        <Field
                            key='description'
                            label='Description'
                            input={<TextInput value={fields.description} onChange={(value) => setField('description', value)} />}
                            description='The description of your token sale.'
                        />,
                        <Field
                            key='tokenAddress'
                            label='Token Address'
                            input={<SelectionInput value={fields.tokenAddress} onChange={(value) => setField('tokenAddress', value)} />}
                            description='The address of the token being sold.'
                        />,
                        <Field
                            key='maxSupply'
                            label='Max Supply'
                            input={<TextInput value={fields.maxSupply} onChange={(value) => setField('maxSupply', value)} />}
                            description='The maximum supply of tokens that can be sold.'
                        />,
                        <Field
                            key='price'
                            label='Price'
                            input={<TextInput value={fields.price} onChange={(value) => setField('price', value)} />}
                            description='The price of each token.'
                        />,
                        <Field
                            key='saleImage'
                            label='Sale Image'
                            input={<TextInput value={fields.saleImage} onChange={(value) => setField('saleImage', value)} />}
                            description='The image for your token sale.'
                        />,
                        <Field
                            key='startDate'
                            label='Start Date'
                            input={<DateInput value={fields.startDate} onChange={(value) => setField('startDate', value)} />}
                            description='The date and time that the token sale will start.'
                        />,
                        <Field
                            key='endDate'
                            label='End Date'
                            input={<DateInput value={fields.endDate} onChange={(value) => setField('endDate', value)} />}
                            description='The date and time that the token sale will end.'
                        />,
                        <Field
                            key='minPurchase'
                            label='Min Purchase'
                            input={<TextInput value={fields.minPurchase} onChange={(value) => setField('minPurchase', value)} />}
                            description='The minimum amount of tokens that can be purchased in a single transaction.'
                        />,
                        <Field
                            key='maxPurchase'
                            label='Max Purchase'
                            input={<TextInput value={fields.maxPurchase} onChange={(value) => setField('maxPurchase', value)} />}
                            description='The maximum amount of tokens that can be purchased in a single transaction.'
                        />
                    ]}
                />
                <Fieldset
                    legend='Whitelist'
                    description='Enter the information for your whitelist.'
                    fields={[
                        <Field
                            key='whitelist'
                            label='Whitelist'
                            input={<TextInput value={fields.whitelist} onChange={(value) => setField('whitelist', value)} />}
                            description='The addresses that are allowed to purchase tokens.'
                        />,
                        <Field
                            key='whitelistEnabled'
                            label='Whitelist Enabled'
                            input={<CheckboxInput value={fields.whitelistEnabled} onChange={(value) => setField('whitelistEnabled', value)} />}
                            description='Whether or not the whitelist is enabled.'
                        />,
                        <Field
                            key='whitelistOnly'
                            label='Whitelist Only'
                            input={<CheckboxInput value={fields.whitelistOnly} onChange={(value) => setField('whitelistOnly', value)} />}
                            description='Whether or not the whitelist is the only way to purchase tokens.'
                        />
                    ]}
                />
                <Fieldset
                    legend='KYC'
                    description='Enter the information for your KYC.'
                    fields={[
                        <Field
                            key='kycEnabled'
                            label='KYC Enabled'
                            input={<CheckboxInput value={fields.kycEnabled} onChange={(value) => setField('kycEnabled', value)} />}
                            description='Whether or not KYC is enabled.'
                        />,
                        <Field
                            key='kycProvider'
                            label='KYC Provider'
                            input={<TextInput value={fields.kycProvider} onChange={(value) => setField('kycProvider', value)} />}
                            description='The address of the KYC provider.'
                        />
                    ]}
                />
                <Fieldset
                    legend='Rarities'
                    description='Enter the information for your rarities.'
                    fields={[
                        <Field
                            key='rarities'
                            label='Rarities'
                            input={<TextInput value={fields.rarities} onChange={(value) => setField('rarities', value)} />}
                            description='The rarities of the tokens.'
                        />
                    ]}
                />
                <Fieldset
                    legend='Attributes'
                    description='Enter the information for your attributes.'
                    fields={[
                        <Field
                            key='attributes'
                            label='Attributes'
                            input={<TextInput value={fields.attributes} onChange={(value) => setField('attributes', value)} />}
                            description='The attributes of the tokens.'
                        />
                    ]}
                />
                <Toolbar
                    section='Jobs'
                    subsection='Create a Token Sale'
                    details={ReleaseInfo({ release: this.props.release })} />
            </div>
        );
    }
    renderContent() {
        return <FlowView
            initialChanges={this.initialChanges()}
            initialFields={this.props.initialFields}
            renderForm={this.renderForm.bind(this)}
            showFooter={changes.tokenSale !== ''}
            submitText='Create Token Sale'
            onSubmit={({fields}) => this.props.submitForm(fields)}
            inProgressText={'Creating\u2026'}
            validate={({fields}) => {
                if (!fields.tokenSale.length && !fields.tokenSale.length) {
                    return '';
                }
                let errorMessages = [];
                if (!fields.tokenSale.length) {
                    errorMessages.push('A description is required.');
                }
                if (!fields.tokenAddress.length) {
                    errorMessages.push('A token address is required.');
                }
                if (!fields.maxSupply.length) {
                    errorMessages.push('A max supply is required.');
                }
                if (!fields.price.length) {
                    errorMessages.push('A price is required.');
                }
                if (!fields.saleImage.length) {
                    errorMessages.push('A sale image is required.');
                }
                if (!fields.startDate.length) {
                    errorMessages.push('A start date is required.');
                }
                if (!fields.endDate.length) {
                    errorMessages.push('An end date is required.');
                }
                if (!fields.minPurchase.length) {
                    errorMessages.push('A min purchase is required.');
                }
                if (!fields.maxPurchase.length) {
                    errorMessages.push('A max purchase is required.');
                }
                if (!fields.whitelist.length) {
                    errorMessages.push('A whitelist is required.');
                }
                if (!fields.whitelistEnabled.length) {
                    errorMessages.push('A whitelist enabled is required.');
                }
                if (!fields.whitelistOnly.length) {
                    errorMessages.push('A whitelist only is required.');
                }
                if (!fields.kycEnabled.length) {
                    errorMessages.push('A KYC enabled is required.');
                }
                if (!fields.kycProvider.length) {
                    errorMessages.push('A KYC provider is required.');
                }
                if (!fields.rarities.length) {
                    errorMessages.push('A rarities is required.');
                }
                if (!fields.attributes.length) {
                    errorMessages.push('A attributes is required.');
                }
                return errorMessages.join(' ');
            }}
            footerContents={({fields}) => {
                let pieces = [];
                pieces.push(<strong>{fields.job}</strong>, ' has sold ', <strong>{fields.tokenSale}</strong>, ' tokens.');
                return pieces;
            }}
        />;
    }
}
