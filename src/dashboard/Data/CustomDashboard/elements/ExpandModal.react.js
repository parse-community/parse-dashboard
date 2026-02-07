/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from 'components/Icon/Icon.react';
import styles from './ExpandModal.scss';

const ExpandModal = ({ title, children, onClose }) => {
  const [container] = useState(() => {
    const el = document.createElement('div');
    el.className = styles.portalContainer;
    return el;
  });

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.appendChild(container);
    // Use capture phase to handle event before it reaches other listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, [container, handleKeyDown]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={handleContentClick}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{title}</span>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            <Icon name="x-outline" width={16} height={16} fill="#64748b" />
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>,
    container
  );
};

export default ExpandModal;
