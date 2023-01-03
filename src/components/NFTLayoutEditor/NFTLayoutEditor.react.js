/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes                        from 'lib/PropTypes';
import React                            from 'react';
import * as Polotno                     from 'polotno/canvas';
import styles                           from 'components/NFTLayoutEditor/NFTLayoutEditor.scss';

/*

This react component embeds the Polotno editor into the dashboard to enable the user to edit the layout of the NFT.
The component is provided a layout json and a list of template elements to use in the layout. The component calls the 
onSave callback when the layout is saved.

This component displays the layout editor in a modal dialog as well as a button to save the layout and a button to cancel

*/

export default class NFTLayoutEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      layout: props.layout,
      templateElements: props.templateElements,
      showEditor: false,
    };
  }

  componentDidMount() {
    this.loadEditor();
  }

  loadEditor() {
    const { layout, templateElements } = this.state;
    const { onSave, onCancel } = this.props;

    const editor = new Polotno.PolotnoEditor({
      container: this.editorContainer,
      layout,
      templateElements,
      onSave,
      onCancel,
    });

    this.setState({ editor });
  }

  render() {
    const { showEditor } = this.state;

    return (
      <div className={styles.container}>
        <button className={styles.button} onClick={() => this.setState({ showEditor: true })}>
          Edit Layout
        </button>
        {showEditor && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <button className={styles.modalCloseButton} onClick={() => this.setState({ showEditor: false })}>
                  &times;
                </button>
                <h2>Edit Layout</h2>
              </div>
              <div className={styles.modalBody}>
                <div ref={el => (this.editorContainer = el)} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

NFTLayoutEditor.propTypes = {
  layout: PropTypes.object.describe('the layout json to edit'),
  onSave: PropTypes.func.describe('the callback to call when the layout is saved'),
  onCancel: PropTypes.func.describe('the callback to call when the layout is cancelled'),
  templateElements: PropTypes.array.describe('the template elements to use in the layout'),
};
