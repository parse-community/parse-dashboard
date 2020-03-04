/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
 import React   from 'react'
 import styles  from 'components/ScrollHint/ScrollHint.scss'

 export default class ScrollHint extends React.Component {
   constructor() {
     super();
     this.state = { active: false };
   }

   toggle(active) {
     this.setState({ active });
   }

   render() {
     const { active } = this.state;

     const classes = [
       styles.scrollHint,
       active ? styles.active: undefined
     ].join(' ');

     return <div className={classes}></div>;
   }
 }
