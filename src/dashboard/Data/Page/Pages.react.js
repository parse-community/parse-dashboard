/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CategoryList from 'components/CategoryList/CategoryList.react';
import DashboardView from 'dashboard/DashboardView.react';
import React from 'react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import ReleaseInfo   from 'components/ReleaseInfo/ReleaseInfo';

import styles from './Page.scss';

let subsections = {
    'add_new': 'Add New',
    'all_pages': 'All Pages'
};

export default class Page extends DashboardView {
    constructor() {
        super();
        this.section = 'Core';
        this.subsection = 'Pages';

        this.state = {
            release: undefined
        };
    }

    renderSidebar() {
        let current = this.props.params.type || '';
        return (
            <CategoryList current={current} linkPrefix={'pages/'} categories={[
                { name: 'Add New', id: 'add_new' },
                { name: 'All Pages', id: 'all_pages' }
            ]} />
        );
    }

    renderContent() {
        let toolbar = null;
        if (subsections[this.props.params.type]) {
            toolbar = (
                <Toolbar
                    section='Pages'
                    subsection={subsections[this.props.params.type]}
                    details={ReleaseInfo({ release: this.state.release })}>
                </Toolbar>
            );
        }
        let content = null;
        content = (
            <div className={styles.empty}>
                Pages Content
            </div>
        )
        return (
            <div className={styles.page}>
                {content}
                {toolbar}
            </div>
        );
    }
}
