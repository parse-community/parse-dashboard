import CodeSnippet from 'components/CodeSnippet/CodeSnippet.react';
import PropTypes   from 'lib/PropTypes';
import React       from 'react';

let JsonPrinter = ({ object }) => (
  <CodeSnippet
    source={JSON.stringify(object, null, 4)}
    language='javascript'
    lineNumbers={false}
    fullPage={false} />
)

export default JsonPrinter;

JsonPrinter.propTypes = {
  object: PropTypes.any.describe(
    'The JavaScript object to stringify and print.'
  )
};
