/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Modal        from 'components/Modal/Modal.react';
import React        from 'react';
import labelStyles  from 'components/Label/Label.scss';
import styles       from 'dashboard/Data/Browser/ExecuteScriptDialog.scss';

export default class ExecuteScriptDialog extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal
        type={this.props.type === 'info' ? Modal.Types.INFO : Modal.Types.DANGER}
        icon="warn-outline"
        title={this.props.scriptName}
        subtitle="Confirm that you want to run this script."
        confirmText="Continue"
        cancelText="Cancel"
        onCancel={this.props.onCancel}
        onConfirm={this.props.onConfirm}
      >
        <div className={[labelStyles.label, labelStyles.text, styles.action].join(' ')}>
          {`Do you want to run script "${this.props.scriptName}" on "${this.props.className}" object "${this.props.objectId}"?`}
        </div>
      </Modal>
    );
  }
}
