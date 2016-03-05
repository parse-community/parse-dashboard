/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React    from 'react';
import Markdown from 'components/Markdown/Markdown.react';

export const component = Markdown;

export const demos = [
  {
    name: 'Demo name',
    render: () => {
      let content = `
**bold** *italic*

~~This code is a mistake~~

> Some quote

\`code\`

# Super heading dude #

### These components are built by: ###
1. Andrew
2. Drew
3. Gogo
4. Peter

\`\`\`
some code block
\`\`\`
`;
      return (
        <Markdown
          content={content} />
      );
    }
  }
];
