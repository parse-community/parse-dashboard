/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useState, useMemo } from 'react';
import Modal from 'components/Modal/Modal.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import TextInput from 'components/TextInput/TextInput.react';

const ViewConfigDialog = ({
  initialConfig,
  availableViews,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialConfig?.title || '');
  const [viewId, setViewId] = useState(initialConfig?.viewId || '');

  const sortedViews = useMemo(() => {
    return [...availableViews].sort((a, b) => a.name.localeCompare(b.name));
  }, [availableViews]);

  const selectedView = useMemo(() => {
    return availableViews.find(v => v.id === viewId);
  }, [availableViews, viewId]);

  const handleSave = () => {
    if (!viewId || !selectedView) {
      return;
    }

    onSave({
      title: title.trim() || null,
      viewId,
      viewName: selectedView.name,
      className: selectedView.className,
      cloudFunction: selectedView.cloudFunction || null,
      query: selectedView.query || null,
    });
  };

  const isValid = viewId && selectedView;

  return (
    <Modal
      type={Modal.Types.INFO}
      icon="visibility"
      title={initialConfig ? 'Edit View' : 'Add View'}
      subtitle="Configure the view to display"
      onCancel={onClose}
      onConfirm={handleSave}
      confirmText="Save"
      cancelText="Cancel"
      disabled={!isValid}
    >
      {availableViews.length === 0 ? (
        <Field
          label={<Label text="No Views Available" />}
          input={
            <div style={{ padding: '20px', color: '#94a3b8' }}>
              No views found. Create a view in the Views section first.
            </div>
          }
        />
      ) : (
        <>
          <Field
            label={<Label text="Title (Optional)" description="Display title for the view" />}
            input={
              <TextInput
                value={title}
                onChange={setTitle}
                placeholder="Enter a title..."
              />
            }
          />
          <Field
            label={<Label text="View" description="Select the view to display" />}
            input={
              <Dropdown
                value={viewId}
                onChange={setViewId}
                placeHolder="Select a view..."
              >
                {sortedViews.map(v => (
                  <Option key={v.id} value={v.id}>
                    {v.name}
                    {v.className ? ` (${v.className})` : ''}
                    {v.cloudFunction ? ' [Cloud Function]' : ''}
                  </Option>
                ))}
              </Dropdown>
            }
          />
          {selectedView && (
            <Field
              label={<Label text="View Details" description="Information about the selected view" />}
              input={
                <div style={{ padding: '12px', backgroundColor: '#f4f5f7', borderRadius: '4px', fontSize: '12px', color: '#666666' }}>
                  {selectedView.cloudFunction ? (
                    <div>Cloud Function: <strong>{selectedView.cloudFunction}</strong></div>
                  ) : (
                    <>
                      <div>Class: <strong>{selectedView.className}</strong></div>
                      {selectedView.query && (
                        <div style={{ marginTop: '4px' }}>Aggregation Pipeline: <strong>{selectedView.query.length} stage(s)</strong></div>
                      )}
                    </>
                  )}
                </div>
              }
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default ViewConfigDialog;
