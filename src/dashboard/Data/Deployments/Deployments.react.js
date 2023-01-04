/* eslint-disable quotes */
import TableView from "dashboard/TableView.react";
import Button from "components/Button/Button.react";
import Modal from "components/Modal/Modal.react";
import Toolbar from "components/Toolbar/Toolbar.react";
import CategoryList from "components/CategoryList/CategoryList.react";
import ReleaseInfo from "components/ReleaseInfo/ReleaseInfo";
import TableHeader from "components/Table/TableHeader.react";

import React from "react";

export default class Deployments extends TableView {
  constructor() {
    super();
    this.section = "Core";
    this.subsection = "Deployments";
    this.state = {
      showModal: false,
    };
  }

  renderSidebar() {
    let current = this.props.params.section || "";
    return this.props.availableDeployments ? (
      <CategoryList
        current={current}
        linkPrefix={"deployments/"}
        categories={this.props.availableDeployments}
      />
    ) : null;
  }

  renderHeaders() {
    if (this.props.params.section === "all") {
      return [
        <TableHeader key="name" width={25}>
          Name
        </TableHeader>,
        <TableHeader key="code" width={25}>
          Code
        </TableHeader>,
        <TableHeader key="createdAt" width={25}>
          CreatedAt
        </TableHeader>,
        <TableHeader key="id" width={25}>
          Id
        </TableHeader>,
      ];
    } else if (this.props.params.section === "scheduled") {
      return [
        <TableHeader key="name" width={20}>
          Name
        </TableHeader>,
        <TableHeader key="func" width={20}>
          Function
        </TableHeader>,
        <TableHeader key="schedule" width={20}>
          Schedule (UTC)
        </TableHeader>,
        <TableHeader key="actions" width={40}>
          Actions
        </TableHeader>,
      ];
    } else {
      return [
        <TableHeader key="func" width={20}>
          Function
        </TableHeader>,
        <TableHeader key="started" width={20}>
          Started At (UTC)
        </TableHeader>,
        <TableHeader key="finished" width={20}>
          Finished At (UTC)
        </TableHeader>,
        <TableHeader key="message" width={20}>
          Message
        </TableHeader>,
        <TableHeader key="status" width={20}>
          Status
        </TableHeader>,
      ];
    }
  }

  renderRow(data) {
    if (this.props.params.section === "all") {
      console.log(data);
      return (
        <tr key={data.id}>
          <td style={{ width: "25%" }}>{data.name}</td>
          <td style={{ width: "25%" }}>{data.code}</td>
          <td style={{ width: "25%" }}>{data.createdAt}</td>
          <td style={{ width: "25%" }}>{data.id}</td>
          {/* <td className={styles.buttonCell}>
              <RunNowButton job={data} width={'100px'} />
            </td> */}
        </tr>
      );
    }
  }

  tableData() {
    let data = undefined;
    if (this.props.params.section === "all") {
      data = this.props.availableDeployments;
    }
    return data;
  }

  renderToolbar() {
    let subsections = this.props.subSections;
    if (subsections[this.props.params.section]) {
      return (
        <Toolbar
          section="Deployments"
          subsection={subsections[this.props.params.section]}
          details={ReleaseInfo({ release: this.props.release })}
        >
          <Button
            color="white"
            value="Add Deployment"
            onClick={() => {
              this.setState({ showModal: true });
            }}
          />
        </Toolbar>
      );
    }
    return null;
  }

  renderExtras() {
    let extras = null;
    if (this.state.showModal) {
      extras = (
        <Modal
          {...this.props}
          title="Add Deployment"
          onConfirm={() => {}}
          onCancel={() => {
            this.setState({ showModal: false });
          }}
        >
          {this.props.children}
        </Modal>
      );
    }
    return extras;
  }
}
