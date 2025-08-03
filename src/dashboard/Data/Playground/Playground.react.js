import React, { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react';
import ReactJson from 'react-json-view';
import Parse from 'parse';

import CodeEditor from 'components/CodeEditor/CodeEditor.react';
import Button from 'components/Button/Button.react';
import SaveButton from 'components/SaveButton/SaveButton.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import { CurrentApp } from 'context/currentApp';

import styles from './Playground.scss';

// Configure ACE editor to prevent worker loading issues
import ace from 'ace-builds/src-noconflict/ace';
ace.config.set('useWorker', false);
ace.config.set('loadWorkerFromBlob', false);

const DEFAULT_CODE_EDITOR_VALUE = `const myObj = new Parse.Object('MyClass');
myObj.set('myField', 'Hello World!')
await myObj.save();
console.log(myObj);`;

const LOG_TYPES = {
  LOG: 'log',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

const formatLogValue = (value, seen = new WeakSet(), depth = 0) => {
  // Prevent infinite recursion with depth limit
  if (depth > 10) {
    return { __type: 'MaxDepthReached', value: '[Too deep to serialize]' };
  }

  // Handle null and undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle primitive types that are JSON-safe
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  // Prevent circular references for objects
  if (typeof value === 'object' && seen.has(value)) {
    return { __type: 'CircularReference', value: '[Circular Reference]' };
  }

  // Handle functions
  if (typeof value === 'function') {
    return {
      __type: 'Function',
      name: value.name || 'anonymous',
      value: value.toString().substring(0, 200) + (value.toString().length > 200 ? '...' : '')
    };
  }

  // Add to seen set for circular reference detection
  if (typeof value === 'object') {
    seen.add(value);
  }

  try {
    // Handle Parse Objects
    if (value instanceof Parse.Object) {
      const result = {
        __type: 'Parse.Object',
        className: value.className,
        objectId: value.id,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt
      };

      // Safely add attributes
      try {
        Object.keys(value.attributes).forEach(key => {
          result[key] = formatLogValue(value.attributes[key], seen, depth + 1);
        });
      } catch {
        result.attributes = '[Error accessing attributes]';
      }

      return result;
    }

    // Handle Errors
    if (value instanceof Error) {
      return {
        __type: 'Error',
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }

    // Handle Arrays
    if (Array.isArray(value)) {
      try {
        return value.slice(0, 100).map(item => formatLogValue(item, seen, depth + 1));
      } catch {
        return { __type: 'Array', length: value.length, value: '[Array]' };
      }
    }

    // Handle Date objects
    if (value instanceof Date) {
      return {
        __type: 'Date',
        value: value.toISOString()
      };
    }

    // Handle RegExp objects
    if (value instanceof RegExp) {
      return {
        __type: 'RegExp',
        value: value.toString()
      };
    }

    // Handle other objects
    if (value && typeof value === 'object') {
      try {
        // First try to JSON serialize to check if it's valid
        const serialized = JSON.stringify(value);
        return JSON.parse(serialized);
      } catch {
        // If serialization fails, create a safe representation
        try {
          const safeObj = {};
          const keys = Object.keys(value).slice(0, 20); // Further reduced to 20 keys

          for (const key of keys) {
            try {
              if (value.hasOwnProperty(key)) {
                safeObj[key] = formatLogValue(value[key], seen, depth + 1);
              }
            } catch {
              safeObj[key] = { __type: 'UnserializableValue', value: '[Cannot serialize]' };
            }
          }

          if (Object.keys(value).length > 20) {
            safeObj.__truncated = `... and ${Object.keys(value).length - 20} more properties`;
          }

          return { __type: 'Object', ...safeObj };
        } catch {
          return { __type: 'Object', value: String(value) };
        }
      }
    }
  } catch (error) {
    return { __type: 'SerializationError', value: String(value), error: error.message };
  }

  // Fallback for any other type
  return { __type: typeof value, value: String(value) };
};

export default function Playground() {
  const context = useContext(CurrentApp);
  const editorRef = useRef(null);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingState, setSavingState] = useState(SaveButton.States.WAITING);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const section = 'Core';
  const subsection = 'JS Console';
  const localKey = 'parse-dashboard-playground-code';
  const historyKey = 'parse-dashboard-playground-history';

  // Load saved code and history on mount
  useEffect(() => {
    if (window.localStorage) {
      const initialCode = window.localStorage.getItem(localKey);
      if (initialCode && editorRef.current) {
        editorRef.current.value = initialCode;
      }

      const savedHistory = window.localStorage.getItem(historyKey);
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.warn('Failed to load execution history:', e);
        }
      }
    }
  }, [localKey, historyKey]);

  // Create console override function
  const createConsoleOverride = useCallback(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;
    const originalConsoleDebug = console.debug;

    // Flag to prevent recursive console calls during formatting
    let isProcessing = false;

    const addResult = (type, args) => {
      // Prevent recursive calls during formatting
      if (isProcessing) {
        return;
      }

      isProcessing = true;

      try {
        const timestamp = new Date().toLocaleTimeString();

        // Safely format arguments with error handling to prevent infinite loops
        const formattedArgs = args.map((arg, index) => {
          try {
            const result = formatLogValue(arg);
            return result;
          } catch (error) {
            console.warn('Error formatting argument ' + index + ':', error);
            return { __type: 'FormattingError', value: String(arg), error: error.message };
          }
        });

        setResults(prevResults => [
          ...prevResults,
          {
            type,
            timestamp,
            args: formattedArgs,
            id: Date.now() + Math.random() // Simple unique ID
          }
        ]);
      } catch (error) {
        console.error('Error in addResult:', error);
      } finally {
        isProcessing = false;
      }
    };

    // Helper function to check if error is from ReactJson and should be ignored
    const isReactJsonError = (args) => {
      return args.length > 0 &&
             typeof args[0] === 'string' &&
             (args[0].includes('react-json-view error') ||
              args[0].includes('src property must be a valid json object'));
    };

    console.log = (...args) => {
      addResult(LOG_TYPES.LOG, args);
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      // Skip ReactJson errors to prevent infinite loop
      if (isReactJsonError(args)) {
        originalConsoleError.apply(console, args);
        return;
      }
      
      addResult(LOG_TYPES.ERROR, args);
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      // Skip ReactJson warnings to prevent infinite loop
      if (isReactJsonError(args)) {
        originalConsoleWarn.apply(console, args);
        return;
      }
      
      addResult(LOG_TYPES.WARN, args);
      originalConsoleWarn.apply(console, args);
    };

    console.info = (...args) => {
      addResult(LOG_TYPES.INFO, args);
      originalConsoleInfo.apply(console, args);
    };

    console.debug = (...args) => {
      addResult(LOG_TYPES.DEBUG, args);
      originalConsoleDebug.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
      console.debug = originalConsoleDebug;
    };
  }, []);

  // Run code function
  const runCode = useCallback(async () => {
    if (!editorRef.current || running) {
      return;
    }

    const code = editorRef.current.value;
    if (!code.trim()) {
      return;
    }

    const restoreConsole = createConsoleOverride();
    setRunning(true);
    setResults([]);

    try {
      const { applicationId, masterKey, serverURL, javascriptKey } = context;

      const finalCode = `return (async function(){
        try{
          Parse.initialize('${applicationId}', ${javascriptKey ? `'${javascriptKey}'` : undefined});
          Parse.masterKey = '${masterKey}';
          Parse.serverUrl = '${serverURL}';

          ${code}
        } catch(e) {
          console.error(e);
        }
      })()`;

      await new Function('Parse', finalCode)(Parse);

      // Add to history
      const newHistory = [code, ...history.slice(0, 19)]; // Keep last 20 items
      setHistory(newHistory);
      setHistoryIndex(-1);

      if (window.localStorage) {
        try {
          window.localStorage.setItem(historyKey, JSON.stringify(newHistory));
        } catch (e) {
          console.warn('Failed to save execution history:', e);
        }
      }
    } catch (e) {
      console.error('Execution error:', e);
    } finally {
      restoreConsole();
      setRunning(false);
    }
  }, [context, createConsoleOverride, running, history, historyKey]);

  // Save code function with debouncing
  const saveCode = useCallback(() => {
    if (!editorRef.current || saving) {
      return;
    }

    try {
      setSaving(true);
      setSavingState(SaveButton.States.SAVING);
      const code = editorRef.current.value;

      window.localStorage.setItem(localKey, code);
      setSavingState(SaveButton.States.SUCCEEDED);

      setTimeout(() => setSavingState(SaveButton.States.WAITING), 3000);
    } catch (e) {
      console.error('Save error:', e);
      setSavingState(SaveButton.States.FAILED);
    } finally {
      setSaving(false);
    }
  }, [localKey, saving]);

  // Clear console
  const clearConsole = useCallback(() => {
    setResults([]);
  }, []);

  // Navigate through history
  const navigateHistory = useCallback((direction) => {
    if (!editorRef.current || history.length === 0) {
      return;
    }

    let newIndex;
    if (direction === 'up') {
      newIndex = Math.min(historyIndex + 1, history.length - 1);
    } else {
      newIndex = Math.max(historyIndex - 1, -1);
    }

    setHistoryIndex(newIndex);

    if (newIndex === -1) {
      // Restore to empty or current content
      return;
    }

    editorRef.current.value = history[newIndex];
  }, [history, historyIndex]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      // Ctrl/Cmd + S to save
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCode();
      }
      // Ctrl/Cmd + L to clear console
      else if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearConsole();
      }
      // Up/Down arrows for history when editor is focused
      else if (e.target.closest('.ace_editor') && e.ctrlKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          navigateHistory('up');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          navigateHistory('down');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [runCode, saveCode, clearConsole, navigateHistory]);

  // Memoized console result renderer
  const ConsoleResultComponent = ({ result }) => {
    const { type, timestamp, args, id } = result;

    const getTypeIcon = (type) => {
      switch (type) {
        case LOG_TYPES.ERROR: return '❌';
        case LOG_TYPES.WARN: return '⚠️';
        case LOG_TYPES.INFO: return 'ℹ️';
        case LOG_TYPES.DEBUG: return '🐛';
        default: return '📝';
      }
    };

    const getTypeClass = (type) => {
      switch (type) {
        case LOG_TYPES.ERROR: return styles['console-error'];
        case LOG_TYPES.WARN: return styles['console-warn'];
        case LOG_TYPES.INFO: return styles['console-info'];
        case LOG_TYPES.DEBUG: return styles['console-debug'];
        default: return styles['console-log'];
      }
    };

    return (
      <div key={id} className={`${styles['console-entry']} ${getTypeClass(type)}`}>
        <div className={styles['console-header']}>
          <span className={styles['console-icon']}>{getTypeIcon(type)}</span>
          <span className={styles['console-type']}>{type}</span>
          <span className={styles['console-timestamp']}>{timestamp}</span>
        </div>
        {args.map((arg, index) => {
          try {
            // Validate that the argument is suitable for ReactJson
            const isValidForReactJson = (value) => {
              // Only use ReactJson for objects and arrays, not primitives
              if (value === null || value === undefined) {
                return false; // Render as text
              }
              if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                return false; // Render as text
              }
              
              if (typeof value === 'object') {
                try {
                  // Test if it can be JSON serialized without errors
                  JSON.stringify(value);
                  // Additional check for reasonable size
                  const keys = Object.keys(value);
                  return keys.length < 100 && keys.length > 0; // Must have at least 1 property
                } catch {
                  return false;
                }
              }
              
              return false;
            };

            // If the argument is not suitable for ReactJson, render as text
            if (!isValidForReactJson(arg)) {
              return (
                <div key={`${id}-${index}`} style={{ marginLeft: '20px', marginBottom: '8px', fontFamily: 'monospace' }}>
                  {String(arg)}
                </div>
              );
            }

            // Use ReactJson for valid objects/arrays
            return (
              <ReactJson
                key={`${id}-${index}`}
                src={arg}
                collapsed={2}
                theme="solarized"
                name={false}
                displayObjectSize={false}
                displayDataTypes={false}
                enableClipboard={true}
                style={{ marginLeft: '20px', marginBottom: '8px' }}
                onError={() => {
                  return false; // Don't show the error in the UI
                }}
              />
            );
          } catch {
            return (
              <div key={`${id}-${index}`} style={{ marginLeft: '20px', marginBottom: '8px', fontFamily: 'monospace', color: '#ff6b6b' }}>
                [Error rendering value: {String(arg)}]
              </div>
            );
          }
        })}
      </div>
    );
  };

  const ConsoleResult = useMemo(() => ConsoleResultComponent, []);

  return (
    <div className={styles['playground-ctn']}>
      <Toolbar section={section} subsection={subsection} />
      <div style={{ minHeight: '25vh' }}>
        <div className={styles['editor-section']}>
          <CodeEditor
            defaultValue={DEFAULT_CODE_EDITOR_VALUE}
            ref={editorRef}
            fontSize={14}
          />
          <div className={styles['editor-help']}>
            <span>💡 Shortcuts: </span>
            <kbd>Ctrl/Cmd + Enter</kbd> to run,{' '}
            <kbd>Ctrl/Cmd + S</kbd> to save,{' '}
            <kbd>Ctrl/Cmd + L</kbd> to clear console,{' '}
            <kbd>Ctrl + ↑/↓</kbd> for history
          </div>
        </div>
        <div className={styles['console-ctn']}>
          <header>
            <h3>Console</h3>
            <div className={styles['buttons-ctn']}>
              <div>
                <div style={{ marginRight: '15px' }}>
                  <Button
                    value={'Clear'}
                    primary={false}
                    onClick={clearConsole}
                    color="white"
                    style={{ marginRight: '10px' }}
                  />
                  {window.localStorage && (
                    <SaveButton
                      state={savingState}
                      primary={false}
                      color="white"
                      onClick={saveCode}
                      progress={saving}
                    />
                  )}
                </div>
                <Button
                  value={running ? 'Running...' : 'Run'}
                  primary={false}
                  onClick={runCode}
                  progress={running}
                  color="white"
                  disabled={running}
                />
              </div>
            </div>
          </header>
          <section className={styles['console-output']}>
            {results.length === 0 ? (
              <div className={styles['console-empty']}>
                <span>Console output will appear here...</span>
                <br />
                <small>Run your code to see results</small>
              </div>
            ) : (
              results.map(result => (
                <ConsoleResult key={result.id} result={result} />
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
