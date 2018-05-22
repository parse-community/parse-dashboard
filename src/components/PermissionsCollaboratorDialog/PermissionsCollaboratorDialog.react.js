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
import Popover    from 'components/Popover/Popover.react';
import Position   from 'lib/Position';
import React      from 'react';
import SliderWrap from 'components/SliderWrap/SliderWrap.react';
import styles     from 'components/PermissionsCollaboratorDialog/PermissionsCollaboratorDialog.scss';
import Toggle     from 'components/Toggle/Toggle.react';
import {
  unselectable,
  verticalCenter
}                 from 'stylesheets/base.scss';
import Label     from 'components/Label/Label.react';
import Field from '../Field/Field.react'

let origin = new Position(0, 0);

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

function renderSimpleLabels(rowId, perms) {
  let readChecked = perms.get('read').get(rowId) || perms.get('read').get('*');
  let writeChecked = perms.get('write').get(rowId) || perms.get('write').get('*');
  if (writeChecked) return (<span>Write</span>)
  else if (readChecked) return (<span>Read</span>)
  else return (<span>None</span>)
}


function renderPointerCheckboxes(rowId, publicPerms, pointerPerms, advanced, onChange) {
  let publicRead = publicPerms.get('get').get('*') && publicPerms.get('find').get('*');
  let publicWrite = publicPerms.get('create').get('*') &&
    publicPerms.get('update').get('*') &&
    publicPerms.get('delete').get('*') &&
    publicPerms.get('addField').get('*');
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

export default class PermissionsCollaboratorDialog extends React.Component {
  constructor({
                permissions,
                features
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
      features
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
          nextPerms = nextPerms.setIn(['read', id], true);
          nextPerms = nextPerms.setIn(['write', id], true);

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
        this.setState({
          entryError: 'Role or User not found. Enter a valid Role name, Username, or User ID.'
        });
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
      newPerms = newPerms
        .deleteIn(['read', key])
        .deleteIn(['write', key]);
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

  renderRow(key, index, forcePointer) {

    let pointer = !!forcePointer;

    let text = this.state.features.label.shift()
    let description = this.state.features.description.shift()
    let label = <Label key={text} text={text} description={description} />

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
      } else {
        console.log('Let\'s renderSimpleCheckboxes');
        content = renderSimpleLabels(key, this.state.perms);
      }
    }
    console.log(label)
    return (
      <div key={key} className={styles.row}>
        <Field labelWidth={100} className={styles.label} label={label} />
        <Field labelWidth={100} className={[styles.label, styles.permission].join(' ')} label={content} />
      </div>
    );
  }

  renderPublicCheckboxes() {
    if (this.state.transitioning) {
      return null;
    }
    return renderSimpleCheckboxes('*', this.state.perms, this.toggleField.bind(this));
  }

  render() {
    let classes = [styles.dialog, unselectable];

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
            <p className={styles.role}>{this.props.role}</p>
            <p className={styles.email}>{this.props.email}</p>
            <p className={styles.description}>{this.props.description}</p>
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
              <div className={[styles.public, styles.row].join(' ')}>
                <div className={styles.label}>
                  Features
                </div>
              </div>
              {this.state.keys.slice(1).map((key) => this.renderRow(key))}
              {this.state.newKeys.map((key) => this.renderRow(key))}
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
          </div>
        </div>
      </Popover>
    );
  }
}
