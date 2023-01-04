/* eslint-disable quotes */
/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from "react";
import { CurrentApp } from "context/currentApp";
import Parse                              from 'parse';

export default class DeploymentsData extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();

    this.state = {
      deployments: undefined,
      subSections: {
        all: "All Deployments",
      },
      release: undefined,
    };
  }

  async fetchDeployments(app) {
    console.log("Fetching deployments");
    const parentObjectQuery = new Parse.Query("Deployment");
    const { useMasterKey } = this.state;
    const response = await parentObjectQuery.findAll({useMasterKey});
    console.log(response[0].toJSON());
    console.log(response[0].get("name"))
    let result = [];
    let subsections = {};
    response.forEach((parseObj) => {
        let parseObjJson = parseObj.toJSON();
        console.log(parseObjJson);
        result.push({
            id: parseObjJson.objectId,
            ...parseObjJson
        });
        subsections[parseObjJson.objectId] = parseObjJson.name;
    });

    this.setState({ deployments: result });
    
    this.setState({
      subSections: {
        ...this.state.subSections,
        ...subsections,
      },
    });
    // {
    //     code: "GOERLI DEPLOYMENT"
    //     createdAt: "2022-11-27T14:02:31.163Z"
    //     description: "goerli Deployment"
    //     name: "goerli Deployment"
    //     objectId: "yCxKvyTesx"
    //     project : 
    //     {__type: 'Pointer', className: 'Project', objectId: 'zrYz26bldN'}
    //     updatedAt: "2022-11-27T14:02:31.163Z"
    // }
  }

  componentDidMount() {
    this.fetchDeployments(this.context);
    // this.fetchRelease(this.context);
  }

  componentWillReceiveProps(props, context) {
    if (this.context !== context) {
      this.fetchDeployments(context);
      // this.fetchRelease(context);
    }
  }

  render() {
    let child = React.Children.only(this.props.children);
    return React.cloneElement(child, {
      ...child.props,
      availableDeployments: this.state.deployments,
      subSections: this.state.subSections,
    });
  }
}
