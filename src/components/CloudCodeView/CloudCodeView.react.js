import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { androidstudio } from 'react-syntax-highlighter/styles/hljs';

export default class CodeTree extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    if (androidstudio.hljs) {
      androidstudio.hljs.background = "#0c2337"
      androidstudio.hljs.height = '100%'
    }
    return <SyntaxHighlighter wrapLines={true} language='javascript' style={androidstudio}>{this.props.source}</SyntaxHighlighter>;
  }
}
