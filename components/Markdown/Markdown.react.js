/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CodeSnippet    from 'components/CodeSnippet/CodeSnippet.react';
import marked         from 'marked';
import PropTypes      from 'lib/PropTypes';
import React          from 'react';
import ReactDOMServer from 'react-dom/server';

// Refer to https://github.com/chjj/marked.
let renderer = new marked.Renderer();
renderer.code = (code, lang) => {
  let snippet = (
    <CodeSnippet
      source={code}
      language={lang}
      fullPage={false} />
  );

  return ReactDOMServer.renderToString(snippet);
};

let Markdown = ({ content }) => {
  let rawHtml = marked(content, {
    sanitize: true,
    renderer: renderer,
  });

  // Yes, it looks dangerous, but we believe `marked` will do its job.
  // It's even recommend by Facebook:
  // https://facebook.github.io/react/docs/tutorial.html#adding-markdown
  return <div dangerouslySetInnerHTML={{ __html: rawHtml }} />;
};

export default Markdown;

Markdown.propTypes = {
  content: PropTypes.string.isRequired.describe(
    'The content that will be rendered as markdown.'
  ),
}
