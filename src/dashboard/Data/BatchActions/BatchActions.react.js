/* eslint-disable quotes */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from "react";
import Parse from "parse";

import DashboardView from "dashboard/DashboardView.react";
import styles from "dashboard/TableView.scss";
import EmptyState from "components/EmptyState/EmptyState.react";
// import LoaderContainer from "components/LoaderContainer/LoaderContainer.react";
import Toolbar from "components/Toolbar/Toolbar.react";
import TableHeader from "components/Table/TableHeader.react";
import Button from "components/Button/Button.react";
import { withRouter } from "lib/withRouter";
import BatchImport from "./BatchImport.react";

// @subscribeTo('Schema', 'schema')
@withRouter
class BatchActions extends DashboardView {
  constructor(props) {
    super(props);
    this.section = "Core";
    this.subsection = "Batch Actions";
    this.state = {
      showImportPopup: false,
      title: [],
      data: {},
      checked: {},
    };
    this.renderRow = this.renderRow.bind(this);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.renderHeaders = this.renderHeaders.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.renderEmpty = this.renderEmpty.bind(this);
    this.burn = this.burn.bind(this);
  }

  renderToolbar() {
    return (
      <Toolbar section="Core" subsection="Batch Actions">
        {!!Object.keys(this.state.data).length && (
          <Button
            color="white"
            value="Batch Mint"
            onClick={this.batchMint.bind(this)}
          />
        )}
      </Toolbar>
    );
  }

  renderEmpty() {
    return (
      <EmptyState
        title="Batch Actions"
        description="Create a new token to use in your app."
        icon="gears"
        cta="Import data"
        action={() => {
          this.setState({ showImportPopup: true });
        }}
      />
    );
  }

  renderRow(index, data) {
    const rowsData = data.map((data, key) => <td key={key}>{data}</td>);
    return (
      <tr key={index}>
        <td>
          <input
            type="checkbox"
            checked={this.state.checked[index]}
            onChange={() => {
              this.setState({
                checked: {
                  ...this.state.checked,
                  [index]: !this.state.checked[index],
                },
              });
            }}
          />
        </td>
        {rowsData}
        <td>
          <Button
            style={{ textAlign: "center" }}
            value="Burn"
            onClick={() => {
              this.burn(index, data);
            }}
          />
        </td>
      </tr>
    );
  }

  renderHeaders() {
    const headers = this.state.title;
    let headersData = [];
    const headersWidth = 100 / (headers.length + 2);

    if (headers.length) {
      headersData.push(
        <TableHeader width={headersWidth} key="#">
          #
        </TableHeader>
      );
      headersData.push(
        headers.map((item, index) => {
          return (
            <TableHeader key={index} width={headersWidth}>
              {item}
            </TableHeader>
          );
        })
      );
      headersData.push(
        <TableHeader width={headersWidth} key="##">
          ##
        </TableHeader>
      );
      return headersData;
    } else {
      return [];
    }
  }

  renderContent() {
    // let loading = this.state ? this.state.loading : false;
    let toolbar = this.renderToolbar();
    let data = this.state.data;
    const dataLength = Object.keys(data).length;
    let content = null;
    let headers = null;

    if (dataLength === 0) {
      content = <div className={styles.empty}>{this.renderEmpty()}</div>;
    } else {
      content = (
        <div className={styles.rows}>
          <table>
            <tbody>
              {Object.keys(data).map((index) =>
                this.renderRow(index, data[index])
              )}
            </tbody>
          </table>
        </div>
      );
      headers = this.renderHeaders();
    }

    return (
      <div>
        {/* <LoaderContainer loading={loading}> */}
        <div className={styles.content}>{content}</div>
        {/* </LoaderContainer> */}
        {toolbar}
        <div className={styles.headers}>{headers}</div>
        {/* {extras} */}
        {this.state.showImportPopup && (
          <BatchImport
            onCancel={() => {
              this.setState({ showImportPopup: false });
            }}
            onConfirm={(result) => {
              this.setState({
                data: result[1],
                title: result[0],
                showImportPopup: false,
                checked: Object.keys(result[1]).reduce(
                  (d, key) => ({
                    ...d,
                    [key]: false,
                  }),
                  {}
                ),
              });
            }}
          />
        )}
      </div>
    );
  }

  burn(index, data) {
    // Call burn function
    console.log(index, data);
  }

  batchMint() {
    let params = [];
    Object.keys(this.state.checked).forEach((index) => {
      if (this.state.checked[index]) {
        params.push({
          quantity: this.state.data[index][1],
          multiSaleId: this.state.data[index][5],
          address: this.state.data[index][3],
          customerId: this.state.data[index][2],
        });
      }
    });
    console.log(params);
  }
}

export default BatchActions;
