/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button                                from 'components/Button/Button.react';
import Dropdown                              from 'components/Dropdown/Dropdown.react';
import DropdownOption                        from 'components/Dropdown/Option.react';
import EmptyState                            from 'components/EmptyState/EmptyState.react';
import Field                                 from 'components/Field/Field.react';
import FormModal                             from 'components/FormModal/FormModal.react';
import Icon                                  from 'components/Icon/Icon.react';
import Label                                 from 'components/Label/Label.react';
import Modal                                 from 'components/Modal/Modal.react';
import React                                 from 'react';
import SidebarAction                         from 'components/Sidebar/SidebarAction';
import subscribeTo                           from 'lib/subscribeTo';
import TableHeader                           from 'components/Table/TableHeader.react';
import TableView                             from 'dashboard/TableView.react';
import TextInput                             from 'components/TextInput/TextInput.react';
import Toolbar                               from 'components/Toolbar/Toolbar.react';
import { ActionTypes as SchemaActionTypes }  from 'lib/stores/SchemaStore';
import { ActionTypes as WebhookActionTypes } from 'lib/stores/WebhookStore';
import styles                                from './Webhooks.scss'

let TableWarning = ({ text }) => <div>
  <Icon name='warn-outline' fill='#343445' width={20} height={20}/><span style={{ position: 'relative', top: '2px' }}> {text}</span>
</div>;

