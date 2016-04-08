/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button     from 'components/Button/Button.react';
import Checkbox   from 'components/Checkbox/Checkbox.react';
import Icon       from 'components/Icon/Icon.react';
import { Map }    from 'immutable';
import Pill       from 'components/Pill/Pill.react';
import Popover    from 'components/Popover/Popover.react';
import Position   from 'lib/Position';
import React      from 'react';
import SliderWrap from 'components/SliderWrap/SliderWrap.react';
import styles     from 'components/PermissionsDialog/PermissionsDialog.scss';
import Toggle     from 'components/Toggle/Toggle.react';
import {
  unselectable,
  verticalCenter
}                 from 'stylesheets/base.scss';

let origin = new Position(0, 0);

function renderAdvancedCheckboxes(rowId, perms, advanced, onChange) {
  let get = perms.get('get').get(rowId) || perms.get('get').get('*');
  let find = perms.get('find').get(rowId) || perms.get('find').get('*');

  let create = perms.get('create').get(rowId) || perms.get('create').get('*');
  let update = perms.get('update').get(rowId) || perms.get('update').get('*');
  let del = perms.get('delete').get(rowId) || perms.get('delete').get('*');

  let add = perms.get('addField').get(rowId) || perms.get('addField').get('*');

  if (advanced) {
    return [
      <div key='second' className={[styles.check, styles.second].join(' ')}>
        {!perms.get('get').get('*') || rowId === '*' ?
          <Checkbox
            label='Get'
            checked={perms.get('get').get(rowId)}
            onChange={(value) => onChange(rowId, 'get', value)} /> :
          <Icon name='check' width={20} height={20} />}
      </div>,
      <div key='third' className={[styles.check, styles.third].join(' ')}>
        {!perms.get('find').get('*') || rowId === '*' ?
          <Checkbox
            label='Find'
            checked={perms.get('find').get(rowId)}
            onChange={(value) => onChange(rowId, 'find', value)} /> :
          <Icon name='check' width={20} height={20} />}
      </div>,
      <div key='fourth' className={[styles.check, styles.fourth].join(' ')}>
        {!perms.get('create').get('*') || rowId === '*' ?
          <Checkbox
            label='Create'
            checked={perms.get('create').get(rowId)}
            onChange={(value) => onChange(rowId, 'create', value)} /> :
          <Icon name='check' width={20} height={20} />}
      </div>,
      <div key='fifth' className={[styles.check, styles.fifth].join(' ')}>
        {!perms.get('update').get('*') || rowId === '*' ?
          <Checkbox
            label='Update'
            checked={perms.get('update').get(rowId)}
            onChange={(value) => onChange(rowId, 'update', value)} /> :
          <Icon name='check' width={20} height={20} />}
      </div>,
      <div key='sixth' className={[styles.check, styles.sixth].join(' ')}>
        {!perms.get('delete').get('*') || rowId === '*' ?
          <Checkbox
            label='Delete'
            checked={perms.get('delete').get(rowId)}
            onChange={(value) => onChange(rowId, 'delete', value)} /> :
          <Icon name='check' width={20} height={20} />}
      </div>,
      <div key='seventh' className={[styles.check, styles.seventh].join(' ')}>
        {!perms.get('addField').get('*') || rowId === '*' ?
          <Checkbox
            label='Add field'
            checked={perms.get('addField').get(rowId)}
            onChange={(value) => onChange(rowId, 'addField', value)} /> :
          <Icon name='check' width={20} height={20} />}
      </div>,
    ];
  }

  let read = get || find;
  let write = create || update || del;
  let readChecked = get && find;
  let writeChecked = create && update && del;

  return [
    <div key='second' className={[styles.check, styles.second].join(' ')}>
      {!(perms.get('get').get('*') && perms.get('find').get('*')) || rowId === '*' ?
        <Checkbox
          label='Read'
          checked={readChecked}
          indeterminate={!readChecked && read}
          onChange={(value) => onChange(rowId, ['get', 'find'], value)} /> :
        <Icon name='check' width={20} height={20} />}
    </div>,
    <div key='third' className={[styles.check, styles.third].join(' ')}>
      {!(perms.get('create').get('*') && perms.get('update').get('*') && perms.get('delete').get('*')) || rowId === '*' ?
        <Checkbox
          label='Write'
          checked={writeChecked}
          indeterminate={!writeChecked && write}
          onChange={(value) => onChange(rowId, ['create', 'update', 'delete'], value)} /> :
        <Icon name='check' width={20} height={20} />}
    </div>,
  ];
}

