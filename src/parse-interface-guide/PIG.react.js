/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import * as ComponentsMap from 'parse-interface-guide/ComponentsMap';
import { Link }           from 'react-router';
import Icon               from 'components/Icon/Icon.react';
import PropsTable         from 'parse-interface-guide/PropsTable.react';
import React              from 'react';
import styles             from 'parse-interface-guide/PIG.scss';
import beautify           from 'js-beautify';
import CodeSnippet        from 'components/CodeSnippet/CodeSnippet.react';

let PIGRow = ({ title, children }) => <div>
  <div className={styles.header}>{title}</div>
  <div className={styles.row}>{children}</div>
</div>;

export default class PIG extends React.Component {
  constructor() {
    super();

    this.state = {
      query: ''
    };
  }

  renderSidebar() {
    let components = Object.keys(ComponentsMap);
    return (
      <div className={styles.sidebar}>
        <div className={styles.iconWrap}>
          <Icon name='infinity' width={50} height={50} fill='#000000' />
          <span className={styles.iconLabel}>PIG Explorer</span>
        </div>
        <input
          type='text'
          placeholder='Filter components...'
          className={styles.searchField}
          onChange={(e) => {
            let query = e.target.value.trim();
            this.setState({query});
          }}/>
        {components.map((name) => {
          return name.toLowerCase().indexOf(this.state.query.toLowerCase()) !== -1
            ? <Link activeClassName={styles.active} key={name} to={`/${name}`}>{name}</Link>
            : null;
        })}
      </div>
    );
  }

  renderContent() {
    let componentInfo = ComponentsMap[this.props.params.component];
    if (!componentInfo) {
      componentInfo = ComponentsMap[Object.keys(ComponentsMap)[0]];
    }
    let demos = componentInfo.demos || [];
    return (
      <div className={styles.content}>
        <h1>&lt;<span className={styles.component_name}>{componentInfo.component.name}</span>&gt;</h1>
        <PropsTable component={componentInfo.component} />
        {demos.map((demo, i) => (
          <div key={demo.name || i} className={styles.table}>
            <PIGRow title={demo.name || 'Demo'}>{typeof demo.render === 'function' ? demo.render() : demo()}</PIGRow>
            <PIGRow title={(demo.name || '') + ' Source'}>
              <CodeSnippet source={beautify((typeof demo.render === 'function' ? demo.render : demo).toString())} language='javascript' fullPage={false}/>
            </PIGRow>
          </div>
        ))}
        <div className={styles.table}>
          <PIGRow title={componentInfo.component.name + '.render() Source'}>
            <CodeSnippet source={beautify((typeof componentInfo.component.render === 'function' ? componentInfo.component.render : componentInfo.component).toString())} language='javascript' fullPage={false}/>
          </PIGRow>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderSidebar()}
        {this.renderContent()}
      </div>
    );
  }
}