export default
@subscribeTo('Webhooks', 'webhooks')
@subscribeTo('Schema', 'schema')
class Webhooks extends TableView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Webhooks';
    this.action = new SidebarAction('Create a webhook', this.openNewWebhookModal.bind(this));
    this.state = {
      showNewWebhookModal: false,
      showEditWebhookModal: false,
      showDeleteWebhookModal: false,

      hookType: 'function',
      functionName: '',
      triggerClass: '',
      hookURL: 'https://',
    };
  }

  componentWillMount() {
    this.props.webhooks.dispatch(WebhookActionTypes.FETCH);
    this.props.schema.dispatch(SchemaActionTypes.FETCH);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      nextProps.webhooks.dispatch(WebhookActionTypes.FETCH);
      nextProps.schema.dispatch(SchemaActionTypes.FETCH);
    }
  }

  renderToolbar() {
    return <Toolbar
      section='Integrations'
      subsection='Webhooks'>
      <Button
        color='white'
        value='Create a Webhook'
        onClick={this.openNewWebhookModal.bind(this)}/>
    </Toolbar>;
  }

  clearFields() {
    this.setState({
      hookType: 'function',
      functionName: '',
      triggerClass: '',
      hookURL: 'https://',
    });
  }

  renderExtras() {
    let classNames = [];
    if (this.props.schema.data) {
      let classes = this.props.schema.data.get('classes')
      if (classes) {
        classNames = Object.keys(classes.toObject());
      }
    }

    let webhookModalFields = <div>
      <Field
        label={<Label
          text='Webhook type'
          description={<span>Learn about <a target='_blank' href='http://docs.parseplatform.org/cloudcode/guide#cloud-code-cloud-functions'>functions</a> and <a target='_blank' href='http://docs.parseplatform.org/cloudcode/guide#cloud-code-beforesave-triggers'>triggers</a>.</span>}
        />}
        input={<Dropdown
          onChange={value => {
            this.setState({hookType: value});
          }}
          disabled={!this.state.showNewWebhookModal}
          value={this.state.hookType}
          fixed={true}>
          <DropdownOption value={'function'} key={'function'}>Function</DropdownOption>
          <DropdownOption value={'beforeSave'} key={'beforeSave'}>beforeSave</DropdownOption>
          <DropdownOption value={'afterSave'} key={'afterSave'}>afterSave</DropdownOption>
          <DropdownOption value={'beforeDelete'} key={'beforeDelete'}>beforeDelete</DropdownOption>
          <DropdownOption value={'afterDelete'} key={'afterDelete'}>afterDelete</DropdownOption>
        </Dropdown>} />
        {this.state.hookType === 'function' ? <Field
          label={<Label text='Function name' description='This is how you will reference your webhook'/>}
          input={<TextInput
            placeholder='MyWebhook'
            disabled={!this.state.showNewWebhookModal}
            onChange={value => {
              this.setState({functionName: value});
            }}
            value={this.state.functionName}
          />} /> : <Field
          label={<Label text='Choose a Class'/>}
          input={<Dropdown
            disabled={!this.state.showNewWebhookModal}
            onChange={value => {
              this.setState({triggerClass: value});
            }}
            value={this.state.triggerClass}
            fixed={true}>
              {/*TODO(drewgross)(non-blocking) display special classes without leading underscore*/}
              {classNames.map(name => <DropdownOption key={name} value={name}>{name}</DropdownOption>)}
          </Dropdown>} />
        }
        <Field
          label={<Label text='Webhook URL' />}
          input={<TextInput
            disabled={this.state.showDeleteWebhookModal}
            onChange={value => {
              this.setState({hookURL: value})
            }}
            value={this.state.hookURL}
          />} />
    </div>

    let hookRequestData = ({hookURL, hookType, functionName, triggerClass}) => {
      let data = { hookURL: hookURL };
      if (hookType === 'function') {
        data.functionName = functionName;
      } else {
        data.triggerName = hookType;
        data.triggerClass = triggerClass;
      }
      return data;
    };

    let newHookModal = <FormModal
      key='new'
      title='Create a Webhook'
      icon='collaborate-outline'
      iconSize={30}
      open={this.state.showNewWebhookModal}
      onSubmit={() => {
        return this.props.webhooks.dispatch(WebhookActionTypes.CREATE, hookRequestData(this.state));
      }}
      onClose={() => {
        this.setState({showNewWebhookModal: false});
      }}
      submitText='Create'
      inProgressText={'Creating\u2026'}
      clearFields={this.clearFields.bind(this)}
      enabled={true /* TODO: do some validation here */}>
      {webhookModalFields}
    </FormModal>;

    let editHookModal = <FormModal
      key='edit'
      title='Change your Webhook'
      subtitle='Webhooks on external servers can be edited here.'
      open={this.state.showEditWebhookModal}
      onSubmit={() => {
        return this.props.webhooks.dispatch(WebhookActionTypes.EDIT, hookRequestData(this.state));
      }}
      onClose={() => {
        this.setState({showEditWebhookModal: false});
      }}
      submitText='Save'
      inProgressText={'Saving\u2026'}
      clearFields={this.clearFields.bind(this)}
      enabled={true /* TODO: do some validation here */}>
      {webhookModalFields}
    </FormModal>;

    let deleteHookModal = <FormModal
      key='delete'
      title='Delete your Webhook'
      subtitle='Webhooks on external servers can be deleted here.'
      open={this.state.showDeleteWebhookModal}
      type={Modal.Types.DANGER}
      onSubmit={() => {
        if (this.state.hookType === 'function') {
          return this.props.webhooks.dispatch(WebhookActionTypes.DELETE, {
            functionName: this.state.functionName,
          });
        } else {
          return this.props.webhooks.dispatch(WebhookActionTypes.DELETE, {
            triggerName: this.state.hookType,
            triggerClass: this.state.triggerClass,
          });
        }
      }}
      onClose={() => {
        this.setState({showDeleteWebhookModal: false});
      }}
      submitText='Delete'
      inProgressText={'Deleting\u2026'}
      clearFields={() => {
        this.setState({
          hookType: 'function',
          functionName: '',
          triggerClass: '',
          hookURL: 'https://',
        });
      }}
      enabled={true /* TODO: do some validation here */}>
      {webhookModalFields}
    </FormModal>;
    return [newHookModal, editHookModal, deleteHookModal];
  }

  renderRow(hook) {
    let showEdit = hook.url ? () => {
      this.setState({
        hookType: hook.functionName ? 'function' : hook.triggerName,
        functionName: hook.functionName,
        triggerClass: hook.className,
        hookURL: hook.url,
        showEditWebhookModal: true,
      });
    } : null;

    let showDelete = hook.url ? () => {
      this.setState({
        hookType: hook.functionName ? 'function' : hook.triggerName,
        functionName: hook.functionName,
        triggerClass: hook.className,
        hookURL: hook.url,
        showDeleteWebhookModal: true,
      });
    } : null;
    let rowStyle = hook.url ? { cursor: 'pointer' } : {};
    let deleteColumnContents = null;
    if (hook.url) {
      deleteColumnContents = <button type='button' onClick={showDelete} className={styles.deleteButton}>
        <Icon name='trash-outline' fill='#343445' width={20} height={20}/>
      </button>;
    } else {
      let isOverridden = !!this.tableData().find(otherHook => otherHook.url &&
        otherHook.functionName == hook.functionName &&
        otherHook.triggerName == hook.triggerName);
      if (isOverridden) {
        deleteColumnContents = <TableWarning text='Overridden' />;
      }
    }
    return <tr
      key={JSON.stringify(hook)}>
      <td style={rowStyle} onClick={showEdit} width={'15%'}>{hook.functionName ? 'Function' : 'Trigger'}</td>
      <td style={rowStyle} onClick={showEdit} width={'15%'}>{hook.className || ''}</td>
      <td style={rowStyle} onClick={showEdit} width={'20%'}>{hook.functionName || hook.triggerName}</td>
      <td style={rowStyle} onClick={showEdit} width={'40%'}>{hook.url || 'Cloud Code'}</td>
      <td width={'10%'}>{deleteColumnContents}</td>
    </tr>;
  }

  renderHeaders() {
    return [
      <TableHeader width={15} key='Type'>Type</TableHeader>,
      <TableHeader width={15} key='Class'>Class</TableHeader>,
      <TableHeader width={20} key='Method'>Method</TableHeader>,
      <TableHeader width={40} key='Destination'>Destination</TableHeader>,
      <TableHeader width={10} key='Delete'>&nbsp;</TableHeader>,
    ];
  }

  renderEmpty() {
    return <EmptyState
      title='Webhooks'
      description={<span>Use webhooks to run Cloud Code or connect Parse to your own server. <a href='http://docs.parseplatform.org/cloudcode/guide/#cloud-code-webhooks' target='_blank'>Learn more</a>.</span>}
      icon='gears'
      cta='Create a Webhook'
      action={this.openNewWebhookModal.bind(this)} />
  }

  tableData() {
    if (this.props.webhooks.data) {
      let hooks = this.props.webhooks.data.get('webhooks');
      if (hooks) {
        return hooks.toArray();
      }
    }
    return undefined;
  }

  openNewWebhookModal() {
    this.setState({showNewWebhookModal: true});
  }
}
