import React, { Component } from 'react';
import introJs from 'intro.js'
import introStyle from 'stylesheets/introjs.css';

const getComponentReadyPromise = conditionFn => {
  return new Promise((resolve, reject) => {
    let retry = 0;
    const checkComponent = () => {
      if (conditionFn()) {
        resolve();
      } else{
        if (++retry > 10) {
          return reject();
        }
        setTimeout(checkComponent, 50);
      }
    };
    checkComponent();
  });
};

export default class Tour extends Component {
  constructor () {
    super();
  }

  componentDidMount() {
    const sidebarPromise = getComponentReadyPromise(() => document.querySelector("[class^='sidebar']"));
    const toolbarPromise = getComponentReadyPromise(() => document.querySelector("[class^='toolbar']"));
    const dataBrowserPromise = getComponentReadyPromise(() => document.querySelector("[class^='browser']"));
    Promise.all([sidebarPromise, toolbarPromise, dataBrowserPromise]).then(() => {
      const intro = introJs();
      intro.setOptions({
        nextLabel: 'Next',
        prevLabel: 'Prev',
        skipLabel: 'Cancel',
        showBullets: false
      });
      this.props.steps.forEach(step => {
        if (typeof step.element === 'function') {
          step.element = step.element();
        }
      });
      intro.addSteps(this.props.steps);

      const sidebar = document.querySelector("[class^='sidebar']");
      sidebar.style.position = 'absolute';

      const toolbar = document.querySelector("[class^='toolbar']");
      toolbar.style.position = 'absolute';

      const dataBrowser = document.querySelector("[class^='browser']");
      dataBrowser.style.position = 'absolute';

      const onExit = this.props.onExit;
      intro.onexit(function () {
        // Fires analytics event when tour finishes
        typeof back4AppNavigation === 'object' && back4AppNavigation.onFinishDatabaseBrowserTour && back4AppNavigation.onFinishDatabaseBrowserTour();

        sidebar.style.position = 'fixed';
        toolbar.style.position = 'fixed';
        dataBrowser.style.position = 'fixed';

        typeof onExit === 'function' && onExit.bind(this)();
      });

      intro.onbeforechange(this.props.onBeforeChange);
      intro.onafterchange(this.props.onAfterChange);
      intro.onbeforeexit(this.props.onBeforeExit);

      this.props.onBeforeStart && this.props.onBeforeStart();

      intro.start();

      // Fires analytics event when tour begins
      typeof back4AppNavigation === 'object' && back4AppNavigation.onStartDatabaseBrowserTour && back4AppNavigation.onStartDatabaseBrowserTour();
    });
  }

  render() {
    return null;
  }
}
