/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import styles from 'components/BrowserFilter/BrowserFilter.scss';
import FilterRow from 'components/BrowserFilter/FilterRow.react';
import Button from 'components/Button/Button.react';
import Checkbox from 'components/Checkbox/Checkbox.react';
import Field from 'components/Field/Field.react';
import Filter from 'components/Filter/Filter.react';
import Icon from 'components/Icon/Icon.react';
import Label from 'components/Label/Label.react';
import Popover from 'components/Popover/Popover.react';
import TextInput from 'components/TextInput/TextInput.react';
import { CurrentApp } from 'context/currentApp';
import { List, Map } from 'immutable';
import * as ClassPreferences from 'lib/ClassPreferences';
import * as Filters from 'lib/Filters';
import Position from 'lib/Position';
import React from 'react';

const POPOVER_CONTENT_ID = 'browserFilterPopover';

export default class BrowserFilter extends React.Component {
  static contextType = CurrentApp;

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
      showMore: false,
      originalFilterName: '',
    };
    this.toggle = this.toggle.bind(this);
    this.wrapRef = React.createRef();
  }

  componentWillReceiveProps(props) {
    if (props.className !== this.props.className) {
      this.setState({ open: false });
    }
    
    // If we're in showMore mode and the filters have changed (e.g., after saving),
    // update the state filters to ensure proper date conversion
    if (this.state.showMore && props.filters !== this.props.filters) {
      this.setState({
        filters: this.convertRelativeDatesForDisplay(props.filters)
      });
    }
  }

  getCurrentFilterInfo() {
    // Extract filterId from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const filterId = urlParams.get('filterId');
    
    if (filterId) {
      const preferences = ClassPreferences.getPreferences(
        this.context.applicationId,
        this.props.className
      );
      
      if (preferences.filters) {
        const savedFilter = preferences.filters.find(filter => filter.id === filterId);
        if (savedFilter) {
          // Check if the filter has relative dates
          let hasRelativeDates = false;
          try {
            const filterData = JSON.parse(savedFilter.filter);
            hasRelativeDates = filterData.some(filter =>
              filter.compareTo && filter.compareTo.__type === 'RelativeDate'
            );
          } catch {
            // If parsing fails, assume no relative dates
            hasRelativeDates = false;
          }
          
          return {
            id: savedFilter.id,
            name: savedFilter.name,
            isApplied: true,
            hasRelativeDates: hasRelativeDates
          };
        }
      }
    }
    
    return {
      id: null,
      name: '',
      isApplied: false,
      hasRelativeDates: false
    };
  }

  toggleMore() {
    const currentFilter = this.getCurrentFilterInfo();
    
    // Convert RelativeDate objects to Date objects for proper display when entering edit mode
    const filtersForDisplay = this.convertRelativeDatesForDisplay(this.props.filters);
    
    this.setState(prevState => ({
      showMore: !prevState.showMore,
      name: currentFilter.name,
      originalFilterName: currentFilter.name,
      relativeDates: currentFilter.hasRelativeDates,
      filters: prevState.showMore ? prevState.filters : filtersForDisplay, // Only update filters when entering edit mode
    }));
  }

  isFilterNameExists(name) {
    const preferences = ClassPreferences.getPreferences(
      this.context.applicationId,
      this.props.className
    );
    
    if (preferences.filters && name) {
      return preferences.filters.some(filter =>
        filter.name === name && filter.id !== this.getCurrentFilterInfo().id
      );
    }
    return false;
  }

  hasFilterContentChanged() {
    // If we're not in showMore mode (editing a saved filter), return false
    if (!this.state.showMore) {
      return false;
    }

    // Compare current state filters with the originally applied filters
    const currentFilters = this.state.filters;
    const appliedFilters = this.props.filters;

    // If the sizes are different, content has changed
    if (currentFilters.size !== appliedFilters.size) {
      return true;
    }

    // Compare each filter
    for (let i = 0; i < currentFilters.size; i++) {
      const currentFilter = currentFilters.get(i);
      const appliedFilter = appliedFilters.get(i);

      // Compare each property of the filter
      const currentClass = currentFilter.get('class');
      const currentField = currentFilter.get('field');
      const currentConstraint = currentFilter.get('constraint');
      const currentCompareTo = currentFilter.get('compareTo');

      const appliedClass = appliedFilter.get('class');
      const appliedField = appliedFilter.get('field');
      const appliedConstraint = appliedFilter.get('constraint');
      const appliedCompareTo = appliedFilter.get('compareTo');

      // Check basic properties
      if (currentClass !== appliedClass ||
          currentField !== appliedField ||
          currentConstraint !== appliedConstraint) {
        return true;
      }

      // Special handling for date comparisons
      if (currentCompareTo && currentCompareTo.__type === 'Date' && appliedCompareTo && appliedCompareTo.__type === 'RelativeDate') {
        // Convert RelativeDate to Date for comparison
        const now = new Date();
        const appliedDate = new Date(now.getTime() + appliedCompareTo.value * 1000);
        const currentDate = new Date(currentCompareTo.iso);
        if (Math.abs(currentDate.getTime() - appliedDate.getTime()) > 1000) { // Allow 1 second tolerance
          return true;
        }
      } else if (currentCompareTo instanceof Date && appliedCompareTo && appliedCompareTo.__type === 'RelativeDate') {
        // Convert RelativeDate to Date for comparison
        const now = new Date();
        const appliedDate = new Date(now.getTime() + appliedCompareTo.value * 1000);
        if (Math.abs(currentCompareTo.getTime() - appliedDate.getTime()) > 1000) { // Allow 1 second tolerance
          return true;
        }
      } else if (!currentCompareTo && !appliedCompareTo) {
        // Both are null/undefined, continue
        continue;
      } else if (currentCompareTo instanceof Date && appliedCompareTo instanceof Date) {
        // Both are Date objects
        if (currentCompareTo.getTime() !== appliedCompareTo.getTime()) {
          return true;
        }
      } else if (currentCompareTo && currentCompareTo.__type === 'Date' && appliedCompareTo && appliedCompareTo.__type === 'Date') {
        // Both are Parse Date objects
        if (currentCompareTo.iso !== appliedCompareTo.iso) {
          return true;
        }
      } else if (currentCompareTo !== appliedCompareTo) {
        // Other types or one is Date and other is not
        return true;
      }
    }

    return false;
  }

  // Helper method to convert RelativeDate objects to Date objects for proper display
  convertRelativeDatesForDisplay(filters) {
    return filters.map(filter => {
      const compareTo = filter.get('compareTo');
      if (compareTo && compareTo.__type === 'RelativeDate') {
        // Convert RelativeDate to Parse Date format that Parse._decode can handle
        const now = new Date();
        const date = new Date(now.getTime() + compareTo.value * 1000);
        return filter.set('compareTo', {
          __type: 'Date',
          iso: date.toISOString(),
        });
      }
      return filter;
    });
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
    } else {
      // Convert RelativeDate objects to Date objects for proper display
      filters = this.convertRelativeDatesForDisplay(filters);
    }
    this.setState(prevState => ({
      open: !prevState.open,
      filters: filters,
      name: '',
      confirmName: false,
      editMode: this.props.filters.size === 0,
      relativeDates: false, // Reset relative dates state when opening/closing
      showMore: false, // Reset showMore state when opening/closing
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
    
    // If we're in showMore mode, we're editing an existing filter
    const currentFilterInfo = this.getCurrentFilterInfo();
    const filterId = this.state.showMore ? currentFilterInfo.id : null;
    
    this.props.onSaveFilter(formatted, this.state.name, this.state.relativeDates, filterId);
    
    // Only close the dialog if we're not in edit mode (showMore)
    if (!this.state.showMore) {
      this.toggle();
    } else {
      // In edit mode, update the original filter name to reflect the saved state
      // Also refresh the filters to ensure they're properly converted after save
      this.setState({
        originalFilterName: this.state.name,
        // Force re-conversion of filters after save to handle any date format changes
        filters: this.convertRelativeDatesForDisplay(this.props.filters)
      });
    }
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

      const hasDateState = this.state.filters.some(filter => {
        const compareTo = filter.get('compareTo');
        return compareTo && (compareTo.__type === 'Date' || compareTo instanceof Date);
      });
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

              {this.state.showMore && (
                <>
                  <Field
                    label={<Label text="Filter name" />}
                    input={
                      <TextInput
                        placeholder="Enter filter name..."
                        value={this.state.name}
                        onChange={name => this.setState({ name })}
                      />
                    }
                  />
                  {hasDateState && (
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
                  )}
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
                    disabled={!this.state.name || this.isFilterNameExists(this.state.name)}
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
                      disabled={this.state.showMore && (!this.state.name || (this.state.name === this.state.originalFilterName && !this.hasFilterContentChanged()) || this.isFilterNameExists(this.state.name))}
                      primary={this.state.showMore && this.state.name && (this.state.name !== this.state.originalFilterName || this.hasFilterContentChanged()) && !this.isFilterNameExists(this.state.name)}
                      onClick={() => {
                        if (this.state.showMore) {
                          // Update existing filter
                          this.save();
                        } else {
                          this.setState({ confirmName: true });
                        }
                      }}
                    />
                    {(() => {
                      const currentFilter = this.getCurrentFilterInfo();
                      const isAppliedSavedFilter = currentFilter.isApplied && this.props.filters.size > 0;
                      
                      if (isAppliedSavedFilter) {
                        return (
                          <Button
                            color="white"
                            value="More"
                            width="120px"
                            onClick={() => this.toggleMore()}
                          />
                        );
                      } else {
                        return (
                          <Button
                            color="white"
                            value="Clear"
                            disabled={this.state.filters.size === 0}
                            width="120px"
                            onClick={() => this.clear()}
                          />
                        );
                      }
                    })()}
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
