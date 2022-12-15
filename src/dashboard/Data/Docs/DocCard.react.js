import React from 'react';
import styles from 'dashboard/Data/Docs/DocCard.scss';

export default class DocCard extends React.Component {
    constructor(props) {
        super();

        this.state = {
            value: !!props.value
        };
    }

    render() {
        return (
            <div className={styles.DocCard}>
                <h2>{this.props.title}</h2>
                {this.props.children}
            </div>
        );
    }
}
