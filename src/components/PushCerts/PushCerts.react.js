/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import CertsTable from 'components/PushCerts/CertsTable.react';
import Field      from 'components/Field/Field.react';
import Fieldset   from 'components/Fieldset/Fieldset.react';
import FileInput  from 'components/FileInput/FileInput.react';
import FormNote   from 'components/FormNote/FormNote.react';
import Label      from 'components/Label/Label.react';

import PropTypes from 'lib/PropTypes';
import React from 'react';

class PushCerts extends React.Component {
  constructor() {
    super();
  }

  render() {
    let renderTable = this.props.uploadPending || (this.props.certs && this.props.certs.length > 0);
    return (
      <Fieldset
        legend='Apple Push Certificates'
        description={'You may upload up to 6 push certificates. This limit cannot be raised.'}>
        <Field
          labelWidth={60}
          label={<Label text='Certificate file' description='Upload your .p12 certificate file to enable push for iOS and OS X.' />}
          input={<FileInput disabled={this.props.uploadPending} accept='application/x-pkcs12' onChange={this.props.onUpload} />} />
        {renderTable || this.props.error ? <FormNote color='orange' show={!!this.props.error}>{this.props.error}</FormNote> : null}
        {renderTable ?
          <Field
            labelWidth={60}
            label={<Label text='Uploaded certificates' description='Remember, you can only upload two certificates per bundle.' />}
            input={<CertsTable {...this.props} />} /> : null}
      </Fieldset>
    );
  }
}

PushCerts.propTypes = {
  certs: PropTypes.arrayOf(PropTypes.object).describe(
    'An array of push cert metadata. Each should include the following fields: id, bundle, type, expiresAt'
  ),
  uploadPending: PropTypes.bool.describe(
    'A boolean that indicates whether an upload is pending'
  ),
  error: PropTypes.string.describe(
    'An error message to display in the form'
  ),
  onUpload: PropTypes.func.isRequired.describe(
    'A function called when a cert file is selected. The File is passed to the handler as the only parameter.'
  ),
  onDelete: PropTypes.func.isRequired.describe(
    'A handler for when a Push has been deleted from the server'
  ),
};

export default PushCerts;