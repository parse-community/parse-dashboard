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
      currentScript: validScripts.find(script => script.name === scriptName),
    });
  }

  render() {
    const { validScripts } = this.state;
    const { selection, processedScripts } = this.props;

    return (
      <FormModal
        open
        icon="plus"
        iconSize={40}
        title="Select script run"
        submitText="Execute"
        inProgressText={`Executed ${processedScripts} of ${Object.keys(selection).length}`}
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
