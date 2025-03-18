import React from 'react';
import FormModal from 'components/FormModal/FormModal.react';
import Field from 'components/Field/Field.react';
import Label from 'components/Label/Label.react';
import Dropdown from 'components/Dropdown/Dropdown.react';
import Option from 'components/Dropdown/Option.react';
import { CurrentApp } from 'context/currentApp';

export default class ExecuteScriptRowsDialog extends React.Component {
  static contextType = CurrentApp;
  constructor(props) {
    super(props);

    this.state = {
      currentScript: null,
      validScripts: [],
    };

    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleScriptChange = this.handleScriptChange.bind(this);
  }

  componentWillMount() {
    const { selection, currentClass } = this.props;

    const validScripts = (this.context.scripts || []).filter(script =>
      script.classes?.includes(currentClass)
    );

    if (selection && validScripts.length > 0) {
      this.setState({
        currentScript: validScripts[0],
        validScripts: validScripts,
      });
    }
  }

  handleConfirm() {
    return this.props.onConfirm(this.state.currentScript);
  }

  handleScriptChange(scriptName) {
    this.setState({
      currentScript: this.state.validScripts.find(script => script.title === scriptName),
    });
  }

  render() {
    const { validScripts } = this.state;
    const { selection, processedScripts } = this.props;
    const selectionLength = Object.keys(selection).length;
    return (
      <FormModal
        open
        icon="gears"
        iconSize={40}
        title={
          selectionLength > 1
            ? `Run script on ${selectionLength} selected rows`
            : 'Run script on selected row'
        }
        submitText="Run"
        inProgressText={`Executed ${processedScripts} of ${selectionLength} rows`}
        onClose={this.props.onCancel}
        onSubmit={this.handleConfirm}
      >
        <Field
          label={<Label text="Script" />}
          input={
            <Dropdown value={this.state.currentScript?.title} onChange={this.handleScriptChange}>
              {validScripts.map(script => (
                <Option key={script.title} value={script.title}>
                  {script.title}
                </Option>
              ))}
            </Dropdown>
          }
        />
      </FormModal>
    );
  }
}