function renderSimpleCheckboxes(rowId, perms, onChange) {
  let readChecked = perms.get('read').get(rowId) || perms.get('read').get('*');
  let writeChecked = perms.get('write').get(rowId) || perms.get('write').get('*');
  return [
    <div key='second' className={[styles.check, styles.second].join(' ')}>
      {!perms.get('read').get('*') || rowId === '*' ?
        <Checkbox
          label='Read'
          checked={readChecked}
          onChange={(value) => onChange(rowId, 'read', value)} /> :
        <Icon name='check' width={20} height={20} />}
    </div>,
    <div key='third' className={[styles.check, styles.third].join(' ')}>
      {!perms.get('write').get('*') || rowId === '*' ?
        <Checkbox
          label='Write'
          checked={writeChecked}
          onChange={(value) => onChange(rowId, 'write', value)} /> :
        <Icon name='check' width={20} height={20} />}
    </div>,
  ];
}

function renderPointerCheckboxes(rowId, publicPerms, pointerPerms, advanced, onChange) {
  let publicRead = publicPerms.get('get').get('*') && publicPerms.get('find').get('*');
  let publicWrite = publicPerms.get('create').get('*') &&
                    publicPerms.get('update').get('*') &&
                    publicPerms.get('delete').get('*') &&
                    publicPerms.get('addField').get('*');

  if (!advanced) {
    return [
      <div key='second' className={[styles.check, styles.second].join(' ')}>
        {!publicRead ?
          <Checkbox
            label='Read'
            checked={pointerPerms.get('read')}
            onChange={(value) => onChange(rowId, 'read', value)} /> :
          <Icon name='check' width={20} height={20} />}
      </div>,
      <div key='third' className={[styles.check, styles.third].join(' ')}>
        {!publicWrite ?
          <Checkbox
            label='Write'
            checked={pointerPerms.get('write')}
            onChange={(value) => onChange(rowId, 'write', value)} /> :
          <Icon name='check' width={20} height={20} />}
      </div>,
    ];
  }
  let cols = [];
  if (publicRead) {
    cols.push(
      <div key='second' className={[styles.check, styles.second].join(' ')}>
        <Icon name='check' width={20} height={20} />
      </div>
    );
    cols.push(
      <div key='third' className={[styles.check, styles.third].join(' ')}>
        <Icon name='check' width={20} height={20} />
      </div>
    );
  } else {
    cols.push(
      <div key='read' className={styles.pointerRead}>
        <div className={styles.checkboxWrap}>
          <Checkbox
            label='Get and Find'
            checked={pointerPerms.get('read')}
            onChange={(value) => onChange(rowId, 'read', value)} />
        </div>
      </div>
    );
  }
  if (publicWrite) {
    cols.push(
      <div key='fourth' className={[styles.check, styles.fourth].join(' ')}>
        <Icon name='check' width={20} height={20} />
      </div>
    );
    cols.push(
      <div key='fifth' className={[styles.check, styles.fifth].join(' ')}>
        <Icon name='check' width={20} height={20} />
      </div>
    );
    cols.push(
      <div key='sixth' className={[styles.check, styles.sixth].join(' ')}>
        <Icon name='check' width={20} height={20} />
      </div>
    );
    cols.push(
      <div key='seventh' className={[styles.check, styles.seventh].join(' ')}>
        <Icon name='check' width={20} height={20} />
      </div>
    );
  } else {
    cols.push(
      <div key='write' className={styles.pointerWrite}>
        <div className={styles.checkboxWrap}>
          <Checkbox
            label='Create, Update, Delete and Add Fields'
            checked={pointerPerms.get('write')}
            onChange={(value) => onChange(rowId, 'write', value)} />
        </div>
      </div>
    );
  }
  return cols;
}

