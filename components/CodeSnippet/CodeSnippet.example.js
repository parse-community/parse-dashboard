import React       from 'react';
import CodeSnippet from 'components/CodeSnippet/CodeSnippet.react';

export const component = CodeSnippet;

export const demos = [
  {
  	render() {
      let source = `// Some comment here
Parse.Cloud.define('hello', function(req, resp) {
  let someVariable = "<div>";
  let otherVariable = "</div>";
});`

      return (
        <CodeSnippet source={source} language='javascript' />
      )
    }
  },
  {
    name: 'Print JSON',
    render() {
      let obj = {
        this: 'is awesome',
        awesome: true
      };

      return (
        <CodeSnippet source={JSON.stringify(obj, null, 4)} language='javascript' />
      )
    }
  }
];
