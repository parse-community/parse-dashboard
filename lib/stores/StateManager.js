import { Map } from 'immutable';

const defaultState = Map();

/**
 * StateManager handles all state used by the dashboard
 */

// Stores app-scoped states
const appStates = {};
// Stores global, account-scoped states
const globalStates = {};

export function getAppState(name, app) {
  if (!app) {
    throw new Error('Cannot get state without an app');
  }
  if (!name) {
    throw new Error('Cannot get state without a state identifier');
  }
  if (!appStates[app.applicationId]) {
    appStates[app.applicationId] = {};
  }
  let state = appStates[app.applicationId][name];
  if (!state) {
    state = appStates[app.applicationId][name] = defaultState;
  }
  return state;
}

export function setAppState(name, app, state) {
  if (!app) {
    throw new Error('Cannot set state without an app');
  }
  if (!name) {
    throw new Error('Cannot set state without a state identifier');
  }
  let prev = getAppState(app.applicationId, name);
  appStates[app.applicationId][name] = state;
  return prev;
}

export function getGlobalState(name) {
  if (!name) {
    throw new Error('Cannot get state without a state identifier');
  }
  let state = globalStates[name];
  if (!state) {
    state = globalStates[name] = defaultState;
  }
  return state;
}

export function setGlobalState(name, state) {
  if (!name) {
    throw new Error('Cannot set state without a state identifier');
  }
  let prev = getGlobalState(name);
  globalStates[name] = state;
  return prev;
}