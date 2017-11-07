/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as Filters          from 'lib/Filters';
import * as PushUtils        from 'lib/PushUtils';
import * as PushConstants    from 'dashboard/Push/PushConstants';
import Button                from 'components/Button/Button.react';
import Field                 from 'components/Field/Field.react';
import Filter                from 'components/Filter/Filter.react';
import FormNote              from 'components/FormNote/FormNote.react';
import InstallationCondition from 'components/PushAudienceDialog/InstallationCondition.react';
import Label                 from 'components/Label/Label.react';
import Modal                 from 'components/Modal/Modal.react';
import MultiSelect           from 'components/MultiSelect/MultiSelect.react';
import MultiSelectOption     from 'components/MultiSelect/MultiSelectOption.react';
import ParseApp              from 'lib/ParseApp';
import PropTypes             from 'lib/PropTypes';
import queryFromFilters      from 'lib/queryFromFilters';
import React                 from 'react';
import styles                from 'components/PushAudienceDialog/PushAudienceDialog.scss';
import TextInput             from 'components/TextInput/TextInput.react';
import Toggle                from 'components/Toggle/Toggle.react';
import { List, Map }         from 'immutable';

const PARSE_SERVER_SUPPORTS_SAVED_AUDIENCES = false;
const AUDIENCE_SIZE_FETCHING_ENABLED = false;

let filterFormatter = (filters, schema) => {
  return filters.map((filter) => {
    let type = schema[filter.get('field')];
    if (Filters.Constraints[filter.get('constraint')].hasOwnProperty('field')) {
      type = Filters.Constraints[filter.get('constraint')].field;
    }
    // Format any stringified fields
    if (type === 'Number') {
      return filter.set('compareTo', parseFloat(filter.get('compareTo')));
    }
    return filter;
  });
}

export default class PushAudienceDialog extends React.Component {
  constructor() {
    super();
    this.xhrHandle = null;
    this.state = {
      platforms: [],
      filters: new List(),
      saveForFuture: false,
      disabled: true,
      audienceName: '',
      audienceSize: undefined,
      approximate: false,
    };
  }

  componentWillMount() {
    let stateSettings = {};
    let audienceInfo = this.props.audienceInfo;
    //this case is only for 'New Segment' to prepopulate existing audience
    if (audienceInfo) {
      if (audienceInfo.query) {
        let { deviceType } = audienceInfo.query;
        stateSettings.platforms = deviceType.$in || [];
      }
      if (audienceInfo.filters) {
        stateSettings.filters = audienceInfo.filters;
      }
      if (audienceInfo.name) {
        stateSettings.audienceName = audienceInfo.name;
      }
      this.setState(stateSettings, this.fetchAudienceSize.bind(this));
    }
  }

  componentWillUnmount() {
    if (this.xhrHandle) {
      this.xhrHandle.abort();
    }
  }

  handleChange(newValue) {
    this.setState(
      { platforms: newValue },
      this.fetchAudienceSize.bind(this)
    );
  }

  handleAddCondition() {
    let available = Filters.availableFilters(this.props.schema, this.state.filters);
    let field = Object.keys(available)[0];
    this.setState(({ filters }) => ({
      filters: filters.push(new Map({ field: field, constraint: available[field][0] }))
    }), this.fetchAudienceSize.bind(this));
  }

  handleAudienceName(name) {
    //TODO: add some client side regex validation for immediate feedback
    this.setState({ audienceName: name });
  }

  handleSaveForFuture(value) {
    this.setState({ saveForFuture: value });
  }

  fetchAudienceSize() {
    if (!this.context || !this.context.currentApp) { //so we don't break the PIG demo
      return;
    }

    let query = {};
    let parseQuery = queryFromFilters('_Installation', this.state.filters);

    if (parseQuery && parseQuery.toJSON()) {
      query = parseQuery.toJSON().where || {};
    }
    query.deviceType = { $in: this.state.platforms };
    let {xhr, promise} = this.context.currentApp.fetchPushSubscriberCount(PushConstants.NEW_SEGMENT_ID, query);
    if (this.xhrHandle) { //cancel existing xhr - prevent from stacking
      this.xhrHandle.abort();
    }
    this.xhrHandle = xhr;
    promise.then(({ approximate, count }) => {
      this.setState({
        approximate,
        audienceSize: count,
      });
    });
  }

  valid() {
    if (this.state.platforms.length === 0) {//check that at least one platform is chosen
      return false;
    }

    if ((this.state.saveForFuture || this.props.disableNewSegment) && this.state.audienceName.length === 0) { //check that a name is written
      return false;
    }
    //TODO check if conditions are valid
    return true;
  }

