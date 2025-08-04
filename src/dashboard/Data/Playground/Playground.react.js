import React, { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react';
import ReactJson from 'react-json-view';
import Parse from 'parse';
import { useBeforeUnload } from 'react-router-dom';

import CodeEditor from 'components/CodeEditor/CodeEditor.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import BrowserMenu from 'components/BrowserMenu/BrowserMenu.react';
import MenuItem from 'components/BrowserMenu/MenuItem.react';
import Icon from 'components/Icon/Icon.react';
import { CurrentApp } from 'context/currentApp';
import browserStyles from 'dashboard/Data/Browser/Browser.scss';
import Separator from 'components/BrowserMenu/Separator.react';
import ScriptManager from 'lib/ScriptManager';

import styles from './Playground.scss';

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
  const consoleOutputRef = useRef(null);
  const scriptManagerRef = useRef(null);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editorHeight, setEditorHeight] = useState(50); // Percentage of the container height
  const [isResizing, setIsResizing] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true); // Track if user is at bottom of console
  const containerRef = useRef(null);

  // Tab management state
  const initialTabId = useMemo(() => crypto.randomUUID(), []);
  const [tabs, setTabs] = useState([
    { id: initialTabId, name: 'Tab 1', code: DEFAULT_CODE_EDITOR_VALUE }
  ]);
  const [activeTabId, setActiveTabId] = useState(initialTabId);
  const [renamingTabId, setRenamingTabId] = useState(null);
  const [renamingValue, setRenamingValue] = useState('');
  const [savedTabs, setSavedTabs] = useState([]); // All saved tabs including closed ones
  const [, setCurrentMenu] = useState(null); // Track which menu is currently open
  const [, setForceUpdate] = useState({}); // Force re-render for unsaved changes detection
  const renamingInputRef = useRef(null);

  // Drag and drop state
  const [draggedTabId, setDraggedTabId] = useState(null);
  const [dragOverTabId, setDragOverTabId] = useState(null);

  // Initialize ScriptManager
  useEffect(() => {
    if (!scriptManagerRef.current && context) {
      scriptManagerRef.current = new ScriptManager(context);
    }
  }, [context]);

  const section = 'Core';
  const subsection = 'JS Console';
  const historyKey = 'parse-dashboard-playground-history';
  const heightKey = 'parse-dashboard-playground-height';

  // Load saved code, tabs, and history on mount
  useEffect(() => {
    const loadData = async () => {
      if (!scriptManagerRef.current || !context?.applicationId) {
        return;
      }

      try {
        // Load open scripts (those with order property)
        const openScripts = await scriptManagerRef.current.getOpenScripts(context.applicationId);
        // Load all scripts to check for unsaved ones (like legacy scripts)
        const allScripts = await scriptManagerRef.current.getScripts(context.applicationId);
        // Load all saved scripts for the tabs menu
        const allSavedScripts = await scriptManagerRef.current.getAllSavedScripts(context.applicationId);

        // Find unsaved scripts (like legacy scripts) that should also be opened
        const unsavedScripts = allScripts.filter(script =>
          script.saved === false && !openScripts.find(openScript => openScript.id === script.id)
        );

        // Combine open scripts with unsaved scripts, giving unsaved scripts an order
        const tabsToOpen = [...openScripts];
        if (unsavedScripts.length > 0) {
          const maxOrder = openScripts.length > 0 ? Math.max(...openScripts.map(s => s.order)) : -1;
          unsavedScripts.forEach((script, index) => {
            tabsToOpen.push({ ...script, order: maxOrder + 1 + index });
          });
        }

        if (tabsToOpen.length > 0) {
          setTabs(tabsToOpen);

          // Set active tab to the first one
          setActiveTabId(tabsToOpen[0].id);

          setSavedTabs(allSavedScripts);
        } else {
          // If no scripts at all, try to get any scripts and open the first one
          if (allScripts && allScripts.length > 0) {
            // Open the first script
            const firstScript = { ...allScripts[0], order: 0 };
            setTabs([firstScript]);
            setActiveTabId(firstScript.id);

            // Save it as open
            await scriptManagerRef.current.openScript(context.applicationId, firstScript.id, 0);

            setSavedTabs(allScripts.filter(script => script.saved !== false));
          } else {
            // Fallback to default tab if no scripts exist
            const defaultTabId = crypto.randomUUID();
            setTabs([{ id: defaultTabId, name: 'Tab 1', code: DEFAULT_CODE_EDITOR_VALUE, order: 0 }]);
            setActiveTabId(defaultTabId);
          }
        }
      } catch (error) {
        console.warn('Failed to load scripts via ScriptManager:', error);
        // Fallback to default tab if loading fails
        const defaultTabId = crypto.randomUUID();
        setTabs([{ id: defaultTabId, name: 'Tab 1', code: DEFAULT_CODE_EDITOR_VALUE, order: 0 }]);
        setActiveTabId(defaultTabId);
      }

      // Load other data from localStorage
      if (window.localStorage) {
        const savedHistory = window.localStorage.getItem(historyKey);
        if (savedHistory) {
          try {
            setHistory(JSON.parse(savedHistory));
          } catch (e) {
            console.warn('Failed to load execution history:', e);
          }
        }

        const savedHeight = window.localStorage.getItem(heightKey);
        if (savedHeight) {
          try {
            const height = parseFloat(savedHeight);
            if (height >= 0 && height <= 100) {
              setEditorHeight(height);
            }
          } catch (e) {
            console.warn('Failed to load saved height:', e);
          }
        }
      }
    };

    loadData();
  }, [context?.applicationId, historyKey, heightKey]);

  // Get current active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  // Update editor when active tab changes
  useEffect(() => {
    if (editorRef.current && activeTab) {
      editorRef.current.value = activeTab.code;
    }
  }, [activeTabId, activeTab]);

  // Helper function to close menu after action
  const executeAndCloseMenu = useCallback((action) => {
    action();
    setCurrentMenu(null);
  }, []);

  // Tab management functions
  const createNewTab = useCallback(() => {
    const newTabId = crypto.randomUUID();
    const tabCount = tabs.length + 1;
    const newTab = {
      id: newTabId,
      name: `Tab ${tabCount}`,
      code: '', // Start with empty code instead of default value
      saved: false, // Mark as unsaved initially
      order: tabs.length // Assign order as the last position
    };
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setActiveTabId(newTabId);
  }, [tabs]);

  const closeTab = useCallback(async (tabId) => {
    if (tabs.length <= 1) {
      return; // Don't close the last tab
    }

    // Find the tab to get its name and check for unsaved changes
    const tabToClose = tabs.find(tab => tab.id === tabId);
    const tabName = tabToClose ? tabToClose.name : 'this tab';

    // Get current content (either from editor if it's the active tab, or from tab's stored code)
    let currentContent = '';
    if (tabId === activeTabId && editorRef.current) {
      currentContent = editorRef.current.value;
    } else if (tabToClose) {
      currentContent = tabToClose.code;
    }

    // Check if the tab is empty (no content at all)
    const isEmpty = !currentContent.trim();

    // Check if there are unsaved changes (only for non-empty tabs)
    let hasUnsavedChanges = false;
    if (!isEmpty && tabId === activeTabId && editorRef.current && tabToClose) {
      const savedContent = tabToClose.code;
      hasUnsavedChanges = currentContent !== savedContent;
    }

    // Show confirmation dialog only if there are unsaved changes and the tab is not empty
    if (!isEmpty && hasUnsavedChanges) {
      const confirmed = window.confirm(
        `Are you sure you want to close "${tabName}"?\n\nAny unsaved changes will be lost.`
      );

      if (!confirmed) {
        return; // User cancelled, don't close the tab
      }
    }

    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(updatedTabs);

    // If closing active tab, switch to another tab
    if (tabId === activeTabId) {
      const newActiveTab = updatedTabs[0];
      setActiveTabId(newActiveTab.id);
    }

    // Update tab orders for remaining tabs
    const reorderedTabs = updatedTabs.map((tab, index) => ({
      ...tab,
      order: index
    }));
    setTabs(reorderedTabs);

    // Save the current content to the script before closing (if not empty)
    if (!isEmpty && scriptManagerRef.current && context?.applicationId) {
      try {
        // First save the current content to the script
        const allScripts = await scriptManagerRef.current.getScripts(context.applicationId);
        const updatedScripts = allScripts.map(script =>
          script.id === tabId
            ? { ...script, code: currentContent, lastModified: Date.now() }
            : script
        );
        await scriptManagerRef.current.saveScripts(context.applicationId, updatedScripts);

        // Then close the script (remove order property)
        await scriptManagerRef.current.closeScript(context.applicationId, tabId);

        // Update the order of remaining open tabs
        await scriptManagerRef.current.updateScriptOrder(context.applicationId, reorderedTabs);
      } catch (error) {
        console.error('Failed to close script:', error);
      }
    } else if (isEmpty && scriptManagerRef.current && context?.applicationId) {
      // For empty tabs, just close them
      try {
        await scriptManagerRef.current.closeScript(context.applicationId, tabId);
        await scriptManagerRef.current.updateScriptOrder(context.applicationId, reorderedTabs);

        // Remove from saved tabs if it was empty
        const updatedSavedTabs = savedTabs.filter(saved => saved.id !== tabId);
        setSavedTabs(updatedSavedTabs);
      } catch (error) {
        console.error('Failed to close empty script:', error);
      }
    }
  }, [tabs, activeTabId, savedTabs, context?.applicationId]);

  const switchTab = useCallback((tabId) => {
    // Update current tab's code in memory before switching (but don't save)
    if (editorRef.current && activeTab) {
      const currentCode = editorRef.current.value;
      const updatedTabs = tabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, code: currentCode }
          : tab
      );
      setTabs(updatedTabs);
    }

    setActiveTabId(tabId);
  }, [tabs, activeTabId, activeTab]);

  const renameTab = useCallback((tabId, newName) => {
    if (!newName.trim()) {
      return;
    }

    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, name: newName.trim() } : tab
    );
    setTabs(updatedTabs);
  }, [tabs]);

  const startRenaming = useCallback((tabId, currentName) => {
    setRenamingTabId(tabId);
    setRenamingValue(currentName);
  }, []);

  const cancelRenaming = useCallback(() => {
    setRenamingTabId(null);
    setRenamingValue('');
  }, []);

  const confirmRenaming = useCallback(() => {
    if (renamingTabId && renamingValue.trim()) {
      renameTab(renamingTabId, renamingValue);
    }
    cancelRenaming();
  }, [renamingTabId, renamingValue, renameTab, cancelRenaming]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, tabId) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  }, []);

  const handleDragOver = useCallback((e, tabId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTabId(tabId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverTabId(null);
  }, []);

  const handleDrop = useCallback(async (e, targetTabId) => {
    e.preventDefault();

    if (!draggedTabId || draggedTabId === targetTabId) {
      setDraggedTabId(null);
      setDragOverTabId(null);
      return;
    }

    // Find the indices of the dragged and target tabs
    const draggedIndex = tabs.findIndex(tab => tab.id === draggedTabId);
    const targetIndex = tabs.findIndex(tab => tab.id === targetTabId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTabId(null);
      setDragOverTabId(null);
      return;
    }

    // Create new tab order
    const newTabs = [...tabs];
    const [draggedTab] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);

    // Update order property for all tabs
    const reorderedTabs = newTabs.map((tab, index) => ({
      ...tab,
      order: index
    }));

    setTabs(reorderedTabs);

    // Save the new order using ScriptManager
    if (scriptManagerRef.current && context?.applicationId) {
      try {
        await scriptManagerRef.current.updateScriptOrder(context.applicationId, reorderedTabs);
      } catch (error) {
        console.error('Failed to update script order:', error);
      }
    }

    setDraggedTabId(null);
    setDragOverTabId(null);
  }, [draggedTabId, tabs, context?.applicationId]);

  const handleDragEnd = useCallback(() => {
    setDraggedTabId(null);
    setDragOverTabId(null);
  }, []);

  const deleteTabFromSaved = useCallback(async (tabId) => {
    // Find the tab to get its name for confirmation
    const tabToDelete = tabs.find(tab => tab.id === tabId) || savedTabs.find(tab => tab.id === tabId);
    const tabName = tabToDelete ? tabToDelete.name : 'this tab';

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${tabName}" from saved tabs?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return; // User cancelled
    }

    // If the tab is currently open, close it first
    const isCurrentlyOpen = tabs.find(tab => tab.id === tabId);
    if (isCurrentlyOpen) {
      const updatedTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(updatedTabs);

      // If closing active tab, switch to another tab
      if (tabId === activeTabId && updatedTabs.length > 0) {
        setActiveTabId(updatedTabs[0].id);
      }
    }

    // Remove from saved tabs state
    const updatedSavedTabs = savedTabs.filter(saved => saved.id !== tabId);
    setSavedTabs(updatedSavedTabs);

    // Completely delete the script from storage using ScriptManager
    if (scriptManagerRef.current && context?.applicationId) {
      try {
        await scriptManagerRef.current.deleteScript(context.applicationId, tabId);
      } catch (error) {
        console.error('Failed to delete script:', error);
      }
    }
  }, [tabs, savedTabs, activeTabId, context?.applicationId]);

  const reopenTab = useCallback(async (savedTab) => {
    // Check if tab is already open
    const isAlreadyOpen = tabs.find(tab => tab.id === savedTab.id);
    if (isAlreadyOpen) {
      // Just switch to the tab if it's already open
      switchTab(savedTab.id);
      return;
    }

    // Create a new tab based on the saved tab
    const reopenedTab = {
      id: savedTab.id,
      name: savedTab.name,
      code: savedTab.code,
      saved: true, // Mark as saved since it's from saved tabs
      order: tabs.length // Add as last tab
    };

    const updatedTabs = [...tabs, reopenedTab];
    setTabs(updatedTabs);
    setActiveTabId(savedTab.id);

    // Save the open state through ScriptManager
    if (scriptManagerRef.current && context?.applicationId) {
      try {
        await scriptManagerRef.current.openScript(context.applicationId, savedTab.id, tabs.length);
      } catch (error) {
        console.error('Failed to open script:', error);
      }
    }
  }, [tabs, switchTab, context?.applicationId]);

  // Navigation confirmation for unsaved changes
  useBeforeUnload(
    useCallback(
      (event) => {
        // Check for unsaved changes across all tabs
        let hasChanges = false;

        for (const tab of tabs) {
          // Check if tab is marked as unsaved (like legacy scripts)
          if (tab.saved === false) {
            hasChanges = true;
            break;
          }

          // Get current content for the tab
          let currentContent = '';
          if (tab.id === activeTabId && editorRef.current) {
            // For active tab, get content from editor
            currentContent = editorRef.current.value;
          } else {
            // For inactive tabs, use stored code
            currentContent = tab.code;
          }

          // Find the saved version of this tab
          const savedTab = savedTabs.find(saved => saved.id === tab.id);

          if (!savedTab) {
            // If tab was never saved, it has unsaved changes if it has any content
            if (currentContent.trim() !== '') {
              hasChanges = true;
              break;
            }
          } else {
            // Compare current content with saved content
            if (currentContent !== savedTab.code) {
              hasChanges = true;
              break;
            }
          }
        }

        if (hasChanges) {
          const message = 'You have unsaved changes in your playground tabs. Are you sure you want to leave?';
          event.preventDefault();
          event.returnValue = message;
          return message;
        }
      },
      [tabs, activeTabId, savedTabs]
    )
  );

  // Handle navigation confirmation for internal route changes
  useEffect(() => {
    const checkForUnsavedChanges = () => {
      // Check for unsaved changes across all tabs
      for (const tab of tabs) {
        // Check if tab is marked as unsaved (like legacy scripts)
        if (tab.saved === false) {
          return true;
        }

        // Get current content for the tab
        let currentContent = '';
        if (tab.id === activeTabId && editorRef.current) {
          // For active tab, get content from editor
          currentContent = editorRef.current.value;
        } else {
          // For inactive tabs, use stored code
          currentContent = tab.code;
        }

        // Find the saved version of this tab
        const savedTab = savedTabs.find(saved => saved.id === tab.id);

        if (!savedTab) {
          // If tab was never saved, it has unsaved changes if it has any content
          if (currentContent.trim() !== '') {
            return true;
          }
        } else {
          // Compare current content with saved content
          if (currentContent !== savedTab.code) {
            return true;
          }
        }
      }
      return false;
    };

    const handleLinkClick = (event) => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.button !== 0) {
        return;
      }
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.target === '_blank') {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href === '#') {
        return;
      }

      // Check if it's an internal navigation (starts with / or #)
      if (href.startsWith('/') || href.startsWith('#')) {
        if (checkForUnsavedChanges()) {
          const message = 'You have unsaved changes in your playground tabs. Are you sure you want to leave?';
          if (!window.confirm(message)) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    const handlePopState = () => {
      if (checkForUnsavedChanges()) {
        const message = 'You have unsaved changes in your playground tabs. Are you sure you want to leave?';
        if (!window.confirm(message)) {
          window.history.go(1);
        }
      }
    };

    // Add event listeners
    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [tabs, activeTabId, savedTabs]);

  // Focus input when starting to rename
  useEffect(() => {
    if (renamingTabId && renamingInputRef.current) {
      renamingInputRef.current.focus();
      renamingInputRef.current.select();
    }
  }, [renamingTabId]);

  // Handle mouse down on resize handle
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (e) => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = rect.height;
      const relativeY = e.clientY - rect.top;

      // Calculate percentage (0% to 100% range)
      let percentage = (relativeY / containerHeight) * 100;
      percentage = Math.max(0, Math.min(100, percentage));

      setEditorHeight(percentage);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Save the height to localStorage
      if (window.localStorage) {
        try {
          window.localStorage.setItem(heightKey, editorHeight.toString());
        } catch (e) {
          console.warn('Failed to save height:', e);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [editorHeight, heightKey]);

  // Check if console is scrolled to bottom
  const checkIfAtBottom = useCallback(() => {
    if (!consoleOutputRef.current) {
      return true;
    }

    const { scrollTop, scrollHeight, clientHeight } = consoleOutputRef.current;
    const threshold = 5; // 5px threshold for "at bottom"
    return scrollHeight - scrollTop - clientHeight <= threshold;
  }, []);

  // Handle console scroll
  const handleConsoleScroll = useCallback(() => {
    setIsAtBottom(checkIfAtBottom());
  }, [checkIfAtBottom]);

  // Auto-scroll to bottom when new results are added
  useEffect(() => {
    if (isAtBottom && consoleOutputRef.current) {
      consoleOutputRef.current.scrollTop = consoleOutputRef.current.scrollHeight;
    }
  }, [results, isAtBottom]);

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

        // Capture stack trace to find the calling location
        const stack = new Error().stack;
        let sourceLocation = null;

        if (stack) {
          const stackLines = stack.split('\n');
          // Look for the first line that contains 'eval' or 'Function' (user code)
          for (let i = 1; i < stackLines.length; i++) {
            const line = stackLines[i];
            if (line.includes('eval') || line.includes('Function')) {
              // Try to extract line number from eval context
              const evalMatch = line.match(/eval.*:(\d+):(\d+)/);
              if (evalMatch) {
                sourceLocation = {
                  file: 'User Code',
                  line: parseInt(evalMatch[1]) - 8, // Adjust for wrapper function lines
                  column: parseInt(evalMatch[2])
                };
                break;
              }
            }
          }
        }

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
            sourceLocation,
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

    // Update current tab's code in memory before running (but don't auto-save)
    if (activeTab) {
      const updatedTabs = tabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, code: code }
          : tab
      );
      setTabs(updatedTabs);
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
  }, [context, createConsoleOverride, running, history, historyKey, tabs, activeTabId, activeTab]);

  // Save code function - this is the ONLY way tabs get saved to saved tabs
  const saveCode = useCallback(async () => {
    if (!editorRef.current || saving || !scriptManagerRef.current || !context?.applicationId) {
      return;
    }

    try {
      setSaving(true);
      const code = editorRef.current.value;

      // Update current tab's code
      const updatedTabs = tabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, code: code, saved: true, lastModified: Date.now() }
          : tab
      );
      setTabs(updatedTabs);

      // Save all tabs using ScriptManager
      await scriptManagerRef.current.saveScripts(context.applicationId, updatedTabs);

      // Update saved tabs state
      const currentTab = updatedTabs.find(tab => tab.id === activeTabId);
      if (currentTab) {
        const updatedSavedTabs = [...savedTabs];
        const existingIndex = updatedSavedTabs.findIndex(saved => saved.id === currentTab.id);

        if (existingIndex >= 0) {
          // Update existing saved tab
          updatedSavedTabs[existingIndex] = { ...currentTab };
        } else {
          // Add new tab to saved tabs
          updatedSavedTabs.push({ ...currentTab });
        }

        setSavedTabs(updatedSavedTabs);
      }

      // Show brief feedback that save was successful
      setTimeout(() => setSaving(false), 1000);
    } catch (e) {
      console.error('Save error:', e);
      setSaving(false);
    }
  }, [saving, tabs, activeTabId, savedTabs, context?.applicationId]);

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
    const { type, args, sourceLocation, id } = result;

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
        <div className={styles['console-content']}>
          <div className={styles['console-output-content']}>
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
                    <div key={`${id}-${index}`} style={{ marginLeft: '2px', marginBottom: '1px', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.2' }}>
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
                    style={{ marginLeft: '2px', marginBottom: '1px', fontSize: '12px' }}
                    onError={() => {
                      return false; // Don't show the error in the UI
                    }}
                  />
                );
              } catch {
                return (
                  <div key={`${id}-${index}`} style={{ marginLeft: '2px', marginBottom: '1px', fontFamily: 'monospace', color: '#ff6b6b', fontSize: '12px', lineHeight: '1.2' }}>
                    [Error rendering value: {String(arg)}]
                  </div>
                );
              }
            })}
          </div>
          <div className={styles['console-source']}>
            {sourceLocation ? (
              <span title={`${sourceLocation.file}:${sourceLocation.line}:${sourceLocation.column}`}>
                {sourceLocation.file}:{sourceLocation.line}
              </span>
            ) : (
              <span className={styles['console-source-unknown']}>—</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ConsoleResult = useMemo(() => ConsoleResultComponent, []);

  const renderToolbar = () => {
    const runButton = (
      <a
        className={`${browserStyles.toolbarButton} ${running ? browserStyles.disabled : ''}`}
        onClick={running ? undefined : runCode}
        style={{
          cursor: running ? 'not-allowed' : 'pointer',
          opacity: running ? 0.6 : 1
        }}
      >
        <Icon name="script-solid" width={14} height={14} />
        <span>{running ? 'Running...' : 'Run'}</span>
      </a>
    );

    const editMenu = (
      <BrowserMenu title="Edit" icon="edit-solid" setCurrent={setCurrentMenu}>
        <MenuItem
          text="New Tab"
          onClick={() => executeAndCloseMenu(createNewTab)}
          disableMouseDown={true}
        />
        <MenuItem
          text="Rename Tab"
          onClick={() => executeAndCloseMenu(() => startRenaming(activeTabId, activeTab?.name || ''))}
        />
        {tabs.length > 1 && (
          <MenuItem
            text="Close Tab"
            onClick={() => executeAndCloseMenu(() => closeTab(activeTabId))}
          />
        )}
        {window.localStorage && (
          <MenuItem
            text="Save Tab"
            shortcut="Cmd+S"
            onClick={() => executeAndCloseMenu(saveCode)}
            disabled={saving}
          />
        )}
        {window.localStorage && savedTabs.find(saved => saved.id === activeTabId) && (
          <MenuItem
            text="Delete Tab"
            onClick={() => executeAndCloseMenu(() => deleteTabFromSaved(activeTabId))}
          />
        )}
        <Separator />
        <MenuItem
          text="Clear Console"
          onClick={() => executeAndCloseMenu(clearConsole)}
        />
      </BrowserMenu>
    );

    const tabsMenu = (
      <BrowserMenu title="Tabs" icon="folder-solid" setCurrent={() => {}}>
        {savedTabs.length === 0 ? (
          <MenuItem
            text="No saved tabs"
            disabled={true}
          />
        ) : (
          savedTabs
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
            .map(savedTab => {
              const isOpen = tabs.find(openTab => openTab.id === savedTab.id);

              return (
                <MenuItem
                  key={savedTab.id}
                  text={
                    <span>
                      {isOpen && (
                        <Icon
                          name="check"
                          width={12}
                          height={12}
                          fill="#ffffffff"
                          className="menuCheck"
                        />
                      )}
                      {savedTab.name}
                    </span>
                  }
                  onClick={() => {
                    if (isOpen) {
                      closeTab(savedTab.id);
                    } else {
                      reopenTab(savedTab);
                    }
                  }}
                  disableMouseDown={true}
                />
              );
            })
        )}
      </BrowserMenu>
    );

    return (
      <Toolbar section={section} subsection={subsection}>
        {runButton}
        <div className={browserStyles.toolbarSeparator} />
        {editMenu}
        <div className={browserStyles.toolbarSeparator} />
        {tabsMenu}
      </Toolbar>
    );
  };

  // Helper function to check if a tab has unsaved changes
  const hasUnsavedChanges = useCallback((tab) => {
    // Get current content for the tab
    let currentContent = '';
    if (tab.id === activeTabId && editorRef.current) {
      // For active tab, get content from editor
      currentContent = editorRef.current.value;
    } else {
      // For inactive tabs, use stored code
      currentContent = tab.code;
    }

    // Find the saved version of this tab
    const savedTab = savedTabs.find(saved => saved.id === tab.id);

    if (!savedTab) {
      // If tab was never saved, it has unsaved changes if it has any content
      return currentContent.trim() !== '';
    }

    // Compare current content with saved content
    return currentContent !== savedTab.code;
  }, [activeTabId, savedTabs]);

  // Effect to periodically check for editor changes and trigger re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      // Force a re-render to update unsaved change indicators
      setForceUpdate({});
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  const renderTabs = () => {
    return (
      <div className={styles['tab-bar']} style={{ backgroundColor: '#353446' }}>
        <div className={styles['tab-container']}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`${styles['tab']} ${tab.id === activeTabId ? styles['tab-active'] : ''} ${
                draggedTabId === tab.id ? styles['tab-dragging'] : ''
              } ${
                dragOverTabId === tab.id ? styles['tab-drag-over'] : ''
              }`}
              onClick={() => switchTab(tab.id)}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.id)}
              onDragEnd={handleDragEnd}
            >
              {renamingTabId === tab.id ? (
                <input
                  ref={renamingInputRef}
                  type="text"
                  value={renamingValue}
                  onChange={(e) => setRenamingValue(e.target.value)}
                  onBlur={confirmRenaming}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      confirmRenaming();
                    } else if (e.key === 'Escape') {
                      cancelRenaming();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={styles['tab-rename-input']}
                />
              ) : (
                <span
                  className={styles['tab-name']}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startRenaming(tab.id, tab.name);
                  }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {hasUnsavedChanges(tab) && (
                    <Icon
                      name="warn-outline"
                      width={12}
                      height={12}
                      fill="#ffffff"
                      style={{ marginRight: '4px' }}
                    />
                  )}
                  {tab.name}
                </span>
              )}
              {tabs.length > 1 && (
                <button
                  className={styles['tab-close']}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            className={styles['tab-new']}
            onClick={createNewTab}
            style={{
              border: 'none',
              background: 'none',
              padding: '4px',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const icon = e.currentTarget.querySelector('svg');
              if (icon) {
                icon.style.fill = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              const icon = e.currentTarget.querySelector('svg');
              if (icon) {
                icon.style.fill = '#a0a0a0';
              }
            }}
          >
            <Icon name="plus-solid" width={14} height={14} fill="#66637a" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles['playground-ctn']}>
      {renderToolbar()}
      <div className={`${styles['playground-content']} ${isResizing ? 'resizing' : ''}`} ref={containerRef}>
        <div
          className={styles['editor-section']}
          style={{ height: `${editorHeight}%` }}
        >
          {renderTabs()}
          <CodeEditor
            defaultValue={activeTab?.code || DEFAULT_CODE_EDITOR_VALUE}
            ref={editorRef}
            fontSize={14}
            theme="monokai"
          />
          <div className={styles['editor-help']}>
            <span>💡 Shortcuts: </span>
            <kbd>Ctrl/Cmd + Enter</kbd> to run,{' '}
            <kbd>Ctrl/Cmd + S</kbd> to save,{' '}
            <kbd>Ctrl/Cmd + L</kbd> to clear console,{' '}
            <kbd>Ctrl + ↑/↓</kbd> for history
          </div>
        </div>
        <div
          className={styles['resize-handle']}
          onMouseDown={handleResizeStart}
          style={{ cursor: isResizing ? 'ns-resize' : 'ns-resize' }}
        />
        <div
          className={styles['console-ctn']}
          style={{ height: `${100 - editorHeight}%` }}
        >
          <section
            className={styles['console-output']}
            ref={consoleOutputRef}
            onScroll={handleConsoleScroll}
          >
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
