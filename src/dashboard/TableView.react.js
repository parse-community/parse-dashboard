/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import DashboardView   from 'dashboard/DashboardView.react';
import LoaderContainer from 'components/LoaderContainer/LoaderContainer.react';
import React           from 'react';
import styles          from 'dashboard/TableView.scss';

export default class TableView extends DashboardView {
  columnWidths(keys) {
    let equalWidth = 100 / keys.length + '%';
    let widths = {};
    // leave the last key undefined, so it fills the remaining space
    for (let i = 0; i < keys.length - 1; i++) {
      widths[keys[i]] = equalWidth;
    }
    return widths;
  }

  renderFooter() {
    return null;
  }

  renderContent() {
    let toolbar = this.renderToolbar();
    let data = this.tableData();
    let footer = this.renderFooter();
    let content = null;
    let headers = null;
    if (data !== undefined) {
      if (!Array.isArray(data)) {
        console.warn('tableData() needs to return an array of objects');
      } else {
        if (data.length === 0) {
          content = <div className={styles.empty}>{this.renderEmpty()}</div>;
        } else {
          content = (
            <div className={styles.rows}>
              <table>
                <tbody>
                  {data.map((row) => this.renderRow(row))}
                </tbody>
              </table>
              {footer}
            </div>
          );
          headers = this.renderHeaders();
        }
      }
    }
    let extras = this.renderExtras ? this.renderExtras() : null;
    let loading = this.state ? this.state.loading : false;
    return (
      <div>
        <LoaderContainer loading={loading}>
          <div className={styles.content}>{content}</div>
        </LoaderContainer>
        {toolbar}
        <div className={styles.headers}>{headers}</div>
        {extras}
      </div>
    );
  }
}
