/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useState } from 'react';
import Modal from 'components/Modal/Modal.react';
import Icon from 'components/Icon/Icon.react';
import styles from './LoadCanvasDialog.scss';

const LoadCanvasDialog = ({ canvases, onClose, onLoad, onDelete }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleLoad = () => {
    if (!selectedId) {
      return;
    }
    const canvas = canvases.find(c => c.id === selectedId);
    if (canvas) {
      onLoad(canvas);
    }
  };

  const handleDeleteClick = (e, canvasId) => {
    e.stopPropagation();
    setConfirmDelete(canvasId);
  };

  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(confirmDelete);
      setConfirmDelete(null);
      if (selectedId === confirmDelete) {
        setSelectedId(null);
      }
    }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(null);
  };

  const sortedCanvases = [...canvases].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

  return (
    <Modal
      type={Modal.Types.INFO}
      icon="canvas-outline"
      title="Load Canvas"
      subtitle="Select a saved canvas to load"
      onCancel={onClose}
      onConfirm={handleLoad}
      confirmText="Load"
      cancelText="Cancel"
      disabled={!selectedId}
    >
      {canvases.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon name="canvas-outline" width={48} height={48} fill="#94a3b8" />
          <p>No saved canvases found</p>
          <p className={styles.emptyHint}>Save your current canvas to see it here</p>
        </div>
      ) : (
        <div className={styles.canvasList}>
          {sortedCanvases.map(canvas => (
            <div
              key={canvas.id}
              className={`${styles.canvasItem} ${selectedId === canvas.id ? styles.selected : ''}`}
              onClick={() => setSelectedId(canvas.id)}
            >
              <div className={styles.canvasInfo}>
                <div className={styles.canvasName}>{canvas.name || 'Untitled Canvas'}</div>
                <div className={styles.canvasDetails}>
                  {canvas.elements?.length || 0} element{(canvas.elements?.length || 0) !== 1 ? 's' : ''}
                </div>
              </div>
              <div className={styles.canvasActions}>
                {confirmDelete === canvas.id ? (
                  <div className={styles.confirmDelete}>
                    <span>Delete?</span>
                    <button
                      type="button"
                      className={styles.confirmYes}
                      onClick={handleConfirmDelete}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={styles.confirmNo}
                      onClick={handleCancelDelete}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteClick(e, canvas.id)}
                    title="Delete canvas"
                  >
                    <Icon name="trash-solid" width={14} height={14} fill="#94a3b8" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default LoadCanvasDialog;
