/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import PropTypes      from 'lib/PropTypes';
import React          from 'react';
import styles         from 'components/CategoryList/CategoryList.scss';
import { Link }       from 'react-router-dom';
import generatePath   from 'lib/generatePath';
import { CurrentApp } from 'context/currentApp';

export default class CategoryList extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();
    this.listWrapperRef = React.createRef();
  }

  componentDidMount() {
    let listWrapper = this.listWrapperRef.current;
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
      for (let i = 0; i < this.props.categories.length; i++) {
        let c = this.props.categories[i];
        let id = c.id || c.name;
        if (id === this.props.current) {
          this.highlight.style.display = 'block';
          this.highlight.style.top = (i * 20) + 'px';
          return;
        }
      }
      this.highlight.style.display = 'none';
    }
  }

  render() {
    if (this.props.categories.length === 0) {
      return null;
    }
    return (
      <div ref={this.listWrapperRef} className={styles.class_list}>
        {this.props.categories.map((c) => {
          let id = c.id || c.name;
          if (c.type === 'separator') {
            return <hr key={id} className={styles.separator} />;
          }
          let count = c.count;
          let className = id === this.props.current ? styles.active : '';
          let link = generatePath(
            this.context,
            (this.props.linkPrefix || '') + (c.link || id)
          );
          return (
            <Link title={c.name} to={{ pathname: link }} className={className} key={id} >
              <span>{count}</span>
              <span>{c.name}</span>
            </Link>
          );
        })}
      </div>
    );
  }
}

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object).describe('Array of categories used to populate list.'),
  current: PropTypes.string.describe('Id of current category to be highlighted.'),
  linkPrefix: PropTypes.string.describe('Link prefix used to generate link path.'),
};
