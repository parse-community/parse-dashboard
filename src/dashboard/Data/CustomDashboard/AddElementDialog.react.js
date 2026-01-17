/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from 'react';
import Modal from 'components/Modal/Modal.react';
import Icon from 'components/Icon/Icon.react';
import styles from './AddElementDialog.scss';

const elementTypes = [
  {
    type: 'staticText',
    icon: 'edit-solid',
    title: 'Static Text',
    description: 'Add text with custom formatting',
  },
  {
    type: 'graph',
    icon: 'chart-line',
    title: 'Graph',
    description: 'Display a saved graph from the data browser',
  },
  {
    type: 'dataTable',
    icon: 'table',
    title: 'Data Table',
    description: 'Show filtered data in a table format',
  },
];

const AddElementDialog = ({ onClose, onSelectType }) => {
  return (
    <Modal
      type={Modal.Types.INFO}
      title="Add Element"
      subtitle="Choose an element type to add to your dashboard"
      onCancel={onClose}
      showCancel={true}
      cancelText="Cancel"
      onConfirm={onClose}
      confirmText="Cancel"
      customFooter={<div className={styles.footer} />}
    >
      <div className={styles.elementTypes}>
        {elementTypes.map(({ type, icon, title, description }) => (
          <button
            key={type}
            type="button"
            className={styles.elementTypeButton}
            onClick={() => onSelectType(type)}
          >
            <div className={styles.elementIcon}>
              <Icon name={icon} width={32} height={32} fill="#0e7490" />
            </div>
            <div className={styles.elementInfo}>
              <div className={styles.elementTitle}>{title}</div>
              <div className={styles.elementDescription}>{description}</div>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default AddElementDialog;