  render() {
    let options = [];
    let availableDevices = this.props.availableDevices;
    // TODO: handle empty case when 0 devices - should display link to device creation.
    // TODO: handle misconfigured device link
    for (let index in availableDevices) {
      options.push(
        <MultiSelectOption
          key={`device${index}`}
          value={availableDevices[index]}>
          {PushConstants.DEVICE_MAP[availableDevices[index]]}
        </MultiSelectOption>
      );
    }
    let platformSelect = (
      <MultiSelect
        endDelineator='or'
        fixed={true}
        value={this.state.platforms}
        onChange={this.handleChange.bind(this)}
        placeHolder='Choose some platforms...'>
        {options}
      </MultiSelect>
    );
    let nonEmptyConditions = this.state.filters.size !== 0 ? true : false;
    let audienceSize = PushUtils.formatCountDetails(this.state.audienceSize, this.state.approximate);
    let customFooter = (
      <div className={styles.footer}>
        {AUDIENCE_SIZE_FETCHING_ENABLED ? <div
          className={styles.audienceSize}>
          <div className={styles.audienceSizeText}>AUDIENCE SIZE</div>
          <div className={styles.audienceSizeDescription}>{audienceSize}</div>
        </div> : null}
        <Button
          value='Cancel'
          onClick={this.props.secondaryAction}/>
        <Button
          primary={true}
          progress={this.props.progress}
          value={this.props.progress ? 'Creating audience...' : 'Use this audience'}
          color='blue'
          disabled={!this.valid()}
          onClick={this.props.primaryAction.bind(undefined,
            {
              platforms: this.state.platforms,
              name: this.state.audienceName,
              filters: this.state.filters,
              formattedFilters: filterFormatter(this.state.filters, this.props.schema),
              saveForFuture: this.state.saveForFuture,
            })} />
      </div>
    );

    let futureUseSegment = [];

    if (!this.props.disableNewSegment) {
      if (PARSE_SERVER_SUPPORTS_SAVED_AUDIENCES) {
        futureUseSegment.push(
          <Field
            key={'saveForFuture'}
            label={<Label text='Save this audience for future use?'/>}
            input={<Toggle value={this.state.saveForFuture} type={Toggle.Types.YES_NO} onChange={this.handleSaveForFuture.bind(this)} />} />
        );
      }

      if (this.state.saveForFuture) {
        futureUseSegment.push(
          <Field
            key={'audienceName'}
            labelWidth={55}
            label={<Label text='Audience name' />}
            input={<TextInput placeholder='Choose a name...' onChange={this.handleAudienceName.bind(this)} />} />
        );
      }
    } else {
      futureUseSegment.push(
        <Field
          key={'audienceName'}
          labelWidth={55}
          label={<Label text='Audience name' />}
          input={<TextInput placeholder='Choose a name...' onChange={this.handleAudienceName.bind(this)} />} />
      );
    }

    return (
      <Modal
        title={ this.props.editMode ? 'Edit audience' : 'Create a new audience'}
        type={Modal.Types.INFO}
        icon='plus-outline'
        width={900}
        customFooter={customFooter} >
        <Field
          labelWidth={55}
          label={<Label text='Which platforms should be included?' />}
          input={platformSelect} />
        <div className={styles.filter}>
        <Filter
          schema={this.props.schema}
          filters={this.state.filters}
          onChange={(filters) =>
            {
              this.setState(
                { filters },
                this.fetchAudienceSize.bind(this)
              );
            }
          }
          renderRow={(props) => <InstallationCondition {...props} />} />
        </div>
        <div className={[styles.addConditions, nonEmptyConditions ? styles.nonEmptyConditions : ''].join(' ')}>
          <Button value={nonEmptyConditions ? 'Add another condition' : 'Add a condition'} onClick={this.handleAddCondition.bind(this)}/>
        </div>
        {futureUseSegment}
        <FormNote
          show={Boolean(this.props.errorMessage && this.props.errorMessage.length > 0)}
          color='red' >
          {this.props.errorMessage}
        </FormNote>
      </Modal>
    );
  }
}

PushAudienceDialog.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};

PushAudienceDialog.propTypes = {
  editMode: PropTypes.bool.describe(
    'Flag if true to be edit mode of dialog.'
  ),
  primaryAction: PropTypes.func.isRequired.describe(
    'Primary callback triggered when submitting modal.'
  ),
  secondaryAction: PropTypes.func.isRequired.describe(
    'Secondary callback triggered when submitting modal.'
  ),
  schema: PropTypes.object.isRequired.describe(
    'A class schema, mapping field names to their Type strings.'
  ),
  audienceInfo: PropTypes.object.describe(
    'Audience info (name, query, platforms) to prepopulate the dialog.'
  ),
  disableNewSegment: PropTypes.bool.describe(
    'Flag if true to be disable creation of a temp one time use segment.'
  ),
  availableDevices: PropTypes.arrayOf(PropTypes.string).describe(
    'List of all availableDevices devices for push notifications.'
  ),
};

