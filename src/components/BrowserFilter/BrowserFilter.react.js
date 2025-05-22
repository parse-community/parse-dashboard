/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as Filters from 'lib/Filters';
import Button from 'components/Button/Button.react';
import Filter from 'components/Filter/Filter.react';
import FilterRow from 'components/BrowserFilter/FilterRow.react';
import Icon from 'components/Icon/Icon.react';
import Popover from 'components/Popover/Popover.react';
import Field from 'components/Field/Field.react';
import TextInput from 'components/TextInput/TextInput.react';
import Label from 'components/Label/Label.react';
import Position from 'lib/Position';
import React from 'react';
import styles from 'components/BrowserFilter/BrowserFilter.scss';
import Checkbox from 'components/Checkbox/Checkbox.react';
import { List, Map } from 'immutable';

const POPOVER_CONTENT_ID = 'browserFilterPopover';

export default class BrowserFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      editMode: true,
      filters: new List(),
      confirmName: false,
      name: '',
      blacklistedFilters: Filters.BLACKLISTED_FILTERS.concat(props.blacklistedFilters),
      relativeDates: false,
    };
    this.toggle = this.toggle.bind(this);
    this.wrapRef = React.createRef();
  }

  componentWillReceiveProps(props) {
    if (props.className !== this.props.className) {
      this.setState({ open: false });
    }
  }

  toggle() {
    let filters = this.props.filters;
    if (this.props.filters.size === 0) {
      const available = Filters.findRelatedClasses(
        this.props.className,
        this.props.allClassesSchema,
        this.state.blacklistedFilters,
        this.state.filters
      );
      const { filterClass, filterField, filterConstraint } = Filters.getFilterDetails(available);
      filters = new List([
        new Map({ class: filterClass, field: filterField, constraint: filterConstraint }),
      ]);
    }
    this.setState(prevState => ({
      open: !prevState.open,
      filters: filters,
      name: '',
      confirmName: false,
      editMode: this.props.filters.size === 0,
      relativeDates: false, // Reset relative dates state when opening/closing
    }));
    this.props.setCurrent(null);
  }

  addRow() {
    const available = Filters.findRelatedClasses(
      this.props.className,
      this.props.allClassesSchema,
      this.state.blacklistedFilters,
      this.state.filters
    );
    const { filterClass, filterField, filterConstraint } = Filters.getFilterDetails(available);
    this.setState(({ filters }) => ({
      filters: filters.push(
        new Map({ class: filterClass, field: filterField, constraint: filterConstraint })
      ),
      editMode: true,
    }));
  }

  clear() {
    this.props.onChange(new Map());
  }

  apply() {
    const formatted = this.state.filters.map(filter => {
      // TODO: type is unused?
      /*let type = this.props.schema[filter.get('field')].type;
      if (Filters.Constraints[filter.get('constraint')].hasOwnProperty('field')) {
        type = Filters.Constraints[filter.get('constraint')].field;
      }*/

      // since we are preserving previous compareTo value
      // remove compareTo for constraints which are not comparable
      const isComparable = Filters.Constraints[filter.get('constraint')].comparable;
      if (!isComparable) {
        return filter.delete('compareTo');
      }
      return filter;
    });
    this.props.onChange(formatted);
  }

  save() {
    const formatted = this.state.filters.map(filter => {
      const isComparable = Filters.Constraints[filter.get('constraint')].comparable;
      if (!isComparable) {
        return filter.delete('compareTo');
      }
      return filter;
    });
    this.props.onSaveFilter(formatted, this.state.name, this.state.relativeDates);
    this.toggle();
  }

  render() {
    let popover = null;
    const buttonStyle = [styles.entry];
    const node = this.wrapRef.current;

    if (this.state.open) {
      const position = Position.inDocument(node);
      const popoverStyle = [styles.popover];
      buttonStyle.push(styles.title);

      if (this.props.filters.size) {
        popoverStyle.push(styles.active);
      }
      const available = Filters.findRelatedClasses(
        this.props.className,
        this.props.allClassesSchema,
        this.state.blacklistedFilters,
        this.state.filters
      );

      const hasDateState = this.state.filters.some(filter => filter.get('compareTo')?.__type === 'Date');
      popover = (
        <Popover
          fixed={true}
          position={position}
          onExternalClick={this.toggle}
          contentId={POPOVER_CONTENT_ID}
        >
          <div
            className={popoverStyle.join(' ')}
            onClick={() => this.props.setCurrent(null)}
            id={POPOVER_CONTENT_ID}
          >
            <div
              onClick={this.toggle}
              style={{
                cursor: 'pointer',
                width: node.clientWidth,
                height: node.clientHeight,
              }}
            ></div>
            <div className={styles.body}>
              <Filter
                className={this.props.className}
                blacklist={this.state.blacklistedFilters}
                schema={this.props.schema}
                filters={this.state.filters}
                onChange={filters => this.setState({ filters: filters })}
                onSearch={this.apply.bind(this)}
                allClasses={this.props.allClassesSchema}
                allClassesSchema={Filters.findRelatedClasses(
                  this.props.className,
                  this.props.allClassesSchema
                )}
                renderRow={props => (
                  <FilterRow
                    {...props}
                    active={this.props.filters.size > 0}
                    editMode={this.state.editMode}
                    parentContentId={POPOVER_CONTENT_ID}
                  />
                )}
              />
              {this.state.confirmName && (
                <>
                  <Field
                    label={<Label text="Filter view name" />}
                    input={
                      <TextInput
                        placeholder="Give it a good name..."
                        value={this.state.name}
                        onChange={name => this.setState({ name })}
                      />
                    }
                  />
                  {hasDateState &&
                  <Field
                    label={<Label text="Relative dates" />}
                    input={
                      <Checkbox
                        checked={this.state.relativeDates}
                        onChange={checked => this.setState({ relativeDates: checked })}
                        className={styles.checkbox}
                      />
                    }
                  />
                  }
                </>
              )}

              {this.state.confirmName && (
                <div className={styles.footer}>
                  <Button
                    color="white"
                    value="Back"
                    width="120px"
                    onClick={() => this.setState({ confirmName: false })}
                  />
                  <Button
                    color="white"
                    value="Confirm"
                    primary={true}
                    width="120px"
                    onClick={() => this.save()}
                  />
                </div>
              )}
              {!this.state.confirmName && (
                <div className={styles.footer}>
                  <div className={styles.btnFlex}>
                    <Button
                      color="white"
                      value="Save"
                      width="120px"
                      onClick={() => this.setState({ confirmName: true })}
                    />
                    <Button
                      color="white"
                      value="Clear"
                      disabled={this.state.filters.size === 0}
                      width="120px"
                      onClick={() => this.clear()}
                    />
                  </div>
                  <div className={styles.btnFlex}>
                    <Button
                      color="white"
                      value="Add"
                      disabled={Object.keys(available).length === 0}
                      width="120px"
                      onClick={() => this.addRow()}
                    />
                    <Button
                      color="white"
                      primary={true}
                      value="Apply"
                      width="120px"
                      onClick={() => this.apply()}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Popover>
      );
    }
    if (this.props.filters.size) {
      buttonStyle.push(styles.active);
    }
    if (this.props.disabled) {
      buttonStyle.push(styles.disabled);
    }
    return (
      <div className={styles.wrap} ref={this.wrapRef}>
        <div className={buttonStyle.join(' ')} onClick={this.toggle}>
          <Icon name="filter-solid" width={14} height={14} />
          <span>{this.props.filters.size ? 'Filtered' : 'Filter'}</span>
        </div>
        {popover}
      </div>
    );
  }
}
