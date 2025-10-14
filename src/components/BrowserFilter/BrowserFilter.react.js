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
import { List, Map as ImmutableMap } from 'immutable';
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
      name: '',
      blacklistedFilters: Filters.BLACKLISTED_FILTERS.concat(props.blacklistedFilters),
      relativeDates: false,
      showMore: false,
      originalFilterName: '',
      confirmDelete: false,
      originalFilters: new List(), // Track original filters when entering edit mode
      originalRelativeDates: false, // Track original relative dates setting when entering edit mode
    };
    this.toggle = this.toggle.bind(this);
    this.wrapRef = React.createRef();
  }

  getClassNameFromURL() {
    const pathParts = window.location.pathname.split('/');
    const browserIndex = pathParts.indexOf('browser');
    return browserIndex >= 0 && pathParts[browserIndex + 1]
      ? pathParts[browserIndex + 1]
      : this.props.className;
  }

  initializeEditFilterMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEditFilterMode = urlParams.get('editFilter') === 'true';

    if (isEditFilterMode && !this.state.open) {
      const currentFilter = this.getCurrentFilterInfo();
      let filtersToDisplay = this.props.filters;
      if (this.props.filters.size === 0) {
        filtersToDisplay = this.loadFiltersFromURL();
      }

      const filters = this.convertDatesForDisplay(filtersToDisplay);
      this.setState({
        open: true,
        showMore: true,
        filters: filters,
        editMode: true,
        name: currentFilter.name || '',
        originalFilterName: currentFilter.name || '',
        relativeDates: currentFilter.hasRelativeDates || false,
        originalRelativeDates: currentFilter.hasRelativeDates || false,
        originalFilters: filtersToDisplay,
      });
    }
  }

  componentWillReceiveProps(props) {
    if (props.className !== this.props.className) {
      this.setState({ open: false });
    }

    this.initializeEditFilterMode();
  }

  componentDidMount() {
    this.initializeEditFilterMode();
  }

  isCurrentFilterSaved() {
    // First check if there's a filterId in the URL (means we're definitely viewing a saved filter)
    const urlParams = new URLSearchParams(window.location.search);
    const filterId = urlParams.get('filterId');

    const urlClassName = this.getClassNameFromURL();

    if (filterId) {
      const preferences = ClassPreferences.getPreferences(
        this.context.applicationId,
        urlClassName
      );

      if (preferences.filters) {
        // If filterId exists in saved filters, it's definitely a saved filter
        const savedFilter = preferences.filters.find(filter => filter.id === filterId);
        if (savedFilter) {
          return true;
        }
      }
      // If filterId is in URL but not found in saved filters, it's not saved
      return false;
    }

    // Check for legacy filters (filters parameter without filterId)
    const filtersParam = urlParams.get('filters');
    if (filtersParam) {
      const preferences = ClassPreferences.getPreferences(
        this.context.applicationId,
        urlClassName
      );

      if (preferences.filters) {
        // Parse the URL filters parameter to get the actual filter data
        let urlFilters;
        try {
          urlFilters = JSON.parse(filtersParam);
        } catch {
          return false;
        }

        // Normalize URL filters for comparison (remove class property if it matches current className)
        const normalizedUrlFilters = urlFilters.map(filter => {
          const normalizedFilter = { ...filter };
          if (normalizedFilter.class === urlClassName) {
            delete normalizedFilter.class;
          }
          return normalizedFilter;
        });
        const urlFiltersString = JSON.stringify(normalizedUrlFilters);

        const matchingFilter = preferences.filters.find(savedFilter => {
          try {
            const savedFilters = JSON.parse(savedFilter.filter);
            // Normalize saved filters for comparison (remove class property if it matches current className)
            const normalizedSavedFilters = savedFilters.map(filter => {
              const normalizedFilter = { ...filter };
              if (normalizedFilter.class === urlClassName) {
                delete normalizedFilter.class;
              }
              return normalizedFilter;
            });
            const savedFiltersString = JSON.stringify(normalizedSavedFilters);
            return savedFiltersString === urlFiltersString;
          } catch {
            return false;
          }
        });

        return !!matchingFilter;
      }
    }

    return false;
  }

  getCurrentFilterInfo() {
    // Extract filterId from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const filterId = urlParams.get('filterId');
    const filtersParam = urlParams.get('filters');

    const urlClassName = this.getClassNameFromURL();

    if (filterId) {
      const preferences = ClassPreferences.getPreferences(
        this.context.applicationId,
        urlClassName
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
          } catch (error) {
            // Log parsing errors for debugging
            console.warn('Failed to parse saved filter:', error);
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

    // Check for legacy filters (filters parameter without filterId)
    if (filtersParam) {
      const preferences = ClassPreferences.getPreferences(
        this.context.applicationId,
        urlClassName
      );

      if (preferences.filters) {
        // Parse the URL filters parameter to get the actual filter data
        let urlFilters;
        try {
          urlFilters = JSON.parse(filtersParam);
        } catch (error) {
          console.warn('Failed to parse URL filters:', error);
          return {
            id: null,
            name: '',
            isApplied: false,
            hasRelativeDates: false,
            isLegacy: false
          };
        }

        // Normalize URL filters for comparison (remove class property if it matches current className)
        const normalizedUrlFilters = urlFilters.map(filter => {
          const normalizedFilter = { ...filter };
          if (normalizedFilter.class === urlClassName) {
            delete normalizedFilter.class;
          }
          return normalizedFilter;
        });
        const urlFiltersString = JSON.stringify(normalizedUrlFilters);

        const matchingFilter = preferences.filters.find(savedFilter => {
          try {
            const savedFilters = JSON.parse(savedFilter.filter);
            // Normalize saved filters for comparison (remove class property if it matches current className)
            const normalizedSavedFilters = savedFilters.map(filter => {
              const normalizedFilter = { ...filter };
              if (normalizedFilter.class === urlClassName) {
                delete normalizedFilter.class;
              }
              return normalizedFilter;
            });
            const savedFiltersString = JSON.stringify(normalizedSavedFilters);
            return savedFiltersString === urlFiltersString;
          } catch {
            return false;
          }
        });

        if (matchingFilter) {
          // Check if the filter has relative dates
          let hasRelativeDates = false;
          try {
            const filterData = JSON.parse(matchingFilter.filter);
            hasRelativeDates = filterData.some(filter =>
              filter.compareTo && filter.compareTo.__type === 'RelativeDate'
            );
          } catch (error) {
            console.warn('Failed to parse saved filter:', error);
            hasRelativeDates = false;
          }

          return {
            id: matchingFilter.id || null, // Legacy filters might not have an id
            name: matchingFilter.name,
            isApplied: true,
            hasRelativeDates: hasRelativeDates,
            isLegacy: !matchingFilter.id // Mark as legacy if no id
          };
        }
      }
    }

    return {
      id: null,
      name: '',
      isApplied: false,
      hasRelativeDates: false,
      isLegacy: false
    };
  }

  loadFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const filtersParam = urlParams.get('filters');
    const filterId = urlParams.get('filterId');

    const urlClassName = this.getClassNameFromURL();

    // If we have a filterId, load from saved filters
    if (filterId) {
      const preferences = ClassPreferences.getPreferences(
        this.context.applicationId,
        urlClassName
      );

      if (preferences.filters) {
        const savedFilter = preferences.filters.find(filter => filter.id === filterId);
        if (savedFilter) {
          try {
            const filterData = JSON.parse(savedFilter.filter);
            return new List(filterData.map(filter => {
              const processedFilter = { ...filter, class: filter.class || urlClassName };
              return new ImmutableMap(processedFilter);
            }));
          } catch (error) {
            console.warn('Failed to parse saved filter:', error);
          }
        }
      }
    }

    // If we have filters in URL but no filterId, parse them directly
    if (filtersParam) {
      try {
        const queryFilters = JSON.parse(filtersParam);
        return new List(queryFilters.map(filter => {
          const processedFilter = { ...filter, class: filter.class || urlClassName };
          return new ImmutableMap(processedFilter);
        }));
      } catch (error) {
        console.warn('Failed to parse URL filters:', error);
      }
    }

    return new List();
  }

  toggleMore() {
    const currentFilter = this.getCurrentFilterInfo();

    this.setState(prevState => {
      let filtersToUse;
      let originalFiltersToStore = prevState.originalFilters;

      if (!prevState.showMore) {
        // Entering edit mode
        // Store the original applied filters for comparison
        originalFiltersToStore = this.props.filters;

        // If we already have filters in state (e.g., user added fields), use those but convert only Parse dates
        // Otherwise, convert the props filters for display (preserving RelativeDate objects)
        if (prevState.filters.size > 0) {
          filtersToUse = this.convertDatesForDisplay(prevState.filters);
        } else {
          filtersToUse = this.convertDatesForDisplay(this.props.filters);
        }
      } else {
        // Exiting edit mode - preserve current state filters
        filtersToUse = prevState.filters;
      }

      return {
        showMore: !prevState.showMore,
        name: prevState.showMore ? prevState.name : currentFilter.name,
        originalFilterName: currentFilter.name,
        relativeDates: currentFilter.hasRelativeDates,
        filters: filtersToUse,
        originalFilters: originalFiltersToStore,
        originalRelativeDates: currentFilter.hasRelativeDates, // Track original relative dates setting
      };
    });
  }

  isFilterNameExists(name) {
    const urlClassName = this.getClassNameFromURL();

    const preferences = ClassPreferences.getPreferences(
      this.context.applicationId,
      urlClassName
    );

    if (preferences.filters && name) {
      const currentFilterInfo = this.getCurrentFilterInfo();
      return preferences.filters.some(filter => {
        // For filters with the same name, check if it's not the current filter
        if (filter.name === name) {
          // If current filter has an ID, exclude it by ID
          if (currentFilterInfo.id && filter.id === currentFilterInfo.id) {
            return false;
          }
          // If current filter is legacy (no ID), exclude it by name match
          if (currentFilterInfo.isLegacy && !filter.id && filter.name === currentFilterInfo.name) {
            return false;
          }
          return true;
        }
        return false;
      });
    }
    return false;
  }

  // Helper method to normalize filters for comparison
  // Converts all date formats to a consistent format for comparison
  normalizeFiltersForComparison(filters) {
    return filters.map(filter => {
      const compareTo = filter.get('compareTo');
      if (!compareTo) {
        return filter;
      }

      // Convert all date types to ISO string for consistent comparison
      if (compareTo instanceof Date) {
        return filter.set('compareTo', compareTo.toISOString());
      } else if (compareTo.__type === 'Date') {
        return filter.set('compareTo', compareTo.iso);
      } else if (compareTo.__type === 'RelativeDate') {
        // Convert RelativeDate to ISO string
        const now = new Date();
        const date = new Date(now.getTime() + compareTo.value * 1000);
        return filter.set('compareTo', date.toISOString());
      }
      return filter;
    });
  }

  hasFilterContentChanged() {
    // If we're not in showMore mode (editing a saved filter), return false
    if (!this.state.showMore) {
      return false;
    }

    // Check if relative dates setting has changed
    if (this.state.relativeDates !== this.state.originalRelativeDates) {
      return true;
    }

    // Compare current state filters with the original filters stored when entering edit mode
    const currentFilters = this.normalizeFiltersForComparison(this.state.filters);
    const originalFilters = this.normalizeFiltersForComparison(this.state.originalFilters);

    // If the sizes are different, content has changed
    if (currentFilters.size !== originalFilters.size) {
      return true;
    }

    // Compare each filter
    for (let i = 0; i < currentFilters.size; i++) {
      const currentFilter = currentFilters.get(i);
      const originalFilter = originalFilters.get(i);

      // Compare each property of the filter
      const currentClass = currentFilter.get('class');
      const currentField = currentFilter.get('field');
      const currentConstraint = currentFilter.get('constraint');
      const currentCompareTo = currentFilter.get('compareTo');

      const originalClass = originalFilter.get('class');
      const originalField = originalFilter.get('field');
      const originalConstraint = originalFilter.get('constraint');
      const originalCompareTo = originalFilter.get('compareTo');

      // Check all properties for equality
      if (currentClass !== originalClass ||
          currentField !== originalField ||
          currentConstraint !== originalConstraint ||
          currentCompareTo !== originalCompareTo) {
        return true;
      }
    }

    return false;
  }

  // Helper method to convert Parse Date objects, date strings, and RelativeDate objects to JavaScript Date objects
  // This ensures all UI components receive proper JavaScript Date objects
  convertDatesForDisplay(filters) {
    const result = filters.map(filter => {
      const compareTo = filter.get('compareTo');
      if (compareTo && compareTo.__type === 'RelativeDate') {
        // Convert RelativeDate to JavaScript Date for UI display
        const now = new Date();
        const date = new Date(now.getTime() + compareTo.value * 1000);
        return filter.set('compareTo', date);
      } else if (compareTo && compareTo.__type === 'Date') {
        // Convert Parse Date to JavaScript Date
        const date = new Date(compareTo.iso);
        return filter.set('compareTo', date);
      } else if (typeof compareTo === 'string' && !isNaN(Date.parse(compareTo))) {
        // Only convert date strings to JavaScript Date if the field type is actually Date
        const className = filter.get('class') || this.props.className;
        const fieldName = filter.get('field');
        const schema = this.props.schema;

        if (schema && className && fieldName) {
          const classSchema = schema[className];
          const fieldType = classSchema?.[fieldName]?.type;

          // Only convert to Date if the field type is actually Date
          if (fieldType === 'Date') {
            const date = new Date(compareTo);
            return filter.set('compareTo', date);
          }
        }
      }
      // Leave JavaScript Date objects and other types unchanged
      return filter;
    });
    return result;
  }  // Helper method to convert RelativeDate objects to Parse Date format for saving
  convertRelativeDatesToParseFormat(filters) {
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

  deleteCurrentFilter() {
    const currentFilterInfo = this.getCurrentFilterInfo();

    // Use parent's onDeleteFilter method which handles everything including force update
    if (this.props.onDeleteFilter) {
      // For legacy filters, we need to pass the entire filter object for the parent to match
      if (currentFilterInfo.isLegacy) {
        const preferences = ClassPreferences.getPreferences(this.context.applicationId, this.props.className);
        if (preferences.filters) {
          // Normalize current filters for comparison
          const currentFilters = this.props.filters.toJS().map(filter => {
            const normalizedFilter = { ...filter };
            if (normalizedFilter.class === this.props.className) {
              delete normalizedFilter.class;
            }
            return normalizedFilter;
          });
          const currentFiltersString = JSON.stringify(currentFilters);

          const matchingFilter = preferences.filters.find(filter => {
            if (!filter.id && filter.name === currentFilterInfo.name) {
              try {
                const savedFilters = JSON.parse(filter.filter);
                // Normalize saved filters for comparison
                const normalizedSavedFilters = savedFilters.map(savedFilter => {
                  const normalizedFilter = { ...savedFilter };
                  if (normalizedFilter.class === this.props.className) {
                    delete normalizedFilter.class;
                  }
                  return normalizedFilter;
                });
                const savedFiltersString = JSON.stringify(normalizedSavedFilters);
                return savedFiltersString === currentFiltersString;
              } catch {
                return false;
              }
            }
            return false;
          });

          if (matchingFilter) {
            this.props.onDeleteFilter(matchingFilter);
          }
        }
      } else if (currentFilterInfo.id) {
        // For modern filters with ID, just pass the ID
        this.props.onDeleteFilter(currentFilterInfo.id);
      }
    }

    // Remove filterId from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('filterId');
    // For legacy filters, also remove the filters parameter
    if (currentFilterInfo.isLegacy) {
      urlParams.delete('filters');
    }
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);

    // Clear current filters and close dialog
    this.props.onChange(new ImmutableMap());
    this.setState({ confirmDelete: false });
    this.toggle();
  }

  copyCurrentFilter() {
    // Remove filterId from URL so when saving it will create a new filter instead of updating
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('filterId');
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);

    // Clear the filter name so user can enter a new name
    this.setState({
      name: '',
      originalFilterName: ''
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
        new ImmutableMap({ class: filterClass, field: filterField, constraint: filterConstraint }),
      ]);
    } else {
      // Convert only Parse Date objects to JavaScript Date objects, preserve RelativeDate objects
      filters = this.convertDatesForDisplay(filters);
    }

    // If closing the dialog and we're in edit filter mode, remove the editFilter parameter
    const urlParams = new URLSearchParams(window.location.search);
    const isEditFilterMode = urlParams.get('editFilter') === 'true';

    if (this.state.open && isEditFilterMode) {
      urlParams.delete('editFilter');
      const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }

    this.setState(prevState => ({
      open: !prevState.open,
      filters: filters,
      name: '',
      editMode: this.props.filters.size === 0,
      relativeDates: false, // Reset relative dates state when opening/closing
      showMore: false, // Reset showMore state when opening/closing
      originalRelativeDates: false, // Reset original relative dates state when opening/closing
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
        new ImmutableMap({ class: filterClass, field: filterField, constraint: filterConstraint })
      ),
      editMode: true,
    }));
  }

  clear() {
    this.props.onChange(new ImmutableMap());
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
    // Store the original UI-friendly filters before any conversion
    const originalUIFilters = this.state.filters;

    let formatted = this.state.filters.map(filter => {
      const isComparable = Filters.Constraints[filter.get('constraint')].comparable;
      if (!isComparable) {
        return filter.delete('compareTo');
      }
      return filter;
    });

    // If relativeDates checkbox is checked, convert for saving but don't update component state
    if (this.state.relativeDates) {
      formatted = formatted.map(filter => {
        const compareTo = filter.get('compareTo');
        if (compareTo instanceof Date) {
          // Convert JavaScript Date back to RelativeDate format
          const now = new Date();
          const timeDiff = compareTo.getTime() - now.getTime();
          const relativeDate = {
            __type: 'RelativeDate',
            value: Math.round(timeDiff / 1000) // Convert milliseconds to seconds
          };
          return filter.set('compareTo', relativeDate);
        } else if (compareTo && compareTo.__type === 'Date') {
          // Convert Parse Date to RelativeDate format
          const parseDateObj = new Date(compareTo.iso);
          const now = new Date();
          const timeDiff = parseDateObj.getTime() - now.getTime();
          const relativeDate = {
            __type: 'RelativeDate',
            value: Math.round(timeDiff / 1000) // Convert milliseconds to seconds
          };
          return filter.set('compareTo', relativeDate);
        }
        return filter;
      });
    }

    // If we're in showMore mode, we're editing an existing filter
    const currentFilterInfo = this.getCurrentFilterInfo();
    let filterId = this.state.showMore ? currentFilterInfo.id : null;

    // For legacy filters (no ID), pass a special identifier so the save handler can convert them
    if (this.state.showMore && currentFilterInfo.isLegacy && !filterId) {
      // Pass the filter name as a special legacy identifier
      filterId = `legacy:${currentFilterInfo.name}`;
    }

    const savedFilterId = this.props.onSaveFilter(formatted, this.state.name, this.state.relativeDates, filterId);

    // Only close the dialog if we're not in edit mode (showMore)
    if (!this.state.showMore) {
      // For new filters, apply the saved filter and update URL
      this.props.onChange(formatted);

      // Update URL with the new filter ID if we got one back
      if (savedFilterId) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('filterId', savedFilterId);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
      }

      this.toggle();
    } else {
      // In edit mode, update the original filter name but keep the original UI-friendly filters
      // Convert any Parse Date objects in the UI filters to JavaScript Date objects for proper display
      const uiFilters = this.convertDatesForDisplay(originalUIFilters);

      this.setState({
        originalFilterName: this.state.name,
        filters: uiFilters, // Ensure UI stays with JavaScript Date objects
        originalFilters: uiFilters, // Update original filters to reflect the saved state
        originalRelativeDates: this.state.relativeDates, // Update original relative dates to reflect the saved state
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
        return compareTo && (compareTo instanceof Date || compareTo.__type === 'Date' || compareTo.__type === 'RelativeDate');
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

              {this.state.confirmDelete && (
                <div className={styles.footer}>
                  <Button
                    color="white"
                    value="Cancel"
                    width="120px"
                    onClick={() => this.setState({ confirmDelete: false })}
                  />
                  <Button
                    color="red"
                    value="Delete"
                    primary={true}
                    width="120px"
                    onClick={() => {
                      this.deleteCurrentFilter();
                    }}
                  />
                </div>
              )}
              {!this.state.confirmDelete && (
                <div className={styles.footer}>
                  {this.state.showMore && (
                    <div className={styles.btnFlex}>
                      <span
                        className={styles.iconButton}
                        onClick={() => this.toggleMore()}
                      >
                        <Icon
                          name="up-solid"
                          width={20}
                          height={20}
                          fill="white"
                        />
                      </span>
                      <div
                        style={{
                          width: '1px',
                          height: '20px',
                          backgroundColor: '#ffffff',
                          opacity: 0.3,
                          alignSelf: 'center'
                        }}
                      />
                      <span
                        className={this.state.name && (this.state.name !== this.state.originalFilterName || this.hasFilterContentChanged()) && !this.isFilterNameExists(this.state.name) ? styles.iconButton : styles.iconButtonDisabled}
                        onClick={() => {
                          if (this.state.name && (this.state.name !== this.state.originalFilterName || this.hasFilterContentChanged()) && !this.isFilterNameExists(this.state.name)) {
                            this.save();
                          }
                        }}
                      >
                        <Icon
                          name="check"
                          width={20}
                          height={20}
                          fill={this.state.name && (this.state.name !== this.state.originalFilterName || this.hasFilterContentChanged()) && !this.isFilterNameExists(this.state.name) ? '#00db7c' : 'white'}
                        />
                      </span>
                      {this.isCurrentFilterSaved() && (
                        <>
                          <span
                            className={styles.iconButton}
                            onClick={() => this.copyCurrentFilter()}
                          >
                            <Icon
                              name="clone-icon"
                              width={20}
                              height={20}
                              fill="white"
                            />
                          </span>
                          <span
                            className={styles.iconButton}
                            onClick={() => this.setState({ confirmDelete: true })}
                          >
                            <Icon
                              name="trash-solid"
                              width={20}
                              height={20}
                              fill="white"
                            />
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <div className={styles.btnFlex}>
                    {!this.state.showMore && (
                      <>
                        <span
                          className={styles.iconButton}
                          onClick={() => this.toggleMore()}
                        >
                          <Icon
                            name="down-solid"
                            width={20}
                            height={20}
                            fill="white"
                          />
                        </span>
                        <Button
                          color="white"
                          value="Clear"
                          disabled={this.state.filters.size === 0}
                          width="120px"
                          onClick={() => this.clear()}
                        />
                      </>
                    )}
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
