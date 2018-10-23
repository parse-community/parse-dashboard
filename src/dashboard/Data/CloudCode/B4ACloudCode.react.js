/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React           from 'react';
import axios           from 'axios'
import Button          from 'components/Button/Button.react';
import EmptyState      from 'components/EmptyState/EmptyState.react';
import CodeTree        from 'components/CodeTree/CodeTree.react';
import { getFiles }    from 'components/CodeTree/TreeActions';
import LoaderContainer from 'components/LoaderContainer/LoaderContainer.react';
import styles          from 'dashboard/Data/CloudCode/CloudCode.scss';
import CloudCode       from 'dashboard/Data/CloudCode/CloudCode.react';

export default class B4ACloudCode extends CloudCode {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Cloud Code Functions';

    this.appsPath = 'parse-app'
    this.param = this.props.params
    this.path = `${b4aSettings.BACK4APP_API_PATH}/${this.appsPath}/${this.params.appId}/cloud`

    this.state = {
      files: undefined,
      source: undefined,
      loading: true,
    };
  }

  async componentWillMount() {
    await this.fetchSource()
  }

  createFolder(folders, parent) {
    folders.forEach(folder => {
      let file = folder;

      // Remove 'new-' prefix from files that will be deployed
      let currentFile = { text: file.text, type: file.type.split('new-').pop() };
      currentFile.type = (currentFile.type === 'file' ? 'default' : currentFile.type)

      parent.push(currentFile);
      if (file.children && file.children.length > 0) {
        currentFile.children = [];
        // If is a folder, call createFolder recursively
        this.createFolder(file.children, currentFile.children);
      } else {
        currentFile.data = file.data;
      }
    })
  }

  async uploadCode() {
    let tree = [];
    let currentCode = getFiles()
    this.createFolder(currentCode, tree);
    // TODO: Show 'loading' modal
    try{
      await axios(this.path, {
        method: "post",
        data: { tree },
        withCredentials: true
      })
      await this.fetchSource()
      // TODO: Show success modal
    } catch (err) {
      console.error(err)
      // TODO: Show error modal
    }
  }

  // method used to fetch the cloud code from app
  async fetchSource() {
    try {
      let response = await axios.get(this.path, { withCredentials: true })
      if (response.data && response.data.tree)
        this.setState({ files: response.data.tree, loading: false })
    } catch(err) {
      console.error(err)
      this.setState({ loading: false })
    }
  }

  // override renderSidebar from cloud code to don't show the files name on sidebar
  renderSidebar() {
    return null
  }

  renderContent() {
    let content = null;
    let title = null;
    let footer = null;

    if (this.state.loading) {
      content = <LoaderContainer loading={true} solid={false}>
        <div className={styles.loading}></div>
      </LoaderContainer>
    } else if (!this.state.files || Object.keys(this.state.files).length === 0) {
      content = (
        <div className={styles.empty}>
          <EmptyState
            title={'You haven\u2019t deployed any code yet.'}
            icon='folder-outline'
            description={'When you deploy your cloud code, you\u2019ll be able to see your files here'}
            cta='Get started with Cloud Code'
            action={() => window.open('https://www.back4app.com/docs/cloud-code-functions/unit-tests', '_blank')} />
        </div>
      );
    } else {
      title = <div className={styles.title}>
        <div><p>Cloud Code Functions</p></div>
        <Button
          value='LEARN MORE'
          primary={true}
          onClick={() => window.open('https://www.back4app.com/docs/cloud-code-functions/unit-tests', '_blank')} />
      </div>
      content = <CodeTree files={this.state.files} />
      footer = <div className={styles.container}>
        <div className={`${styles.footer}`}>
          <Button
            value='DEPLOY'
            primary={true}
            color='green'
            onClick={this.uploadCode.bind(this)}
          />
        </div>
      </div>
    }

    return (
      <div className={styles.source} >
        {title}
        {content}
        {footer}
      </div>
    );
  }
}
