/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import hasAncestor        from 'lib/hasAncestor';
import Button             from 'components/Button/Button.react';
import Autocomplete       from 'components/Autocomplete/Autocomplete.react';
import Icon               from 'components/Icon/Icon.react';
import { Map }            from 'immutable';
import Pill               from 'components/Pill/Pill.react';
import Popover            from 'components/Popover/Popover.react';
import Position           from 'lib/Position';
import React              from 'react';
import ScrollHint         from 'components/ScrollHint/ScrollHint.react'
import styles             from 'components/ProtectedFieldsDialog/ProtectedFieldsDialog.scss';
import MultiSelect        from 'components/MultiSelect/MultiSelect.react';
import MultiSelectOption  from 'components/MultiSelect/MultiSelectOption.react';
import TrackVisibility    from 'components/TrackVisibility/TrackVisibility.react';
import baseStyles         from 'stylesheets/base.scss';

let origin = new Position(0, 0);
const intersectionMargin = '10px 0px 0px 20px';

export default class ProtectedFieldsDialog extends React.Component {
  constructor({ protectedFields, columns }) {
    super();

    let keys = Object.keys(protectedFields || {});

    this.refEntry = React.createRef();
    this.refTable = React.createRef();
    this.refScrollHint = React.createRef();

    // Intersection observer is used to avoid ugly effe t
    // when suggestion are shown whil input field is scrolled out oof viewpoort
    const callback = ([entry]) => {
      const ratio = entry.intersectionRatio;
      const hidden = ratio < 0.92;
      // hide suggestions to avoid ugly  footer overlap
      this.refEntry.current.setHidden(hidden);
      // also show indicator when input is not visible
      this.refScrollHint.current.toggleActive(hidden);
    };

    this.observer = new IntersectionObserver(callback, {
      root: this.refTable.current,
      rootMargin: intersectionMargin,
      threshold: [0.92]
    });

    this.state = {
      entryTypes: undefined,
      transitioning: false,
      columns: columns,
      protectedFields: new Map(protectedFields || {}), // protected fields map
      keys,
      newEntry: '',
      entryError: null,
      newKeys: []
    };
  }

  async componentDidMount() {
    // validate existing entries, also preserve their types (to render correct pills).
    const rows = await Promise.all(
      this.state.keys.map(key => this.props.validateEntry(key))
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

      if (type === 'public' || type === 'auth' || type === 'pointer') {
        key = entry;
        value[type] = true;
      }

      entryTypes = entryTypes.set(key, value);
    }

    this.setState({ entryTypes });
  }

  checkEntry(input) {
    if (input === '') {
      return;
    }
    if (this.props.validateEntry) {
      this.props.validateEntry(input).then(
        ({ type, entry }) => {
          let next = { [type]: entry };

          let key;
          let name;
          let id;
          let newEntry = {};

          if (next.user || next.role) {
            // entry for saving
            key = next.user ? next.user.id : 'role:' + next.role.getName();

            // info for displaying
            name = next.user ? next.user.get('username') : next.role.getName();
            id = next.user ? next.user.id : next.role.id;
            newEntry[type] = { name, id };
          } else {
            key = next.public || next.auth || next.pointer;
            newEntry[type] = true;
          }

          if (key) {
            if (
              this.state.keys.includes(key) ||
              this.state.newKeys.includes(key)
            ) {
              return this.setState({
                entryError: 'You already have a row for this object'
              });
            }

            let nextKeys = this.state.newKeys.concat([key]);
            let nextFields = this.state.protectedFields.set(key, []);
            let nextEntryTypes = this.state.entryTypes.set(key, newEntry);

            return this.setState(
              {
                entryTypes: nextEntryTypes,
                protectedFields: nextFields,
                newKeys: nextKeys,
                entryError: null
              },
              this.refEntry.current.resetInput()
            );
          }
        },
        () => {
          if (this.props.enablePointerPermissions) {
            this.setState({
              entryError:
                'Role, User or field not found. Enter a valid id, name or column.'
            });
          } else {
            this.setState({
              entryError: 'Role or User not found. Enter a valid name or id'
            });
          }
        }
      );
    }
  }

  deleteRow(key) {
    // remove from proectedFields
    let protectedFields = this.state.protectedFields.delete(key);

    // also remove from local state
    let keys = this.state.keys.filter(k => k !== key);
    let newKeys = this.state.newKeys.filter(k => k !== key);

    return this.setState({
      protectedFields,
      newKeys,
      keys
    });
  }

  outputPerms() {
    let output = this.state.protectedFields.toObject();

    return output;
  }

  onChange(key, newValue) {
    this.setState(state => {
      let protectedFields = state.protectedFields;
      protectedFields = protectedFields.set(key, newValue);
      return { protectedFields };
    });
  }

