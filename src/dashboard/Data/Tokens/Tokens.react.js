/* eslint-disable quotes */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { ActionTypes } from "lib/stores/TokensStore";
import Button from "components/Button/Button.react";
import TokenDialog from "dashboard/Data/Tokens/TokensDialog.react";
import EmptyState from "components/EmptyState/EmptyState.react";
import Icon from "components/Icon/Icon.react";
import DeleteParameterDialog from "dashboard/Data/Config/DeleteParameterDialog.react";
import Parse from "parse";
import React from "react";
import SidebarAction from "components/Sidebar/SidebarAction";
import subscribeTo from "lib/subscribeTo";
import TableHeader from "components/Table/TableHeader.react";
import TableView from "dashboard/TableView.react";
import Toolbar from "components/Toolbar/Toolbar.react";
import { withRouter } from "lib/withRouter";

@subscribeTo("Tokens", "tokens")
@withRouter
class Tokens extends TableView {
  constructor() {
    super();
    this.section = "Core";
    this.subsection = "Tokens";
    this.state = {
      modalOpen: false,
      showDeleteParameterDialog: false,
      modalTokenId: "",
      modalType: "",
      modalOwner: "",
      modalAddress: "",
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tokens) {
      this.action = new SidebarAction(
        "Create a token",
        this.createToken.bind(this)
      );
      return;
    }
    this.action = null;
  }

  renderToolbar() {
    return (
      <Toolbar section="Core" subsection="Tokens">
        <Button
          color="white"
          value="Create a token"
          onClick={this.createToken.bind(this)}
        />
      </Toolbar>
    );
  }

  renderExtras() {
    let extras = null;
    if (this.state.modalOpen) {
      extras = (
        <TokenDialog
          onConfirm={this.saveToken.bind(this)}
          onCancel={() =>
            this.setState({
              modalOpen: false,
              modalTokenId: "",
              modalType: "",
              modalOwner: "",
              modalAddress: "",
            })
          }
          tokenId={this.state.modalTokenId}
          type={this.state.modalType}
          owner={this.state.modalOwner}
          address={this.state.modalAddress}
        />
      );
    } else if (this.state.showDeleteParameterDialog) {
      extras = (
        <DeleteParameterDialog
          param={this.state.modalTokenId}
          onCancel={() => this.setState({ showDeleteParameterDialog: false })}
          onConfirm={this.deleteParam.bind(this, this.state.modalTokenId)}
        />
      );
    }
    return extras;
  }

  deleteParam(tokenId) {
    var tokenQuery = new Parse.Query("Token");
    tokenQuery.equalTo("tokenId", tokenId);
    tokenQuery
      .first({ useMasterKey: true })
      .then(async (object) => {
        object.destroy({});
        this.setState({ showDeleteParameterDialog: false });
        this.props.refetch();
        this.forceUpdate();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  renderRow(data) {
    let openModal = () =>
      this.setState({
        modalOpen: true,
        modalTokenId: data.tokenId,
        modalType: data.type,
        modalOwner: data.owner,
        modalAddress: data.address,
      });
    let columnStyleLarge = { width: "30%", cursor: "pointer" };
    let columnStyleSmall = { width: "15%", cursor: "pointer" };

    let openDeleteParameterDialog = () =>
      this.setState({
        showDeleteParameterDialog: true,
        modalTokenId: data.tokenId,
      });

    return (
      <tr key={data.tokenId}>
        <td style={columnStyleSmall}>{data.tokenId}</td>
        <td style={columnStyleSmall}>{data.type}</td>
        <td style={columnStyleLarge}>{data.owner}</td>
        <td style={columnStyleLarge}>{data.address}</td>
        <td style={{ textAlign: "center" }}>
          <a onClick={openModal}>
            <Icon width={16} height={16} name="edit-solid" fill="green" />
          </a>
        </td>
        <td style={{ textAlign: "center" }}>
          <a onClick={openDeleteParameterDialog}>
            <Icon width={16} height={16} name="trash-solid" fill="#ff395e" />
          </a>
        </td>
      </tr>
    );
  }

  renderHeaders() {
    return [
      <TableHeader key="tokenid" width={15}>
        Token Id
      </TableHeader>,
      <TableHeader key="type" width={15}>
        Type
      </TableHeader>,
      <TableHeader key="owner" width={30}>
        Owner
      </TableHeader>,
      <TableHeader key="address" width={30}>
        Address
      </TableHeader>,
    ];
  }

  renderEmpty() {
    return (
      <EmptyState
        title="Create tokens"
        description="Create a new token to use in your app."
        icon="gears"
        cta="Create your first token"
        action={this.createToken.bind(this)}
      />
    );
  }

  tableData() {
    return this.props.tokens;
  }

  saveToken({ tokenId, type, owner, address }) {
    var tokenQuery = new Parse.Query("Token");
    tokenQuery.equalTo("tokenId", tokenId);
    tokenQuery
      .first({ useMasterKey: true })
      .then(async (object) => {
        if (!object) {
          object = new Parse.Object("Token");
        }
        object.set("tokenId", tokenId);
        object.set("type", type);
        object.set("owner", owner);
        object.set("address", address);

        await object.save();
        this.setState({ modalOpen: false });
        this.props.refetch();
        this.forceUpdate();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  createToken() {
    this.setState({ modalOpen: true });
  }
}

export default Tokens;
