/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import baseStyles     from 'stylesheets/base.scss';
import Button         from 'components/Button/Button.react';
import ChromeDropdown from 'components/ChromeDropdown/ChromeDropdown.react';
import DateTimeEntry  from 'components/DateTimeEntry/DateTimeEntry.react';
import {
  Constraints,
  FieldConstraints
}                       from 'components/ExplorerQueryComposer/ExplorerFilter';
import PropTypes      from 'lib/PropTypes';
import React          from 'react';
import styles         from 'components/ExplorerQueryComposer/ExplorerQueryComposer.scss';

const TABLE_SOURCES_LABEL = ['API Event', 'Custom Event'];

const FIELD_LABELS = {
  'API Event': [
    'Request Type',
    'Class',
    'Installation ID',
    'Parse User ID',
    'Parse SDK',
    'Parse SDK Version',
    'OS',
    'OS Version',
    'App Build Version',
    'App Display Version',
    'Timestamp (s)',
    'Latency (s)'
  ],
  'Custom Event': [
    'Event Name',
    'Dimensions',
    'Installation ID',
    'Parse User ID',
    'Parse SDK',
    'Parse SDK Version',
    'OS',
    'OS Version',
    'App Build Version',
    'App Display Version',
    'Timestamp (s)'
  ]
};

const AGGREGATE_TYPE_LABELS = [
  'Count', 'Count Distinct', 'Sum', 'Minimum', 'Median', '99th Percentile', 'Average'
];

const REQUIRED_GROUPING_LABELS = [
  'Time (day)', 'Time (hour)'
];

const ORDER_LABELS = [
  'Ascending', 'Descending'
];

const FIELD_TYPE = {
  'Request Type'        : 'String',
  'Class'               : 'String',
  'Event Name'          : 'String',
  /* eslint-disable no-constant-condition */
  'Dimensions'          : false ? 'JSON' : 'String', //In progress features. Change false to true to work on this feature.
  /* eslint-enable */
  'Installation ID'     : 'String',
  'Parse User ID'       : 'String',
  'Parse SDK'           : 'String',
  'Parse SDK Version'   : 'String',
  'OS'                  : 'String',
  'OS Version'          : 'String',
  'App Build Version'   : 'String',
  'App Display Version' : 'String',
  'Timestamp (s)'       : 'Date',
  'Latency (s)'         : 'Number',
};

let availableFilters = {};
for (let field in FIELD_TYPE) {
  availableFilters[field] = FieldConstraints[FIELD_TYPE[field]];
}

const TIMESERIES_DEFAULT_STATE = {
  groups: [REQUIRED_GROUPING_LABELS[0]],
  limit: undefined
};

const NON_TIMESERIES_DEFAULT_STATE = {
  aggregates: [],
  groups: [],
  limit: 100
};

let constraintLookup = {};
for (let c in Constraints) {
  constraintLookup[Constraints[c].name] = c;
}

let setFocus = (input) => {
  if (input !== null) {
    input.focus();
  }
};

function validateNumeric() {
  return true;
}

let fieldView = (type, value, onChangeValue) => {
  let fieldStyle = { width: '32%', marginLeft: '1%', display: 'inline-block' };
  switch (type) {
    case null:
      return null;
    case 'String':
      return <input type='text' className={styles.formInput} style={fieldStyle} value={value} onChange={(e) => onChangeValue(e.target.value)} ref={setFocus}/>;
    case 'Number':
      return <input type='number' className={styles.formInput} style={fieldStyle} value={value} onChange={(e) => onChangeValue(validateNumeric(e.target.value) ? e.target.value : (value || ''))} />;
    case 'Date':
      return <div style={fieldStyle}><DateTimeEntry fixed={true} className={styles.formInput} value={value || new Date()} onChange={onChangeValue} ref={setFocus}/></div>;
    default:
      throw new Error('Incompatible type ' + type + ' used to render fieldView.');
  }
};

export default class ExplorerQueryComposer extends React.Component {
  constructor(props) {
    super();

    let initialState = this.getInitialStateFromProps(props);
    this.state = {
      // newName is used to revert the edit if cancelled.
      newName: '',
      editing: false,
      isSaved: false,
      ...initialState
    };
  }

