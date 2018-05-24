/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button     from 'components/Button/Button.react';
import Checkbox   from 'components/Checkbox/Checkbox.react';
import RadioButton   from 'components/RadioButton/RadioButton.react';
import Popover    from 'components/Popover/Popover.react';
import Position   from 'lib/Position';
import React      from 'react';
import SliderWrap from 'components/SliderWrap/SliderWrap.react';
import styles     from 'components/PermissionsCollaboratorDialog/PermissionsCollaboratorDialog.scss';
import Toggle     from 'components/Toggle/Toggle.react';
import { unselectable }                 from 'stylesheets/base.scss';
import Label     from 'components/Label/Label.react';
import Field from '../Field/Field.react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

let origin = new Position(0, 0);

function renderSimpleCheckboxes(feature, permissions, onChange) {
  return [
    <label key={feature + 'None' + 'label'} htmlFor={feature + 'None'}>
      <div key={feature + 'None' + 'div'} className={[styles.check, styles.second].join(' ')}>
          <RadioButton
            id={feature + 'None'}
            name={feature}
            className={styles.input}
            defaultChecked={permissions[feature] === 'None'}
            onChange={() => onChange(feature, 'None', permissions)}
          />None
      </div>
    </label>,
    <label key={feature + 'Read' + 'label'} htmlFor={feature + 'Read'}>
      <div key={feature + 'Read' + 'div'} className={[styles.check, styles.third].join(' ')}>
          <RadioButton
            id={feature + 'Read'}
            name={feature}
            className={styles.input}
            defaultChecked={permissions[feature] === 'Read'}
            onChange={() => onChange(feature, 'Read', permissions)}
          />Read
      </div>
    </label>,
    <label key={feature + 'Write' + 'label'} htmlFor={feature + 'Write'}>
      <div key={feature + 'Write' + 'div'} className={[styles.check, styles.third].join(' ')}>
        <RadioButton
          id={feature + 'Write'}
          name={feature}
          className={styles.input}
          defaultChecked={permissions[feature] === 'Write'}
          onChange={() => onChange(feature, 'Write', permissions)}
        />Write
      </div>
    </label>,
  ];
}

function renderSimpleLabels(permission) {
  if (permission === 'Write') return (<span>Write</span>)
  else if (permission === 'Read') return (<span>Read</span>)
  else return (<span>None</span>)
}

export default class PermissionsCollaboratorDialog extends React.Component {
  constructor({
                permissions,
                features
              }) {
    super();

    let customPermissions = Object.assign({}, permissions);

    this.state = {
      transitioning: false,
      showLevels: false,
      level: 'Simple', // 'Simple' | 'Advanced'
      customPermissions,
      features,
      selectedTab: 'Default' // 'Default' | 'Custom'
    };
  }

  setPermissions(feature, permission, customPermissions) {
    customPermissions[feature] = permission;
    this.setState({ customPermissions });
  }

  renderRows(isDefault) {
    let rows = [];
    let index = 0;
    for (let feature in this.props.permissions) {
      let text = this.state.features.label[index]
      let description = this.state.features.description[index]
      let label = <Label key={text  + (isDefault ? 'Label' : 'Input')} text={text} description={description}/>
      let content = null;
      if (isDefault) content = renderSimpleLabels(this.props.permissions[feature]);
      else content = renderSimpleCheckboxes(feature, this.state.customPermissions, this.setPermissions.bind(this));
      rows.push((<div key={feature + (isDefault ? 'Label' : 'Input')} className={styles.row}>
          <Field labelWidth={100} className={styles.label} label={label} />
          <Field labelWidth={100} className={[styles.label, styles.permission].join(' ')} label={content} />
        </div>))
      index++
    }
    return rows;
  }

  render() {
    let classes = [styles.dialog, unselectable];

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
          <div className={styles.tableWrap}>
            <div className={styles.table}>
              <Tabs>
                <div className={styles.subHeader}>
                  <div className={[styles.public, styles.row].join(' ')}>
                    <div className={styles.label}>
                      Features
                    </div>
                  </div>
                  <TabList className={styles.customTabList}>
                    <Tab>
                      <label>
                        <RadioButton
                          id='tab1'
                          name='Tab'
                          className={styles.radiobutton}
                          defaultChecked={true}
                          disabled={false}
                          onClick={() => this.setState({ selectedTab: 'Default' })}
                        />
                        Default
                      </label>
                    </Tab>
                    <Tab>
                      <label htmlFor='tab2'>
                        <RadioButton
                          id='tab2'
                          name='Tab'
                          disabled={false}
                          onClick={() => this.setState({ selectedTab: 'Custom' })}
                        />
                        Custom
                      </label>
                    </Tab>
                  </TabList>
                </div>
                <TabPanel>
                  {this.renderRows(true)}
                </TabPanel>
                <TabPanel>
                  {this.renderRows()}
                </TabPanel>
              </Tabs>

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
                onClick={() => {
                  this.props.onConfirm(
                    (this.state.selectedTab === 'Default' ?
                      this.props.permissions :
                      this.state.customPermissions
                    )
                  )
                }}
              />
              </div>
          </div>
        </div>
      </Popover>
    );
  }
}
