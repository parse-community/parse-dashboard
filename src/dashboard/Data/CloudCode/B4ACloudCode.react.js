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
import B4AAlert        from 'components/B4AAlert/B4AAlert.react';
import Button          from 'components/Button/Button.react';
import CodeTree        from 'components/CodeTree/CodeTree.react';
import {
  getFiles,
  updateTreeContent
}                      from 'components/CodeTree/TreeActions';
import LoaderContainer from 'components/LoaderContainer/LoaderContainer.react';
import styles          from 'dashboard/Data/CloudCode/CloudCode.scss';
import CloudCode       from 'dashboard/Data/CloudCode/CloudCode.react';
import LoaderDots      from 'components/LoaderDots/LoaderDots.react';
import Modal           from 'components/Modal/Modal.react';
import Icon            from 'components/Icon/Icon.react';

class B4ACloudCode extends CloudCode {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Cloud Code Functions';

    this.appsPath = 'parse-app'

    // Parameters used to on/off alerts
    this.alertTips = 'showTips'
    this.alertWhatIs= 'showWhatIs'

    this.state = {
      files: undefined,
      loading: true,
      unsavedChanges: false,
      modal: null,

      // Parameters used to on/off alerts
      showTips: localStorage.getItem(this.alertTips) !== 'false',
      showWhatIs: localStorage.getItem(this.alertWhatIs) !== 'false'
    };
  }

  handlerCloseAlert(alertTitle) {
    let alertName = (alertTitle.indexOf('Tips') >= 0 ? this.alertTips : this.alertWhatIs)
    localStorage.setItem(alertName, 'false')
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
        updateTreeContent()
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
      updateTreeContent()
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
    console.log("RENDER CONTENT", this.state.files)
    let content = null;
    let title = null;
    let footer = null;
    let alertWhatIs = null;
    let alertTips = null;

    let alertTipsMessage = <div>
      <p><b>0</b> - Using the Cloud Code tool you can deploy and run your Node.js functions on the Back4App cloud via SDK or calling the <a href="https://www.back4app.com/docs/platform/command-line-tool/how-to-use" target="_blank">REST API</a></p>
      <p><b>1</b> - To upload your code you should first click on <b>ADD</b> button and choose what files and folders you want to upload.</p>
      <p><b>2</b> - The first file MUST BE called <b>main.js</b> and any other file or folder MUST BE referenced more in this file.</p>
      <p><b>3</b> - After ADD and REMOVE all files you want, click on the <b>DEPLOY</b> button and commit your operation;</p>
    </div>

    let alertWhatIsMessage = <div>
      <p>To make long short, Cloud code isn’t anything else than a script that runs on the server side instead of the device that is running your app. It is more commonly used on Apps that need of a little more of complexity to its execution but isn’t mandatory.</p>
    </div>

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

      alertWhatIs = <B4AAlert
        show={this.state.showWhatIs}
        handlerCloseEvent={this.handlerCloseAlert.bind(this)}
        title="What is Cloud Code Functions"
        description={alertWhatIsMessage} />

      alertTips = <B4AAlert
        show={this.state.showTips}
        handlerCloseEvent={this.handlerCloseAlert.bind(this)}
        title="Back4App Tips"
        description={alertTipsMessage} />

      content = <CodeTree files={this.state.files} parentState={this.setState.bind(this)} />

      footer = <div className={`${styles.row} ${styles.footer}`}>
        <Button
          value={<div><Icon name='icon-deploy' fill='#fff' width={17} height={30} /> DEPLOY</div>}
          primary={true}
          color='b4a-green'
          onClick={this.uploadCode.bind(this)}
          width={'144px'}
        />
      </div>
    }

    return (
      <div className={`${styles.source} ${styles['b4a-source']}`} >
        {title}
        {alertWhatIs}
        {alertTips}
        {content}
        {footer}
        {this.state.modal}
      </div>
    );
  }
}

export default withRouter(B4ACloudCode);
