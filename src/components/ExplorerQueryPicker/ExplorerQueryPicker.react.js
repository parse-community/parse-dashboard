/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import baseStyles    from 'stylesheets/base.scss';
import Button        from 'components/Button/Button.react';
import CascadingView from 'components/CascadingView/CascadingView.react';
import PropTypes     from 'lib/PropTypes';
import React         from 'react';
import styles        from 'components/ExplorerQueryPicker/ExplorerQueryPicker.scss';

let ExplorerQueryPicker = ({ queries, onCompose, onSelect, onDelete }) => {
  return (
    <div className={styles.queryPicker}>
      <div className={styles.header}>
        <h3 className={baseStyles.verticalCenter}>Choose a query to visualize</h3>
      </div>
      <div className={styles.queryContainer}>
        {queries.map((queryGroup) => {
          let childrenView = null;
          if (queryGroup.children.length > 0) {
            childrenView = queryGroup.children.map((query, j) => {
              return (
                <div
                  className={styles.queryItem}
                  key={`query_${j}`}>
                  <button
                    type='button'
                    onClick={() => onSelect(query)}
                    className={styles.queryLabel}>
                    {query.name}
                  </button>
                  {query.preset ? null : <button
                    type='button'
                    onClick={() => onDelete(query)}
                    className={styles.del}>
                    &times;
                  </button>}
                </div>
              );
            });
          } else {
            let emptyMessage = queryGroup.emptyMessage;
            if (!emptyMessage) {
              emptyMessage = `No query found in ${queryGroup.name}.`;
            }
            childrenView = (
              <div
                className={styles.queryItem}>
                {emptyMessage}
              </div>
            );
          }

          return (
            <CascadingView
              content={queryGroup.name}
              className={styles.queryGroup}
              key={queryGroup.name}>
              {childrenView}
            </CascadingView>
          );
        })}
      </div>
      <div className={styles.footer}>
        <div className={baseStyles.center} style={{ width:'95%' }}>
          <Button
            width='100%'
            value='Build a custom query'
            color='white'
            onClick={onCompose} />
        </div>
      </div>
    </div>
  );
};

export default ExplorerQueryPicker;

ExplorerQueryPicker.propTypes = {
  queries: PropTypes.arrayOf(PropTypes.object).isRequired.describe(
    'An array of queryGroups. Each querygroup should include the following fields: name, children. ' +
    'children of queryGroup contains an array of queries. Each query should include the following fields: ' +
    'name, query, (optional)preset.'
  ),
  onCompose: PropTypes.func.isRequired.describe(
    'Function to be called when "Build a custom query" button is clicked.'
  ),
  onSelect: PropTypes.func.describe(
    'Function to be called when a query is being selected.'
  ),
  onDelete: PropTypes.func.describe(
    'Function to be called when a query is being deleted.'
  )
};
