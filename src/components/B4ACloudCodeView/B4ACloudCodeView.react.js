import React             from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import style             from 'react-syntax-highlighter/dist/esm/styles/hljs/tomorrow-night-eighties';

export default class B4ACloudCodeView extends React.Component {
  constructor(props){
    super(props);
  }

  extensionDecoder() {
    if (this.props.extension)
      switch (this.props.extension) {
        case 'js':
          return 'javascript'
        case 'ejs':
          return 'html'
        default:
          // css, html, ...
          return this.props.extension
      }
    return 'javascript'
  }


  render() {
    if (style.hljs) {
      style.hljs.background = "#0c2337"
      style.hljs.height = '100%'
      style.hljs.padding = '1em 0.5em'
    }
    return <SyntaxHighlighter
      showLineNumbers={true}
      lineNumberStyle={{
        paddingRight: 10,
        color: "rgb(169, 183, 198, 0.3)"
      }}
      wrapLines={true}
      language={this.extensionDecoder()}
      style={style}>
        {this.props.source}
      </SyntaxHighlighter>;
  }
}