export default class PermissionsDialog extends React.Component {
  constructor({
    enablePointerPermissions = false,
    permissions,
    advanced,
  }) {
    super();

    let uniqueKeys = ['*'];
    let perms = {};
    for (let k in permissions) {
      if (k !== 'readUserFields' && k !== 'writeUserFields') {
        Object.keys(permissions[k]).forEach((key) => {
          if (uniqueKeys.indexOf(key) < 0) {
            uniqueKeys.push(key);
          }
        });
        perms[k] = Map(permissions[k]);
      }
    }
    if (advanced) {
      // Fill any missing fields
      perms.get = perms.get || Map();
      perms.find = perms.find || Map();
      perms.create = perms.create || Map();
      perms.update = perms.update || Map();
      perms.delete = perms.delete || Map();
      perms.addField = perms.addField || Map();
    }

    let pointerPerms = {};
    if (permissions.readUserFields) {
      permissions.readUserFields.forEach((f) => {
        let p = { read: true };
        if (permissions.writeUserFields && permissions.writeUserFields.indexOf(f) > -1) {
          p.write = true;
        }
        pointerPerms[f] = Map(p);
      });
    }
    if (permissions.writeUserFields) {
      permissions.writeUserFields.forEach((f) => {
        if (!pointerPerms[f]) {
          pointerPerms[f] = Map({ write: true });
        }
      });
    }

    this.state = {
      transitioning: false,
      showLevels: false,
      level: 'Simple', // 'Simple' | 'Advanced'

      perms: Map(perms), // Permissions map
      keys: uniqueKeys, // Permissions row order
      pointerPerms: Map(pointerPerms), // Pointer permissions map
      pointers: Object.keys(pointerPerms), // Pointer order

      newEntry: '',
      entryError: null,
      newKeys: [], // Order for new entries
    };
  }

  toggleField(rowId, type, value) {
    this.setState((state) => {
      let perms = state.perms;
      if (Array.isArray(type)) {
        type.forEach((t) => {
          perms = perms.setIn([t, rowId], value);
        });
      } else {
        perms = perms.setIn([type, rowId], value);
      }
      return { perms };
    });
  }

