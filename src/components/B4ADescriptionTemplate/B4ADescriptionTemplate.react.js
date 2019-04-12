/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button from 'components/Button/Button.react';
import PropTypes    from 'lib/PropTypes';
import React        from 'react';
import styles       from 'components/B4ADescriptionTemplate/B4ADescriptionTemplate.scss';


let B4ADescriptionTemplate = (props) => {
  let padding = (props.padding || 20) + 'px';
  return (
    <div className={styles.description}
      style={{ padding: '0 ' + padding }}>
        <div className={styles.text}>{props.text}</div>
        <div className={styles.button}>
          <Button value={"Buy externally"} primary={true} color="green" onClick={() => window.open(props.link, "_blank")}/>
        </div>
    </div>
  );
};

export default B4ADescriptionTemplate;


