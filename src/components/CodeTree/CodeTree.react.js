import React from 'react';
import jstree from 'jstree';
import 'jstree/dist/themes/default/style.css'
import 'components/CodeTree/JsTree.css'
import styles from 'components/CodeTree/CodeTree.scss'
import Button from 'components/Button/Button.react';

import $ from 'jquery'

const data = [{"text":"cloud","state":{"opened":true},"type":"folder","children":[{"text":"main.js","data":{"code":"data:plain/text;base64,Ci8vIFVzZSBQYXJzZS5DbG91ZC5kZWZpbmUgdG8gZGVmaW5lIGFzIG1hbnkgY2xvdWQgZnVuY3Rpb25zIGFzIHlvdSB3YW50LgovLyBGb3IgZXhhbXBsZToKUGFyc2UuQ2xvdWQuam9iKCJoZWxsbyIsIGZ1bmN0aW9uKHJlcXVlc3QsIHJlc3BvbnNlKSB7CiAgcmVzcG9uc2Uuc3VjY2VzcygiSGVsbG8gd29ybGQgZG8gcmVzcG9uc2UgLSBqb2IiKTsKICByZXF1ZXN0LmxvZy5pbmZvKCJIZWxsbyB3b3JsZCBkbyByZXF1ZXN0IC0gam9iIik7CiAgY29uc29sZS5sb2coIkhlbGxvIHdvcmxkIGRvIGNvbnNvbGUgLSBqb2IiKTsgLy8vLy8vLy9sa2pvamlvam9pbGtoaXV5aXV5dWhqa20KfSk7Cg=="}}]},{"text":"public","state":{"opened":true},"type":"folder","children":[{"text":"index.html","data":{"code":"data:plain/text;base64,CjxodG1sPgogIDxoZWFkPgogICAgPHRpdGxlPk15IFBhcnNlQXBwIHNpdGU8L3RpdGxlPgogICAgPHN0eWxlPgogICAgYm9keSB7IGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmOyB9CiAgICBkaXYgeyB3aWR0aDogODAwcHg7IGhlaWdodDogNDAwcHg7IG1hcmdpbjogNDBweCBhdXRvOyBwYWRkaW5nOiAyMHB4OyBib3JkZXI6IDJweCBzb2xpZCAjNTI5OGZjOyB9CiAgICBoMSB7IGZvbnQtc2l6ZTogMzBweDsgbWFyZ2luOiAwOyB9CiAgICBwIHsgbWFyZ2luOiA0MHB4IDA7IH0KICAgIGVtIHsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsgfQogICAgYSB7IGNvbG9yOiAjNTI5OGZjOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IH0KICAgIDwvc3R5bGU+CiAgPC9oZWFkPgogIDxib2R5PgogICAgPGRpdj4KICAgICAgPGgxPkNvbmdyYXR1bGF0aW9ucyEgWW91J3JlIGFscmVhZHkgaG9zdGluZyB3aXRoIFBhcnNlLjwvaDE+CiAgICAgIDxwPlRvIGdldCBzdGFydGVkLCBlZGl0IHRoaXMgZmlsZSBhdCA8ZW0+cHVibGljL2luZGV4Lmh0bWw8L2VtPiBhbmQgc3RhcnQgYWRkaW5nIHN0YXRpYyBjb250ZW50LjwvcD4KICAgICAgPHA+SWYgeW91IHdhbnQgc29tZXRoaW5nIGEgYml0IG1vcmUgZHluYW1pYywgZGVsZXRlIHRoaXMgZmlsZSBhbmQgY2hlY2sgb3V0IDxhIGhyZWY9Imh0dHBzOi8vcGFyc2UuY29tL2RvY3MvaG9zdGluZ19ndWlkZSN3ZWJhcHAiPm91ciBob3N0aW5nIGRvY3M8L2E+LjwvcD4KICAgIDwvZGl2PgogIDwvYm9keT4KPC9odG1sPgo="}}]}]

export default class CodeTree extends React.Component {
  constructor(props){
    super(props);
    this.state = { data };
  }

  componentDidMount() {
    console.log('wooow')
    $('#tree').jstree({
      'core' : {
        'data' : [
          {
            "text" : "Root node",
            "state":{ "opened": true },
            "type": "folder",
            "children" : [
              {
                "text" : "main.js"
              },
              {
                "text" : "custom.js",
                "type" : "new"
              }
            ]
          }
        ]
      },
      "types" : {
        "default": {
          "icon": "zmdi zmdi-file"
        },
        "folder": {
          "icon": "zmdi zmdi-folder",
          "valid_children": ["default", "folder"]
        },
        "new": {
          "icon": "zmdi zmdi-file new"
        }
      },
      "plugins": ["types"]
    })
  }

  render(){
    return (
      <div className={styles['files-box']}>
        <div className={styles['files-header']} >
          <p>Files</p>
          <Button
            value='ADD'
            primary={true}
            width='68'
          />
        </div>
        <div className={styles['files-tree']}>
          <div id={'tree'}></div>
        </div>
      </div>
    );
  }
}
