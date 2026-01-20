/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useState, useMemo } from 'react';
import Modal from 'components/Modal/Modal.react';
import Icon from 'components/Icon/Icon.react';
import styles from './LoadCanvasDialog.scss';

const LoadCanvasDialog = ({ canvases, onClose, onLoad, onDelete, onToggleFavorite }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

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

  const handleToggleFavorite = (e, canvasId) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(canvasId);
    }
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Group canvases by their group property
  const { groupedCanvases, ungroupedCanvases, groupNames } = useMemo(() => {
    const grouped = {};
    const ungrouped = [];

    canvases.forEach(canvas => {
      if (canvas.group) {
        if (!grouped[canvas.group]) {
          grouped[canvas.group] = [];
        }
        grouped[canvas.group].push(canvas);
      } else {
        ungrouped.push(canvas);
      }
    });

    // Sort canvases within each group
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    ungrouped.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Sort group names
    const sortedGroupNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    return {
      groupedCanvases: grouped,
      ungroupedCanvases: ungrouped,
      groupNames: sortedGroupNames
    };
  }, [canvases]);

  const renderCanvasItem = (canvas) => (
    <div
      key={canvas.id}
      className={`${styles.canvasItem} ${selectedId === canvas.id ? styles.selected : ''}`}
      onClick={() => setSelectedId(canvas.id)}
      onDoubleClick={() => onLoad(canvas)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (selectedId === canvas.id) {
            onLoad(canvas);
          } else {
            setSelectedId(canvas.id);
          }
        } else if (e.key === ' ') {
          e.preventDefault();
          setSelectedId(canvas.id);
        }
      }}
      role="button"
      tabIndex={0}
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
          <>
            <button
              type="button"
              className={`${styles.favoriteButton} ${canvas.favorite ? styles.favorited : ''}`}
              onClick={(e) => handleToggleFavorite(e, canvas.id)}
              title={canvas.favorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={canvas.favorite ? `Remove ${canvas.name || 'Untitled Canvas'} from favorites` : `Add ${canvas.name || 'Untitled Canvas'} to favorites`}
            >
              <Icon name="star-solid" width={22} height={22} fill={canvas.favorite ? '#f59e0b' : '#94a3b8'} />
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={(e) => handleDeleteClick(e, canvas.id)}
              title="Delete canvas"
              aria-label={`Delete canvas ${canvas.name || 'Untitled Canvas'}`}
            >
              <Icon name="trash-solid" width={18} height={18} fill="#94a3b8" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderGroup = (groupName) => {
    const isExpanded = expandedGroups[groupName];
    const groupCanvases = groupedCanvases[groupName];

    return (
      <div key={groupName} className={styles.group}>
        <button
          type="button"
          className={styles.groupHeader}
          onClick={() => toggleGroup(groupName)}
          aria-expanded={isExpanded}
        >
          <span
            className={styles.groupArrow}
            style={{ transform: isExpanded ? 'scaleY(-1)' : 'scaleY(1)' }}
          />
          <span className={styles.groupName}>{groupName}</span>
          <span className={styles.groupCount}>({groupCanvases.length})</span>
        </button>
        {isExpanded && (
          <div className={styles.groupContent}>
            {groupCanvases.map(renderCanvasItem)}
          </div>
        )}
      </div>
    );
  };

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
          {groupNames.map(renderGroup)}
          {ungroupedCanvases.length > 0 && groupNames.length > 0 && (
            <div className={styles.ungroupedSection}>
              <div className={styles.ungroupedLabel}>Ungrouped</div>
            </div>
          )}
          {ungroupedCanvases.length > 0 && (
            <div className={styles.ungroupedContent}>
              {ungroupedCanvases.map(renderCanvasItem)}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default LoadCanvasDialog;
