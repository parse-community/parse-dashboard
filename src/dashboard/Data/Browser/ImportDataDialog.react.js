/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Modal from 'components/Modal/Modal.react';
import React from 'react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Option from 'components/Dropdown/Option.react';
import Toggle from 'components/Toggle/Toggle.react';
import FileInput from 'components/FileInput/FileInput.react';
import styles from 'dashboard/Data/Browser/ImportDataDialog.scss';

export default class ImportDataDialog extends React.Component {
  constructor() {
    super();

    this.state = {
      file: null,
      fileError: null,
      preserveObjectIds: false,
      preserveTimestamps: false,
      duplicateHandling: 'overwrite',
      unknownColumns: 'auto',
      continueOnError: true,
      importing: false,
      progress: null,
      results: null,
    };
  }

  valid() {
    if (this.state.importing) {
      return false;
    }
    if (this.state.results) {
      return false;
    }
    if (!this.state.file) {
      return false;
    }
    const ext = this.getFileExtension();
    if (ext !== '.json' && ext !== '.csv') {
      return false;
    }
    return true;
  }

  getFileExtension() {
    if (!this.state.file) {
      return null;
    }
    const name = this.state.file.name.toLowerCase();
    if (name.endsWith('.json')) {
      return '.json';
    }
    if (name.endsWith('.csv')) {
      return '.csv';
    }
    return null;
  }

  handleFileChange(file) {
    if (!file) {
      this.setState({ file: null, fileError: null });
      return;
    }
    const name = file.name.toLowerCase();
    if (!name.endsWith('.json') && !name.endsWith('.csv')) {
      this.setState({ file: null, fileError: 'Only .json and .csv files are supported.' });
      return;
    }
    this.setState({ file, fileError: null });
  }

