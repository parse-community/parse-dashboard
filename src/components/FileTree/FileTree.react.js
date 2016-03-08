/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Icon     from 'components/Icon/Icon.react';
import { Link } from 'react-router';
import React    from 'react';
import styles   from 'components/FileTree/FileTree.scss';

export default class FileTree extends React.Component {
  constructor(props) {
    super();

    let open = !props.name;
    if (props.current && props.name) {
      let dirPath = (props.prefix || '') + props.name + '/';
      if (props.current.startsWith(dirPath)) {
        open = true;
      }
    }

    this.state = {
      open: open,
    };
  }

  render() {
    let dir = null;
    if (this.props.name) {
      dir = (
        <div className={styles.directory} onClick={() => this.setState((state) => ({ open: !state.open }))}>
          <Icon width={14} height={14} name={this.state.open ? 'folder-outline' : 'folder-solid'} fill='#ffffff' />
          {this.props.name}
        </div>
      );
    }

    let content = null;
    if (this.state.open) {
      let dirs = {};
      let files = [];
      this.props.files.forEach((f) => {
        let folderEnd = f.indexOf('/');
        if (folderEnd > -1) {
          let folder = f.substr(0, folderEnd);
          if (!dirs[folder]) {
            dirs[folder] = [];
          }
          dirs[folder].push(f.substr(folderEnd + 1));
        } else {
          files.push(f);
        }
      });
      let folders = Object.keys(dirs);
      folders.sort();
      content = (
        <div className={styles.contents}>
          {folders.map((f) => (
            <FileTree
              key={'dir_' + f}
              name={f}
              files={dirs[f]}
              prefix={this.props.name ? this.props.prefix + this.props.name + '/' : ''}
              linkPrefix={this.props.linkPrefix}
              current={this.props.current}/>
          ))}
          {files.map((f) => {
            let path = (this.props.name ? this.props.prefix + this.props.name + '/' : '') + f;
            let isCurrent = this.props.current === path;
            return (
              <Link
                key={'f_' + f}
                className={[styles.file, isCurrent ? styles.current : ''].join(' ')}
                to={{ pathname: this.props.linkPrefix + path }}>
                {f}
              </Link>
            );
          })}
        </div>
      );
    }

    return (
      <div>
        {dir}
        {content}
      </div>
    );
  }
}
