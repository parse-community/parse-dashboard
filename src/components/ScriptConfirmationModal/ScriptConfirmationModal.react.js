/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Modal from 'components/Modal/Modal.react';
import labelStyles from 'components/Label/Label.scss';
import browserCellStyles from 'components/BrowserCell/BrowserCell.scss';

/**
 * Confirmation dialog for executing scripts
 */
export default function ScriptConfirmationModal({ script, onConfirm, onCancel }) {
  if (!script) {
    return null;
  }

  return (
    <Modal
      type={script.confirmationDialogStyle === 'critical' ? Modal.Types.DANGER : Modal.Types.INFO}
      icon="warn-outline"
      title={script.title}
      confirmText="Continue"
      cancelText="Cancel"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <div className={[labelStyles.label, labelStyles.text, browserCellStyles.action].join(' ')}>
        {`Do you want to run script "${script.title}" on "${script.className}" object "${script.objectId}"?`}
      </div>
    </Modal>
  );
}
