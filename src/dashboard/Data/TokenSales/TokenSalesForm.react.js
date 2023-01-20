/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DashboardView from "dashboard/DashboardView.react";
import DateTimeInput from "components/DateTimeInput/DateTimeInput.react";
import { convertToDateTimeObject } from "dashboard/utils";
import Field from "components/Field/Field.react";
import Fieldset from "components/Fieldset/Fieldset.react";
import Label from "components/Label/Label.react";
import FlowView from "components/FlowView/FlowView.react";
import React from "react";
import ReleaseInfo from "components/ReleaseInfo/ReleaseInfo";
import TextInput from "components/TextInput/TextInput.react";
import Toggle from "components/Toggle/Toggle.react";
import Toolbar from "components/Toolbar/Toolbar.react";
import styles from "dashboard/Data/TokenSales/TokenSales.scss";

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
    this.section = "Core";
    this.subsection = "TokenSales";
  }

  initialChanges() {
    if (this.props.initialFields) {
      let changes = {};
      if (!this.props.initialFields.name) {
        changes.name = "New Token Sale";
      }
      if (!this.props.initialFields.totalSupply) {
        changes.totalSupply = 0;
      }
      if (!this.props.initialFields.price) {
        changes.price = 0;
      }
      if (!this.props.initialFields.startTime) {
        changes.startDate = new Date();
      }
      if (!this.props.initialFields.endTime) {
        changes.endDate = new Date();
      }
      //   if (!this.props.initialFields.rarities) {
      //     changes.rarities = [
      //       {
      //         name: "common",
      //         probability: 1,
      //         images: [],
      //       },
      //     ];
      //   }
      //   if (!this.props.initialFields.attributes) {
      //     changes.attributes = [
      //       {
      //         name: "attribute",
      //         values: [
      //           {
      //             value: "value",
      //             probability: 1,
      //             images: [],
      //           },
      //         ],
      //       },
      //     ];
      //   }
      return changes;
    }
    return {
      name: "New Token Sale",
      totalSupply: 0,
      price: 0,
      saleImage: "",
      startTime: new Date(),
      endTime: new Date(),
    };
  }
  renderForm({ fields, setField }) {
    console.log(fields);
    return (
      <div className={styles.tokenSalesFlow}>
        <Fieldset
          legend="Token Sale Information"
          description="Edit the information for your token sale."
        >
          <Field
            label={<Label text="Name" description="Pick a good name" />}
            input={
              <TextInput
                value={fields.name}
                onChange={(value) => setField("name", value)}
              />
            }
          />
          <Field
            label={
              <Label text="Symbol" description="Symbol for your tokensale" />
            }
            input={
              <TextInput
                value={fields.symbol}
                onChange={(value) => setField("symbol", value)}
              />
            }
          />
          <Field
            label={
              <Label
                text="TotalSupply"
                description="The maximum supply of tokens that can be sold."
              />
            }
            input={
              <TextInput
                value={fields.totalSupply}
                onChange={(value) => setField("totalSupply", value)}
              />
            }
          />
          <Field
            label={
              <Label text="Price" description="The price of each token." />
            }
            input={
              <TextInput
                value={fields.price}
                onChange={(value) => setField("price", value)}
              />
            }
          />
          <Field
            label={
              <Label
                text="Start Date"
                description="The date and time that the token sale will start."
              />
            }
            input={
              <DateTimeInput
                value={convertToDateTimeObject(fields.startTime)}
                onChange={(value) => setField("startDate", value)}
              />
            }
          />
          <Field
            label={
              <Label
                text="End Date"
                description="The date and time that the token sale will end."
              />
            }
            input={
              <DateTimeInput
                value={convertToDateTimeObject(fields.endTime)}
                onChange={(value) => setField("endDate", value)}
              />
            }
          />
          <Field
            label={<Label text="Status" />}
            input={
              <Toggle
                value={fields.status}
                onChange={(value) => setField("status", value)}
              />
            }
          />
        </Fieldset>
        <Toolbar
          section="TokenSale"
          subsection="Edit Token Sale"
          details={ReleaseInfo({ release: this.props.release })}
        />
      </div>
    );
  }
  renderContent() {
    const changes = this.initialChanges();
    return (
      <FlowView
        initialChanges={changes}
        initialFields={this.props.initialFields}
        renderForm={this.renderForm.bind(this)}
        showFooter={(changes) => changes.tokenSale !== ""}
        submitText="Save"
        onSubmit={({ fields }) => this.props.onSubmit(fields)}
        inProgressText={"Updating\u2026"}
        footerContents={() => {}}
        validate={({ fields }) => {
          //   if (!fields.tokenSale.length && !fields.tokenSale.length) {
          //     return "";
          //   }
          let errorMessages = [];
          //   if (!fields.tokenSale.length) {
          //     errorMessages.push("A description is required.");
          //   }
          //   if (!fields.tokenAddress.length) {
          //     errorMessages.push("A token address is required.");
          //   }
          //   if (!fields.maxSupply.length) {
          //     errorMessages.push("A max supply is required.");
          //   }
          //   if (!fields.price.length) {
          //     errorMessages.push("A price is required.");
          //   }
          //   if (!fields.saleImage.length) {
          //     errorMessages.push("A sale image is required.");
          //   }
          //   if (!fields.startDate.length) {
          //     errorMessages.push("A start date is required.");
          //   }
          //   if (!fields.endDate.length) {
          //     errorMessages.push("An end date is required.");
          //   }
          //   if (!fields.minPurchase.length) {
          //     errorMessages.push("A min purchase is required.");
          //   }
          //   if (!fields.maxPurchase.length) {
          //     errorMessages.push("A max purchase is required.");
          //   }
          //   if (!fields.whitelist.length) {
          //     errorMessages.push("A whitelist is required.");
          //   }
          //   if (!fields.whitelistEnabled.length) {
          //     errorMessages.push("A whitelist enabled is required.");
          //   }
          //   if (!fields.whitelistOnly.length) {
          //     errorMessages.push("A whitelist only is required.");
          //   }
          //   if (!fields.kycEnabled.length) {
          //     errorMessages.push("A KYC enabled is required.");
          //   }
          //   if (!fields.kycProvider.length) {
          //     errorMessages.push("A KYC provider is required.");
          //   }
          //   if (!fields.rarities.length) {
          //     errorMessages.push("A rarities is required.");
          //   }
          //   if (!fields.attributes.length) {
          //     errorMessages.push("A attributes is required.");
          //   }
          return errorMessages.join(" ");
        }}
      />
    );
  }
}
