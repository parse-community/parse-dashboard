import React from 'react';
import FormModal from 'components/FormModal/FormModal.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import TextInput from 'components/TextInput/TextInput.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import { SpecialClasses } from 'lib/Constants';

export default class AttachSelectedRowsDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentClass: null,
      currentColumn: null,
      touchableColumns: [],
      targetObjectId: '',
      objectIds: [],
    };

    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleClassChange = this.handleClassChange.bind(this);
    this.handleColumnChange = this.handleColumnChange.bind(this);
    this.handleTargetObjectIdChange = this.handleTargetObjectIdChange.bind(this);
  }

  componentWillMount() {
    const { selection, classes, onSelectClass } = this.props;
    if (selection) {
      const currentClass = classes[0];
      const objectIds = [];
      for (const objectId in selection) {
        objectIds.push(objectId);
      }
      const touchableColumns = onSelectClass(currentClass);
      const currentColumn = touchableColumns[0];
      this.setState({
        currentClass: currentClass,
        touchableColumns,
        currentColumn,
        objectIds,
      });
    }
  }

  handleTargetObjectIdChange(targetObjectId) {
    this.setState({ targetObjectId });
  }

  handleConfirm() {
    const {
      currentClass,
      currentColumn,
      targetObjectId,
      objectIds,
    } = this.state;
    return this.props.onConfirm(currentClass, targetObjectId, currentColumn, objectIds);
  }

  handleClassChange(className) {
    const touchableColumns = this.props.onSelectClass(className);
    this.setState({
      currentClass: className,
      touchableColumns,
      currentColumn: touchableColumns[0],
    });
  }

  handleColumnChange(column) {
    this.setState({
      currentColumn: column,
    });
  }

  render() {
    const {
      classes,
    } = this.props;
    let targetRelationSelector;
    let targetEntityIdInsert;
      if (this.state.touchableColumns.length) {
        targetRelationSelector = (
          <Field
            label={
              <Label
                text="Target Relation"
                description="Target class's relation column"
              />
            }
            input={
              <Dropdown
                value={this.state.currentColumn}
                onChange={this.handleColumnChange}
              >
                {this.state.touchableColumns.map(column => (
                  <Option key={column} value={column}>
                    {column}
                  </Option>
                ))}
              </Dropdown>
            }
          />
        );
      }
      if (this.state.currentColumn) {
        targetEntityIdInsert = (
          <Field
            label={
              <Label
                text="Target objectId"
                description={`${this.state.currentClass} objectId`}
              />
            }
            input={
              <TextInput
                placeholder="ox0QZFl7eg, qs81Q72lTL, etc..."
                value={this.state.targetObjectId}
                onChange={this.handleTargetObjectIdChange}
              />
            }
          />
        );
      }
    return (
      <FormModal
        open
        icon="plus"
        iconSize={40}
        title="Attach Selected Rows to Relation"
        submitText="Attach"
        inProgressText="Attaching ..."
        onClose={this.props.onCancel}
        onSubmit={this.handleConfirm}
      >
        <Field
          label={
            <Label
              text="Target Class"
              description="Target relation's parent class"
            />
          }
          input={
            <Dropdown
              value={this.state.currentClass}
              onChange={this.handleClassChange}
            >
              {classes.map(className => (
                <Option key={className} value={className}>
                  {SpecialClasses[className] || className}
                </Option>
              ))}
            </Dropdown>
          }
        />
        {targetRelationSelector}
        {targetEntityIdInsert}
      </FormModal>
    );
  }
}
