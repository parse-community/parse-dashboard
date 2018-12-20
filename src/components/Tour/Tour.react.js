import React, { Component } from 'react';
import history from 'dashboard/history';
import introJs from 'intro.js'
import { post } from 'lib/AJAX';
import { ActionTypes } from 'lib/stores/SchemaStore';
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
      const context = this.props.context;
      const schema = this.props.schema;
      const intro = introJs();
      intro.setOptions({
        prevLabel: '&larr; Prev',
        skipLabel: '&#10060; Cancel'
      });
      const createClassCode = `
        <p><br/></p>
        <section class="intro-code">
          <pre><span class="intro-code-keyword">const</span> Vehicle = Parse.Object.extend(<span class="intro-code-string">'Vehicle'</span>);</pre>
          <pre><span class="intro-code-keyword">const</span> vehicle = <span class="intro-code-keyword">new</span> Vehicle();</pre>
          <br/>
          <pre>vehicle.set('name', <span class="intro-code-string">'Corolla'</span>);</pre>
          <pre>vehicle.set('price', <span class="intro-code-number">19499</span>);</pre>
          <pre>vehicle.set('color' <span class="intro-code-string">'black'</span>);</pre>
          <br/>
          <pre>vehicle.save().then(savedObject => {</pre>
          <pre>  <span class="intro-code-comment">// The class is automatically created on</span></pre>
          <pre>  <span class="intro-code-comment">// the back-end when saving the object!</span></pre>
          <pre>  console.log(savedObject);</pre>
          <pre>},</pre>
          <pre>error => {</pre>
          <pre>  console.error(error);</pre>
          <pre>});</pre>
        </section>
      `;
      const steps = [
        {
          element: document.querySelector('[class^="section_contents"] > div > div'),
          intro: `This is the <b>Database Browser</b> where you can create and access your classes through the Back4pp's Dashboard.`,
          position: 'right'
        },
        {
          element: null, // This should render in the center of the page
          intro: `<p>We got this piece of code from the <b>API Reference</b> to help you create your first class as a sample and save data on Back4app.</p>${createClassCode}`,
        },
        {
          element: document.querySelector('[class^=class_list] a:last-of-type'),
          intro: `Here is the <b>Vehicle</b> class that you have just created!`,
          position: 'bottom'
        },
        {
          element: document.querySelector('[class^=browser]'),
          intro: `Congratulations! As you can see, you just created a new class and saved data on it.`,
          position: 'right'
        },
        {
          element: document.querySelector('[class^="section_contents"] [class^=subitem] a[class^=action]'),
          intro: `If you preffer, you can create your classes and data directly through the dashboard.`,
          position: 'bottom'
        },
        {
          element: document.querySelector('.toolbar-help-section'),
          intro: `If you need some help besides the Help section on the top menu, you also have this contextual help, which provides a specific assistance for the section you are exploring.`,
          position: 'bottom'
        }
        // {
        //   element: document.querySelector('[class^="subitem"][href$="cloud_code"]'),
        //   intro: `You can find this tour and play it again by pressing this button and selecting <b>"Play intro again"</b>.`,
        //   position: 'right'
        // }
      ];
      intro.addSteps(steps);

      const sidebar = document.querySelector("[class^='sidebar']");
      sidebar.style.position = 'absolute';

      const toolbar = document.querySelector("[class^='toolbar']");
      toolbar.style.position = 'absolute';

      const dataBrowser = document.querySelector("[class^='browser']");
      dataBrowser.style.position = 'absolute';

      intro.onexit(() => {
        sidebar.style.position = 'fixed';
        toolbar.style.position = 'fixed';
        dataBrowser.style.position = 'fixed';
      });

      document.querySelector('[class^="section_contents"] > div > div').style.backgroundColor = "#0e69a0";
      intro.onbeforechange(function() {
        switch(this._currentStep) {
          case 1:
            schema.dispatch(ActionTypes.CREATE_CLASS, { className: 'Vehicle' }).then(() => {
              const lastClassLink = document.querySelector('[class^=class_list] a:last-of-type');
              this._introItems[2].element = lastClassLink;
              return context.currentApp.apiRequest('POST', '/classes/Vehicle', { name: 'Corolla', price: 19499, color: 'black' }, { useMasterKey: true});
            }).catch(console.error);
            break;
          case 2:
            history.push(context.generatePath('browser/Vehicle'));
            break;
          case 3:
            this._introItems[3].element = document.querySelector('[class^=browser] [class^=tableRow] > :nth-child(2)');
            break;
        }
      });

      intro.onafterchange(function(targetElement) {
        switch(this._currentStep) {
          case 2:
            targetElement.style.backgroundColor = "#0e69a0";
            break;
        }
      });

      post(`/tutorial`, { databaseBrowser: true });
      intro.start();
    });
  }

  render() {
    return null;
  }
}