  togglePointer(field, type, value) {
    this.setState((state) => {
      let pointerPerms = state.pointerPerms.setIn([field, type], value);
      return { pointerPerms };
    });
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.checkEntry();
    }
  }

  checkEntry() {
    if (this.state.newEntry === '') {
      return;
    }
    if (this.props.validateEntry) {
      this.props.validateEntry(this.state.newEntry).then((type) => {
        if (type.user || type.role) {
          let id = type.user ? type.user.id : 'role:' + type.role.getName();
          if (this.state.keys.indexOf(id) > -1 || this.state.newKeys.indexOf(id) > -1) {
            return this.setState({
              entryError: 'You already have a row for this object'
            })
          }

          let nextPerms = this.state.perms;
          if (this.props.advanced) {
            nextPerms = nextPerms.setIn(['get', id], true);
            nextPerms = nextPerms.setIn(['find', id], true);
            nextPerms = nextPerms.setIn(['create', id], true);
            nextPerms = nextPerms.setIn(['update', id], true);
            nextPerms = nextPerms.setIn(['delete', id], true);
            nextPerms = nextPerms.setIn(['addField', id], true);
          } else {
            nextPerms = nextPerms.setIn(['read', id], true);
            nextPerms = nextPerms.setIn(['write', id], true);
          }

          let nextKeys = this.state.newKeys.concat([id]);
          return this.setState({
            perms: nextPerms,
            newKeys: nextKeys,
            newEntry: '',
            entryError: null,
          });
        }
        if (type.pointer) {
          let nextPerms = this.state.pointerPerms.set(type.pointer, Map({ read: true, write: true }));
          let nextKeys = this.state.newKeys.concat('pointer:' + type.pointer);

          this.setState({
            pointerPerms: nextPerms,
            newKeys: nextKeys,
            newEntry: '',
            entryError: null,
          });
        }
      }, () => {
        if (this.props.advanced && this.props.enablePointerPermissions) {
          this.setState({
            entryError: 'Role, User or pointer field not found. Enter a valid Role name, Username, User ID or User pointer field name.'
          });
        } else {
          this.setState({
            entryError: 'Role or User not found. Enter a valid Role name, Username, or User ID.'
          });
        }
      })
    }
  }

  deleteRow(key, isPointer) {
    if (isPointer) {
      let index = this.state.pointers.indexOf(key);
      if (index > -1) {
        let filtered = this.state.pointers.concat([]);
        filtered.splice(index, 1);
        return this.setState({
          pointers: filtered,
          pointerPerms: this.state.pointerPerms.delete(key)
        });
      }
      index = this.state.newKeys.indexOf('pointer:' + key);
      if (index > -1) {
        let filtered = this.state.newKeys.concat([]);
        filtered.splice(index, 1);
        return this.setState({
          newKeys: filtered,
          pointerPerms: this.state.pointerPerms.delete(key)
        });
      }
    } else {
      let index = this.state.keys.indexOf(key);
      let newPerms = this.state.perms;
      if (this.props.advanced) {
        newPerms = newPerms
          .deleteIn(['get', key])
          .deleteIn(['find', key])
          .deleteIn(['create', key])
          .deleteIn(['update', key])
          .deleteIn(['delete', key])
          .deleteIn(['addField', key]);
      } else {
        newPerms = newPerms
          .deleteIn(['read', key])
          .deleteIn(['write', key]);
      }
      if (index > -1) {
        let filtered = this.state.keys.concat([]);
        filtered.splice(index, 1);
        return this.setState({
          keys: filtered,
          perms: newPerms
        });
      }
      index = this.state.newKeys.indexOf(key);
      if (index > -1) {
        let filtered = this.state.newKeys.concat([]);
        filtered.splice(index, 1);
        return this.setState({
          newKeys: filtered,
          perms: newPerms
        });
      }
    }
  }

  outputPerms() {
    let output = {};
    let fields = [ 'read', 'write' ];
    if (this.props.advanced) {
      fields = [ 'get', 'find', 'create', 'update', 'delete', 'addField' ];
    }

    fields.forEach((field) => {
      output[field] = {};
      this.state.perms.get(field).forEach((v, k) => {
        if (v) {
          output[field][k] = true;
        }
      });
    });

    let readUserFields = [];
    let writeUserFields = [];
    this.state.pointerPerms.forEach((perms, key) => {
      if (perms.get('read')) {
        readUserFields.push(key);
      }
      if (perms.get('write')) {
        writeUserFields.push(key);
      }
    });
    if (readUserFields.length) {
      output.readUserFields = readUserFields;
    }
    if (writeUserFields.length) {
      output.writeUserFields = writeUserFields;
    }
    return output;
  }

  renderRow(key, forcePointer) {
    let pointer = !!forcePointer;
    let label = <span>{key}</span>;
    if (key.startsWith('role:')) {
      label = <span>{key.substr(5)} (Role)</span>;
    } else if (key.startsWith('pointer:')) {
      pointer = true;
      key = key.substr(8);
    }
    if (pointer) {
      label = <span>{key} <span className={styles.pillHolder}><Pill value='<_User>' /></span></span>;
    }
    let content = null;
    if (!this.state.transitioning) {
      if (pointer) {
        content = renderPointerCheckboxes(
          key,
          this.state.perms,
          this.state.pointerPerms.get(key),
          this.state.level === 'Advanced',
          this.togglePointer.bind(this)
        );
      } else if (this.props.advanced) {
        content = renderAdvancedCheckboxes(
          key,
          this.state.perms,
          this.state.level === 'Advanced',
          this.toggleField.bind(this)
        );
      } else {
        content = renderSimpleCheckboxes(key, this.state.perms, this.toggleField.bind(this));
      }
    }
    let trash = null;
    if (!this.state.transitioning) {
      trash = (
        <div className={styles.delete}>
          <a href='javascript:;' role='button' onClick={this.deleteRow.bind(this, key, pointer)}>
            <Icon name='trash-solid' width={20} height={20} />
          </a>
        </div>
      );
    }
    return (
      <div key={key} className={styles.row}>
        <div className={styles.label}>{label}</div>
        {content}
        {trash}
      </div>
    );
  }

  renderPublicCheckboxes() {
    if (this.state.transitioning) {
      return null;
    }
    if (this.props.advanced) {
      return renderAdvancedCheckboxes(
        '*',
        this.state.perms,
        this.state.level === 'Advanced',
        this.toggleField.bind(this)
      );
    }
    return renderSimpleCheckboxes('*', this.state.perms, this.toggleField.bind(this));
  }

  render() {
    let classes = [styles.dialog, unselectable];
    if (this.state.level === 'Advanced') {
      classes.push(styles.advanced);
    }

    let placeholderText = '';
    if (this.props.advanced && this.props.enablePointerPermissions) {
      placeholderText = 'Role, User, or Pointer\u2026';
    } else {
      placeholderText = 'Role or User\u2026';
    }

    return (
      <Popover fadeIn={true} fixed={true} position={origin} modal={true} color='rgba(17,13,17,0.8)'>
        <div className={classes.join(' ')}>
          <div className={styles.header}>
            {this.props.title}
            {this.props.advanced ?
              <div className={styles.settings} onClick={() => this.setState(({ showLevels }) => ({ showLevels: !showLevels }))}>
                <Icon name='gear-solid' width={20} height={20} />
              </div> : null}
            {this.props.advanced && this.state.showLevels ?
              <div className={styles.arrow} /> : null}
          </div>
          <SliderWrap expanded={this.state.showLevels}>
            <div className={styles.level}>
              <span>Permissions</span>
              <Toggle
                darkBg={true}
                value={this.state.level}
                type={Toggle.Types.TWO_WAY}
                optionLeft='Simple'
                optionRight='Advanced'
                onChange={(level) => {
                  if (this.state.transitioning || this.state.level === level) {
                    return;
                  }
                  this.setState({ level, transitioning: true });
                  setTimeout(() => this.setState({ transitioning: false }), 700);
                }} />
            </div>
          </SliderWrap>
          <div className={styles.headers}>
            <div className={styles.readHeader}>Read</div>
            <div className={styles.writeHeader}>Write</div>
            <div className={styles.addHeader}>Add</div>
          </div>
          <div className={styles.tableWrap}>
            <div className={styles.table}>
              <div className={[styles.overlay, styles.second].join(' ')} />
              <div className={[styles.overlay, styles.fourth].join(' ')} />
              <div className={[styles.overlay, styles.sixth].join(' ')} />
              <div className={[styles.overlay, styles.eighth].join(' ')} />

              <div className={[styles.public, styles.row].join(' ')}>
                <div className={styles.label}>
                  Public
                </div>
                {this.renderPublicCheckboxes()}
              </div>
              {this.state.keys.slice(1).map((key) => this.renderRow(key))}
              {this.props.advanced ?
                this.state.pointers.map((pointer) => this.renderRow(pointer, true)) :
                null}
              {this.state.newKeys.map((key) => this.renderRow(key))}
              <div className={styles.row}>
                <input
                  className={[styles.entry, this.state.entryError ? styles.error : undefined].join(' ')}
                  value={this.state.newEntry}
                  onChange={(e) => this.setState({ newEntry: e.target.value })}
                  onBlur={this.checkEntry.bind(this)}
                  onKeyDown={this.handleKeyDown.bind(this)}
                  placeholder={placeholderText} />
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles.actions}>
              <Button
                value='Cancel'
                onClick={this.props.onCancel} />
              <Button
                primary={true}
                value={this.props.confirmText}
                onClick={() => this.props.onConfirm(this.outputPerms())} />
            </div>
            <div className={[styles.details, verticalCenter].join(' ')}>
              {this.props.details}
            </div>
          </div>
        </div>
      </Popover>
    );
  }
}
