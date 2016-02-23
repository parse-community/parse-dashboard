/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React  from 'react';
import styles from 'parse-interface-guide/PIG.scss';

function typeString(prop) {
  switch (prop._id) {
    case 'Enum':
      return 'Enum { ' + prop._values.join(', ') + ' }';
    case 'Union':
      return prop._classes.map((c) => c._id).join(' | ');
    default:
      return prop._id;
  }
}

const PropsRow = (p) => (
  <div className={styles.row}>
    <div>
      <span className={styles.prop_name}>{p.name}</span>
      {p.required ? <span className={styles.prop_required}>[Required]</span> : null}
      <span className={styles.prop_type}>{p.type}</span>
    </div>
    <p>{p.description}</p>
  </div>
);

export default class PropsTable extends React.Component {
  render() {
    let component = this.props.component;
    let requiredProps = [];
    let optionalProps = [];
    if (component.propTypes) {
      for (let p in component.propTypes) {
        let info = {
          name: p,
          type: typeString(component.propTypes[p]),
          required: component.propTypes[p]._required,
          description: component.propTypes[p]._description,
        };
        if (component.defaultProps && component.defaultProps[p]) {
          info.default = component.defaultProps[p];
        }
        if (info.required) {
          requiredProps.push(info);
        } else {
          optionalProps.push(info);
        }
      }
    }
    let propInfo = requiredProps.concat(optionalProps);
    return (
      <div className={styles.table}>
        <div className={styles.header}>Props</div>
        {propInfo.map((p) => <PropsRow key={p.name} {...p} />)}
      </div>
    );
  }
}
