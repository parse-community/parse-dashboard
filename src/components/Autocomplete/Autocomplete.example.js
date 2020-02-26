/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React        from 'react';
import Autocomplete from 'components/Autocomplete/Autocomplete.react';

export const component = Autocomplete;

class AutocompleteDemo extends React.Component {
  constructor() {
    super();

    this.state = {
      suggestions: ['aaa', 'abc', 'xxx', 'xyz']
    };

    this.onSubmit = input => console.log('onSubmit: ' + input);
    this.onUserInput = input => {
      console.log(`input: ${input}`);
    };
    this.buildLabel = input =>
      input.length > 0
        ? `You've typed ${input.length} characters`
        : 'Start typing';
    this.buildSuggestions = input =>
      this.state.suggestions.filter(s => s.startsWith(input));
  }

  render() {
    return (
      <Autocomplete
        inputStyle={{
          width: '400px',
          padding: '0 6px',
          margin: '10px 20px'
        }}
        suggestionsStyle={{
          margin: '-6px 0px 0px 20px',
          width: '400px'
        }}
        locked={true}
        onChange={this.onUserInput}
        onSubmit={this.onSubmit}
        placeholder={'Placeholder'}
        buildSuggestions={this.buildSuggestions}
        buildLabel={this.buildLabel}
      />
    );
  }
}

export const demos = [
  {
    render: () => (
      <div>
        <AutocompleteDemo />
      </div>
    )
  }
];
