/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import baseStyles       from 'stylesheets/base.scss';
import Button           from 'components/Button/Button.react';
import Checkbox         from 'components/Checkbox/Checkbox.react';
import Icon             from 'components/Icon/Icon.react';
import Pill             from 'components/Pill/Pill.react';
import Popover          from 'components/Popover/Popover.react';
import Position         from 'lib/Position';
import React            from 'react';
import ScrollHint       from 'components/ScrollHint/ScrollHint.react'
import SliderWrap       from 'components/SliderWrap/SliderWrap.react';
import styles           from 'components/PermissionsDialog/PermissionsDialog.scss';
import Toggle           from 'components/Toggle/Toggle.react';
import Autocomplete     from 'components/Autocomplete/Autocomplete.react';
import { Map, fromJS }  from 'immutable';
import TrackVisibility  from 'components/TrackVisibility/TrackVisibility.react';

let origin = new Position(0, 0);

function resolvePermission(perms, rowId, column) {
  let isPublicRow = rowId === '*';
  let isAuthRow = rowId === 'requiresAuthentication'; // exists only on CLP
  let isEntryRow = !isAuthRow && !isPublicRow;

  let publicAccess = perms.get(column).get('*');
  let auth = perms.get(column).get('requiresAuthentication');
  let checked = perms.get(column).get(rowId);

  let forceChecked = publicAccess && !auth;
  let indeterminate = isPublicRow && auth;
  // the logic is:
  // Checkbox is shown for:
  //  - Public row: always
  //  - Authn row:  always
  //  - Entry row:  when requires auth OR not Public
  let editable = isPublicRow || isAuthRow || (isEntryRow && !forceChecked);

  return {
    checked,
    editable,
    indeterminate
  };
}

function resolvePointerPermission(perms, pointerPerms, rowId, column) {
  let publicAccess = perms.get(column) && perms.get(column).get('*');
  let auth = perms.get(column).get('requiresAuthentication');

  // Pointer permission can be grouped as read/write
  let permsGroup;

  if (['get', 'find', 'count'].includes(column)) {
    permsGroup = 'read';
  }

  if (['create', 'update', 'delete', 'addField'].includes(column)) {
    permsGroup = 'write';
  }

  let checked = pointerPerms.get(permsGroup) || pointerPerms.get(column); //pointerPerms.get(permsGroup) && pointerPerms.get(permsGroup).get(rowId);

  let forceChecked = publicAccess && !auth;

  // Checkbox is shown for:
  //  - Public row: always
  //  - Authn row:  always
  //  - Entry row:  when requires auth OR not Public
  let editable = !forceChecked;

  return {
    checked,
    editable
  };
}

