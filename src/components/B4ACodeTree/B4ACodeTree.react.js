import React            from 'react';
import $                from 'jquery'
import jstree           from 'jstree';
import ReactFileReader  from 'react-file-reader';
import styles           from 'components/B4ACodeTree/B4ACodeTree.scss'
import Button           from 'components/Button/Button.react';
import B4ACloudCodeView from 'components/B4ACloudCodeView/B4ACloudCodeView.react';
import B4ATreeActions   from 'components/B4ACodeTree/B4ATreeActions';
import 'jstree/dist/themes/default/style.css'
import 'components/B4ACodeTree/B4AJsTree.css'

export default class B4ACodeTree extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      selectedFile: '',
      extension: '',
      source: '',
      nodeId: '',
      files: this.props.files,
      isImage: false
    }
  }

  getFileType(file) {
    try {
      return file.split(',')[0].indexOf('image') >= 0
    } catch (err) {
      console.error(err)
    }
    return false
  }

  async handleFiles(files) {
    await this.setState({ newFile: files })
    await this.loadFile()
  }

  // load file and add on tree
  async loadFile() {
    let file = this.state.newFile
    if (file) {
      let currentTree = '#'
      B4ATreeActions.addFilesOnTree(file, currentTree)
      await this.setState({ newFile: '' })
      this.handleTreeChanges()
    }
  }

  deleteFile() {
    if (this.state.nodeId) {
      B4ATreeActions.remove(`#${this.state.nodeId}`)
      this.setState({ source: '', selectedFile: '', nodeId: '' })
      this.handleTreeChanges()
    }
  }

  selectNode(data) {
    let selected = ''
    let source = ''
    let selectedFile = ''
    let nodeId = ''
    let extension = ''
    let isImage = false
    if (data.selected && data.selected.length === 1) {
      selected = data.instance.get_node(data.selected[0])
      // if is code
      if (selected.data && selected.data.code && selected.type != 'folder') {
        isImage = this.getFileType(selected.data.code)
        source = isImage ? selected.data.code : B4ATreeActions.decodeFile(selected.data.code)
        selectedFile = selected.text
        nodeId = selected.id
        extension = B4ATreeActions.getExtension(selectedFile)
      }
    }
    this.setState({ source, selectedFile, nodeId, extension, isImage })
  }

  // method to identify the selected tree node
  watchSelectedNode() {
    $('#tree').on('select_node.jstree', (e, data) => this.selectNode(data))
    $('#tree').on('changed.jstree', (e, data) => this.selectNode(data))
  }

  handleTreeChanges() {
    return this.props.parentState({ unsavedChanges: true })
  }

  componentDidMount() {
    let config = B4ATreeActions.getConfig(this.state.files)
    $('#tree').jstree(config)
    this.watchSelectedNode()
  }

  render(){
    return (
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
                  value={<div><i className="zmdi zmdi-plus"></i> ADD</div>}
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
                value={<div><i className="zmdi zmdi-minus"></i> REMOVE</div>}
                primary={true}
                color={'red'}
                width='93'
                disabled={!this.state.nodeId}
                onClick={this.deleteFile.bind(this)}
              />
            </div>
            <div className={styles['files-text']}>
              {
                this.state.isImage ?
                  <img src={this.state.source} /> :
                  <B4ACloudCodeView
                  source={this.state.source || "Select a file to view your Cloud Code"}
                  extension={this.state.extension} />
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
