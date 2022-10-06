/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button from 'components/Button/Button.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import DropdownOption from 'components/Dropdown/Option.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Field from 'components/Field/Field.react';
import FormModal from 'components/FormModal/FormModal.react';
import Icon from 'components/Icon/Icon.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import React from 'react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import subscribeTo from 'lib/subscribeTo';
import TableHeader from 'components/Table/TableHeader.react';
import TableView from 'dashboard/TableView.react';
import TextInput from 'components/TextInput/TextInput.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import { ActionTypes as SchemaActionTypes } from 'lib/stores/SchemaStore';
import { ActionTypes as CodeActionTypes } from 'lib/stores/CodeStore';
import styles from './Code.scss';
import ParseCodeEditor from 'components/ParseCodeEditor/ParseCodeEditor.react';

let TableWarning = ({ text }) => (
  <div>
    <Icon name="warn-outline" fill="#343445" width={20} height={20} />
    <span style={{ position: 'relative', top: '2px' }}> {text}</span>
  </div>
);

const defaultState = {
  hookType: 'function',
  functionName: '',
  triggerClass: '',
  sourceCode: '',
};

export default
@subscribeTo('Code', 'code')
@subscribeTo('Schema', 'schema')
class Code extends TableView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Code';
    this.action = new SidebarAction(
      'Create a code',
      this.openNewCodeModal.bind(this)
    );
    this.state = {
      showNewCodeModal: false,
      showEditCodeModal: false,
      showDeleteCodeModal: false,
      currentObjectId: undefined,

      ...defaultState,
    };
  }

  componentWillMount() {
    this.props.code.dispatch(CodeActionTypes.FETCH);
    this.props.schema.dispatch(SchemaActionTypes.FETCH);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      nextProps.code.dispatch(CodeActionTypes.FETCH);
      nextProps.schema.dispatch(SchemaActionTypes.FETCH);
    }
  }

  renderToolbar() {
    return (
      <Toolbar section="Integrations" subsection="Code">
        <Button
          color="white"
          value="Create a Code"
          onClick={this.openNewCodeModal.bind(this)}
        />
      </Toolbar>
    );
  }

  clearFields() {
    this.setState({
      ...defaultState,
    });
  }

  renderExtras() {
    const that = this;
    let classNames = [];
    if (this.props.schema.data) {
      let classes = this.props.schema.data.get('classes');
      if (classes) {
        classNames = Object.keys(classes.toObject());
      }
    }

    const codeModalFields = (
      <div>
        <Field
          label={
            <Label
              text="Code type"
              description={
                <span>
                  Learn about{' '}
                  <a
                    target="_blank"
                    href="http://docs.parseplatform.org/cloudcode/guide#cloud-code-cloud-functions"
                  >
                    functions
                  </a>{' '}
                  and{' '}
                  <a
                    target="_blank"
                    href="http://docs.parseplatform.org/cloudcode/guide#cloud-code-beforesave-triggers"
                  >
                    triggers
                  </a>
                  .
                </span>
              }
            />
          }
          input={
            <Dropdown
              onChange={(value) => {
                this.setState({ hookType: value });
              }}
              disabled={!this.state.showNewCodeModal}
              value={this.state.hookType}
              fixed={true}
            >
              <DropdownOption value={'function'} key={'function'}>
                Cloud Function
              </DropdownOption>
              <DropdownOption value={'beforetrigger'} key={'beforetrigger'}>
                Before Trigger
              </DropdownOption>
              <DropdownOption value={'aftertrigger'} key={'aftertrigger'}>
                After Trigger
              </DropdownOption>
            </Dropdown>
          }
        />
        {this.state.hookType === 'function' ? (
          <Field
            label={
              <Label
                text="Could Function Name"
                description="This is your Cloud Function Name"
              />
            }
            input={
              <TextInput
                show
                placeholder="MyCloudFunction"
                disabled={!this.state.showNewCodeModal}
                onChange={(value) => {
                  this.setState({ functionName: value });
                }}
                value={this.state.functionName}
              />
            }
          />
        ) : (
          <Field
            label={<Label text="Choose a Class" />}
            input={
              <Dropdown
                disabled={!this.state.showNewCodeModal}
                onChange={(value) => {
                  this.setState({ triggerClass: value });
                }}
                value={this.state.triggerClass}
                fixed={true}
              >
                {/*TODO(drewgross)(non-blocking) display special classes without leading underscore*/}
                {classNames.map((name) => (
                  <DropdownOption key={name} value={name}>
                    {name}
                  </DropdownOption>
                ))}
              </Dropdown>
            }
          />
        )}
        {
          <>
            <div className={styles.label}>Source Code</div>

            <ParseCodeEditor
              showConsole={false}
              code={this.state.sourceCode}
              setCompile={(func) => (that.compileCode = func)}
              isModal={true}
            />
          </>
        }
      </div>
    );

    const hookRequestData = ({
      sourceCode,
      hookType,
      functionName,
      triggerClass,
    }) => {
      let data = { sourceCode };
      if (hookType === 'function') {
        data.functionName = functionName;
      } else {
        data.triggerName = hookType;
        data.triggerClass = triggerClass;
      }
      return data;
    };

    const newHookModal = (
      <FormModal
        key="new"
        title="Create Code"
        icon="collaborate-outline"
        iconSize={30}
        open={this.state.showNewCodeModal}
        onSubmit={async () => {
          this.setState({ sourceCode: await that.compileCode() });
          return this.props.code.dispatch(
            CodeActionTypes.CREATE,
            hookRequestData(this.state)
          );
        }}
        onClose={() => {
          this.setState({ showNewCodeModal: false });
        }}
        submitText="Create"
        inProgressText={'Creating\u2026'}
        clearFields={this.clearFields.bind(this)}
        enabled={true /* TODO: do some validation here */}
      >
        {codeModalFields}
      </FormModal>
    );

    const editHookModal = (
      <FormModal
        key="edit"
        title="Change your Code"
        subtitle="Code on external servers can be edited here."
        open={this.state.showEditCodeModal}
        onSubmit={async () => {
          this.setState({ sourceCode: await that.compileCode() });
          if (this.state.currentObjectId) {
            return this.props.code.dispatch(CodeActionTypes.EDIT, {
              ...hookRequestData(this.state),
              objectId: this.state.currentObjectId,
            });
          }
        }}
        onClose={() => {
          this.setState({
            showEditCodeModal: false,
            currentObjectId: undefined,
          });
        }}
        submitText="Save"
        inProgressText={'Saving\u2026'}
        clearFields={this.clearFields.bind(this)}
        enabled={true /* TODO: do some validation here */}
      >
        {codeModalFields}
      </FormModal>
    );

    const deleteHookModal = (
      <FormModal
        key="delete"
        title="Delete your Code"
        subtitle="Code on external servers can be deleted here."
        open={this.state.showDeleteCodeModal}
        type={Modal.Types.DANGER}
        onSubmit={() => {
          if (this.state.currentObjectId)
            return this.props.code.dispatch(CodeActionTypes.DELETE, {
              objectId: this.state.currentObjectId,
            });
        }}
        onClose={() => {
          this.setState({
            showDeleteCodeModal: false,
            currentObjectId: undefined,
          });
        }}
        submitText="Delete"
        inProgressText={'Deleting\u2026'}
        clearFields={() => {
          this.setState({
            ...defaultState,
          });
        }}
        enabled={true /* TODO: do some validation here */}
      >
        {codeModalFields}
      </FormModal>
    );
    return [newHookModal, editHookModal, deleteHookModal];
  }

  renderRow(hook) {
    const showEdit = () => {
      this.setState({
        hookType: hook.functionName ? 'function' : hook.triggerName,
        functionName: hook.functionName,
        triggerClass: hook.collectionName,
        sourceCode: hook.code,
        showEditCodeModal: true,
        currentObjectId: hook.objectId,
      });
    };

    const showDelete = () => {
      this.setState({
        hookType: hook.functionName ? 'function' : hook.triggerName,
        functionName: hook.functionName,
        triggerClass: hook.collectionName,
        sourceCode: hook.code,
        showDeleteCodeModal: true,
        currentObjectId: hook.objectId,
      });
    };
    const rowStyle = { cursor: 'pointer' };
    let deleteColumnContents = null;
    if (hook.code) {
      deleteColumnContents = (
        <button
          type="button"
          onClick={showDelete}
          className={styles.deleteButton}
        >
          <Icon name="trash-outline" fill="#343445" width={20} height={20} />
        </button>
      );
    } else {
      const isOverridden = !!this.tableData().find(
        (otherHook) =>
          otherHook.code &&
          otherHook.functionName == hook.functionName &&
          otherHook.triggerName == hook.triggerName
      );
      if (isOverridden) {
        deleteColumnContents = <TableWarning text="Overridden" />;
      }
    }
    return (
      <tr key={JSON.stringify(hook)}>
        <td style={rowStyle} onClick={showEdit} width={'15%'}>
          {hook.functionName ? 'Function' : 'Trigger'}
        </td>
        <td style={rowStyle} onClick={showEdit} width={'15%'}>
          {hook.collectionName || ''}
        </td>
        <td style={rowStyle} onClick={showEdit} width={'20%'}>
          {hook.functionName || hook.triggerName}
        </td>
        <td style={rowStyle} onClick={showEdit} width={'40%'}>
          {hook.code || ''}
        </td>
        <td width={'10%'}>{deleteColumnContents}</td>
      </tr>
    );
  }

  renderHeaders() {
    return [
      <TableHeader width={15} key="Type">
        Type
      </TableHeader>,
      <TableHeader width={15} key="Class">
        Class
      </TableHeader>,
      <TableHeader width={20} key="Method">
        Method
      </TableHeader>,
      <TableHeader width={40} key="SourceCode">
        Source Code
      </TableHeader>,
      <TableHeader width={10} key="Delete">
        &nbsp;
      </TableHeader>,
    ];
  }

  renderEmpty() {
    return (
      <EmptyState
        title="Code"
        description={<span>...</span>}
        icon="gears"
        cta="Create a Code"
        action={this.openNewCodeModal.bind(this)}
      />
    );
  }

  tableData() {
    if (this.props.code.data) {
      let hooks = this.props.code.data.get('code');
      if (hooks) {
        return hooks.toArray();
      }
    }
    return undefined;
  }

  openNewCodeModal() {
    this.setState({ showNewCodeModal: true });
  }
}
