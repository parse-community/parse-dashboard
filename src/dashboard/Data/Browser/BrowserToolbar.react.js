/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import BrowserFilter  from 'components/BrowserFilter/BrowserFilter.react';
import BrowserMenu    from 'components/BrowserMenu/BrowserMenu.react';
import Icon           from 'components/Icon/Icon.react';
import MenuItem       from 'components/BrowserMenu/MenuItem.react';
import prettyNumber   from 'lib/prettyNumber';
import React          from 'react';
import SecurityDialog from 'dashboard/Data/Browser/SecurityDialog.react';
import Separator      from 'components/BrowserMenu/Separator.react';
import styles         from 'dashboard/Data/Browser/Browser.scss';
import Toolbar        from 'components/Toolbar/Toolbar.react';

let BrowserToolbar = ({
  className,
  classNameForPermissionsEditor,
  count,
  perms,
  schema,
  userPointers,
  filters,
  selection,
  relation,
  setCurrent,
  onFilterChange,
  onAddColumn,
  onAddRow,
  onAddClass,
  onExport,
  onRemoveColumn,
  onDeleteRows,
  onDropClass,
  onChangeCLP,
  hidePerms,

  enableDeleteAllRows,
  enableExportClass,
  enableSecurityDialog,
}) => {
  let selectionLength = Object.keys(selection).length;
  let details = [];
  if (count !== undefined) {
      if (count === 1) {
        details.push('1 object');
      } else {
        details.push(prettyNumber(count) + ' objects');
      }
  }

  if (!relation) {    
    if (perms && !hidePerms) {
      let read = perms.get && perms.find && perms.get['*'] && perms.find['*'];
      let write = perms.create && perms.update && perms.delete && perms.create['*'] && perms.update['*'] && perms.delete['*'];
      if (read && write) {
        details.push('Public Read and Write enabled');
      } else if (read) {
        details.push('Public Read enabled');
      } else if (write) {
        details.push('Public Write enabled');
      }
    }
  }
  let menu = null;
  if (relation) {
    menu = (
      <BrowserMenu title='Edit' icon='edit-solid'>
        <MenuItem
          disabled={selectionLength === 0}
          text={selectionLength === 1 && !selection['*'] ? 'Remove this row' : 'Remove these rows'}
          onClick={() => onDeleteRows(selection)} />
      </BrowserMenu>
    );
  } else {
    menu = (
      <BrowserMenu title='Edit' icon='edit-solid'>
        <MenuItem text='Add a row' onClick={onAddRow} />
        <MenuItem text='Add a column' onClick={onAddColumn} />
        <MenuItem text='Add a class' onClick={onAddClass} />
        <Separator />
        <MenuItem
          disabled={selectionLength === 0}
          text={selectionLength === 1 && !selection['*'] ? 'Delete this row' : 'Delete these rows'}
          onClick={() => onDeleteRows(selection)} />
        <MenuItem text='Delete a column' onClick={onRemoveColumn} />
        {enableDeleteAllRows ? <MenuItem text='Delete all rows' onClick={() => onDeleteRows({ '*': true })} /> : <noscript />}
        <MenuItem text='Delete this class' onClick={onDropClass} />
        {enableExportClass ? <Separator /> : <noscript />}
        {enableExportClass ? <MenuItem text='Export this data' onClick={onExport} /> : <noscript />}
      </BrowserMenu>
    );
  }

  let subsection = className;
  if (relation) {
    subsection = `'${relation.key}' on ${relation.parent.id}`;
  } else if (subsection.length > 30) {
    subsection = subsection.substr(0, 30) + '\u2026';
  }
  return (
    <Toolbar
      section={relation ? `Relation <${relation.targetClassName}>` : 'Class'}
      subsection={subsection}
      details={details.join(' \u2022 ')}>
      <BrowserFilter
        setCurrent={setCurrent}
        schema={schema}
        filters={filters}
        onChange={onFilterChange} />
      <div className={styles.toolbarSeparator} />
      {enableSecurityDialog ? <SecurityDialog
        setCurrent={setCurrent}
        disabled={!!relation}
        perms={perms}
        className={classNameForPermissionsEditor}
        onChangeCLP={onChangeCLP}
        userPointers={userPointers} /> : <noscript />}
      {enableSecurityDialog ? <div className={styles.toolbarSeparator} /> : <noscript/>}
      {menu}
    </Toolbar>
  );
};

export default BrowserToolbar;