function renderAdvancedCheckboxes(rowId, perms, advanced, onChange) {
  let get = resolvePermission(perms, rowId, 'get');
  let find = resolvePermission(perms, rowId, 'find');
  let count = resolvePermission(perms, rowId, 'count');
  let create = resolvePermission(perms, rowId, 'create');
  let update = resolvePermission(perms, rowId, 'update');
  let del = resolvePermission(perms, rowId, 'delete');
  let addField = resolvePermission(perms, rowId, 'addField');

  if (advanced) {
    return [
      <div key="second" className={[styles.check, styles.second].join(' ')}>
        {get.editable ? (
          <Checkbox
            label="Get"
            checked={get.checked}
            onChange={value => onChange(rowId, 'get', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>,
      <div key="third" className={[styles.check, styles.third].join(' ')}>
        {find.editable ? (
          <Checkbox
            label="Find"
            checked={find.checked}
            onChange={value => onChange(rowId, 'find', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>,
      <div key="fourth" className={[styles.check, styles.fourth].join(' ')}>
        {count.editable ? (
          <Checkbox
            label="Count"
            checked={count.checked}
            onChange={value => onChange(rowId, 'count', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>,
      <div key="fifth" className={[styles.check, styles.fifth].join(' ')}>
        {create.editable ? (
          <Checkbox
            label="Create"
            checked={create.checked}
            onChange={value => onChange(rowId, 'create', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>,
      <div key="sixth" className={[styles.check, styles.sixth].join(' ')}>
        {update.editable ? (
          <Checkbox
            label="Update"
            checked={update.checked}
            onChange={value => onChange(rowId, 'update', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>,
      <div key="seventh" className={[styles.check, styles.seventh].join(' ')}>
        {del.editable ? (
          <Checkbox
            label="Delete"
            checked={del.checked}
            onChange={value => onChange(rowId, 'delete', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>,
      <div key="eighth" className={[styles.check, styles.eighth].join(' ')}>
        {addField.editable ? (
          <Checkbox
            label="Add field"
            checked={addField.checked}
            onChange={value => onChange(rowId, 'addField', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>
    ];
  }

  let showReadCheckbox = find.editable || get.editable || count.editable;
  let showWriteCheckbox = create.editable || update.editable || del.editable;

  let readChecked = find.checked && get.checked && count.checked;
  let writeChecked = create.checked && update.checked && del.checked;

  let indeterminateRead =
    [get, find, count].some(s => s.checked) &&
    [get, find, count].some(s => !s.checked);

  let indeterminateWrite =
    [create, update, del].some(s => s.checked) &&
    [create, update, del].some(s => !s.checked);

  return [
    <div key="second" className={[styles.check, styles.second].join(' ')}>
      {showReadCheckbox ? (
        <Checkbox
          label="Read"
          checked={readChecked}
          indeterminate={indeterminateRead}
          onChange={value => onChange(rowId, ['get', 'find', 'count'], value)}
        />
      ) : (
        <Icon name="check" width={20} height={20} />
      )}
    </div>,
    <div key="third" className={[styles.check, styles.third].join(' ')}>
      {showWriteCheckbox ? (
        <Checkbox
          label="Write"
          checked={writeChecked}
          indeterminate={indeterminateWrite}
          onChange={value =>
            onChange(rowId, ['create', 'update', 'delete'], value)
          }
        />
      ) : (
        <Icon name="check" width={20} height={20} />
      )}
    </div>,
    <div key="fourth" className={[styles.check, styles.fourth].join(' ')}>
      {addField.editable ? (
        <Checkbox
          label="Add field"
          checked={addField.checked}
          onChange={value => onChange(rowId, ['addField'], value)}
        />
      ) : (
        <Icon name="check" width={20} height={20} />
      )}
    </div>
  ];
}

function renderSimpleCheckboxes(rowId, perms, onChange) {
  // Public state
  let allowPublicRead = perms.get('read').get('*');
  let allowPublicWrite = perms.get('write').get('*');

  // requireAuthentication state
  let onlyAuthRead = perms.get('read').get('requiresAuthentication');
  let onlyAuthWrite = perms.get('write').get('requiresAuthentication');

  let isAuthRow = rowId === 'requiresAuthentication';
  let isPublicRow = rowId === '*';

  let showReadCheckbox =
    isAuthRow ||
    (!onlyAuthRead && isPublicRow) ||
    (!onlyAuthRead && !allowPublicRead);
  let showWriteCheckbox =
    isAuthRow ||
    (!onlyAuthWrite && isPublicRow) ||
    (!onlyAuthWrite && !allowPublicWrite);

  let readChecked =
    perms.get('read').get(rowId) || allowPublicRead || isAuthRow;
  let writeChecked =
    perms.get('write').get(rowId) || allowPublicWrite || isAuthRow;

  return [
    <div key="second" className={[styles.check, styles.second].join(' ')}>
      {showReadCheckbox ? (
        <Checkbox
          label="Read"
          checked={readChecked}
          onChange={value => onChange(rowId, 'read', value)}
        />
      ) : (
        <Icon name="check" width={20} height={20} />
      )}
    </div>,
    <div key="third" className={[styles.check, styles.third].join(' ')}>
      {showWriteCheckbox ? (
        <Checkbox
          label="Write"
          checked={writeChecked}
          onChange={value => onChange(rowId, 'write', value)}
        />
      ) : (
        <Icon name="check" width={20} height={20} />
      )}
    </div>
  ];
}

function renderPointerCheckboxes(
  rowId,
  perms,
  pointerPerms,
  advanced,
  onChange
) {
  let get = resolvePointerPermission(perms, pointerPerms, rowId, 'get');
  let find = resolvePointerPermission(perms, pointerPerms, rowId, 'find');
  let count = resolvePointerPermission(perms, pointerPerms, rowId, 'count');
  let create = resolvePointerPermission(perms, pointerPerms, rowId, 'create');
  let update = resolvePointerPermission(perms, pointerPerms, rowId, 'update');
  let del = resolvePointerPermission(perms, pointerPerms, rowId, 'delete');
  let addField = resolvePointerPermission(
    perms,
    pointerPerms,
    rowId,
    'addField'
  );

  // whether this field is listed under readUserFields[]
  let readUserFields = pointerPerms.get('read');
  // or writeUserFields[]
  let writeUserFields = pointerPerms.get('write');

  let read = {
    checked: readUserFields || (get.checked && find.checked && count.checked),
    editable: true
  };

  let write = {
    checked:
      writeUserFields ||
      (create.checked && update.checked && del.checked && addField.checked),
    editable: true
  };

  let cols = [];

  if (!advanced) {
    // simple view mode
    // detect whether public access is enabled

    //for read
    let publicReadGrouped = perms.getIn(['read', '*']);
    let publicReadGranular =
      perms.getIn(['get', '*']) &&
      perms.getIn(['find', '*']) &&
      perms.getIn(['count', '*']);

    // for write
    let publicWriteGrouped = perms.getIn(['write', '*']);
    let publicWriteGranular =
      perms.getIn(['create', '*']) &&
      perms.getIn(['update', '*']) &&
      perms.getIn(['delete', '*']) &&
      perms.getIn(['addField', '*']);

    // assume public access is on when it is set either for group or for each operation
    let publicRead = publicReadGrouped || publicReadGranular;
    let publicWrite = publicWriteGrouped || publicWriteGranular;

    // --------------
    // detect whether auth is required
    // for read
    let readAuthGroup = perms.getIn(['read', 'requiresAuthentication']);
    let readAuthSeparate =
      perms.getIn(['get', 'requiresAuthentication']) &&
      perms.getIn(['find', 'requiresAuthentication']) &&
      perms.getIn(['count', 'requiresAuthentication']);

    // for write
    let writeAuthGroup = perms.getIn(['write', 'requiresAuthentication']);
    let writeAuthSeparate =
      perms.getIn(['create', 'requiresAuthentication']) &&
      perms.getIn(['update', 'requiresAuthentication']) &&
      perms.getIn(['delete', 'requiresAuthentication']) &&
      perms.getIn(['addField', 'requiresAuthentication']);

    // assume auth is required when it's set either for group or for each operation
    let readAuth = readAuthGroup || readAuthSeparate;
    let writeAuth = writeAuthGroup || writeAuthSeparate;

    // when all ops have public access and none requiure auth, show non-editable checked icon
    let readForceChecked = publicRead && !readAuth;
    let writeForceChecked = publicWrite && !writeAuth;

    // --------------
    // detect whether to show indeterminate checkbox (dash icon)
    // in simple view indeterminate happens when:
    // {read/write}UserFields is not set and
    // not all permissions have same value !(all checked || all unchecked)
    let indeterminateRead =
      !readUserFields &&
      [get, find, count].some(s => s.checked) &&
      [get, find, count].some(s => !s.checked);

    let indeterminateWrite =
      !writeUserFields &&
      [create, update, del, addField].some(s => s.checked) &&
      [create, update, del, addField].some(s => !s.checked);

    cols.push(
      <div key="second" className={[styles.check, styles.second].join(' ')}>
        {readForceChecked ? (
          <Icon name="check" width={20} height={20} />
        ) : (
          <Checkbox
            label="Read"
            checked={read.checked}
            indeterminate={indeterminateRead}
            onChange={value => onChange(rowId, 'read', value)}
          />
        )}
      </div>
    );

    if (writeForceChecked) {
      cols.push(
        <div key="third" className={[styles.check, styles.third].join(' ')}>
          <Icon name="check" width={20} height={20} />
        </div>,
        <div key="fourth" className={[styles.check, styles.fourth].join(' ')}>
          <Icon name="check" width={20} height={20} />
        </div>
      );
    } else {
      cols.push(
        <div key="third" className={[styles.pointerWrite].join(' ')}>
          <div className={styles.checkboxWrap}>
            <Checkbox
              label="Write and Add field"
              indeterminate={indeterminateWrite}
              checked={write.checked}
              onChange={value => onChange(rowId, 'write', value)}
            />
          </div>
        </div>
      );
    }
  } else {
    // in advanced view mode
    cols.push(
      <div key="second" className={[styles.check, styles.second].join(' ')}>
        {get.editable ? (
          <Checkbox
            label="Get"
            checked={get.checked}
            onChange={value => onChange(rowId, 'get', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>
    );
    cols.push(
      <div key="third" className={[styles.check, styles.third].join(' ')}>
        {find.editable ? (
          <Checkbox
            label="Find"
            checked={find.checked}
            onChange={value => onChange(rowId, 'find', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>
    );
    cols.push(
      <div key="fourth" className={[styles.check, styles.fourth].join(' ')}>
        {count.editable ? (
          <Checkbox
            label="Count"
            checked={count.checked}
            onChange={value => onChange(rowId, 'count', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>
    );

    cols.push(
      <div key="fifth" className={[styles.check, styles.fifth].join(' ')}>
        {create.editable ? (
          <Checkbox
            label="Create"
            checked={create.checked}
            onChange={value => onChange(rowId, 'create', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>
    );
    cols.push(
      <div key="sixth" className={[styles.check, styles.sixth].join(' ')}>
        {update.editable ? (
          <Checkbox
            label="Update"
            checked={update.checked}
            onChange={value => onChange(rowId, 'update', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>
    );
    cols.push(
      <div key="seventh" className={[styles.check, styles.seventh].join(' ')}>
        {del.editable ? (
          <Checkbox
            label="Delete"
            checked={del.checked}
            onChange={value => onChange(rowId, 'delete', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>
    );
    cols.push(
      <div key="eighth" className={[styles.check, styles.eighth].join(' ')}>
        {addField.editable ? (
          <Checkbox
            label="Add field"
            checked={addField.checked}
            onChange={value => onChange(rowId, 'addField', value)}
          />
        ) : (
          <Icon name="check" width={20} height={20} />
        )}
      </div>
    );
  }
  return cols;
}

const intersectionMargin = '10px 0px 0px 20px';
export default class PermissionsDialog extends React.Component {
  constructor(props) {
    super(props);

    const { permissions, advanced, columns } = props;

    this.refEntry = React.createRef();
    this.refTable = React.createRef();
    this.refScrollIndicator = React.createRef();

    const callback = ([entry]) => {
      const ratio = entry.intersectionRatio;
      const hidden = ratio < 0.92;
      // hide suggestions to avoid ugly footer overlap
      this.refEntry.current.setHidden(hidden);
      // also show indicator when input is not visible
      // this.refScrollHint.current.toggleActive(hidden);
    };

    this.observer = new IntersectionObserver(callback, {
      root: this.refTable.current,
      rootMargin: intersectionMargin,
      threshold: [0.92]
    });

    this.suggestInput = this.suggestInput.bind(this);
    this.buildLabel = this.buildLabel.bind(this);

    let uniqueKeys = [...(advanced ? ['requiresAuthentication'] : []), '*'];
    let perms = {};
    for (let k in permissions) {
      if (
        k !== 'readUserFields' &&
        k !== 'writeUserFields' &&
        k !== 'protectedFields'
      ) {
        Object.keys(permissions[k]).forEach(key => {
          if (key === 'pointerFields') {
            //pointerFields is not a regular entity; processed later
            return;
          }
          if (uniqueKeys.indexOf(key) < 0) {
            uniqueKeys.push(key);
          }

          // requireAuthentication is only available for CLP
          if (advanced) {
            if (!permissions[k].requiresAuthentication) {
              permissions[k].requiresAuthentication = false;
            }
          }
        });
        perms[k] = Map(permissions[k]);
      }
    }

    let pointerPermsSubset = {
      read: permissions.readUserFields || [],
      write: permissions.writeUserFields || []
    };

    if (advanced) {
      // Fill any missing fields
      perms.get = perms.get || Map();
      perms.find = perms.find || Map();
      perms.count = perms.count || Map();
      perms.create = perms.create || Map();
      perms.update = perms.update || Map();
      perms.delete = perms.delete || Map();
      perms.addField = perms.addField || Map();

      // The double check is necessary because the permissions object seems to be empty when accessing the CLP section
      // if the class was recently created.
      (pointerPermsSubset.get = permissions.get && permissions.get.pointerFields || []),
        (pointerPermsSubset.find = permissions.find && permissions.find.pointerFields || []),
        (pointerPermsSubset.count = permissions.count && permissions.count.pointerFields || []),
        (pointerPermsSubset.create = permissions.create && permissions.create.pointerFields || []),
        (pointerPermsSubset.update = permissions.update && permissions.update.pointerFields || []),
        (pointerPermsSubset.delete = permissions.delete && permissions.delete.pointerFields || []),
        (pointerPermsSubset.addField = permissions.addField && permissions.addField.pointerFields || []);
    }

    let pointerPerms = {};

    // form an object where each pointer-field name holds operations it has access to
    // e.g. { [field]: {  read: true, create: true}, [field2]: {read: true,} ...}
    for (const action in pointerPermsSubset) {
      // action holds array of field names
      for (const field of pointerPermsSubset[action]) {
        pointerPerms[field] = Object.assign(
          { [action]: true },
          pointerPerms[field]
        );
      }
    }
    // preserve protectedFields
    if (permissions.protectedFields) {
      perms.protectedFields = permissions.protectedFields;
    }

    this.state = {
      transitioning: false,
      showLevels: false,
      level: 'Simple', // 'Simple' | 'Advanced'
      entryTypes: undefined,
      perms: Map(perms), // Permissions map
      keys: uniqueKeys, // Permissions row order
      pointerPerms: Map(fromJS(pointerPerms)), // Pointer permissions map
      pointers: Object.keys(pointerPerms), // Pointer order
      columns,
      newEntry: '',
      entryError: null,
      newKeys: [] // Order for new entries
    };
  }

  async componentDidMount() {
    // validate existing entries, also preserve their types
    // to render correct pills and details.
    const rows = await Promise.all(
      this.state.keys
        .filter(key => !['requiresAuthentication', '*'].includes(key))
        .map(key => this.props.validateEntry(key))
    );

    let entryTypes = new Map({});

    for (const { entry, type } of rows) {
      let key;
      let value = {};

      if (type === 'user') {
        key = entry.id;
        value[type] = {
          name: entry.get('username'),
          id: entry.id
        };
      }

      if (type === 'role') {
        key = 'role:' + entry.getName();
        value[type] = {
          name: entry.getName(),
          id: entry.id
        };
      }

      if (type === 'pointer') {
        key = entry;
        value[type] = true;
      }
      entryTypes = entryTypes.set(key, value);
    }

    this.setState({ entryTypes });
  }

  toggleField(rowId, type, value) {
    this.setState(state => {
      let perms = state.perms;
      if (Array.isArray(type)) {
        type.forEach(t => {
          perms = perms.setIn([t, rowId], value);
        });
      } else {
        perms = perms.setIn([type, rowId], value);
      }
      return { perms };
    });
  }

  togglePointer(field, action, value) {
    this.setState(state => {
      let pointerPerms = state.pointerPerms;

      // toggle the value clicked
      pointerPerms = pointerPerms.setIn([field, action], value);

      const readGroup = ['get', 'find', 'count'];
      const writeGroup = ['create', 'update', 'delete', 'addField'];

      // since there're two ways a permission can be granted for field ({read/write}UserFields:['field'] or action: pointerFields:['field'] )
      // both views (advanced/simple) need to be in sync
      // e.g.
      // read is true (checked in simple view); then 'get' changes true->false in advanced view - 'read' should be also unset in simple view

      // when read/write changes - also update all individual actions with new value
      if (action === 'read') {
        for (const op of readGroup) {
          pointerPerms = pointerPerms.setIn([field, op], value);
        }
      } else if (action === 'write') {
        for (const op of writeGroup) {
          pointerPerms = pointerPerms.setIn([field, op], value);
        }
      } else {
        const groupKey = readGroup.includes(action) ? 'read' : 'write';
        const group = groupKey === 'read' ? readGroup : writeGroup;

        // if granular action changed to true
        if (value) {
          // if all become checked, unset them as granulars and enable write group instead
          if (!group.some(op => !pointerPerms.getIn([field, op]))) {
            for (const op of group) {
              pointerPerms = pointerPerms.setIn([field, op], false);
            }
            pointerPerms = pointerPerms.setIn([field, groupKey], true);
          }
        }
        // if granular action changed to false
        else {
          // if group was checked on simple view / {read/write}UserFields contained this field
          if (pointerPerms.getIn([field, groupKey])) {
            // unset value for group
            pointerPerms = pointerPerms.setIn([field, groupKey], false);
            // and enable all granular actions except the one unchecked
            group
              .filter(op => op !== action)
              .forEach(op => {
                pointerPerms = pointerPerms.setIn([field, op], true);
              });
          }
        }
      }
      return { pointerPerms };
    });
  }

  checkEntry(input) {
    if (input === '') {
      return;
    }
    if (this.props.validateEntry) {
      this.props.validateEntry(input).then(
        ({ type, entry }) => {
          let next = { [type]: entry };

          if (next.public) {
            return this.setState({
              entryError: 'You already have a row for Public'
            });
          }

          let id, name, key, newEntry;

          let nextKeys;
          let nextEntryTypes;
          let nextPerms = this.state.perms;
          let nextPointerPerms = this.state.pointerPerms;

          if (next.user || next.role) {
            id = next.user ? next.user.id : next.role.id;
            name = next.user ? next.user.get('username') : next.role.getName();

            key = next.user ? id : 'role:' + name;
            newEntry = { [type]: { name, id } };
          } else if (next.pointer) {
            key = next.pointer;
            newEntry = { [type]: true };
          } else {
            return this.setState({
              entryError: 'Unsupported entry'
            });
          }

          // check if key already in list
          if (
            this.state.keys.indexOf(key) > -1 ||
            this.state.newKeys.indexOf(key) > -1
          ) {
            return this.setState({
              entryError: 'You already have a row for this object'
            });
          }

          // create new permissions
          if (next.pointer) {
            if (this.props.advanced) {
              nextPointerPerms = nextPointerPerms.setIn([entry, 'get'], true)
              nextPointerPerms = nextPointerPerms.setIn([entry, 'find'], true)
              nextPointerPerms = nextPointerPerms.setIn([entry, 'count'], true)
              nextPointerPerms = nextPointerPerms.setIn([entry, 'create'], true)
              nextPointerPerms = nextPointerPerms.setIn([entry, 'update'], true)
              nextPointerPerms = nextPointerPerms.setIn([entry, 'delete'], true)
              nextPointerPerms = nextPointerPerms.setIn([entry, 'addField'], true)
            } else {
              nextPointerPerms = nextPointerPerms.setIn([entry, 'read'], true)
              nextPointerPerms = nextPointerPerms.setIn([entry, 'write'], true)
            }
          } else {
            if (this.props.advanced) {
              nextPerms = nextPerms.setIn(['get', key], true);
              nextPerms = nextPerms.setIn(['find', key], true);
              nextPerms = nextPerms.setIn(['count', key], true);
              nextPerms = nextPerms.setIn(['create', key], true);
              nextPerms = nextPerms.setIn(['update', key], true);
              nextPerms = nextPerms.setIn(['delete', key], true);
              nextPerms = nextPerms.setIn(['addField', key], true);
            } else {
              nextPerms = nextPerms.setIn(['read', key], true);
              nextPerms = nextPerms.setIn(['write', key], true);
            }
          }

          nextKeys = this.state.newKeys.concat([key]);
          nextEntryTypes = this.state.entryTypes.set(key, newEntry);

          return this.setState(
            {
              perms: nextPerms,
              pointerPerms: nextPointerPerms,
              newKeys: nextKeys,
              entryTypes: nextEntryTypes,
              newEntry: '',
              entryError: null
            },
            () => this.refEntry.current.resetInput()
          );
        },
        () => {
          if (this.props.advanced && this.props.enablePointerPermissions) {
            this.setState({
              entryError:
                'Role, User or field not found. Enter a valid id, name or column'
            });
          } else {
            this.setState({
              entryError: 'Role or User not found. Enter a valid name or id.'
            });
          }
        }
      );
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
      index = this.state.newKeys.indexOf(key);
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
          .deleteIn(['count', key])
          .deleteIn(['create', key])
          .deleteIn(['update', key])
          .deleteIn(['delete', key])
          .deleteIn(['addField', key]);
      } else {
        newPerms = newPerms.deleteIn(['read', key]).deleteIn(['write', key]);
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
    let fields = ['read', 'write'];
    if (this.props.advanced) {
      fields = [
        'get',
        'find',
        'count',
        'create',
        'update',
        'delete',
        'addField'
      ];
    }

    fields.forEach(field => {
      output[field] = {};
      this.state.perms.get(field).forEach((v, k) => {
        if (k === 'pointerFields') {
          return;
        }
        if (k === 'requiresAuthentication' && !v){
          // only acceppt requiresAuthentication with true
          return
        }
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

      fields.forEach(op => {
        if (perms.get(op)) {
          if (!output[op].pointerFields) {
            output[op].pointerFields = [];
          }

          output[op].pointerFields.push(key);
        }
      });
    });

    if (readUserFields.length) {
      output.readUserFields = readUserFields;
    }
    if (writeUserFields.length) {
      output.writeUserFields = writeUserFields;
    }
    // should also preserve protectedFields!
    if (this.state.perms.get('protectedFields')) {
      output.protectedFields = this.state.perms.get('protectedFields');
    }
    return output;
  }

  renderRow(key, columns, types) {
    const pill = text => (
      <span className={styles.pillType}>
        <Pill value={text} />
      </span>
    );

    // types is immutable.js Map
    const type = (types && types.get(key)) || {};

    let pointer = this.state.pointerPerms.has(key);
    let label = <span>{key}</span>;

    if (type.user) {
      label = (
        <span>
          <p>
            <span>
              <span className={styles.selectable}>{type.user.id}</span>
              {pill('User')}
            </span>
          </p>
          <p className={styles.hint}>
            {'username: '}
            <span className={styles.selectable}>{type.user.name}</span>
          </p>
        </span>
      );
    } else if (type.role) {
      label = (
        <span>
          <p>
            <span>
              <span className={styles.prefix}>{'role:'}</span>
              {type.role.name}
            </span>
          </p>
          <p className={styles.hint}>
            id: <span className={styles.selectable}>{type.role.id}</span>
          </p>
        </span>
      );
    } else if (pointer) {
      // get class info from schema
      let { type, targetClass } = columns[key];

      let pillText = type + (targetClass ? `<${targetClass}>` : '');

      label = (
        <span>
          <p>
            {key}
            {pill(pillText)}
          </p>
          <p className={styles.hint}>Only users pointed to by this field</p>
        </span>
      );
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
        content = renderSimpleCheckboxes(
          key,
          this.state.perms,
          this.toggleField.bind(this)
        );
      }
    }
    let trash = null;
    if (!this.state.transitioning) {
      trash = (
        <div className={styles.delete}>
          <button
            type='button'
            onClick={this.deleteRow.bind(this, key, pointer)}
          >
            <Icon name="trash-solid" width={20} height={20} />
          </button>
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
    return renderSimpleCheckboxes(
      '*',
      this.state.perms,
      this.toggleField.bind(this)
    );
  }

  renderAuthenticatedCheckboxes() {
    if (this.state.transitioning) {
      return null;
    }
    if (this.props.advanced) {
      return renderAdvancedCheckboxes(
        'requiresAuthentication',
        this.state.perms,
        this.state.level === 'Advanced',
        this.toggleField.bind(this)
      );
    }
    return null;
  }

  buildLabel(input) {
    let label;
    if (input.startsWith('userField:')) {
      label = 'Name of field with pointer(s) to User';
    } else if (input.startsWith('user:')) {
      label = 'Find User by id or name';
    } else if (input.startsWith('role:')) {
      label = 'Find Role by id or name';
    }

    return label;
  }

  suggestInput(input) {
    // role:  user:  suggested if entry empty or does start with not already start with any of them
    // and not -  suggestedPrefix is currently set
    const userPointers = this.props.userPointers || [];

    const keys = this.state.keys;
    const newKeys = this.state.newKeys;
    const allKeys = [...keys, ...newKeys];

    // "userPointer:" fields that were not added yet
    let unusedPointerFields = userPointers.filter(
      ptr => !allKeys.includes(ptr) && ptr.includes(input)
    );

    // roles
    let prefixes = ['role:']
      .filter(o => o.startsWith(input) && o.length > input.length) // filter matching input
      .concat(...unusedPointerFields);

    // pointer fields that are not applied yet;
    let availableFields = [];

    availableFields.push(...prefixes);

    return availableFields;
  }

  render() {
    let classes = [styles.dialog, baseStyles.unselectable];

    // for 3-column CLP dialog
    if (this.props.advanced) {
      classes.push(styles.clp);
    }

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
      <Popover
        fadeIn={true}
        fixed={true}
        position={origin}
        modal={true}
        color="rgba(17,13,17,0.8)"
      >
        <div className={classes.join(' ')}>
          <div className={styles.header}>
            {this.props.title}
            {this.props.advanced ? (
              <div
                className={styles.settings}
                onClick={() =>
                  this.setState(({ showLevels }) => ({
                    showLevels: !showLevels
                  }))
                }
              >
                <Icon name="gear-solid" width={20} height={20} />
              </div>
            ) : null}
            {this.props.advanced && this.state.showLevels ? (
              <div className={styles.arrow} />
            ) : null}
          </div>
          <SliderWrap expanded={this.state.showLevels}>
            <div className={styles.level}>
              <span>Permissions</span>
              <Toggle
                darkBg={true}
                value={this.state.level}
                type={Toggle.Types.TWO_WAY}
                optionLeft="Simple"
                optionRight="Advanced"
                onChange={level => {
                  if (this.state.transitioning || this.state.level === level) {
                    return;
                  }
                  this.setState({ level, transitioning: true });
                  setTimeout(
                    () => this.setState({ transitioning: false }),
                    700
                  );
                }}
              />
            </div>
          </SliderWrap>
          <div className={styles.headers}>
            <div className={styles.readHeader}>Read</div>
            <div className={styles.writeHeader}>Write</div>
            <div className={styles.addHeader}>Add</div>
          </div>
          <div
            className={styles.tableWrap}
            onScroll={
              this.refEntry.current && this.refEntry.current.recalculatePosition
            }
          >
            <div className={styles.table} ref={this.refTable}>
              <div className={[styles.overlay, styles.second].join(' ')} />
              <div className={[styles.overlay, styles.fourth].join(' ')} />
              <div className={[styles.overlay, styles.sixth].join(' ')} />
              <div className={[styles.overlay, styles.eighth].join(' ')} />

              <div className={[styles.public, styles.row].join(' ')}>
                <div className={styles.label}>Public</div>
                {this.renderPublicCheckboxes()}
              </div>
              {this.props.advanced ? (
                <div className={[styles.public, styles.row].join(' ')}>
                  <div className={styles.label}>Authenticated</div>
                  {this.renderAuthenticatedCheckboxes()}
                </div>
              ) : null}

              {this.state.keys
                .slice(this.props.advanced ? 2 : 1)
                .map(key =>
                  this.renderRow(key, this.state.columns, this.state.entryTypes)
                )}
              {this.props.advanced
                ? this.state.pointers.map(pointer =>
                    this.renderRow(pointer, this.state.columns)
                  )
                : null}
              {this.state.newKeys.map(key =>
                this.renderRow(key, this.state.columns, this.state.entryTypes)
              )}

              <div className={styles.row}>
                <TrackVisibility observer={this.observer}>
                  <Autocomplete
                    ref={this.refEntry}
                    inputStyle={{
                      width: '290px',
                      padding: '0 6px',
                      margin: '10px 0px 0px 20px'
                    }}
                    suggestionsStyle={{
                      margin: '-6px 0px 0px 21px',
                      width: '290px'
                    }}
                    onChange={input => {
                      this.setState({ newEntry: input, entryError: undefined });
                    }}
                    onSubmit={this.checkEntry.bind(this)}
                    placeholder={placeholderText}
                    buildSuggestions={input => this.suggestInput(input)}
                    buildLabel={input => this.buildLabel(input)}
                    error={this.state.entryError}
                 />
                </TrackVisibility>
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <ScrollHint ref={this.refScrollIndicator}/>
            <div className={styles.actions}>
              <Button value="Cancel" onClick={this.props.onCancel} />
              <Button
                primary={true}
                value={this.props.confirmText}
                onClick={() => this.props.onConfirm(this.outputPerms())}
              />
            </div>
            <div className={[styles.details, baseStyles.verticalCenter].join(' ')}>
              {this.props.details}
            </div>
          </div>
        </div>
      </Popover>
    );
  }
}
