/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import styles from 'components/CategoryList/CategoryList.scss';
import Icon from 'components/Icon/Icon.react';
import { CurrentApp } from 'context/currentApp';
import generatePath from 'lib/generatePath';
import PropTypes from 'lib/PropTypes';
import React from 'react';
import { Link } from 'react-router-dom';

export default class CategoryList extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();
    this.listWrapperRef = React.createRef();
    this.state = {
      openClasses: [],
    };
  }

  componentDidMount() {
    const listWrapper = this.listWrapperRef.current;
    if (listWrapper) {
      this.highlight = document.createElement('div');
      this.highlight.className = styles.highlight;
      listWrapper.appendChild(this.highlight);
      this._updateHighlight();
    }
  }

  componentDidUpdate() {
    this._updateHighlight();
  }

  componentWillUnmount() {
    if (this.highlight) {
      this.highlight.parentNode.removeChild(this.highlight);
    }
  }

  _updateHighlight() {
    if (this.highlight) {
      let height = 0;
      for (let i = 0; i < this.props.categories.length; i++) {
        const c = this.props.categories[i];
        const id = c.id || c.name;
        if (id === this.props.current) {
          if (this.state.openClasses.includes(id)) {
            const query = new URLSearchParams(this.props.params);
            if (query.has('filters')) {
              const queryFilter = query.get('filters');
              const filterId = query.get('filterId');
              for (let i = 0; i < c.filters?.length; i++) {
                const filter = c.filters[i];
                // Prioritize filterId matching, only fall back to content comparison if no filterId
                if (filterId) {
                  if (filterId === filter.id) {
                    height += (i + 1) * 20;
                    break;
                  }
                } else if (queryFilter === filter.filter) {
                  // Legacy fallback: match by filter content when no filterId is present
                  height += (i + 1) * 20;
                  break;
                }
              }
            }
          }
          this.highlight.style.display = 'block';
          this.highlight.style.top = height + 'px';
          return;
        }
        if (id === 'classSeparator') {
          height += 13;
        } else if (this.state.openClasses.includes(id)) {
          height = height + 20 * (c.filters.length + 1);
        } else {
          height += 20;
        }
      }
      this.highlight.style.display = 'none';
    }
  }

  toggleDropdown(e, id) {
    e.preventDefault();
    const openClasses = [...this.state.openClasses];
    const index = openClasses.indexOf(id);
    if (openClasses.includes(id)) {
      openClasses.splice(index, 1);
    } else {
      openClasses.push(id);
    }
    this.setState({ openClasses });
  }

  render() {
    if (this.props.categories.length === 0) {
      return null;
    }
    return (
      <div ref={this.listWrapperRef} className={styles.class_list}>
        {this.props.categories.map(c => {
          const id = c.id || c.name;
          if (c.type === 'separator') {
            return <hr key={id} className={styles.separator} />;
          }
          const count = c.count;
          let className = id === this.props.current ? styles.active : '';
          let selectedFilter = null;
          if (this.state.openClasses.includes(id) && id === this.props.current) {
            const query = new URLSearchParams(this.props.params);
            if (query.has('filters')) {
              const queryFilter = query.get('filters');
              const queryFilterId = query.get('filterId');
              for (let i = 0; i < c.filters?.length; i++) {
                const filter = c.filters[i];
                // Prioritize filterId matching, only fall back to content comparison if no filterId
                if (queryFilterId) {
                  if (queryFilterId === filter.id) {
                    selectedFilter = i;
                    className = '';
                    break;
                  }
                } else if (queryFilter === filter.filter) {
                  // Legacy fallback: match by filter content when no filterId is present
                  selectedFilter = i;
                  className = '';
                  break;
                }
              }
            }
          }
          const link = generatePath(this.context, (this.props.linkPrefix || '') + (c.link || id));
          return (
            <div key={id}>
              <div className={styles.link}>
                <Link
                  title={c.name}
                  to={{ pathname: link }}
                  className={className}
                  onClick={() => this.props.classClicked()}
                >
                  {c.name}
                </Link>
                {c.onEdit && (
                  <a
                    className={styles.edit}
                    onClick={e => {
                      e.preventDefault();
                      c.onEdit();
                    }}
                  >
                    <Icon name="edit-solid" width={14} height={14} />
                  </a>
                )}
                <span className={styles.count}>{count}</span>
                {(c.filters || []).length !== 0 && (
                  <a
                    className={styles.expand}
                    onClick={e => this.toggleDropdown(e, id)}
                    style={{
                      transform: this.state.openClasses.includes(id) ? 'scaleY(-1)' : 'scaleY(1)',
                    }}
                  ></a>
                )}
              </div>
              {this.state.openClasses.includes(id) &&
                c.filters.map((filterData, index) => {
                  const { name, filter, id } = filterData;
                  // Only include filterId in URL if the filter has an ID (modern filters)
                  // Legacy filters without ID should work with just the filter content
                  const url = id
                    ? `${this.props.linkPrefix}${c.name}?filters=${encodeURIComponent(filter)}&filterId=${id}`
                    : `${this.props.linkPrefix}${c.name}?filters=${encodeURIComponent(filter)}`;
                  return (
                    <div key={index} className={styles.childLink}>
                      <Link
                        className={selectedFilter === index ? styles.active : ''}
                        onClick={e => {
                          e.preventDefault();
                          this.props.filterClicked(url);
                        }}
                        key={name + index}
                      >
                        <span>{name}</span>
                      </Link>
                      {this.props.onEditFilter && (
                        <a
                          className={styles.editFilter}
                          onClick={e => {
                            e.preventDefault();
                            this.props.onEditFilter(c.name, filterData);
                          }}
                        >
                          <Icon name="edit-solid" width={14} height={14} />
                        </a>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    );
  }
}

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object).describe(
    'Array of categories used to populate list.'
  ),
  current: PropTypes.string.describe('Id of current category to be highlighted.'),
  linkPrefix: PropTypes.string.describe('Link prefix used to generate link path.'),
  onEditFilter: PropTypes.func.describe('Callback function for editing a filter.'),
};
