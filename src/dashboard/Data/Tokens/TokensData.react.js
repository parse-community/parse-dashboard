/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from "react";
import { CurrentApp } from "context/currentApp";
import { Outlet } from "react-router-dom";
import Parse from "parse";

export default class TokensData extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();
    this.fetchTokens = this.fetchTokens.bind(this);
    this.state = {
      tokens: undefined,
    };
  }

  async fetchTokens() {
    const parentObjectQuery = new Parse.Query("Token");
    const response = await parentObjectQuery.findAll({ useMasterKey: true });
    let result = [];
    response.forEach((parseObj) => {
      result.push(parseObj.toJSON());
    });
    console.log(result);
    this.setState({ tokens: result });
  }

  componentDidMount() {
    this.fetchTokens();
  }

  refetch() {
    this.fetchTokens();
  }

  componentWillReceiveProps(props, context) {
    if (this.context !== context) {
      this.fetchTokens();
    }
  }

  render() {
    return (
      <Outlet
        context={{
          tokens: this.state.tokens,
          refetch: this.fetchTokens.bind(this),
        }}
      />
    );
  }
}