  handleConfirm() {
    const file = this.state.file;
    if (!file) {
      return;
    }
    this.setState({ importing: true, progress: null, fileError: null });
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const fileType = this.getFileExtension();
      this.props.onConfirm({
        content,
        fileType,
        preserveObjectIds: this.state.preserveObjectIds,
        preserveTimestamps: this.state.preserveTimestamps,
        duplicateHandling: this.state.duplicateHandling,
        unknownColumns: this.state.unknownColumns,
        continueOnError: this.state.continueOnError,
      });
    };
    reader.onerror = () => {
      this.setState({
        importing: false,
        fileError: 'Failed to read the selected file. Please try again.',
      });
    };
    reader.readAsText(file);
  }

  setImporting() {
    this.setState({ importing: true, progress: null, results: null });
  }

  resetForm() {
    this.setState({ importing: false, progress: null, results: null });
  }

  setProgress(progress) {
    this.setState({ progress });
  }

  setResults(results) {
    this.setState({ importing: false, results });
  }

  formatBytes(bytes) {
    if (!+bytes) {
      return '0 Bytes';
    }

    const k = 1024;
    const decimals = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }

  renderForm() {
    const hasMaintenanceKey = !!this.props.maintenanceKey;

    return (
      <>
        <Field
          label={<Label text="Select file" />}
          input={
            <FileInput
              value={this.state.file}
              onChange={file => this.handleFileChange(file)}
              accept=".json,.csv"
              buttonText={this.state.file ? this.state.file.name : undefined}
            />
          }
        />
        {this.state.fileError && (
          <div className={styles.error}>{this.state.fileError}</div>
        )}
        {this.state.file && (
          <div className={styles.fileInfo}>
            Format: {this.getFileExtension()} &middot; Size: {this.formatBytes(this.state.file.size)}
          </div>
        )}
        <Field
          label={<Label text="Preserve object IDs" description="Use the objectId values from the import file instead of generating new ones." />}
          input={
            <Toggle
              value={this.state.preserveObjectIds}
              type={Toggle.Types.YES_NO}
              onChange={preserveObjectIds => this.setState({ preserveObjectIds })}
            />
          }
        />
        {!this.state.preserveObjectIds && (
          <div className={styles.warning}>
            Pointer and Relation fields that reference objectIds in this file will not resolve correctly if new objectIds are generated.
          </div>
        )}
        <Field
          label={<Label text="Preserve timestamps" description="Use the createdAt and updatedAt values from the import file." />}
          input={
            hasMaintenanceKey ? (
              <Toggle
                value={this.state.preserveTimestamps}
                type={Toggle.Types.YES_NO}
                onChange={preserveTimestamps => this.setState({ preserveTimestamps })}
              />
            ) : (
              <div className={styles.disabledToggle}>
                <Toggle
                  value={false}
                  type={Toggle.Types.YES_NO}
                  onChange={() => {}}
                />
              </div>
            )
          }
        />
        {!hasMaintenanceKey && (
          <div className={styles.tooltip}>
            Requires a maintenanceKey to be configured in the dashboard.
          </div>
        )}
        {this.state.preserveObjectIds && (
          <Field
            label={<Label text="Duplicate handling" description="How to handle rows whose objectId already exists in the class." />}
            input={
              <Dropdown
                fixed={true}
                value={this.state.duplicateHandling}
                onChange={duplicateHandling => this.setState({ duplicateHandling })}
              >
                <Option value="overwrite">Overwrite existing</Option>
                <Option value="skip">Skip duplicates</Option>
                <Option value="fail">Fail on duplicate</Option>
              </Dropdown>
            }
          />
        )}
        <Field
          label={<Label text="Unknown columns" description="How to handle columns in the file that do not exist in the class schema." />}
          input={
            <Dropdown
              fixed={true}
              value={this.state.unknownColumns}
              onChange={unknownColumns => this.setState({ unknownColumns })}
            >
              <Option value="auto">Auto-create columns</Option>
              <Option value="ignore">Ignore unknown columns</Option>
              <Option value="fail">Fail on unknown</Option>
            </Dropdown>
          }
        />
        <Field
          label={<Label text="Continue on errors" description="If enabled, rows that fail to import will be skipped and the import will continue." />}
          input={
            <Toggle
              value={this.state.continueOnError}
              type={Toggle.Types.YES_NO}
              onChange={continueOnError => this.setState({ continueOnError })}
            />
          }
        />
      </>
    );
  }

  renderProgress() {
    const { progress } = this.state;
    const percent = progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

    return (
      <div className={styles.row}>
        <Label
          text="Importing..."
          description={
            <span className={styles.label}>
              {progress
                ? `${progress.completed} of ${progress.total} rows (${percent}%)`
                : 'Starting import...'}
            </span>
          }
        />
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  renderResults() {
    const { results } = this.state;
    if (!results) {
      return null;
    }

    return (
      <div className={styles.results}>
        <div className={styles.resultSuccess}>
          Imported: {results.imported}
        </div>
        {results.skipped > 0 && (
          <div className={styles.resultSkip}>
            Skipped: {results.skipped}
          </div>
        )}
        {results.failed > 0 && (
          <div className={styles.resultFail}>
            Failed: {results.failed}
          </div>
        )}
        {results.errors && results.errors.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {results.errors.slice(0, 5).map((err, i) => (
              <div key={i} className={styles.error}>
                Row {err.index + 1}: {err.error}
              </div>
            ))}
            {results.errors.length > 5 && (
              <div className={styles.error}>
                ...and {results.errors.length - 5} more error(s)
              </div>
            )}
          </div>
        )}
        {results.stopped && (
          <div className={styles.warning} style={{ marginTop: 8 }}>
            Import stopped on first error.
          </div>
        )}
      </div>
    );
  }

  render() {
    const { importing, results } = this.state;

    return (
      <Modal
        type={Modal.Types.INFO}
        icon="warn-outline"
        title={`Import into ${this.props.className}`}
        disabled={!results && !this.valid()}
        confirmText={results ? 'Done' : 'Import'}
        showCancel={!results}
        progress={importing}
        onCancel={this.props.onCancel}
        onConfirm={results ? this.props.onCancel : () => this.handleConfirm()}
      >
        {!importing && !results && this.renderForm()}
        {importing && this.renderProgress()}
        {results && this.renderResults()}
      </Modal>
    );
  }
}