  getInitialStateFromProps(props) {
    let query = props.query || {};
    let defaultState = {};
    if (props.isTimeSeries) {
      defaultState = {
        ...TIMESERIES_DEFAULT_STATE,
        aggregates: [{
          op: AGGREGATE_TYPE_LABELS[0],
          col: FIELD_LABELS[TABLE_SOURCES_LABEL[0]][0]
        }]
      };
    } else {
      defaultState = NON_TIMESERIES_DEFAULT_STATE;
    }
    // Override with props if they exist. Otherwise, use default value.
    return {
      name: query.name || '',
      source: query.source || TABLE_SOURCES_LABEL[0],
      aggregates: query.aggregates || defaultState.aggregates,
      groups: query.groups || defaultState.groups,
      limit: query.limit || defaultState.limit,
      filters: query.filters || [],
      orders: query.orders || []
    };
  }

  getOrderOptions() {
    let options = [];
    this.state.aggregates.forEach((value, index) => {
      options.push({
        key: 'aggregate|' + index,
        value: [value.col, value.op].join(' ')
      });
    });

    this.state.groups.forEach((value, index) => {
      options.push({
        key: 'group|' + index,
        value: value
      });
    });

    return options;
  }

  componentWillReceiveProps(nextProps) {
    let initialState = this.getInitialStateFromProps(nextProps);
    this.setState({ ...initialState });
  }

  toggleEditing() {
    this.setState({
      editing: !this.state.editing,
      newName: this.state.name
    });
  }

  handleSave() {
    let query = this.props.query || {};
    this.props.onSave({
      source: this.state.source,
      name: this.state.name,
      aggregates: this.state.aggregates,
      groups: this.state.groups,
      limit: this.state.limit,
      filters: this.state.filters,
      // Only pass them if order is valid
      orders: this.state.orders.filter((order) => order.col !== null && order.col !== undefined),
      localId: query.localId,
      objectId: query.objectId
    });

    this.setState({
      editing: false,
      name: this.state.newName,
      isSaved: !!this.state.newName
    });
  }

  handleNameChange(e) {
    this.setState({ newName: e.nativeEvent.target.value });
  }

  handleAddAggregate() {
    this.setState({
      aggregates: this.state.aggregates.concat([{
        op: AGGREGATE_TYPE_LABELS[0],
        col: FIELD_LABELS[this.state.source][0]
      }])
    });
  }

  handleAddGroup() {
    this.setState({
      groups: this.state.groups.concat([
        FIELD_LABELS[this.state.source][0]
      ])
    });
  }

  handleAddFilter() {
    this.setState({
      filters: this.state.filters.concat([{
        op: '$eq',
        col: FIELD_LABELS[this.state.source][0],
        val: null
      }])
    });
  }

  handleAddOrder() {
    this.setState({
      orders: this.state.orders.concat([{
        col: null,
        asc: ORDER_LABELS[0]
      }])
    });
  }

  handleSourceChange(newSource) {
    let initialState = this.getInitialStateFromProps(this.props);
    this.setState({
      ...initialState,
      source: newSource
    });
  }

  removeAdditionalQuery(stateKey, index) {
    this.state[stateKey].splice(index, 1);
    this.setState({ [stateKey]: this.state[stateKey] });
  }

  renderAggregate(aggregate, index=0) {
    let deleteButton = null;
    if (!this.props.isTimeSeries || index !== 0 ) {
      deleteButton = (
        <div className={styles.delWrapper}>
          <button
            type='button'
            className={styles.del}
            onClick={this.removeAdditionalQuery.bind(this, 'aggregates', index)}>
            &times;
          </button>
        </div>
      );
    }

    return (
      <div className={styles.boxContent}>
        <div className={styles.halfBox}>
          <div className={styles.formLabel}>Aggregate</div>
          <ChromeDropdown
            value={aggregate.op}
            options={AGGREGATE_TYPE_LABELS}
            onChange={(val) => {
              let aggregates = this.state.aggregates;
              aggregates[index] = {
                op: val,
                col: FIELD_LABELS[this.state.source][0]
              };
              this.setState({ aggregates });
            }}
            color='blue'
            width='100%' />
        </div>

        <div className={styles.halfBox}>
          <div className={styles.formLabel} style={{ width: '40px' }}>of</div>
          <ChromeDropdown
            value={aggregate.col}
            options={FIELD_LABELS[this.state.source].filter(field => {
              switch (aggregate.op) {
                case 'Sum':
                case 'Median':
                case 'Average':
                  return FIELD_TYPE[field] === 'Number' || FIELD_TYPE[field] === 'Date';
                default:
                  return true;
              }
            })}
            onChange={(val) => {
              let aggregates = this.state.aggregates;
              aggregates[index].col = val;
              this.setState({ aggregates });
            }}
            color='blue'
            width='100%' />

          {deleteButton}
        </div>
      </div>
    );
  }

