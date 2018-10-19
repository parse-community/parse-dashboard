import React from 'react';
import jstree from 'jstree';
import 'jstree/dist/themes/default/style.css'
import 'components/CodeTree/JsTree.css'
import styles from 'components/CodeTree/CodeTree.scss'
import Button from 'components/Button/Button.react';
import CloudCodeView from 'components/CloudCodeView/CloudCodeView.react';
import $ from 'jquery'
import { getConfig } from 'components/CodeTree/TreeActions';

export default class CodeTree extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      selectedFile: '',
      source: 'Select a file to view your Cloud Code'
    }
  }

  watchSelectedNode() {
    $('#tree').on('select_node.jstree', (e, data) => {
      if (data.selected && data.selected.length === 1) {
        let selected = data.instance.get_node(data.selected[0]);
        // if is code
        if (selected.data && selected.data.code && selected.type != 'folder') {
          let source = selected.data.code
          let selectedFile = selected.text
          this.setState({ source, selectedFile })
        }
      }
    })
  }

  componentDidMount() {
    let config = getConfig()
    console.log(config)
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
                <Button
                  value={'ADD'}
                  primary={true}
                  width='68'
                />
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
