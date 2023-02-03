/* eslint-disable quotes */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Field from "components/Field/Field.react";
import Label from "components/Label/Label.react";
import Modal from "components/Modal/Modal.react";
import React from "react";
import TextInput from "components/TextInput/TextInput.react";
// import Dropdown from "components/Dropdown/Dropdown.react";
// import DropdownOption from "components/Dropdown/Option.react";

export default class BatchImport extends React.Component {
  constructor() {
    super();
    this.state = {
      data: "",
      action: "mint",
    };
  }

  processData(data) {
    const title = data.slice(0, data.indexOf("\n")).split(",");
    const rows = data.slice(data.indexOf("\n") + 1).split("\n");
    rows.splice(-1);
    let resultData = {}
    rows.forEach((row, index) => {
      const rowArr = row.split(",");
      const rowData = rowArr.map((r) => r.replace(/['" ]+/g, ""));
      resultData[index] = rowData;
    });
    return [title, resultData];
  }

  valid() {
    if (!this.state.data) {
      return false;
    }
    return true;
  }

  cancel() {
    this.setState({
      data: "",
    });
    this.props.onCancel();
  }

  submit() {
    this.props.onConfirm(this.processData(this.state.data));
  }

  render() {
    return (
      <Modal
        type={Modal.Types.INFO}
        title="Import Tokensale Data"
        icon="gear-solid"
        iconSize={30}
        subtitle=""
        disabled={!this.valid()}
        confirmText="Import"
        cancelText="Cancel"
        onCancel={this.props.onCancel}
        onConfirm={this.submit.bind(this)}
      >
        {/* <Field
          label={<Label text="Choose action" description="Choose the option" />}
          input={
            <Dropdown
              value={this.state.action}
              onChange={(action) => this.setState({ action })}
            >
              <DropdownOption key="Mint" value="mint">
                Mint
              </DropdownOption>
              <DropdownOption key="Burn" value="burn">
                Burn
              </DropdownOption>
            </Dropdown>
          }
        /> */}
        <Field
          label={<Label text="Multisale Data" description="Multisale Data" />}
          input={
            <TextInput
              multiline={true}
              placeholder={"Paste Multisale Data here"}
              value={this.state.data}
              onChange={(data) => this.setState({ data })}
            />
          }
        />
      </Modal>
    );
  }
}