  renderGroup(grouping, index=0) {
    let deleteButton = null;
    let specialGroup = this.props.isTimeSeries && index === 0;
    if (!specialGroup) {
      deleteButton = (
        <div className={styles.delWrapper}>
          <button
            type='button'
            className={styles.del}
            onClick={this.removeAdditionalQuery.bind(this, 'groups', index)}>
            &times;
          </button>
        </div>
      );
    }

    return (
      <div className={styles.boxContent}>
        <div className={styles.formLabel}>Grouping</div>
        <ChromeDropdown
          value={grouping}
          options={specialGroup ? REQUIRED_GROUPING_LABELS : FIELD_LABELS[this.state.source]}
          onChange={(val) => {
            let groups = this.state.groups;
            groups[index] = val;
            this.setState({ groups });
          }}
          color='blue'
          width='100%' />

        {deleteButton}
      </div>
    );
  }

  renderFilter(filter, index=0) {
    let type = Object.prototype.hasOwnProperty.call(Constraints[filter.op], 'field') ? Constraints[filter.op].field : FIELD_TYPE[filter.col];

    let constraintView = null;
    if (type === 'JSON') {
      let isJSONView = filter.op === 'json_extract_scalar';

      let jsonView = null;
      if (isJSONView) {
        filter.json_scalar_op = filter.json_scalar_op || '$eq';

        jsonView = (
          <div style={{ marginTop: '10px' }}>
            <ChromeDropdown
              width='51%'
              color='blue'
              value={Constraints[filter.json_scalar_op].name}
              options={FieldConstraints['JSONValue'].map((c) => Constraints[c].name)}
              onChange={(val) => {
                let filters = this.state.filters;
                filters[index] = {
                  col: filter.col,
                  op: filter.op,
                  json_path: filter.json_path,
                  json_scalar_op: constraintLookup[val],
                  val: filter.val
                };
                this.setState({ filters });
              }} />

            <input
              className={[styles.formInput, styles.filterInputStyle].join(' ')}
              value={filter.val}
              onChange={(e) => {
                let filters = this.state.filters;
                filters[index] = {
                  col: filter.col,
                  op: filter.op,
                  json_path: filter.json_path,
                  json_scalar_op: filter.json_scalar_op,
                  val: e.target.value
                };
                this.setState({ filters });
              }} />
          </div>
        );
      }

      let constraintInputValue = isJSONView ? filter.json_path : filter.val;
      constraintView = (
        <div style={{ width: '65%', display: 'inline-block' }}>
          <div>
            <ChromeDropdown
              width='51%'
              color='blue'
              value={Constraints[filter.op].name}
              options={availableFilters[filter.col].map((c) => Constraints[c].name)}
              onChange={(val) => {
                let filters = this.state.filters;
                filters[index] = {
                  col: filter.col,
                  op: constraintLookup[val],
                  val: filter.val
                };
                this.setState({ filters });
              }} />

            <input
              className={[styles.formInput, styles.filterInputStyle].join(' ')}
              value={constraintInputValue}
              onChange={(e) => {
                let filters = this.state.filters;
                let newFilter = null;
                if (isJSONView) {
                  newFilter = {
                    col: filter.col,
                    op: filter.op,
                    val: filter.val,
                    json_path: e.target.value,
                    json_scalar_op: filter.json_scalar_op
                  };
                } else {
                  newFilter = {
                    col: filter.col,
                    op: filter.op,
                    val: e.target.value
                  }
                }
                filters[index] = newFilter;
                this.setState({ filters });
              }}
              ref={setFocus} />
          </div>

          {jsonView}
        </div>
      );
    } else {
      constraintView = (
        <span>
          <ChromeDropdown
            width={type ? '33%' : '65%'}
            color='blue'
            value={Constraints[filter.op].name}
            options={availableFilters[filter.col].map((c) => Constraints[c].name)}
            onChange={(val) => {
              let filters = this.state.filters;
              filters[index] = {
                col: filter.col,
                op: constraintLookup[val],
                val: null
              };
              this.setState({ filters });
            }} />

          {fieldView(type, filter.val, (val) => {
            let filters = this.state.filters;
            filters[index] = {
              col: filter.col,
              op: filter.op,
              val: val
            };
            this.setState({ filters });
          })}
        </span>
      );
    }

    return (
      <div className={styles.boxContent}>
        <div className={styles.formLabel}>Filter</div>
        <span style={{ marginRight: '1%' }}>
          <ChromeDropdown
            width='33%'
            color='blue'
            value={filter.col}
            options={FIELD_LABELS[this.state.source]}
            onChange={(val) => {
              let filters = this.state.filters;
              filters[index] = {
                col: val,
                op: '$eq',
                val: null
              };
              this.setState({ filters });
            }} />
        </span>

        {constraintView}

        <div className={styles.delWrapper}>
          <button
            type='button'
            className={styles.del}
            onClick={this.removeAdditionalQuery.bind(this, 'filters', index)}>
            &times;
          </button>
        </div>
      </div>
    );
  }

