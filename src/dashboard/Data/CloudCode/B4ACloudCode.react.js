/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React           from 'react';
import { withRouter }  from 'react-router';
import history         from 'dashboard/history';
import axios           from 'axios'
import Button          from 'components/Button/Button.react';
import CodeTree        from 'components/CodeTree/CodeTree.react';
import { getFiles }    from 'components/CodeTree/TreeActions';
import LoaderContainer from 'components/LoaderContainer/LoaderContainer.react';
import styles          from 'dashboard/Data/CloudCode/CloudCode.scss';
import CloudCode       from 'dashboard/Data/CloudCode/CloudCode.react';
import LoaderDots      from 'components/LoaderDots/LoaderDots.react';
import Modal           from 'components/Modal/Modal.react';

class B4ACloudCode extends CloudCode {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Cloud Code Functions';

    this.appsPath = 'parse-app'

    this.state = {
      files: undefined,
      loading: true,
      unsavedChanges: false,
      modal: null
    };
  }

  getPath() {
    return `${b4aSettings.BACK4APP_API_PATH}/${this.appsPath}/${this.props.params.appId}/cloud`
  }

  async componentWillMount() {
    await this.fetchSource()
    const unbindHook = this.props.router.setRouteLeaveHook(this.props.route, nextLocation => {
      if (this.state.unsavedChanges) {
        const warningModal = <Modal
          type={Modal.Types.WARNING}
          icon='warn-triangle-solid'
          title="Undeployed changes!"
          buttonsInCenter={true}
          textModal={true}
          confirmText='Continue anyway'
          onConfirm={() => {
            unbindHook();
            history.push(nextLocation);
          }}
          onCancel={() => { this.setState({ modal: null }); }}
          children='There are undeployed changes, if you leave the page you will lose it.'
          />;
        this.setState({ modal: warningModal });
        return false;
      } else {
        unbindHook();
      }
    });
  }

  // Format object to expected backend format
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
    const loadingModal = <Modal
      type={Modal.Types.INFO}
      icon='files-outline'
      title='Deploying...'
      textModal={true}
      children={
        <div>
          <LoaderDots />
          <div>
            Please wait, deploying in progress...
          </div>
        </div>
      }
      customFooter={<div style={{ padding: '10px 0 20px' }}></div>}
      />;
    this.setState({ modal: loadingModal });
    try{
      await axios(this.getPath(), {
        method: "post",
        data: { tree },
        withCredentials: true
      })
      await this.fetchSource()
      const successModal = <Modal
        type={Modal.Types.VALID}
        icon='check'
        title='Success on deploying your changes!'
        showCancel={false}
        buttonsInCenter={true}
        confirmText='Ok, got it'
        onConfirm={() => this.setState({ modal: null })}
        />;
      this.setState({ unsavedChanges: false, modal: successModal })
    } catch (err) {
      const errorModal = <Modal
        type={Modal.Types.DANGER}
        icon='warn-triangle-solid'
        title='Something went wrong'
        children='Please try to deploy your changes again.'
        showCancel={false}
        textModal={true}
        confirmText='Ok, got it'
        buttonsInCenter={true}
        onConfirm={() => {
          this.setState({ modal: null });
        }} />;
      this.setState({
        modal: errorModal
      });
    }
  }

  // method used to fetch the cloud code from app
  async fetchSource() {
    try {
      let response = await axios.get(this.getPath(), { withCredentials: true })
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

    // Show loading page before fetch data
    if (this.state.loading) {
      content = <LoaderContainer loading={true} solid={false}>
        <div className={styles.loading}></div>
      </LoaderContainer>
    } else { // render cloud code page
      title = <div className={styles.title}>
        <div><p>Cloud Code Functions</p></div>
        <Button
          value='LEARN MORE'
          primary={true}
          onClick={() => window.open('https://www.back4app.com/docs/cloud-code-functions/unit-tests', '_blank')} />
      </div>
      content = <CodeTree files={this.state.files} parentState={this.setState.bind(this)} />
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
        {this.state.modal}
      </div>
    );
  }
}

export default withRouter(B4ACloudCode);
