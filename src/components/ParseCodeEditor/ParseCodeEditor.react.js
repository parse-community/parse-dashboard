import React from 'react';
import ReactJson from 'react-json-view';
import Parse from 'parse';

import CodeEditor from 'components/CodeEditor/CodeEditor.react';
import Button from 'components/Button/Button.react';
import notification from 'lib/notification';

import styles from './ParseCodeEditor.scss';

export default class ParseCodeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.localKey = 'parse-dashboard-playground-code';
    this.state = {
      results: [],
      running: false,
    };
    this.compileCode = this.compileCode.bind(this);
    this.props.setCompile(this.compileCode);
  }

  async compileCode() {
    await this.runCode();
    const error = this.state.results.filter(
      (result) => result.name === 'Error'
    );
    if (error.length) {
      notification('error', 'An error occurred in your code');
      throw new Error(
        'Please check code again, cannot compile the source code!!!'
      );
    }
    return this.editor.value;
  }

  overrideConsole() {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      this.setState(({ results }) => ({
        results: [
          ...results,
          ...args.map((arg) => ({
            log:
              typeof arg === 'object'
                ? Array.isArray(arg)
                  ? arg.map(this.getParseObjectAttr)
                  : this.getParseObjectAttr(arg)
                : { result: arg },
            name: 'Log',
          })),
        ],
      }));

      originalConsoleLog.apply(console, args);
    };
    console.error = (...args) => {
      console.log(args);
      this.setState(({ results }) => ({
        results: [
          ...results,
          ...args.map((arg) => ({
            log:
              arg instanceof Error
                ? { message: arg.message, name: arg.name, stack: arg.stack }
                : { result: arg },
            name: 'Error',
          })),
        ],
      }));

      originalConsoleError.apply(console, args);
    };

    return [originalConsoleLog, originalConsoleError];
  }

  async runCode() {
    const [originalConsoleLog, originalConsoleError] = this.overrideConsole();

    try {
      const { applicationId, masterKey, serverURL, javascriptKey } =
        this.context;
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

  getParseObjectAttr(parseObject) {
    if (parseObject instanceof Parse.Object) {
      return parseObject.attributes;
    }

    return parseObject;
  }

  componentDidMount() {
    if (this.props.code) {
      this.editor.value = this.props.code;
    }
  }

  render() {
    const { results, running } = this.state;

    return React.cloneElement(
      <div style={{padding: '0 10px'}}>
        <CodeEditor
          placeHolder=""
          ref={(editor) => (this.editor = editor)}
          style={this.props.isModal ? { height: '300px' } : {}}
        />
        <div className={styles['console-ctn']}>
          <header>
            <h3>Console</h3>
            <div className={styles['buttons-ctn']}>
              <div>
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
          <section style={this.props.isModal ? { maxHeight: '15vh' } : {}}>
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
    );
  }
}
