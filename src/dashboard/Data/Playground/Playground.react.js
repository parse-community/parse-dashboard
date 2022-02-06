import React, { Component } from 'react';
import ReactJson from 'react-json-view';
import Parse from 'parse';

import CodeEditor from 'components/CodeEditor/CodeEditor.react';
import Button from 'components/Button/Button.react';
import SaveButton from 'components/SaveButton/SaveButton.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import { CurrentApp } from 'context/currentApp';

import styles from './Playground.scss';

export default class Playground extends Component {
  static contextType = CurrentApp;
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'JS Console';
    this.localKey = 'parse-dashboard-playground-code';
    this.state = {
      results: [],
      running: false,
      saving: false,
      savingState: SaveButton.States.WAITING
    };
  }

  overrideConsole() {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      this.setState(({ results }) => ({
        results: [
          ...results,
          ...args.map(arg => ({
            log:
              typeof arg === 'object'
                ? Array.isArray(arg)
                  ? arg.map(this.getParseObjectAttr)
                  : this.getParseObjectAttr(arg)
                : { result: arg },
            name: 'Log'
          }))
        ]
      }));

      originalConsoleLog.apply(console, args);
    };
    console.error = (...args) => {
      this.setState(({ results }) => ({
        results: [
          ...results,
          ...args.map(arg => ({
            log:
              arg instanceof Error
                ? { message: arg.message, name: arg.name, stack: arg.stack }
                : { result: arg },
            name: 'Error'
          }))
        ]
      }));

      originalConsoleError.apply(console, args);
    };

    return [originalConsoleLog, originalConsoleError];
  }

  async runCode() {
    const [originalConsoleLog, originalConsoleError] = this.overrideConsole();

    try {
      const {
        applicationId, masterKey, serverURL, javascriptKey
      } = this.context;
      const originalCode = this.editor.value;

      const finalCode = `return (async function(){
        try{
          Parse.initialize('${applicationId}', ${
        javascriptKey ? `'${javascriptKey}'` : undefined
      });
          Parse.masterKey = '${masterKey}';
          Parse.serverUrl = '${serverURL}';

          ${originalCode}
        } catch(e) {
          console.error(e);
        }
      })()`;

      this.setState({ running: true, results: [] });

      await new Function('Parse', finalCode)(Parse);
    } catch (e) {
      console.error(e);
    } finally {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      this.setState({ running: false });
    }
  }

  saveCode() {
    try {
      this.setState({ saving: true, savingState: SaveButton.States.SAVING });
      const code = this.editor.value;

      window.localStorage.setItem(this.localKey, code);
      this.setState({
        saving: false,
        savingState: SaveButton.States.SUCCEEDED
      });

      setTimeout(
        () => this.setState({ savingState: SaveButton.States.WAITING }),
        3000
      );
    } catch (e) {
      console.error(e);
      this.setState({ saving: false, savingState: SaveButton.States.FAILED });
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

  render() {
    const { results, running, saving, savingState } = this.state;

    return React.cloneElement(
      <div className={styles['playground-ctn']}>
        <Toolbar section={this.section} subsection={this.subsection} />
        <div style={{ minHeight: '25vh' }}>
          <CodeEditor
            placeHolder={`const myObj = new Parse.Object('MyClass');
myObj.set('myField', 'Hello World!')
await myObj.save();
console.log(myObj);`}
            ref={editor => (this.editor = editor)}
          />
          <div className={styles['console-ctn']}>
            <header>
              <h3>Console</h3>
              <div className={styles['buttons-ctn']}>
                <div>
                  <div style={{ marginRight: '15px' }}>
                    {window.localStorage && (
                      <SaveButton
                        state={savingState}
                        primary={false}
                        color="white"
                        onClick={() => this.saveCode()}
                        progress={saving}
                      />
                    )}
                  </div>
                  <Button
                    value={'Run'}
                    primary={false}
                    onClick={() => this.runCode()}
                    progress={running}
                    color="white"
                  />
                </div>
              </div>
            </header>
            <section>
              {results.map(({ log, name }, i) => (
                <ReactJson
                  key={i + `${log}`}
                  src={log}
                  collapsed={1}
                  theme="solarized"
                  name={name}
                />
              ))}
            </section>
          </div>
        </div>
      </div>
    );
  }
}
