/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CSRFInput from 'components/CSRFInput/CSRFInput.react';
import Field from 'components/Field/Field.react';
import FormButton from 'components/FormButton/FormButton.react';
import Label from 'components/Label/Label.react';
import PropTypes from 'lib/PropTypes';
import React from 'react';

const DEFAULT_LABEL_WIDTH = 56;

// We use refs, so can't be stateless component
export class AccountLinkField extends React.Component {
  constructor() {
    super();
    this.modifyRef = React.createRef();
  }
  render() {
    return (
      <div>
        <form ref={this.modifyRef}
              method='post'
              action={this.props.metadata.linked ?
                      this.props.metadata.deauthorize_url :
                      this.props.metadata.authorize_url}>
          <CSRFInput />
        </form>
        <Field
          labelWidth={DEFAULT_LABEL_WIDTH}
          label={<Label text={this.props.serviceName} />}
          input={<FormButton
          value={this.props.metadata.linked ?
                 'Unlink ' + this.props.serviceName :
                 'Connect ' + this.props.serviceName}
          onClick={() => this.modifyRef.current.submit()} />}/>
      </div>
    );
  }
}

export default AccountLinkField;

AccountLinkField.PropTypes = {
  serviceName: PropTypes.string.isRequired.describe(
    'Text to show on button'
  ),
  metadata: PropTypes.object.isRequired.describe(
    'Data from server with keys: linked, authorize_url, and deauthorize_url'
  )
};
