/* eslint-disable quotes */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DashboardView from "dashboard/DashboardView.react";
import EmptyState from "components/EmptyState/EmptyState.react";
import React from "react";
import Toolbar from "components/Toolbar/Toolbar.react";

import styles from "dashboard/Data/IpfsUpload/IpfsUpload.scss";
import browserStyles from "dashboard/TableView.scss";
import { withRouter } from "lib/withRouter";
import FileInput from "components/FileInput/FileInput.react";
import TableHeader from "components/Table/TableHeader.react";

import { create } from "ipfs-http-client";

console.log(process.env);
const projectId = process.env.projectId;
const projectSecret = process.env.projectSecret;
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);
const client = create({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization,
  },
});

@withRouter
class IpfsUpload extends DashboardView {
  constructor() {
    super();
    this.section = "Core";
    this.subsection = "Upload";
    this.retrieveFile = this.retrieveFile.bind(this);

    this.state = {
      urlArr: [],
    };
  }

  renderToolbar() {
    return (
      <Toolbar section="Core" subsection="Ipfs Upload">
        <FileInput
          onChange={(file) => this.retrieveFile(file)}
          style={{ padding: 0, background: "transparent" }}
        />
      </Toolbar>
    );
  }

  renderHeaders() {
    let headersData = [];
    if (this.state.urlArr.length) {
      headersData.push(<TableHeader width={14}>Index</TableHeader>);
      headersData.push(<TableHeader>URL</TableHeader>);
      return headersData;
    } else {
      return [];
    }
  }

  renderRow(url, index) {
    return (
      <tr key={index}>
        <td className={styles.row} width={"22%"}>
          {index + 1}
        </td>
        <td className={styles.row}>
          <a href={url} target="_blank">
            {url}
          </a>
        </td>
      </tr>
    );
  }

  async retrieveFile(file) {
    try {
      const created = await client.add(file);
      const url = `https://ipfs.io/ipfs/${created.path}`;
      this.setState({ urlArr: [...this.state.urlArr, url] });
    } catch (error) {
      console.error(error);
    }
  }

  renderContent() {
    let toolbar = this.renderToolbar();
    let content = null;
    let headers = null;
    if (this.state.urlArr.length) {
      content = (
        <div className={styles.rows}>
          <table>
            <tbody>
              {this.state.urlArr.map((url, index) =>
                this.renderRow(url, index)
              )}
            </tbody>
          </table>
        </div>
      );
      headers = this.renderHeaders();
    } else {
      content = (
        <div>
          <EmptyState
            icon="push-outline"
            title="Upload files to IPFS"
            description="Use this section to upload assets to IPFS"
          />
          <div className={styles.fileInput}>
            <FileInput onChange={(file) => this.retrieveFile(file)} />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className={browserStyles.content}>{content}</div>
        {toolbar}
        <div className={browserStyles.headers}>{headers}</div>
      </div>
    );
  }
}

export default IpfsUpload;
