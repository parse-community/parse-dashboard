/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import { ActionTypes } from 'lib/stores/ConfigStore';
import Button from 'components/Button/Button.react';
import ConfigDialog from 'dashboard/Data/Config/ConfigDialog.react';
import DeleteParameterDialog from 'dashboard/Data/Config/DeleteParameterDialog.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Icon from 'components/Icon/Icon.react';
import { isDate } from 'lib/DateUtils';
import Parse from 'parse';
import React from 'react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import subscribeTo from 'lib/subscribeTo';
import TableHeader from 'components/Table/TableHeader.react';
import TableView from 'dashboard/TableView.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import browserStyles from 'dashboard/Data/Browser/Browser.scss';
import { CurrentApp } from 'context/currentApp';
import Modal from 'components/Modal/Modal.react';
import equal from 'fast-deep-equal';

@subscribeTo('Config', 'config')
class Config extends TableView {
  static contextType = CurrentApp;
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Config';
    this.action = new SidebarAction('Create a parameter', this.createParameter.bind(this));
    this.state = {
      modalOpen: false,
      showDeleteParameterDialog: false,
      modalParam: '',
      modalType: 'String',
      modalValue: '',
      modalMasterKeyOnly: false,
      loading: false,
      confirmModalOpen: false,
    };
  }

  componentWillMount() {
    this.loadData();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      nextProps.config.dispatch(ActionTypes.FETCH);
    }
  }

  onRefresh() {
    this.loadData();
  }

  async loadData() {
    this.setState({ loading: true });
    try {
      await this.props.config.dispatch(ActionTypes.FETCH);
      this.cacheData = new Map(this.props.config.data);
    } finally {
      this.setState({ loading: false });
    }
  }

  renderToolbar() {
    return (
      <Toolbar section="Core" subsection="Config">
        <a className={browserStyles.toolbarButton} onClick={this.onRefresh.bind(this)}>
          <Icon name="refresh-solid" width={14} height={14} />
          <span>Refresh</span>
        </a>
        <Button
          color="white"
          value="Create a parameter"
          onClick={this.createParameter.bind(this)}
        />
      </Toolbar>
    );
  }

  renderExtras() {
    let extras = null;
    if (this.state.modalOpen) {
      extras = (
        <ConfigDialog
          onConfirm={this.saveParam.bind(this)}
          onCancel={() => this.setState({ modalOpen: false })}
          param={this.state.modalParam}
          type={this.state.modalType}
          value={this.state.modalValue}
          masterKeyOnly={this.state.modalMasterKeyOnly}
          parseServerVersion={this.context.serverInfo?.parseServerVersion}
          loading={this.state.loading}
        />
      );
    } else if (this.state.showDeleteParameterDialog) {
      extras = (
        <DeleteParameterDialog
          param={this.state.modalParam}
          onCancel={() => this.setState({ showDeleteParameterDialog: false })}
          onConfirm={this.deleteParam.bind(this, this.state.modalParam)}
        />
      );
    }

    if (this.state.confirmModalOpen) {
      extras = (
        <Modal
          type={Modal.Types.INFO}
          icon="warn-outline"
          title={'Are you sure?'}
          confirmText="Continue"
          cancelText="Cancel"
          onCancel={() => this.setState({ confirmModalOpen: false })}
          onConfirm={() => {
            this.setState({ confirmModalOpen: false });
            this.saveParam({
              ...this.confirmData,
              override: true,
            });
          }}
        >
          <div className={[browserStyles.confirmConfig]}>
            This parameter changed while you were editing it. If you continue, the latest changes will be lost and replaced with your version. Do you want to proceed?
          </div>
        </Modal>
      );
    }
    return extras;
  }

  parseValueForModal(dataValue) {
    let value = dataValue;
    let modalValue = value;
    let type = typeof value;

    if (type === 'object') {
      if (isDate(value)) {
        type = 'Date';
        value = value.toISOString();
      } else if (Array.isArray(value)) {
        type = 'Array';
        value = JSON.stringify(value);
        modalValue = value;
      } else if (value instanceof Parse.GeoPoint) {
        type = 'GeoPoint';
        value = `(${value.latitude}, ${value.longitude})`;
        modalValue = dataValue.toJSON();
      } else if (dataValue instanceof Parse.File) {
        type = 'File';
        value = (
          <a target="_blank" href={dataValue.url()} rel="noreferrer">
            Open in new window
          </a>
        );
      } else {
        type = 'Object';
        value = JSON.stringify(value);
        modalValue = value;
      }
    } else {
      if (type === 'boolean') {
        value = value ? 'true' : 'false';
      }
      type = type.substr(0, 1).toUpperCase() + type.substr(1);
    }

    return {
      value: value,
      modalValue: modalValue,
      type: type,
    };
  }

  renderRow(data) {
    // Parse modal data
    const { value, modalValue, type } = this.parseValueForModal(data.value);

    /**
     * Opens the modal dialog to edit the Config parameter.
     */
    const openModal = async () => {

      // Show dialog
      this.setState({
        loading: true,
        modalOpen: true,
        modalParam: data.param,
        modalType: type,
        modalValue: modalValue,
        modalMasterKeyOnly: data.masterKeyOnly,
      });

      // Fetch config data
      await this.loadData();

      // Get latest param values
      const fetchedParams = this.props.config.data.get('params');
      const fetchedValue = fetchedParams.get(this.state.modalParam);
      const fetchedMasterKeyOnly = this.props.config.data.get('masterKeyOnly')?.get(this.state.modalParam) || false;

      // Parse fetched data
      const { modalValue: fetchedModalValue } = this.parseValueForModal(fetchedValue);

      // Update dialog
      this.setState({
        modalValue: fetchedModalValue,
        modalMasterKeyOnly: fetchedMasterKeyOnly,
        loading: false,
      });
    };

    // Define column styles
    const columnStyleLarge = { width: '30%', cursor: 'pointer' };
    const columnStyleSmall = { width: '15%', cursor: 'pointer' };

    const openModalValueColumn = () => {
      if (data.value instanceof Parse.File) {
        return;
      }
      openModal();
    };

    const openDeleteParameterDialog = () =>
      this.setState({
        showDeleteParameterDialog: true,
        modalParam: data.param,
      });

    return (
      <tr key={data.param}>
        <td style={columnStyleLarge} onClick={openModal}>
          {data.param}
        </td>
        <td style={columnStyleSmall} onClick={openModal}>
          {type}
        </td>
        <td style={columnStyleLarge} onClick={openModalValueColumn}>
          {value}
        </td>
        <td style={columnStyleSmall} onClick={openModal}>
          {data.masterKeyOnly.toString()}
        </td>
        <td style={{ textAlign: 'center' }}>
          <a onClick={openDeleteParameterDialog}>
            <Icon width={16} height={16} name="trash-solid" fill="#ff395e" />
          </a>
        </td>
      </tr>
    );
  }

  renderHeaders() {
    return [
      <TableHeader key="parameter" width={30}>
        Parameter
      </TableHeader>,
      <TableHeader key="type" width={15}>
        Type
      </TableHeader>,
      <TableHeader key="value" width={30}>
        Value
      </TableHeader>,
      <TableHeader key="masterKeyOnly" width={15}>
        Master key only
      </TableHeader>,
    ];
  }

  renderEmpty() {
    return (
      <EmptyState
        title="Dynamically configure your app"
        description="Set up parameters that let you control the appearance or behavior of your app."
        icon="gears"
        cta="Create your first parameter"
        action={this.createParameter.bind(this)}
      />
    );
  }

  tableData() {
    let data = undefined;
    if (this.props.config.data) {
      const params = this.props.config.data.get('params');
      const masterKeyOnlyParams = this.props.config.data.get('masterKeyOnly') || {};
      if (params) {
        data = [];
        params.forEach((value, param) => {
          const masterKeyOnly = masterKeyOnlyParams.get(param) || false;
          const type = typeof value;
          if (type === 'object' && value.__type == 'File') {
            value = Parse.File.fromJSON(value);
          } else if (type === 'object' && value.__type == 'GeoPoint') {
            value = new Parse.GeoPoint(value);
          }
          data.push({
            param: param,
            value: value,
            masterKeyOnly: masterKeyOnly,
          });
        });
        data.sort((object1, object2) => {
          return object1.param.localeCompare(object2.param);
        });
      }
    }
    return data;
  }

  async saveParam({ name, value, type, masterKeyOnly, override }) {
    try {
      this.setState({ loading: true });

      const fetchedParams = this.props.config.data.get('params');
      const currentValue = fetchedParams.get(name);
      await this.props.config.dispatch(ActionTypes.FETCH);
      const fetchedParamsAfter = this.props.config.data.get('params');
      const currentValueAfter = fetchedParamsAfter.get(name);
      const valuesAreEqual = equal(currentValue, currentValueAfter);

      if (!valuesAreEqual && !override) {
        this.setState({
          confirmModalOpen: true,
          modalOpen: false,
          loading: false,
        });
        this.confirmData = {
          name,
          value,
          type,
          masterKeyOnly,
        };
        return;
      }

      await this.props.config.dispatch(ActionTypes.SET, {
        param: name,
        value: value,
        masterKeyOnly: masterKeyOnly,
      });

      // Update the cached data after successful save
      const params = this.cacheData.get('params');
      params.set(name, value);
      if (masterKeyOnly) {
        const masterKeyOnlyParams = this.cacheData.get('masterKeyOnly') || new Map();
        masterKeyOnlyParams.set(name, masterKeyOnly);
        this.cacheData.set('masterKeyOnly', masterKeyOnlyParams);
      }

      this.setState({ modalOpen: false });

      // Update config history in localStorage
      const limit = this.context.cloudConfigHistoryLimit;
      const applicationId = this.context.applicationId;
      let transformedValue = value;

      if (type === 'Date') {
        transformedValue = { __type: 'Date', iso: value };
      }
      if (type === 'File') {
        transformedValue = { name: value._name, url: value._url };
      }

      const configHistory = localStorage.getItem(`${applicationId}_configHistory`);
      const newHistoryEntry = {
        time: new Date(),
        value: transformedValue,
      };

      if (!configHistory) {
        localStorage.setItem(
          `${applicationId}_configHistory`,
          JSON.stringify({
            [name]: [newHistoryEntry],
          })
        );
      } else {
        const oldConfigHistory = JSON.parse(configHistory);
        const updatedHistory = !oldConfigHistory[name]
          ? [newHistoryEntry]
          : [newHistoryEntry, ...oldConfigHistory[name]].slice(0, limit || 100);

        localStorage.setItem(
          `${applicationId}_configHistory`,
          JSON.stringify({
            ...oldConfigHistory,
            [name]: updatedHistory,
          })
        );
      }
    } catch (error) {
      this.context.showError?.(
        `Failed to save parameter: ${error.message || 'Unknown error occurred'}`
      );
    } finally {
      this.setState({ loading: false });
    }
  }

  deleteParam(name) {
    this.props.config.dispatch(ActionTypes.DELETE, { param: name }).then(() => {
      this.setState({ showDeleteParameterDialog: false });
    });
    const configHistory =
      localStorage.getItem('configHistory') && JSON.parse(localStorage.getItem('configHistory'));
    if (configHistory) {
      delete configHistory[name];
      if (Object.keys(configHistory).length === 0) {
        localStorage.removeItem('configHistory');
      } else {
        localStorage.setItem('configHistory', JSON.stringify(configHistory));
      }
    }
  }

  createParameter() {
    this.setState({
      modalOpen: true,
      modalParam: '',
      modalType: 'String',
      modalValue: '',
      modalMasterKeyOnly: false,
    });
  }
}

export default Config;