  renderOrder(order, index) {
    return (
      <div className={styles.boxContent}>
        <div className={styles.formLabel}>Sort by</div>
        <div className={styles.halfBox}>
          <ChromeDropdown
            placeholder='Column'
            value={order.col}
            options={this.getOrderOptions()}
            onChange={(val) => {
              let orders = this.state.orders;
              orders[index] = {
                col: val,
                asc: ORDER_LABELS[0]
              };
              this.setState({ orders });
            }}
            color='blue'
            width='100%' />
        </div>

        <div className={styles.halfBox}>
          <ChromeDropdown
            value={order.asc}
            options={ORDER_LABELS}
            onChange={(val) => {
              let orders = this.state.orders;
              orders[index].asc = val;
              this.setState({ orders });
            }}
            color='blue'
            width='100%' />

          <div className={styles.delWrapper}>
            <button
              type='button'
              className={styles.del}
              onClick={this.removeAdditionalQuery.bind(this, 'orders', index)}>
              &times;
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    let { query, isNew, isTimeSeries, onDismiss } = this.props;
    query = query || {};

    // First and foremost, let's not waste time if the query itself is not composable.
    if (query.nonComposable) {
      return (
        <div className={styles.queryComposer}>
          <div className={styles.header}>
            <div className={[baseStyles.center, styles.headerView].join(' ')}>
              <h3 className={styles.headerLabel}>{query.name}</h3>
            </div>
          </div>
          <div className={styles.footer}>
            <div className={[baseStyles.center, styles.boxContent].join(' ')}>
              <Button
                width='100%'
                value='Dismiss query'
                color='white'
                primary={true}
                onClick={onDismiss} />
            </div>
          </div>
        </div>
      );
    }

    let headerView = null;

    if (!isNew && this.state.editing) {
      headerView = (
        <div className={[baseStyles.center, styles.headerView].join(' ')}>
          <input
            type='text'
            className={[styles.headerLabel, styles.textInput].join(' ')}
            value={this.state.newName}
            onChange={this.handleNameChange.bind(this)}
            placeholder={'Give your query a name'} />
          <div className={styles.headerButtonCell}>
            <button
              type='button'
              className={styles.headerButton}
              onClick={this.handleSave.bind(this)}>
              { this.state.isSaved ? 'Rename' : 'Save' }
            </button>
          </div>
          <div className={styles.headerButtonCell}>
            <button
              type='button'
              className={[styles.headerButton, styles.secondaryColor].join(' ')}
              onClick={this.toggleEditing.bind(this)}>
              Cancel
            </button>
          </div>
        </div>
      );
    } else {
      headerView = (
        <div className={[baseStyles.center, styles.headerView].join(' ')}>
          <h3 className={styles.headerLabel}>{ this.state.name || 'Build a custom query' }</h3>
          { isNew ? null : (
            <div className={styles.headerButtonCell}>
              <button
                type='button'
                className={[styles.headerButton, styles.secondaryColor].join(' ')}
                onClick={this.toggleEditing.bind(this)}>
                { this.state.isSaved ? 'Rename' : 'Save' }
              </button>
            </div>
          )}
        </div>
      );
    }

    let aggregate = null;
    let group = null;
    let limit = null;
    let orders = null;
    if (isTimeSeries) {
      // On chart view, we show aggregate and group by default. And we also disallow limit.
      aggregate = (
        <div className={styles.queryComposerBox}>
          {this.renderAggregate(this.state.aggregates[0])}
        </div>
      );

      group = (
        <div className={styles.queryComposerBox}>
          {this.renderGroup(this.state.groups[0])}
        </div>
      );
    } else {
      // On table/json view, we hide aggregate and group. And we also show limit.
      limit = (
        <div className={styles.queryComposerBox}>
          <div className={styles.boxContent}>
            <div className={styles.formLabel}>Limit</div>
            <input
              type='number'
              className={styles.formInput}
              style={{ width: '100%' }}
              value={this.state.limit}
              onChange={(event) => this.setState({ limit: event.nativeEvent.target.value })} />
          </div>
        </div>
      );

      orders = this.state.orders.map((order, i) => (
        <div className={styles.queryComposerBox} key={`order_${i + 1}`}>
          {this.renderOrder(order, i)}
        </div>
      ));
    }

    let offset = isTimeSeries ? 1 : 0;
    let extraAggregateModels = isTimeSeries ? this.state.aggregates.slice(1) : this.state.aggregates;
    let extraAggregates = extraAggregateModels.map((aggregate, i) => (
      <div className={styles.queryComposerBox} key={`aggregate_${i + 1}`}>
        {this.renderAggregate(aggregate, i + offset)}
      </div>
    ));

    let extraGroupModels = isTimeSeries ? this.state.groups.slice(1) : this.state.groups;
    let extraGroups = extraGroupModels.map((group, i) => (
      <div className={styles.queryComposerBox} key={`group_${i + 1}`}>
        {this.renderGroup(group, i + offset)}
      </div>
    ));

    let filters = this.state.filters.map((filter, i) => (
      <div className={styles.queryComposerBox} key={`filter_${i}`}>
        {this.renderFilter(filter, i)}
      </div>
    ));

    let sortButton = null;
    if (!isTimeSeries) {
      sortButton = (
        <span className={styles.actionButton}>
          <Button
            width='100%'
            value='Order by'
            color='white'
            onClick={this.handleAddOrder.bind(this)} />
        </span>
      );
    }

    let footerButton = null;
    if (isNew) {
      footerButton = (
        <div className={styles.boxContent}>
          <Button
            width='100%'
            value='Add query'
            color='white'
            primary={true}
            onClick={this.handleSave.bind(this)} />
        </div>
      );
    } else {
      footerButton = (
        <div className={styles.boxContent}>
          <span className={styles.twoButton}>
            <Button
              width='100%'
              value='Dismiss query'
              color='white'
              onClick={onDismiss} />
          </span>
          <span className={styles.twoButton}>
            <Button
              width='100%'
              value={query.preset ? 'Duplicate as new query' : 'Update query'}
              color='white'
              primary={true}
              onClick={this.handleSave.bind(this)} />
          </span>
        </div>
      );
    }

    return (
      <div className={styles.queryComposer}>
        <div className={styles.header}>
          {headerView}
        </div>

        <div className={styles.queryComposerBox}>
          <div className={styles.boxContent}>
            <div className={styles.formLabel}>Source</div>
            <ChromeDropdown
              value={this.state.source}
              options={TABLE_SOURCES_LABEL}
              onChange={this.handleSourceChange.bind(this)}
              color='blue'
              width='100%' />
          </div>
        </div>

        {aggregate}
        {group}
        {limit}
        {extraAggregates}
        {extraGroups}
        {filters}
        {orders}

        <div className={styles.queryComposerBox}>
          <div className={styles.boxContent}>
            <span className={styles.actionButton}>
              <Button
                width='100%'
                value='Add aggregate'
                color='white'
                onClick={this.handleAddAggregate.bind(this)} />
            </span>
            <span className={styles.actionButton}>
              <Button
                width='100%'
                value='Add grouping'
                color='white'
                onClick={this.handleAddGroup.bind(this)} />
            </span>
            <span className={styles.actionButton}>
              <Button
                width='100%'
                value='Filter input rows'
                color='white'
                onClick={this.handleAddFilter.bind(this)} />
            </span>

            {sortButton}
          </div>
        </div>

        <div className={styles.footer}>
          {footerButton}
        </div>
      </div>
    );
  }
}

ExplorerQueryComposer.propTypes = {
  query: PropTypes.object.describe(
    'The query to be edited by this composer.'
  ),
  onSave: PropTypes.func.isRequired.describe(
    'Function to be called on query created/saved.'
  ),
  onDismiss: PropTypes.func.describe(
    'Function to be called on dismiss button clicked.'
  ),
  isNew: PropTypes.bool.describe(
    'True if the composer is trying to compose a new query. ' +
    'False if the composer is editing an existing one.'
  ),
  isTimeSeries: PropTypes.bool.describe(
    'If set to true, add default group (day, hour) and aggregate to the composer. ' +
    'Otherwise, render limit inside the composer.'
  )
}
