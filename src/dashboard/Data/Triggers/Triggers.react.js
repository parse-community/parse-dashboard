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

import styles from './Triggers.scss';

let subsections = {
    'add_new': 'Add New',
    'all_triggers': 'All Triggers'
};

export default class Page extends DashboardView {
    constructor() {
        super();
        this.section = 'Core';
        this.subsection = 'Triggers';

        this.state = {
            release: undefined
        };
    }

    renderSidebar() {
        let current = this.props.params.type || '';
        return (
            <CategoryList current={current} linkPrefix={'triggers/'} categories={[
                { name: 'Add New', id: 'add_new' },
                { name: 'All Triggers', id: 'all_triggers' }
            ]} />
        );
    }

    renderContent() {
        let toolbar = null;
        if (subsections[this.props.params.type]) {
            toolbar = (
                <Toolbar
                    section='Triggers'
                    subsection={subsections[this.props.params.type]}
                    details={ReleaseInfo({ release: this.state.release })}>
                </Toolbar>
            );
        }
        let content = null;
        content = (
            <div className={styles.empty}>
                Triggers Content
            </div>
        )
        return (
            <div className={styles.triggers}>
                {content}
                {toolbar}
            </div>
        );
    }
}
