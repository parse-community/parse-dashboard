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
import Button         from 'components/Button/Button.react'
import VideoTutorialButton from 'components/VideoTutorialButton/VideoTutorialButton.react';

const apiDocsButtonStyle = {
  display: 'inline-block',
  height: 20,
  border: '1px solid #169cee',
  lineHeight: '20px',
  outline: 0,
  textDecoration: 'none',
  textAlign: 'center',
  borderRadius: '5px',
  cursor: 'pointer',
  width: 90,
  padding: '0 5px',
  fontSize: '12px',
  fontWeight: 'bold',
  marginBottom: 4,
}

let B4ABrowserToolbar = ({
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
    onAttachRows,
    onAttachSelectedRows,
    onImport,
    onImportRelation,
    onExport,
    onRemoveColumn,
    onDeleteRows,
    onDropClass,
    onChangeCLP,
    onRefresh,
    hidePerms,

    enableDeleteAllRows,
    enableImport,
    enableExportClass,
    enableSecurityDialog,

    applicationId
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
          text={`Create ${relation.targetClassName} and attach`}
          onClick={onAddRow}
        />
        <MenuItem
          text="Attach existing row"
          onClick={onAttachRows}
        />
        <Separator />
        <MenuItem
          disabled={selectionLength === 0}
          text={selectionLength === 1 && !selection['*'] ? 'Detach this row' : 'Detach these rows'}
          onClick={() => onDeleteRows(selection)}
        />
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
          disabled={!selectionLength}
          text={`Attach ${selectionLength <= 1 ? 'this row' : 'these rows'} to relation`}
          onClick={onAttachSelectedRows}
        />
        <Separator />
        <MenuItem
          disabled={selectionLength === 0}
          text={selectionLength === 1 && !selection['*'] ? 'Delete this row' : 'Delete these rows'}
          onClick={() => onDeleteRows(selection)} />
        <MenuItem text='Delete a column' onClick={onRemoveColumn} />
        {enableDeleteAllRows ? <MenuItem text='Delete all rows' onClick={() => onDeleteRows({ '*': true })} /> : <noscript />}
        <MenuItem text='Delete this class' onClick={onDropClass} />
        {enableImport || enableExportClass ? <Separator /> : <noscript />}
        {enableImport ? <MenuItem text='Import data' onClick={onImport} /> : <noscript />}
        {enableImport ? <MenuItem text='Import relation data' onClick={onImportRelation} /> : <noscript />}
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

  // variables used to define an API reference button on browser toolbar
  let classApiId = ''
  let apiDocsButton = ''
  let isCustomCLass = classNameForPermissionsEditor && classNameForPermissionsEditor.indexOf('_') === -1

  if (className && (className === 'User' || isCustomCLass)) {
    // set classApiId taking into count the User class special condition
    classApiId = `#${className === 'User' ? 'user-api' : `${className}-custom-class`}`
    apiDocsButton = <Button value='API Reference'
      primary={true}
      width='90px'
      additionalStyles={apiDocsButtonStyle}
      onClick={() => {
        back4AppNavigation && back4AppNavigation.atApiReferenceClassesEvent()
        window.open(`${b4aSettings.DASHBOARD_PATH}/apidocs/${applicationId}${classApiId}`, '_blank')
      }}
    />
  }
  // TODO: Set the videoTutorialUrl
  const videoTutorialUrl = 'https://youtu.be/0Ym9-BHI8Fg';
  const helpsection = (
    <span className="toolbar-help-section">
      {apiDocsButton}
      <VideoTutorialButton url={videoTutorialUrl} additionalStyles={ { marginLeft: '8px', marginBottom: '4px' } } />
    </span>
  );

  return (
    <Toolbar
      relation={relation}
      filters={filters}
      section={relation ? `Relation <${relation.targetClassName}>` : `Class | ${details.join(' \u2022 ')}`}
      subsection={subsection}
      details={relation ? details.join(' \u2022 ') : ''}
      helpsection={helpsection}>
      <a className={styles.toolbarButton} onClick={onAddRow}>
        <Icon name='plus-solid' width={14} height={14} />
        <span>Add Row</span>
      </a>
      <div className={styles.toolbarSeparator} />
      <a className={styles.toolbarButton} onClick={onRefresh}>
        <Icon name='refresh-solid' width={14} height={14} />
        <span>Refresh</span>
      </a>
      <div className={styles.toolbarSeparator} />
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

export default B4ABrowserToolbar;
