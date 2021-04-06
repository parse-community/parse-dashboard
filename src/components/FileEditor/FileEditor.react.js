/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import hasAncestor from 'lib/hasAncestor';
import Parse from 'parse';
import React from 'react';
import styles from 'components/FileEditor/FileEditor.scss';

export default class FileEditor extends React.Component {
  constructor(props) {
    super();

    this.state = {
      value: props.value
    };

    this.checkExternalClick = this.checkExternalClick.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.inputRef = React.createRef();
    this.fileInputRef = React.createRef();
  }

  componentDidMount() {
    document.body.addEventListener('click', this.checkExternalClick);
    document.body.addEventListener('keypress', this.handleKey);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.checkExternalClick);
    document.body.removeEventListener('keypress', this.handleKey);
  }

  checkExternalClick(e) {
    const { onCancel } = this.props;
    if (!hasAncestor(e.target, this.inputRef.current) && onCancel) {
      onCancel();
    }
  }

  handleKey(e) {
    const { onCancel } = this.props;
    if (e.keyCode === 13 && onCancel) {
      onCancel();
    }
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  removeFile() {
    this.fileInputRef.current.value = '';
    this.props.onCommit(undefined);
  }

  async handleChange(e) {
    let file = e.target.files[0];
    if (file) {
      let base64 = await this.getBase64(file);
      this.props.onCommit(new Parse.File(file.name, { base64 }));
    }
  }

  render() {
    const file = this.props.value;
    return (
      <div ref={this.inputRef} style={{ minWidth: this.props.width }} className={styles.editor}>
        {file && file.url() ? <a href={file.url()} target='_blank' rel='noreferrer' role='button' className={styles.download}>Download</a> : null}
        <a className={styles.upload}>
          <input ref={this.fileInputRef} type='file' onChange={this.handleChange} />
          <span>{file ? 'Replace file' : 'Upload file'}</span>
        </a>
        {file ? <a href='javascript:;' role='button' className={styles.delete} onClick={this.removeFile}>Delete</a> : null}
      </div>
    );
  }
}
