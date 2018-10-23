/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React    from 'react';
import CodeTree from 'components/CodeTree/CodeTree.react';

let source = {"tree":[{"text":"cloud","state":{"opened":true},"type":"folder","children":[{"text":"newFile.js","data":{"code":"data:plain/text;base64,Y29uc29sZS5sb2coIm5ldyBmaWxlIik7Cg=="}}]},{"text":"public","state":{"opened":true},"type":"folder","children":[{"text":"render.html","data":{"code":"data:plain/text;base64,ZXJyb3Igd2l0aCBzdGF0dXM9NTAwIGFuZCBib2R5PSJUeXBlRXJyb3I6IF9lcnJvcnMyLmRlZmF1bHQgaXMgbm90IGEgY29uc3RydWN0b3I8YnI+ICZuYnNwOyAmbmJzcDthdCAvaG9tZS9iYWNrNGFwcC9zY20vYmFjazRhcHAtY2xpLXNlcnZlci9saWIvYmFjay9CYWNrNGFwcFZlbmRvckFkYXB0ZXIuanM6MTE2OjIxPGJyPiAmbmJzcDsgJm5ic3A7YXQgdHJ5Q2F0Y2hlciAoL2hvbWUvYmFjazRhcHAvc2NtL2JhY2s0YXBwLWNsaS1zZXJ2ZXIvbm9kZV9tb2R1bGVzL2JsdWViaXJkL2pzL3JlbGVhc2UvdXRpbC5qczoxNjoyMyk8YnI+ICZuYnNwOyAmbmJzcDthdCBQcm9taXNlLl9zZXR0bGVQcm9taXNlRnJvbUhhbmRsZXIgKC9ob21lL2JhY2s0YXBwL3NjbS9iYWNrNGFwcC1jbGktc2VydmVyL25vZGVfbW9kdWxlcy9ibHVlYmlyZC9qcy9yZWxlYXNlL3Byb21pc2UuanM6NTEyOjMxKTxicj4gJm5ic3A7ICZuYnNwO2F0IFByb21pc2UuX3NldHRsZVByb21pc2UgKC9ob21lL2JhY2s0YXBwL3NjbS9iYWNrNGFwcC1jbGktc2VydmVyL25vZGVfbW9kdWxlcy9ibHVlYmlyZC9qcy9yZWxlYXNlL3Byb21pc2UuanM6NTY5OjE4KTxicj4gJm5ic3A7ICZuYnNwO2F0IFByb21pc2UuX3NldHRsZVByb21pc2UwICgvaG9tZS9iYWNrNGFwcC9zY20vYmFjazRhcHAtY2xpLXNlcnZlci9ub2RlX21vZHVsZXMvYmx1ZWJpcmQvanMvcmVsZWFzZS9wcm9taXNlLmpzOjYxNDoxMCk8YnI+ICZuYnNwOyAmbmJzcDthdCBQcm9taXNlLl9zZXR0bGVQcm9taXNlcyAoL2hvbWUvYmFjazRhcHAvc2NtL2JhY2s0YXBwLWNsaS1zZXJ2ZXIvbm9kZV9tb2R1bGVzL2JsdWViaXJkL2pzL3JlbGVhc2UvcHJvbWlzZS5qczo2OTM6MTgpPGJyPiAmbmJzcDsgJm5ic3A7YXQgQXN5bmMuX2RyYWluUXVldWUgKC9ob21lL2JhY2s0YXBwL3NjbS9iYWNrNGFwcC1jbGktc2VydmVyL25vZGVfbW9kdWxlcy9ibHVlYmlyZC9qcy9yZWxlYXNlL2FzeW5jLmpzOjEzMzoxNik8YnI+ICZuYnNwOyAmbmJzcDthdCBBc3luYy5fZHJhaW5RdWV1ZXMgKC9ob21lL2JhY2s0YXBwL3NjbS9iYWNrNGFwcC1jbGktc2VydmVyL25vZGVfbW9kdWxlcy9ibHVlYmlyZC9qcy9yZWxlYXNlL2FzeW5jLmpzOjE0MzoxMCk8YnI+ICZuYnNwOyAmbmJzcDthdCBJbW1lZGlhdGUuQXN5bmMuZHJhaW5RdWV1ZXMgKC9ob21lL2JhY2s0YXBwL3NjbS9iYWNrNGFwcC1jbGktc2VydmVyL25vZGVfbW9kdWxlcy9ibHVlYmlyZC9qcy9yZWxlYXNlL2FzeW5jLmpzOjE3OjE0KTxicj4gJm5ic3A7ICZuYnNwO2F0IHJ1bkNhbGxiYWNrICh0aW1lcnMuanM6NjM3OjIwKTxicj4gJm5ic3A7ICZuYnNwO2F0IHRyeU9uSW1tZWRpYXRlICh0aW1lcnMuanM6NjEwOjUpPGJyPiAmbmJzcDsgJm5ic3A7YXQgcHJvY2Vzc0ltbWVkaWF0ZSBbYXMgX2ltbWVkaWF0ZUNhbGxiYWNrXSAodGltZXJzLmpzOjU4Mjo1KVxuIgo="}}]}]}

class Demo extends React.Component {
  constructor() {
    super();
    this.state = { value: null };
  }

  render() {
    return <CodeTree files={source} />
  }
}

export const component = CodeTree;

export const demos = [
  {
    name: 'Code Tree',
    render: () => ( <Demo /> )
  }
];
