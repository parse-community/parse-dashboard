import React from "react";
import ReactJson from "react-json-view";

import CategoryList from 'components/CategoryList/CategoryList.react'
import DashboardView from 'dashboard/DashboardView.react'
import CodeEditor from "components/CodeEditor/CodeEditor.react";
import Button from "components/Button/Button.react";

export default class Playground extends DashboardView {

  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Playground';
    this.state = {
      result: null
    }
  }

  renderSidebar() {
    const {path} = this.props.match;
    const current = path.substr(path.lastIndexOf('/') + 1, path.length - 1);
    return (
      <CategoryList current={current} linkPrefix={'playground/'} categories={[]}/>
    )
  }

  runCode() {
    const originalCode = this.editor.value;
  }

  renderContent() {
    return React.cloneElement(
      <>
        <CodeEditor placeHolder={"You can run custom queries here"} ref={editor => this.editor = editor}/>
        <Button value={"RUN"} primary={true} onClick={() => this.runCode()}/>
        {this.state.result && <ReactJson json={this.stat.result}/>}
      </>
    )
  }
}
