import React from "react";
import ReactJson from "react-json-view";
import Parse from 'parse';

import PropTypes from 'lib/PropTypes';
import ParseApp from 'lib/ParseApp';
import CategoryList from 'components/CategoryList/CategoryList.react'
import DashboardView from 'dashboard/DashboardView.react'
import CodeEditor from "components/CodeEditor/CodeEditor.react";
import Button from "components/Button/Button.react";
import SaveButton from "components/SaveButton/SaveButton.react";
import Toolbar from "components/Toolbar/Toolbar.react";

export default class Playground extends DashboardView {

  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Playground';
    this.localKey = 'parse-dashboard-playground-code';
    this.state = {
      result: null,
      running: false,
      saving: false,
      initialCode: '',
      savingState: SaveButton.States.WAITING
    }
  }

  renderSidebar() {
    const {path} = this.props.match;
    const current = path.substr(path.lastIndexOf('/') + 1, path.length - 1);
    return (
      <CategoryList current={current} linkPrefix={'playground/'} categories={[]}/>
    )
  }

  async runCode() {
    try {
      const {currentApp: {applicationId, masterKey, serverURL, javascriptKey}} = this.context;

      const originalCode = this.editor.value.split(';');
      originalCode[originalCode.length - 1] = `return ${originalCode[originalCode.length - 1]}`;

      const finalCode = `return (async function(){
        Parse.initialize('${applicationId}', ${javascriptKey ? `'${javascriptKey}'` : undefined});
        Parse.masterKey = '${masterKey}';
        Parse.serverUrl = '${serverURL}';

        ${originalCode.join('\n')}})()`;

      this.setState({running: true});
      const evaluation = await new Function('Parse', finalCode)(Parse);
      const result = Array.isArray(evaluation) ?
        evaluation.map(this.getParseObjectAttr) :
        this.getParseObjectAttr(evaluation);

      this.setState({result: {result}});
    } catch (e) {
      console.error("Don't forget to separate your statements with semicolon ;");
      console.error(e);
    } finally {
      this.setState({running: false});
    }
  }

  saveCode() {
    try {
      this.setState({saving: true, savingState: SaveButton.States.SAVING});
      const code = this.editor.value;

      window.localStorage.setItem(this.localKey, code);
      this.setState({saving: false, savingState: SaveButton.States.SUCCEEDED});

      setTimeout(() => this.setState({savingState: SaveButton.States.WAINTING}), 3000);
    } catch (e) {
      console.error(e);
      this.setState({saving: false, savingState: SaveButton.States.FAILED});
    }
  }

  getParseObjectAttr(parseObject) {
    if (parseObject instanceof Parse.Object) {
      return parseObject.attributes;
    }

    return parseObject;
  }

  componentDidMount() {
    if (window.localStorage) {
      const initialCode = window.localStorage.getItem(this.localKey);
      if (initialCode) {
        this.editor.value = initialCode;
      }
    }
  }

  renderContent() {
    const {result, running, saving, initialCode, savingState} = this.state;
    return React.cloneElement(
      <div style={{padding: '96px 0 60px 0'}}>
        <Toolbar section={this.section} subsection={this.subsection}/>
        <div style={{minHeight: '600px'}}>
          <CodeEditor
            initialCode={initialCode}
            placeHolder={"Type your code here\nDon't forget to separate your statements with semicolon ;"}
            ref={editor => this.editor = editor}/>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: 15,
            borderTop: '#66637A 1px solid',
            alignItems: 'center'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', width: '24%'}}>
              {window.localStorage && <SaveButton
                state={savingState}
                primary={false}
                onClick={() => this.saveCode()}
                progress={saving}/>}
              <Button value={"Run"} primary={true} onClick={() => this.runCode()} progress={running}/>
            </div>
          </div>
          {result && <ReactJson src={result} collapsed={1}/>}
        </div>
      </div>
    )
  }
}

Playground.contextTypes = {
  generatePath: PropTypes.func,
  currentApp: PropTypes.instanceOf(ParseApp)
};
