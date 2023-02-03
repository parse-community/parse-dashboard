/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DateTimeInput from "components/DateTimeInput/DateTimeInput.react";
import Dropdown from "components/Dropdown/Dropdown.react";
import Field from "components/Field/Field.react";
import FileInput from "components/FileInput/FileInput.react";
import GeoPointInput from "components/GeoPointInput/GeoPointInput.react";
import Label from "components/Label/Label.react";
import Modal from "components/Modal/Modal.react";
import Option from "components/Dropdown/Option.react";
import Parse from "parse";
import React from "react";
import TextInput from "components/TextInput/TextInput.react";
import Toggle from "components/Toggle/Toggle.react";
import validateNumeric from "lib/validateNumeric";
import styles from "dashboard/Data/Browser/Browser.scss";
import semver from "semver/preload.js";

export default class TokensDialog extends React.Component {
  constructor(props) {
    super();
    this.state = {
      tokenId: props.tokenId || "",
      type: props.type || "String",
      owner: props.owner || "0x...",
      address: props.address || "0x...",
    };
  }
  valid() {
    if (
      !this.state.tokenId ||
      !this.state.type ||
      !this.state.owner ||
      !this.state.address
    ) {
      return false;
    }
    return true;
  }

  cancel() {
    this.setState({
      tokenId: "",
      type: "",
      owner: "",
      address: "",
    });
    this.props.onCancel();
  }

  submit() {
    this.props.onConfirm({
      tokenId: this.state.tokenId,
      type: this.state.type,
      owner: this.state.owner,
      address: this.state.address,
    });
  }

  render() {
    let newParam = !this.props.tokenId;
    return (
      <Modal
        type={Modal.Types.INFO}
        title={newParam ? "New token" : "Edit token"}
        icon="gear-solid"
        iconSize={30}
        subtitle={"Create a new token or edit an existing one."}
        disabled={!this.valid()}
        confirmText={newParam ? "Create" : "Save"}
        cancelText="Cancel"
        onCancel={this.props.onCancel}
        onConfirm={this.submit.bind(this)}
      >
        <Field
          label={<Label text="Token Id" description="Token Id" />}
          input={
            <TextInput
              placeholder={"xxxxx"}
              value={this.state.tokenId}
              onChange={(tokenId) => this.setState({ tokenId })}
            />
          }
        />
        <Field
          label={<Label text="Token Type" description="Token Type" />}
          input={
            <TextInput
              placeholder={"ERC721"}
              value={this.state.type}
              onChange={(type) => this.setState({ type })}
            />
          }
        />
        <Field
          label={<Label text="Token Owner" description="Token Owner" />}
          input={
            <TextInput
              placeholder={"0x...."}
              value={this.state.owner}
              onChange={(owner) => this.setState({ owner })}
            />
          }
        />
        <Field
          label={<Label text="Token Address" description="Token Address" />}
          input={
            <TextInput
              placeholder={"0x...."}
              value={this.state.address}
              onChange={(address) => this.setState({ address })}
            />
          }
        />
      </Modal>
    );
  }
}