  /**
   * @param {String} key - entity (Public, User, Role, field-pointer)
   * @param {Object} schema - object with fields of collection: { [fieldName]: { type: String, targetClass?: String }}
   * @param {String[]} selected - fields that are set for entity
   *
   * Renders Dropdown allowing to pick multiple fields for an entity (row).
   */
  renderSelector(key, schema, selected) {
    let options = [];
    let values = selected || [];

    let entries = Object.entries(schema);
    for (let [field, { type, targetClass }] of entries) {
      if (
        field === 'objectId' ||
        field === 'createdAt' ||
        field === 'updatedAt' ||
        field === 'ACL'
      ) {
        continue;
      }

      let pillText = type + (targetClass ? `<${targetClass}>` : '');

      options.push(
        <MultiSelectOption key={`col-${field}`} value={field} dense={true}>
          {field}
          <span className={styles.pillType}>
            <Pill value={pillText} />
          </span>
        </MultiSelectOption>
      );
    }

    let noAvailableFields = options.length === 0;

    if(noAvailableFields){
      options.push(
        <MultiSelectOption  disabled={true} dense={true}>
        {'This class has no fields to protect'}
        </MultiSelectOption>
      )
    }

    const placeholder = 'All fields allowed.'+ (noAvailableFields ? '': ' Click to protect.');

    return (
      <div className={(styles.second, styles.multiselect)}>
        <MultiSelect
          fixed={false}
          dense={true}
          chips={true}
          onChange={s => {
            this.onChange(key, s);
          }}
          value={values}
          placeHolder={placeholder}
        >
          {options}
        </MultiSelect>
      </div>
    );
  }

  renderRow(key, columns, types) {
    const pill = text => (
      <span className={styles.pillType}>
        <Pill value={text} />
      </span>
    );

    // types is immutable.js Map
    const type = (types && types.get(key)) || {};

    let label = <span>{key}</span>;

    if (type.role) {
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
    }

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
            username:{' '}
            <span className={styles.selectable}>{type.user.name}</span>
          </p>
        </span>
      );
    }

    if (type.public) {
      label = (
        <span>
          <p>
            {' '}
            <span className={styles.prefix}>*</span> (Public Access)
          </p>
          <p className={styles.hint}>Applies to all queries</p>
        </span>
      );
    }

    if (type.auth) {
      label = (
        <span>
          <p className={styles.prefix}>Authenticated</p>
          <p className={styles.hint}>Applies to any logged user</p>
        </span>
      );
    }

    if (type.pointer) {
      let { type, targetClass } = columns[key.substring(10)];
      let pillText = type + (targetClass ? `<${targetClass}>` : '');

      label = (
        <span>
          <p>
            <span className={styles.prefix}>userField:</span>
            {key.substring(10)}
            {pill(pillText)}
          </p>
          <p className={styles.hint}>Only users pointed to by this field</p>
        </span>
      );
    }

    let content = null;
    if (!this.state.transitioning) {
      content = this.renderSelector(
        key,
        this.state.columns,
        this.state.protectedFields.get(key)
      );
    }
    let trash = null;
    if (!this.state.transitioning) {
      trash = (
        <div className={styles.delete}>
          <button
            type='button'
            onClick={this.deleteRow.bind(this, key)}
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

  close(e) {
    if (!hasAncestor(e.target, this.node)) {
      //In the case where the user clicks on the node, toggle() will handle closing the dropdown.
      this.setState({ open: false });
    }
  }

  onUserInput(input) {
    this.setState({ newEntry: input, entryError: undefined });
  }

  suggestInput(input) {
    const userPointers = this.props.userPointers;

    const keys = this.state.keys;
    const newKeys = this.state.newKeys;
    const allKeys = [...keys, ...newKeys];

    let availablePointerFields = userPointers
      .map(ptr => `userField:${ptr}`)
      .filter(ptr => !allKeys.includes(ptr) && ptr.includes(input));

    let possiblePrefix = ['role:']
      .filter(o => o.startsWith(input) && o.length > input.length) // filter matching prefixes
      .concat(...availablePointerFields); //

    // pointer fields that are not applied yet;
    let availableFields = [];

    // do not suggest unique rows that are already added;
    let uniqueOptions = ['*', 'authenticated'].filter(
      key =>
        !allKeys.includes(key) && (input.length == 0 || key.startsWith(input))
    );

    availableFields.push(...uniqueOptions);
    availableFields.push(...possiblePrefix);

    return availableFields;
  }

  onClick(e) {
    this.setState(
      {
        activeSuggestion: 0,
        newEntry: e.currentTarget.innerText,
        showSuggestions: false
      },
      () => {
        this.props.onChange(this.state.newEntry);
      }
    );
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

  render() {
    let classes = [styles.dialog, baseStyles.unselectable];

    let placeholderText = 'Role/User id/name * or authenticated\u2026';

    return (
      <Popover
        fadeIn={true}
        fixed={true}
        position={origin}
        modal={true}
        color="rgba(17,13,17,0.8)"
        onExternalClick={this.close.bind(this)}
      >
        <div className={classes.join(' ')}>
          <div className={styles.header}>{this.props.title}</div>
          <div className={styles.tableWrap}>
            <div className={styles.table} ref={this.refTable}>
              <div className={[styles.overlay, styles.second].join(' ')} />
              {this.state.keys.map(key =>
                this.renderRow(key, this.state.columns, this.state.entryTypes)
              )}

              {this.state.newKeys.map(key =>
                this.renderRow(key, this.state.columns, this.state.entryTypes)
              )}

              <div className={styles.row}>
                <TrackVisibility observer={this.observer}>
                  <Autocomplete
                    ref={this.refEntry}
                    inputStyle={{
                      width: '400px',
                      padding: '0 6px',
                      margin: '10px 20px'
                    }}
                    suggestionsStyle={{
                      margin: '-6px 0px 0px 20px',
                      width: '400px'
                    }}
                    onChange={e => this.onUserInput(e)}
                    onSubmit={this.checkEntry.bind(this)}
                    placeholder={placeholderText}
                    buildSuggestions={input => this.suggestInput(input)}
                    buildLabel={input => this.buildLabel(input)}
                    error={this.state.entryError}
                  />
                </TrackVisibility>

                <div className={[styles.second, styles.error].join(' ')}>
                  {this.state.entryError}
                </div>
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
