import React from 'react';
import jstree from 'jstree';
import 'jstree/dist/themes/default/style.css'
import 'components/CodeTree/JsTree.css'
import styles from 'components/CodeTree/CodeTree.scss'
import Button from 'components/Button/Button.react';
import CloudCodeView from 'components/CloudCodeView/CloudCodeView.react';
import $ from 'jquery'
import treeAction from 'components/CodeTree/TreeActions';
import ReactFileReader from 'react-file-reader';

export default class CodeTree extends React.Component {
  constructor(props){
    super(props);

    const originalFiles = this.props.files

    this.state = {
      selectedFile: '',
      source: 'Select a file to view your Cloud Code',
      nodeId: '',
      files: this.props.files
    }
  }

  async updateReference() {
    let files = treeAction.getFiles()
  }

  async handleFiles(files) {
    console.log(files)
    await this.setState({ newFile: files })
    await this.loadFile()
    this.updateReference()
  }

  async loadFile() {
    let file = this.state.newFile
    if (file) {
      let currentTree = '#'
      treeAction.addFilesOnTree(file, currentTree)
      await this.setState({ newFile: '' })
    }
  }

  deleteFile() {
    if (this.state.nodeId) {
      treeAction.remove(`#${this.state.nodeId}`)
      this.setState({ source: '', selectedFile: '', nodeId: '' })
    }
  }

  watchSelectedNode() {
    $('#tree').on('select_node.jstree', (e, data) => {
      if (data.selected && data.selected.length === 1) {
        let selected = data.instance.get_node(data.selected[0]);
        let source = ''
        let selectedFile = ''
        let nodeId = ''
        // if is code
        if (selected.data && selected.data.code && selected.type != 'folder') {
          source = treeAction.decodeFile(selected.data.code)
          selectedFile = selected.text
          nodeId = selected.id
        }
        this.setState({ source, selectedFile, nodeId })
      }
    })
  }



  componentDidMount() {
    let config = treeAction.getConfig(this.state.files)
    console.log('config', config)
    $('#tree').jstree(config)
    this.watchSelectedNode()
  }

  render(){
    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles['col-4']}>
            <div className={`${styles['files-box']}`}>
              <div className={styles['files-header']} >
                <p>Files</p>
                <ReactFileReader
                  fileTypes={'*/*'}
                  base64={true}
                  multipleFiles={true}
                  handleFiles={this.handleFiles.bind(this)} >
                  <Button
                    value={'ADD'}
                    primary={true}
                    width='68'
                  />
                </ReactFileReader>
              </div>
              <div className={styles['files-tree']}>
                <div id={'tree'} onClick={this.watchSelectedNode.bind(this)}></div>
              </div>
            </div>
          </div>
          <div className={styles['col-8']}>
            <div className={`${styles['files-box']}`}>
              <div className={styles['files-header']} >
                <p>{this.state.selectedFile}</p>
                <Button
                  value={'REMOVE'}
                  primary={true}
                  color={'red'}
                  width='93'
                  disabled={!this.state.nodeId}
                  onClick={this.deleteFile.bind(this)}
                />
              </div>
              <div className={styles['files-text']}>
                <CloudCodeView
                  source={this.state.source}
                  language='javascript'/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
