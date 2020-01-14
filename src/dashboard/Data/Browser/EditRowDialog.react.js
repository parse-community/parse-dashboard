import React from "react";
import Parse from "parse";
import Modal from "components/Modal/Modal.react";
import FormModal from "components/FormModal/FormModal.react";
import Field from "components/Field/Field.react";
import Label from "components/Label/Label.react";
import TextInput from "components/TextInput/TextInput.react";
import DateTimeInput from "components/DateTimeInput/DateTimeInput.react";
import Toggle from "components/Toggle/Toggle.react";
import Pill from "components/Pill/Pill.react";
import GeoPointEditor from "components/GeoPointEditor/GeoPointEditor.react";
import FileEditor from "components/FileEditor/FileEditor.react";

export default class EditRowDialog extends React.Component {
  constructor(props) {
    super(props);

    const { selectedObject, columns } = this.props;
    const currentObject = { ...selectedObject };
    columns.forEach(column => {
      const { name, type } = column;
      if (["Array", "Object"].indexOf(type) >= 0) {
        currentObject[name] = JSON.stringify(currentObject[name], null, 2);
      }
      if (type === "Polygon") {
        currentObject[name] = JSON.stringify(
          (currentObject[name] && currentObject[name].coordinates) || [
            ["lat", "lon"]
          ],
          null,
          2
        );
      }
      if (type === "Pointer") {
        currentObject[name] =
          (currentObject[name] && currentObject[name].id) || "";
      }
    });
    this.state = { currentObject };

    this.updateCurrentObject = this.updateCurrentObject.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.openAcl = this.openAcl.bind(this);
    this.openRelation = this.openRelation.bind(this);
  }

  updateCurrentObject(newValue, name) {
    const { currentObject } = this.state;
    currentObject[name] = newValue;
    this.setState({ currentObject });
  }

  handleChange(newValue, name, type, targetClass) {
    if (name == "password") {
      if (newValue === "") {
        return false;
      } else {
        const { currentObject } = this.state;
        currentObject.password = "";
      }
    }
    if (["Array", "Object", "Polygon"].indexOf(type) >= 0) {
      const { currentObject } = this.state;
      currentObject[name] = JSON.stringify(newValue, null, 2);
      if (type === "Polygon") {
        newValue = {
          __type: type,
          coordinates: newValue
        };
      }
    }
    if (type === "Pointer") {
      newValue = newValue
        ? Parse.Object.fromJSON({
            className: targetClass,
            objectId: newValue
          })
        : undefined;
    }
    const { selectedObject, updateRow } = this.props;
    updateRow(selectedObject.row, name, newValue);
  }

  openAcl() {
    const { selectedObject, columns, onClose, handleShowAcl } = this.props;
    const { row } = selectedObject;
    const col = columns.findIndex(c => c.name === "ACL");
    onClose();
    handleShowAcl(row, col);
  }

  openRelation(relation) {
    const { onClose, setRelation } = this.props;
    onClose();
    setRelation(relation);
  }

  render() {
    const {
      selectedObject,
      className,
      columns,
      onClose,
      onConfirm
    } = this.props;
    const { currentObject } = this.state;

    const fields = columns.map(column => {
      const { name, type, targetClass } = column;

      let inputComponent;

      const isDisabled =
        ["objectId", "createdAt", "updatedAt"].indexOf(name) >= 0 ||
        (className === "_User" && ["authData"].indexOf(name) >= 0) ||
        (className === "_Role" && ["name"].indexOf(name) >= 0) ||
        (className === "_Session" &&
          [
            "sessionToken",
            "expiresAt",
            "user",
            "createdWith",
            "installationId",
            "restricted"
          ].indexOf(name) >= 0);

      switch (type) {
        case "String":
          inputComponent = (
            <TextInput
              multiline={
                currentObject[name] && currentObject[name].length > 70
                  ? true
                  : false
              }
              disabled={isDisabled}
              placeholder={name === "password" ? "(hidden)" : ""}
              value={currentObject[name]}
              onChange={newValue => this.updateCurrentObject(newValue, name)}
              onBlur={newValue => this.handleChange(newValue, name)}
            />
          );
          break;
        case "Number":
          inputComponent = (
            <TextInput
              disabled={isDisabled}
              value={currentObject[name]}
              onChange={newValue => this.updateCurrentObject(newValue, name)}
              onBlur={newValue => this.handleChange(parseFloat(newValue), name)}
            />
          );
          break;
        case "Array":
        case "Object":
        case "Polygon":
          inputComponent = (
            <TextInput
              multiline={true}
              disabled={isDisabled}
              value={currentObject[name]}
              onChange={newValue => this.updateCurrentObject(newValue, name)}
              onBlur={newValue =>
                this.handleChange(JSON.parse(newValue), name, type)
              }
            />
          );
          break;
        case "Boolean":
          inputComponent = isDisabled ? (
            <TextInput disabled={true} value={selectedObject[name]} />
          ) : (
            <Toggle
              type={Toggle.Types.TRUE_FALSE}
              value={selectedObject[name]}
              onChange={newValue => this.handleChange(newValue, name)}
            />
          );
          break;
        case "Date":
          inputComponent = (
            <DateTimeInput
              disabled={isDisabled}
              value={selectedObject[name]}
              onChange={newValue => this.handleChange(newValue, name)}
            />
          );
          break;
        case "GeoPoint":
          inputComponent = (
            <div style={{ padding: "25px" }}>
              <GeoPointEditor
                disableAutoFocus={true}
                value={selectedObject[name]}
                width={610}
                style={{ position: "inherit" }}
                onCommit={newValue => this.handleChange(newValue, name)}
              />
            </div>
          );
          break;
        case "File":
          inputComponent = (
            <div style={{ padding: "25px" }}>
              <FileEditor
                value={selectedObject[name]}
                width={610}
                style={{ position: "inherit" }}
                onCommit={newValue => this.handleChange(newValue, name)}
              />
            </div>
          );
          break;
        case "Pointer":
          inputComponent = (
            <TextInput
              disabled={isDisabled}
              value={currentObject[name]}
              onChange={newValue => this.updateCurrentObject(newValue, name)}
              onBlur={newValue =>
                this.handleChange(newValue, name, type, targetClass)
              }
            />
          );
          break;
        case "ACL":
        case "Relation":
          inputComponent = (
            <div
              style={{
                textAlign: "center",
                cursor: "pointer",
                paddingTop: "35px"
              }}
            >
              <Pill
                onClick={() =>
                  type === "ACL"
                    ? this.openAcl(selectedObject[name])
                    : this.openRelation(selectedObject[name])
                }
                value={`View ${type}`}
              />
            </div>
          );
          break;
        default:
          inputComponent = <div />;
      }

      return (
        <Field
          key={name}
          label={
            <Label
              text={name}
              description={targetClass ? `${type} <${targetClass}>` : type}
            />
          }
          labelWidth={33}
          input={inputComponent}
        />
      );
    });

    return (
      <FormModal
        open
        type={Modal.Types.INFO}
        icon="edit-solid"
        iconSize={30}
        title={`${className} Details`}
        showCancel={false}
        onClose={onClose}
        onSubmit={onConfirm}
        submitText="Close"
        width={1000}
      >
        <div style={{ maxHeight: "60vh", overflowY: "scroll" }}>{fields}</div>
      </FormModal>
    );
  }
}
